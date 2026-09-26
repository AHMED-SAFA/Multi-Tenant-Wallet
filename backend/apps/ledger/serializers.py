from rest_framework import serializers
from .models import Transaction


class DepositSerializer(serializers.Serializer):
    wallet_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=18, decimal_places=2, min_value=0.01)
    idempotency_key = serializers.CharField(max_length=255)


class WithdrawSerializer(serializers.Serializer):
    wallet_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=18, decimal_places=2, min_value=0.01)
    idempotency_key = serializers.CharField(max_length=255)


class TransferSerializer(serializers.Serializer):
    from_wallet_id = serializers.UUIDField()
    to_wallet_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=18, decimal_places=2, min_value=0.01)
    idempotency_key = serializers.CharField(max_length=255)

    def validate(self, data):
        if data["from_wallet_id"] == data["to_wallet_id"]:
            raise serializers.ValidationError("Cannot transfer to the same wallet.")
        return data


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "id",
            "wallet",
            "type",
            "amount",
            "balance_after",
            "idempotency_key",
            "related_transfer_id",
            "created_at",
        ]
