from rest_framework import generics
from .models import Tenant
from .serializers import TenantSerializer


class TenantCreateView(generics.CreateAPIView):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
