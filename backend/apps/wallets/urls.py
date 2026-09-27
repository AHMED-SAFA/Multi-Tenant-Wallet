from django.urls import path
from .views import WalletCreateView, WalletDetailView, WalletListView

urlpatterns = [
    path("", WalletListView.as_view(), name="wallet-list"),
    path("create/", WalletCreateView.as_view(), name="wallet-create"),
    path("<uuid:wallet_id>/", WalletDetailView.as_view(), name="wallet-detail"),
]
