from django.urls import path
from .views import (
    DepositView,
    WithdrawView,
    TransferView,
    WalletBalanceView,
    WalletTransactionListView,
    WalletStatementPDFView,
)

urlpatterns = [
    path("deposit/", DepositView.as_view(), name="wallet-deposit"),
    path("withdraw/", WithdrawView.as_view(), name="wallet-withdraw"),
    path("transfer/", TransferView.as_view(), name="wallet-transfer"),
    path(
        "wallets/<uuid:wallet_id>/balance/",
        WalletBalanceView.as_view(),
        name="wallet-balance",
    ),
    path(
        "wallets/<uuid:wallet_id>/transactions/",
        WalletTransactionListView.as_view(),
        name="wallet-transactions",
    ),
    path(
        "wallets/<uuid:wallet_id>/statement/",
        WalletStatementPDFView.as_view(),
        name="wallet-statement",
    ),
]
