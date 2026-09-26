from rest_framework import serializers
from .models import Wallet


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ["id", "owner_name", "balance", "created_at"]
        read_only_fields = ["id", "balance", "created_at"]
