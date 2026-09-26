from django.urls import path
from .views import WalletCreateView, WalletDetailView

urlpatterns = [
    path("", WalletCreateView.as_view(), name="wallet-create"),
    path("<uuid:wallet_id>/", WalletDetailView.as_view(), name="wallet-detail"),
]
