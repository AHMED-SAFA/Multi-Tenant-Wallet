from rest_framework.exceptions import AuthenticationFailed
from .models import Tenant


def resolve_tenant(request):
    """Resolve tenant from the authenticated user (JWT), falling back to
    X-API-Key / X-Tenant-ID for service-to-service or test use."""
    if request.user and request.user.is_authenticated:
        tenant = getattr(request.user, "tenant", None)
        if tenant is None:
            raise AuthenticationFailed("This account has no tenant.")
        return tenant

    api_key = request.headers.get("X-API-Key")
    tenant_id = request.headers.get("X-Tenant-ID")

    if api_key:
        try:
            return Tenant.objects.get(api_key=api_key)
        except Tenant.DoesNotExist:
            raise AuthenticationFailed("Invalid API key.")

    if tenant_id:
        try:
            return Tenant.objects.get(id=tenant_id)
        except (Tenant.DoesNotExist, ValueError):
            raise AuthenticationFailed("Invalid tenant ID.")

    raise AuthenticationFailed("Tenant not identified.")
