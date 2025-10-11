import requests
import sys
import json
from datetime import datetime, timedelta

class InterviewSchedulerAPITester:
    def __init__(self, base_url="https://meet-scheduler-8.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        
        if headers:
            default_headers.update(headers)
        
        if self.token and 'Authorization' not in default_headers:
            default_headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    self.log_test(name, True)
                    return True, response_data
                except:
                    self.log_test(name, True, "No JSON response")
                    return True, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f" - {error_data}"
                except:
                    error_msg += f" - {response.text[:100]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except requests.exceptions.RequestException as e:
            error_msg = f"Request failed: {str(e)}"
            print(f"   Error: {error_msg}")
            self.log_test(name, False, error_msg)
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_admin_login_valid(self):
        """Test admin login with valid credentials"""
        success, response = self.run_test(
            "Admin Login (Valid)",
            "POST",
            "admin/login",
            200,
            data={"username": "admin", "password": "admin123"}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token received: {self.token[:20]}...")
            return True
        return False

    def test_admin_login_invalid(self):
        """Test admin login with invalid credentials"""
        return self.run_test(
            "Admin Login (Invalid)",
            "POST",
            "admin/login",
            401,
            data={"username": "wrong", "password": "wrong"}
        )

    def test_create_interview(self):
        """Test creating a new interview"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        interview_data = {
            "candidate_name": "John Doe",
            "company_name": "Tech Corp",
            "interview_date": tomorrow,
            "interview_time": "14:30",
            "duration": 60
        }
        
        success, response = self.run_test(
            "Create Interview",
            "POST",
            "interviews",
            200,
            data=interview_data
        )
        
        if success and 'id' in response:
            self.created_interview_id = response['id']
            print(f"   Created interview ID: {self.created_interview_id}")
            return True
        return False

    def test_get_all_interviews(self):
        """Test getting all interviews (requires auth)"""
        if not self.token:
            self.log_test("Get All Interviews", False, "No auth token available")
            return False
            
        return self.run_test(
            "Get All Interviews",
            "GET",
            "interviews",
            200
        )

    def test_get_interviews_by_date(self):
        """Test getting interviews by specific date"""
        if not self.token:
            self.log_test("Get Interviews by Date", False, "No auth token available")
            return False
            
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        return self.run_test(
            "Get Interviews by Date",
            "GET",
            f"interviews/date/{tomorrow}",
            200
        )

    def test_unauthorized_access(self):
        """Test accessing protected endpoints without token"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        success, _ = self.run_test(
            "Unauthorized Access to Interviews",
            "GET",
            "interviews",
            401
        )
        
        # Restore token
        self.token = temp_token
        return success

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting Interview Scheduler API Tests")
        print("=" * 50)
        
        # Test basic connectivity
        self.test_root_endpoint()
        
        # Test authentication
        self.test_admin_login_valid()
        self.test_admin_login_invalid()
        
        # Test unauthorized access
        self.test_unauthorized_access()
        
        # Test interview operations
        self.test_create_interview()
        self.test_get_all_interviews()
        self.test_get_interviews_by_date()
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   - {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = InterviewSchedulerAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())