from rest_framework import generics
from apps.tenants.mixins import TenantScopedMixin
from .models import Wallet
from .serializers import WalletSerializer


class WalletCreateView(TenantScopedMixin, generics.CreateAPIView):
    serializer_class = WalletSerializer

    def perform_create(self, serializer):
        serializer.save(tenant=self.tenant)


class WalletDetailView(TenantScopedMixin, generics.RetrieveAPIView):
    serializer_class = WalletSerializer
    lookup_field = "id"
    lookup_url_kwarg = "wallet_id"

    def get_queryset(self):
        # Scoped to tenant -> other tenants' wallets 404, never leak existence.
        return Wallet.objects.filter(tenant=self.tenant)
