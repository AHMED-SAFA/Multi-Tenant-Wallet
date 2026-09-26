from django.urls import path
from .views import DepositView, WithdrawView, TransferView

urlpatterns = [
    path("deposit/", DepositView.as_view(), name="wallet-deposit"),
    path("withdraw/", WithdrawView.as_view(), name="wallet-withdraw"),
    path("transfer/", TransferView.as_view(), name="wallet-transfer"),
]
