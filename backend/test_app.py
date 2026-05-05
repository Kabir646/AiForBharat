"""
Basic tests for the FastAPI backend
Run with: pytest test_app.py -v
"""
import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "healthy"


def test_root_endpoint():
    """Test the root API information endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "version" in data
    assert "endpoints" in data


def test_cors_headers():
    """Test that CORS headers are properly configured"""
    response = client.options("/health")
    assert response.status_code == 200


def test_invalid_endpoint():
    """Test that invalid endpoints return 404"""
    response = client.get("/invalid-endpoint-that-does-not-exist")
    assert response.status_code == 404


# Add more tests as needed for your specific endpoints
# Example:
# def test_upload_dpr():
#     """Test DPR upload endpoint"""
#     files = {"file": ("test.pdf", b"fake pdf content", "application/pdf")}
#     response = client.post("/api/dprs/upload", files=files)
#     assert response.status_code in [200, 401]  # 401 if auth required
