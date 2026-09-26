from django.db import transaction, IntegrityError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.tenants.mixins import TenantScopedMixin
from apps.wallets.models import Wallet
from .models import Transaction
from .serializers import DepositSerializer, WithdrawSerializer


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
