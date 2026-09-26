from rest_framework import serializers


class DepositSerializer(serializers.Serializer):
    wallet_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=18, decimal_places=2, min_value=0.01)
    idempotency_key = serializers.CharField(max_length=255)
