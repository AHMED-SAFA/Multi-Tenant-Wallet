from rest_framework.exceptions import AuthenticationFailed
from .models import Tenant


def resolve_tenant(request):
    """Resolve tenant from X-API-Key or X-Tenant-ID header."""
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

    raise AuthenticationFailed(
        "Tenant not identified. Provide X-API-Key or X-Tenant-ID header."
    )
