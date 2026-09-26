import uuid
from django.db import transaction, IntegrityError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.tenants.mixins import TenantScopedMixin
from apps.wallets.models import Wallet
from .models import Transaction
from rest_framework import generics
from .serializers import (
    DepositSerializer,
    WithdrawSerializer,
    TransferSerializer,
    TransactionSerializer,
)

class DepositView(TenantScopedMixin, APIView):
    def post(self, request):
        serializer = DepositSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        existing = Transaction.objects.filter(
            tenant=self.tenant,
            idempotency_key=data["idempotency_key"],
            type=Transaction.Type.DEPOSIT,
        ).first()
        if existing:
            return Response(
                {
                    "transaction_id": existing.id,
                    "wallet_id": existing.wallet_id,
                    "balance": existing.balance_after,
                    "idempotent_replay": True,
                },
                status=status.HTTP_200_OK,
            )

        try:
            with transaction.atomic():
                wallet = (
                    Wallet.objects.select_for_update()
                    .filter(id=data["wallet_id"], tenant=self.tenant)
                    .first()
                )
                if wallet is None:
                    return Response(
                        {"detail": "Wallet not found for this tenant."},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                wallet.balance += data["amount"]
                wallet.save(update_fields=["balance"])

                txn = Transaction.objects.create(
                    tenant=self.tenant,
                    wallet=wallet,
                    type=Transaction.Type.DEPOSIT,
                    amount=data["amount"],
                    balance_after=wallet.balance,
                    idempotency_key=data["idempotency_key"],
                )
        except IntegrityError:
            # Concurrent retry with same key lost the race -> replay the winner.
            existing = Transaction.objects.get(
                tenant=self.tenant,
                idempotency_key=data["idempotency_key"],
                type=Transaction.Type.DEPOSIT,
            )
            return Response(
                {
                    "transaction_id": existing.id,
                    "wallet_id": existing.wallet_id,
                    "balance": existing.balance_after,
                    "idempotent_replay": True,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "transaction_id": txn.id,
                "wallet_id": wallet.id,
                "balance": wallet.balance,
            },
            status=status.HTTP_201_CREATED,
        )


class WithdrawView(TenantScopedMixin, APIView):
    def post(self, request):
        serializer = WithdrawSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        existing = Transaction.objects.filter(
            tenant=self.tenant,
            idempotency_key=data["idempotency_key"],
            type=Transaction.Type.WITHDRAW,
        ).first()
        if existing:
            return Response(
                {
                    "transaction_id": existing.id,
                    "wallet_id": existing.wallet_id,
                    "balance": existing.balance_after,
                    "idempotent_replay": True,
                },
                status=status.HTTP_200_OK,
            )

        try:
            with transaction.atomic():
                wallet = (
                    Wallet.objects.select_for_update()
                    .filter(id=data["wallet_id"], tenant=self.tenant)
                    .first()
                )
                if wallet is None:
                    return Response(
                        {"detail": "Wallet not found for this tenant."},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                if wallet.balance < data["amount"]:
                    return Response(
                        {
                            "detail": "Insufficient balance.",
                            "balance": wallet.balance,
                            "requested": data["amount"],
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                wallet.balance -= data["amount"]
                wallet.save(update_fields=["balance"])

                txn = Transaction.objects.create(
                    tenant=self.tenant,
                    wallet=wallet,
                    type=Transaction.Type.WITHDRAW,
                    amount=data["amount"],
                    balance_after=wallet.balance,
                    idempotency_key=data["idempotency_key"],
                )
        except IntegrityError:
            existing = Transaction.objects.get(
                tenant=self.tenant,
                idempotency_key=data["idempotency_key"],
                type=Transaction.Type.WITHDRAW,
            )
            return Response(
                {
                    "transaction_id": existing.id,
                    "wallet_id": existing.wallet_id,
                    "balance": existing.balance_after,
                    "idempotent_replay": True,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "transaction_id": txn.id,
                "wallet_id": wallet.id,
                "balance": wallet.balance,
            },
            status=status.HTTP_201_CREATED,
        )


class TransferView(TenantScopedMixin, APIView):
    def post(self, request):
        serializer = TransferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        existing_out = Transaction.objects.filter(
            tenant=self.tenant,
            idempotency_key=data["idempotency_key"],
            type=Transaction.Type.TRANSFER_OUT,
        ).first()
        if existing_out:
            return Response(
                {
                    "transfer_id": existing_out.related_transfer_id,
                    "from_wallet_id": existing_out.wallet_id,
                    "from_balance": existing_out.balance_after,
                    "idempotent_replay": True,
                },
                status=status.HTTP_200_OK,
            )

        # Lock wallets in a fixed order (by PK) regardless of direction,
        # so two concurrent transfers between the same pair can't deadlock.
        id_a, id_b = sorted([str(data["from_wallet_id"]), str(data["to_wallet_id"])])

        try:
            with transaction.atomic():
                wallets = list(
                    Wallet.objects.select_for_update().filter(
                        id__in=[id_a, id_b], tenant=self.tenant
                    )
                )
                if len(wallets) != 2:
                    # Missing wallet means either it doesn't exist, or it belongs
                    # to another tenant — both return the same generic 404
                    # so we never confirm cross-tenant wallet existence.
                    return Response(
                        {"detail": "One or both wallets not found for this tenant."},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                wallets_by_id = {str(w.id): w for w in wallets}
                from_wallet = wallets_by_id[str(data["from_wallet_id"])]
                to_wallet = wallets_by_id[str(data["to_wallet_id"])]

                if from_wallet.balance < data["amount"]:
                    return Response(
                        {
                            "detail": "Insufficient balance.",
                            "balance": from_wallet.balance,
                            "requested": data["amount"],
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                from_wallet.balance -= data["amount"]
                to_wallet.balance += data["amount"]
                from_wallet.save(update_fields=["balance"])
                to_wallet.save(update_fields=["balance"])

                transfer_id = uuid.uuid4()

                txn_out = Transaction.objects.create(
                    tenant=self.tenant,
                    wallet=from_wallet,
                    type=Transaction.Type.TRANSFER_OUT,
                    amount=data["amount"],
                    balance_after=from_wallet.balance,
                    idempotency_key=data["idempotency_key"],
                    related_transfer_id=transfer_id,
                )
                Transaction.objects.create(
                    tenant=self.tenant,
                    wallet=to_wallet,
                    type=Transaction.Type.TRANSFER_IN,
                    amount=data["amount"],
                    balance_after=to_wallet.balance,
                    idempotency_key=data["idempotency_key"],
                    related_transfer_id=transfer_id,
                )
        except IntegrityError:
            existing_out = Transaction.objects.get(
                tenant=self.tenant,
                idempotency_key=data["idempotency_key"],
                type=Transaction.Type.TRANSFER_OUT,
            )
            return Response(
                {
                    "transfer_id": existing_out.related_transfer_id,
                    "from_wallet_id": existing_out.wallet_id,
                    "from_balance": existing_out.balance_after,
                    "idempotent_replay": True,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "transfer_id": transfer_id,
                "from_wallet_id": from_wallet.id,
                "from_balance": from_wallet.balance,
                "to_wallet_id": to_wallet.id,
                "to_balance": to_wallet.balance,
            },
            status=status.HTTP_201_CREATED,
        )


class WalletBalanceView(TenantScopedMixin, APIView):
    def get(self, request, wallet_id):
        wallet = Wallet.objects.filter(id=wallet_id, tenant=self.tenant).first()
        if wallet is None:
            return Response(
                {"detail": "Wallet not found for this tenant."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response({"wallet_id": wallet.id, "balance": wallet.balance})


class WalletTransactionListView(TenantScopedMixin, generics.ListAPIView):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        wallet_id = self.kwargs["wallet_id"]
        # Filtering by tenant here (not just wallet_id) is what blocks
        # cross-tenant history reads even if the wallet UUID is guessed.
        return Transaction.objects.filter(tenant=self.tenant, wallet_id=wallet_id)
