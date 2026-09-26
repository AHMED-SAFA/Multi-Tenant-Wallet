from rest_framework.permissions import IsAuthenticated
from .authentication import resolve_tenant


class TenantScopedMixin:
    permission_classes = [IsAuthenticated]

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        self.tenant = resolve_tenant(request)
