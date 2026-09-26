import uuid
from django.db import models
from apps.tenants.models import Tenant
from apps.wallets.models import Wallet


class Transaction(models.Model):
    class Type(models.TextChoices):
        DEPOSIT = "deposit", "Deposit"
        WITHDRAW = "withdraw", "Withdraw"
        TRANSFER_IN = "transfer_in", "Transfer In"
        TRANSFER_OUT = "transfer_out", "Transfer Out"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name="transactions"
    )
    wallet = models.ForeignKey(
        Wallet, on_delete=models.CASCADE, related_name="transactions"
    )
    type = models.CharField(max_length=20, choices=Type.choices)
    amount = models.DecimalField(max_digits=18, decimal_places=2)
    balance_after = models.DecimalField(max_digits=18, decimal_places=2)
    idempotency_key = models.CharField(max_length=255)
    related_transfer_id = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["tenant", "idempotency_key", "type"],
                name="unique_idempotency_key_per_tenant_and_type",
            ),
        ]

    def __str__(self):
        return f"{self.type} {self.amount} -> wallet {self.wallet_id}"


