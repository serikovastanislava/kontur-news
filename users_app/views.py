from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken


def user_payload(user):
    return {
        "id": user.id,
        "email": user.email,
        "name": user.first_name or user.username,
    }


def tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    name = str(request.data.get("name", "")).strip()
    email = str(request.data.get("email", "")).strip().lower()
    password = str(request.data.get("password", ""))

    if len(name) < 2:
        return Response({"detail": "Введите имя"}, status=status.HTTP_400_BAD_REQUEST)
    if not email or "@" not in email:
        return Response({"detail": "Введите корректный email"}, status=status.HTTP_400_BAD_REQUEST)
    if len(password) < 6:
        return Response({"detail": "Пароль должен быть не короче 6 символов"}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
        return Response({"detail": "Пользователь с таким email уже существует"}, status=status.HTTP_409_CONFLICT)

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=name,
    )

    return Response(
        {"user": user_payload(user), "tokens": tokens_for(user)},
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(user_payload(request.user))
