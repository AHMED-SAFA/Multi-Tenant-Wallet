from rest_framework import generics
from apps.tenants.mixins import TenantScopedMixin
from .serializers import TenantSerializer


class TenantMeView(TenantScopedMixin, generics.RetrieveAPIView):
    serializer_class = TenantSerializer

    def get_object(self):
        return self.tenant
