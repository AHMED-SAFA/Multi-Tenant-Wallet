import uuid
from django.db import models
from apps.tenants.models import Tenant


class Wallet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="wallets")
    owner_name = models.CharField(max_length=255)
    balance = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(balance__gte=0), name="wallet_balance_non_negative"
            ),
        ]

    def __str__(self):
        return f"{self.owner_name} ({self.tenant.name})"

    def recompute_balance(self):
        """Recalculate balance purely from the ledger — proves the ledger
        is the source of truth, not the cached `balance` field."""
        from apps.ledger.models import Transaction

        credits = (
            Transaction.objects.filter(
                wallet=self,
                type__in=[Transaction.Type.DEPOSIT, Transaction.Type.TRANSFER_IN],
            ).aggregate(total=models.Sum("amount"))["total"]
            or 0
        )
        debits = (
            Transaction.objects.filter(
                wallet=self,
                type__in=[Transaction.Type.WITHDRAW, Transaction.Type.TRANSFER_OUT],
            ).aggregate(total=models.Sum("amount"))["total"]
            or 0
        )
        return credits - debits
