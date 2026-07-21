"""
CoachMind Pro - Authentication Tests
Tests for registration, login, and token validation
"""
import pytest
from app.api.v1.endpoints.auth import get_password_hash


def test_register_success(client):
    response = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "securepass123",
        "full_name": "Test User"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"
    assert "hashed_password" not in data


def test_register_duplicate_email(client):
    client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "username": "user1",
        "password": "pass123",
        "full_name": "User 1"
    })
    response = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "username": "user2",
        "password": "pass456",
        "full_name": "User 2"
    })
    assert response.status_code == 400


def test_register_duplicate_username(client):
    client.post("/api/v1/auth/register", json={
        "email": "user1@example.com",
        "username": "testuser",
        "password": "pass123",
        "full_name": "User 1"
    })
    response = client.post("/api/v1/auth/register", json={
        "email": "user2@example.com",
        "username": "testuser",
        "password": "pass456",
        "full_name": "User 2"
    })
    assert response.status_code == 400


def test_login_success(client):
    client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "securepass123",
        "full_name": "Test User"
    })
    response = client.post("/api/v1/auth/login", data={
        "username": "testuser",
        "password": "securepass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "securepass123",
        "full_name": "Test User"
    })
    response = client.post("/api/v1/auth/login", data={
        "username": "testuser",
        "password": "wrongpassword"
    })
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    response = client.post("/api/v1/auth/login", data={
        "username": "nobody",
        "password": "whatever"
    })
    assert response.status_code == 401


def test_get_me_authenticated(client):
    client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "securepass123",
        "full_name": "Test User"
    })
    login_resp = client.post("/api/v1/auth/login", data={
        "username": "testuser",
        "password": "securepass123"
    })
    token = login_resp.json()["access_token"]
    response = client.get("/api/v1/auth/me", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"


def test_get_me_unauthenticated(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_password_hashing():
    hashed = get_password_hash("testpassword")
    assert hashed != "testpassword"
    assert len(hashed) > 0


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["name"] == "CoachMind Pro"
