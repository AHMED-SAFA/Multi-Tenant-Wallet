from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    mobile = models.CharField(max_length=20)
    gender = models.CharField(max_length=10, choices=Gender.choices)

    def __str__(self):
        return self.user.email
