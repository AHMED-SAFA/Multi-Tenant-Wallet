from .authentication import resolve_tenant


class TenantScopedMixin:
    """Attaches resolved Tenant as self.tenant before the view runs.
    All tenant-scoped querysets MUST filter by self.tenant."""

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        self.tenant = resolve_tenant(request)