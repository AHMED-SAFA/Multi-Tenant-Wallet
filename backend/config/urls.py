from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/tenants/", include("apps.tenants.urls")),
    path("api/wallets/", include("apps.wallets.urls")),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/", include("apps.ledger.urls")),
]
