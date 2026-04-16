"""
Backend API Tests for AirWrite - Smart Air-Writing App
Tests CRUD operations for drawings and health endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthEndpoints:
    """Health and root endpoint tests"""
    
    def test_root_endpoint_returns_message(self):
        """Test GET /api/ returns correct message"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "AirWrite" in data["message"]
        print(f"✓ Root endpoint returned: {data['message']}")
    
    def test_health_endpoint_returns_healthy(self):
        """Test GET /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        print(f"✓ Health endpoint returned: {data}")


class TestDrawingsCRUD:
    """Drawing CRUD operation tests"""
    
    @pytest.fixture
    def sample_drawing_data(self):
        """Sample drawing data for tests"""
        return {
            "title": f"TEST_Drawing_{uuid.uuid4().hex[:8]}",
            "image_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        }
    
    def test_create_drawing(self, sample_drawing_data):
        """Test POST /api/drawings creates a drawing"""
        response = requests.post(
            f"{BASE_URL}/api/drawings",
            json=sample_drawing_data
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "id" in data
        assert "title" in data
        assert "image_data" in data
        assert "created_at" in data
        
        # Verify data values
        assert data["title"] == sample_drawing_data["title"]
        assert data["image_data"] == sample_drawing_data["image_data"]
        assert isinstance(data["id"], str)
        assert len(data["id"]) > 0
        
        print(f"✓ Created drawing with ID: {data['id']}")
        return data["id"]
    
    def test_get_drawings_returns_list(self):
        """Test GET /api/drawings returns list of drawings"""
        response = requests.get(f"{BASE_URL}/api/drawings")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response is a list
        assert isinstance(data, list)
        print(f"✓ GET /api/drawings returned {len(data)} drawings")
    
    def test_create_and_verify_persistence(self, sample_drawing_data):
        """Test that created drawing persists and can be retrieved"""
        # Create drawing
        create_response = requests.post(
            f"{BASE_URL}/api/drawings",
            json=sample_drawing_data
        )
        assert create_response.status_code == 200
        created = create_response.json()
        drawing_id = created["id"]
        
        # Verify it appears in the list
        get_response = requests.get(f"{BASE_URL}/api/drawings")
        assert get_response.status_code == 200
        drawings = get_response.json()
        
        # Find our drawing in the list
        found = next((d for d in drawings if d["id"] == drawing_id), None)
        assert found is not None, f"Drawing {drawing_id} not found in list"
        assert found["title"] == sample_drawing_data["title"]
        assert found["image_data"] == sample_drawing_data["image_data"]
        
        print(f"✓ Drawing {drawing_id} persisted and retrieved successfully")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/drawings/{drawing_id}")
    
    def test_delete_drawing(self, sample_drawing_data):
        """Test DELETE /api/drawings/{id} deletes a drawing"""
        # First create a drawing
        create_response = requests.post(
            f"{BASE_URL}/api/drawings",
            json=sample_drawing_data
        )
        assert create_response.status_code == 200
        drawing_id = create_response.json()["id"]
        
        # Delete the drawing
        delete_response = requests.delete(f"{BASE_URL}/api/drawings/{drawing_id}")
        assert delete_response.status_code == 200
        data = delete_response.json()
        assert "message" in data
        assert "deleted" in data["message"].lower()
        
        print(f"✓ Deleted drawing {drawing_id}")
        
        # Verify it's no longer in the list
        get_response = requests.get(f"{BASE_URL}/api/drawings")
        drawings = get_response.json()
        found = next((d for d in drawings if d["id"] == drawing_id), None)
        assert found is None, f"Drawing {drawing_id} should not exist after deletion"
        
        print(f"✓ Verified drawing {drawing_id} no longer exists")
    
    def test_delete_nonexistent_drawing(self):
        """Test DELETE /api/drawings/{id} with non-existent ID"""
        fake_id = f"nonexistent-{uuid.uuid4().hex}"
        response = requests.delete(f"{BASE_URL}/api/drawings/{fake_id}")
        assert response.status_code == 200
        data = response.json()
        assert "error" in data
        print(f"✓ Delete non-existent drawing returned error: {data}")
    
    def test_create_drawing_empty_title(self):
        """Test POST /api/drawings with empty title"""
        response = requests.post(
            f"{BASE_URL}/api/drawings",
            json={
                "title": "",
                "image_data": "data:image/png;base64,test"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["title"] == ""
        print(f"✓ Created drawing with empty title, ID: {data['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/drawings/{data['id']}")


class TestDrawingsDataValidation:
    """Data validation tests for drawings API"""
    
    def test_drawings_sorted_by_created_at(self):
        """Test that drawings are returned sorted by created_at descending"""
        # Create two drawings
        drawing1 = requests.post(
            f"{BASE_URL}/api/drawings",
            json={"title": "TEST_First", "image_data": "data:image/png;base64,first"}
        ).json()
        
        import time
        time.sleep(0.1)  # Small delay to ensure different timestamps
        
        drawing2 = requests.post(
            f"{BASE_URL}/api/drawings",
            json={"title": "TEST_Second", "image_data": "data:image/png;base64,second"}
        ).json()
        
        # Get all drawings
        response = requests.get(f"{BASE_URL}/api/drawings")
        drawings = response.json()
        
        # Find our test drawings
        test_drawings = [d for d in drawings if d["title"].startswith("TEST_")]
        
        # Verify most recent is first (descending order)
        if len(test_drawings) >= 2:
            # The second created should appear before the first in descending order
            idx1 = next((i for i, d in enumerate(test_drawings) if d["id"] == drawing1["id"]), -1)
            idx2 = next((i for i, d in enumerate(test_drawings) if d["id"] == drawing2["id"]), -1)
            if idx1 != -1 and idx2 != -1:
                assert idx2 < idx1, "Drawings should be sorted by created_at descending"
                print("✓ Drawings are sorted by created_at descending")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/drawings/{drawing1['id']}")
        requests.delete(f"{BASE_URL}/api/drawings/{drawing2['id']}")


# Cleanup fixture to remove test data after all tests
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_drawings():
    """Cleanup TEST_ prefixed drawings after test session"""
    yield
    # Teardown: Delete all test-created data
    try:
        response = requests.get(f"{BASE_URL}/api/drawings")
        if response.status_code == 200:
            drawings = response.json()
            for d in drawings:
                if d.get("title", "").startswith("TEST_"):
                    requests.delete(f"{BASE_URL}/api/drawings/{d['id']}")
                    print(f"Cleaned up test drawing: {d['id']}")
    except Exception as e:
        print(f"Cleanup error: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
