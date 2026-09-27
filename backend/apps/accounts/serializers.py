from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.tenants.models import Tenant
from .models import UserProfile


class RegisterSerializer(serializers.Serializer):
    tenant_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    mobile = serializers.CharField(max_length=20)
    gender = serializers.ChoiceField(choices=UserProfile.Gender.choices)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )
        return value

    def validate_tenant_name(self, value):
        if Tenant.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError(
                "This tenant/organization name is already taken."
            )
        return value

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        return data

    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        UserProfile.objects.create(
            user=user,
            mobile=validated_data["mobile"],
            gender=validated_data["gender"],
        )
        Tenant.objects.create(name=validated_data["tenant_name"], owner=user)
        return user


from django.contrib.auth import authenticate


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Allows login with {"email": ..., "password": ...} instead of username.
    Since User.username is set equal to email at registration, we authenticate
    with username=email directly rather than relying on the parent's dynamic
    username_field lookup (which only works if USERNAME_FIELD itself is 'email')."""

    username_field = "email"

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        user = authenticate(username=email, password=password)
        if user is None or not user.is_active:
            raise serializers.ValidationError(
                "No active account found with the given credentials."
            )
        self.user = user
        refresh = self.get_token(self.user)
        return {"refresh": str(refresh), "access": str(refresh.access_token)}


class ProfileSerializer(serializers.Serializer):
    email = serializers.EmailField(source="user.email")
    mobile = serializers.CharField()
    gender = serializers.CharField()
    tenant_name = serializers.CharField(source="user.tenant.name")
