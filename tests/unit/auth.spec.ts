import { test, expect } from "@playwright/test";
import { setupTestData, getTestDataIds } from "../setup/testData";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3333";

// Setup test data before all tests
test.beforeAll(async ({ request }) => {
  await setupTestData(request);
});

// Test data for Equivalence Class Partitioning (ECP) and Boundary Value Analysis (BVA)
const testData = {
  // Valid email formats (ECP - Valid class)
  validEmails: [
    "user@example.com",
    "test.user@domain.co.uk",
    "user+tag@example.org",
    "user123@test-domain.com",
  ],

  // Invalid email formats (ECP - Invalid class)
  invalidEmails: [
    "invalid-email",
    "@example.com",
    "user@",
    "user@.com",
    "user..double@example.com",
    "user@example..com",
    "",
  ],

  // Valid passwords (ECP - Valid class)
  validPasswords: [
    "password123",
    "mypassword",
    "123456",
    "abcdefghijklmnopqrstuvwxyz1234567890", // 36 chars
  ],

  // Invalid passwords (ECP - Invalid class)
  invalidPasswords: [
    "12345", // Too short (BVA - just below boundary)
    "1234", // Too short
    "", // Empty
    "a".repeat(101), // Too long (BVA - just above boundary)
  ],

  // Valid names (ECP - Valid class)
  validNames: [
    "John Doe",
    "A", // Minimum length (BVA - at boundary)
    "A".repeat(100), // Maximum length (BVA - at boundary)
    "Test User 123",
  ],

  // Invalid names (ECP - Invalid class)
  invalidNames: [
    "", // Empty (BVA - just below boundary)
    "A".repeat(101), // Too long (BVA - just above boundary)
    "   ", // Only spaces
    "123", // Only numbers
  ],

  // Valid phone numbers (ECP - Valid class)
  validPhoneNumbers: [
    "+1234567890",
    "1234567890",
    "+91-9876543210",
    "9876543210",
  ],

  // Invalid phone numbers (ECP - Invalid class)
  invalidPhoneNumbers: [
    "123456789", // Too short (BVA - just below boundary)
    "1234567890123456", // Too long (BVA - just above boundary)
    "abc1234567",
    "",
    "+",
  ],
};

test.describe("Authentication API - Unit Tests", () => {
  test.describe("POST /api/auth/signup/email - Email Signup", () => {
    test("TC-AUTH-001: Valid signup with all required fields (ECP - Valid Class)", async ({
      request,
    }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/auth/signup/email`,
        {
          data: {
            email: "test@example.com",
            password: "password123",
            name: "Test User",
            phone_number: "+1234567890",
            constituency_id: getTestDataIds().constituency_id,
            panchayat_id: getTestDataIds().panchayat_id,
            ward_no: getTestDataIds().ward_no,
          },
        }
      );
      expect(response.status()).toBe(201);
      const responseData = await response.json();
      expect(responseData).toHaveProperty("message");
      expect(responseData).toHaveProperty("token");
      expect(responseData).toHaveProperty("user");
      expect(responseData.user).toHaveProperty("email", "test@example.com");
    });

    test("TC-AUTH-002: Invalid email format (ECP - Invalid Class)", async ({
      request,
    }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/auth/signup/email`,
        {
          data: {
            email: "invalid-email",
            password: "password123",
            name: "Test User",
            phone_number: "+1234567890",
            constituency_id: getTestDataIds().constituency_id,
            panchayat_id: getTestDataIds().panchayat_id,
            ward_no: getTestDataIds().ward_no,
          },
        }
      );

      expect(response.status()).toBe(400);
      const responseData = await response.json();
      expect(responseData).toHaveProperty("error");
    });

    test("TC-AUTH-003: Password too short (BVA - Just below boundary)", async ({
      request,
    }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/auth/signup/email`,
        {
          data: {
            email: "test@example.com",
            password: "12345", // 5 characters (minimum is 6)
            name: "Test User",
            phone_number: "+1234567890",
            constituency_id: getTestDataIds().constituency_id,
            panchayat_id: getTestDataIds().panchayat_id,
            ward_no: getTestDataIds().ward_no,
          },
        }
      );

      expect(response.status()).toBe(400);
    });

    test("TC-AUTH-004: Password at minimum boundary (BVA - At boundary)", async ({
      request,
    }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/auth/signup/email`,
        {
          data: {
            email: "test@example.com",
            password: "123456", // Exactly 6 characters
            name: "Test User",
            phone_number: "+1234567890",
            constituency_id: getTestDataIds().constituency_id,
            panchayat_id: getTestDataIds().panchayat_id,
            ward_no: getTestDataIds().ward_no,
          },
        }
      );

      expect(response.status()).toBe(201);
    });

    test("TC-AUTH-005: Name too short (BVA - Just below boundary)", async ({
      request,
    }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/auth/signup/email`,
        {
          data: {
            email: "test@example.com",
            password: "password123",
            name: "A", // 1 character (minimum is 2)
            phone_number: "+1234567890",
            constituency_id: getTestDataIds().constituency_id,
            panchayat_id: getTestDataIds().panchayat_id,
            ward_no: getTestDataIds().ward_no,
          },
        }
      );

      expect(response.status()).toBe(400);
    });

    test("TC-AUTH-006: Name at minimum boundary (BVA - At boundary)", async ({
      request,
    }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/auth/signup/email`,
        {
          data: {
            email: "test@example.com",
            password: "password123",
            name: "AB", // Exactly 2 characters
            phone_number: "+1234567890",
            constituency_id: getTestDataIds().constituency_id,
            panchayat_id: getTestDataIds().panchayat_id,
            ward_no: getTestDataIds().ward_no,
          },
        }
      );
      console.log(response);
      expect(response.status()).toBe(201);
    });

    test("TC-AUTH-007: Missing required fields (ECP - Invalid Class)", async ({
      request,
    }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/auth/signup/email`,
        {
          data: {
            email: "test@example.com",
            password: "password123",
            // Missing name, phone_number, constituency_id, panchayat_id, ward_no
          },
        }
      );

      expect(response.status()).toBe(400);
    });

    test("TC-AUTH-008: Duplicate email signup (ECP - Invalid Class)", async ({
      request,
    }) => {
      // First signup
      await request.post(`${API_BASE_URL}/api/auth/signup/email`, {
        data: {
          email: "duplicate@example.com",
          password: "password123",
          name: "Test User",
          phone_number: "+1234567890",
          constituency_id: "507f1f77bcf86cd799439011",
          panchayat_id: "507f1f77bcf86cd799439012",
          ward_no: "W001",
        },
      });

      // Second signup with same email
      const response = await request.post(
        `${API_BASE_URL}/api/auth/signup/email`,
        {
          data: {
            email: "duplicate@example.com",
            password: "password123",
            name: "Test User 2",
            phone_number: "+1234567891",
            constituency_id: "507f1f77bcf86cd799439011",
            panchayat_id: "507f1f77bcf86cd799439012",
            ward_no: "W002",
          },
        }
      );

      expect(response.status()).toBe(400);
    });
  });

  test.describe("POST /api/auth/login/email - Email Login", () => {
    test("TC-AUTH-009: Valid login credentials (ECP - Valid Class)", async ({
      request,
    }) => {
      // First create a user
      await request.post(`${API_BASE_URL}/api/auth/signup/email`, {
        data: {
          email: "logintest@example.com",
          password: "password123",
          name: "Login Test User",
          phone_number: "+1234567890",
          constituency_id: "507f1f77bcf86cd799439011",
          panchayat_id: "507f1f77bcf86cd799439012",
          ward_no: "W001",
        },
      });

      // Then test login
      const response = await request.post(
        `${API_BASE_URL}/api/auth/login/email`,
        {
          data: {
            email: "logintest@example.com",
            password: "password123",
          },
        }
      );

      expect(response.status()).toBe(200);
      const responseData = await response.json();
      expect(responseData).toHaveProperty("token");
      expect(responseData).toHaveProperty("user");
    });

    test("TC-AUTH-010: Invalid email format (ECP - Invalid Class)", async ({
      request,
    }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/auth/login/email`,
        {
          data: {
            email: "invalid-email",
            password: "password123",
          },
        }
      );

      expect(response.status()).toBe(400);
    });

    test("TC-AUTH-011: Wrong password (ECP - Invalid Class)", async ({
      request,
    }) => {
      // First create a user
      await request.post(`${API_BASE_URL}/api/auth/signup/email`, {
        data: {
          email: "wrongpass@example.com",
          password: "password123",
          name: "Wrong Pass User",
          phone_number: "+1234567890",
          constituency_id: "507f1f77bcf86cd799439011",
          panchayat_id: "507f1f77bcf86cd799439012",
          ward_no: "W001",
        },
      });

      // Then test with wrong password
      const response = await request.post(
        `${API_BASE_URL}/api/auth/login/email`,
        {
          data: {
            email: "wrongpass@example.com",
            password: "wrongpassword",
          },
        }
      );

      expect(response.status()).toBe(401);
    });

    test("TC-AUTH-012: Non-existent user (ECP - Invalid Class)", async ({
      request,
    }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/auth/login/email`,
        {
          data: {
            email: "nonexistent@example.com",
            password: "password123",
          },
        }
      );

      expect(response.status()).toBe(404);
    });

    test("TC-AUTH-013: Missing credentials (ECP - Invalid Class)", async ({
      request,
    }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/auth/login/email`,
        {
          data: {
            email: "test@example.com",
            // Missing password
          },
        }
      );

      expect(response.status()).toBe(400);
    });
  });

  test.describe("GET /api/auth/me - Get Current User Profile", () => {
    test("TC-AUTH-014: Valid authenticated request (ECP - Valid Class)", async ({
      request,
    }) => {
      // First create and login a user
      await request.post(`${API_BASE_URL}/api/auth/signup/email`, {
        data: {
          email: "profiletest@example.com",
          password: "password123",
          name: "Profile Test User",
          phone_number: "+1234567890",
          constituency_id: "507f1f77bcf86cd799439011",
          panchayat_id: "507f1f77bcf86cd799439012",
          ward_no: "W001",
        },
      });

      const loginResponse = await request.post(
        `${API_BASE_URL}/api/auth/login/email`,
        {
          data: {
            email: "profiletest@example.com",
            password: "password123",
          },
        }
      );

      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Test getting profile with valid token
      const response = await request.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.status()).toBe(200);
      const responseData = await response.json();
      expect(responseData).toHaveProperty("user");
      expect(responseData.user.email).toBe("profiletest@example.com");
    });

    test("TC-AUTH-015: Missing authorization header (ECP - Invalid Class)", async ({
      request,
    }) => {
      const response = await request.get(`${API_BASE_URL}/api/auth/me`);

      expect(response.status()).toBe(401);
    });

    test("TC-AUTH-016: Invalid token format (ECP - Invalid Class)", async ({
      request,
    }) => {
      const response = await request.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });

      expect(response.status()).toBe(401);
    });

    test("TC-AUTH-017: Malformed authorization header (ECP - Invalid Class)", async ({
      request,
    }) => {
      const response = await request.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: "InvalidFormat token123",
        },
      });

      expect(response.status()).toBe(401);
    });
  });

  test.describe("POST /api/auth/change-password - Change Password", () => {
    test("TC-AUTH-018: Valid password change (ECP - Valid Class)", async ({
      request,
    }) => {
      // First create and login a user
      await request.post(`${API_BASE_URL}/api/auth/signup/email`, {
        data: {
          email: "changepass@example.com",
          password: "oldpassword",
          name: "Change Pass User",
          phone_number: "+1234567890",
          constituency_id: "507f1f77bcf86cd799439011",
          panchayat_id: "507f1f77bcf86cd799439012",
          ward_no: "W001",
        },
      });

      const loginResponse = await request.post(
        `${API_BASE_URL}/api/auth/login/email`,
        {
          data: {
            email: "changepass@example.com",
            password: "oldpassword",
          },
        }
      );

      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Test password change
      const response = await request.post(
        `${API_BASE_URL}/api/auth/change-password`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            currentPassword: "oldpassword",
            newPassword: "newpassword123",
          },
        }
      );

      expect(response.status()).toBe(200);
    });

    test("TC-AUTH-019: Wrong current password (ECP - Invalid Class)", async ({
      request,
    }) => {
      // First create and login a user
      await request.post(`${API_BASE_URL}/api/auth/signup/email`, {
        data: {
          email: "wrongcurrent@example.com",
          password: "oldpassword",
          name: "Wrong Current User",
          phone_number: "+1234567890",
          constituency_id: "507f1f77bcf86cd799439011",
          panchayat_id: "507f1f77bcf86cd799439012",
          ward_no: "W001",
        },
      });

      const loginResponse = await request.post(
        `${API_BASE_URL}/api/auth/login/email`,
        {
          data: {
            email: "wrongcurrent@example.com",
            password: "oldpassword",
          },
        }
      );

      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Test with wrong current password
      const response = await request.post(
        `${API_BASE_URL}/api/auth/change-password`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            currentPassword: "wrongpassword",
            newPassword: "newpassword123",
          },
        }
      );

      expect(response.status()).toBe(400);
    });

    test("TC-AUTH-020: New password too short (BVA - Just below boundary)", async ({
      request,
    }) => {
      // First create and login a user
      await request.post(`${API_BASE_URL}/api/auth/signup/email`, {
        data: {
          email: "shortnewpass@example.com",
          password: "oldpassword",
          name: "Short New Pass User",
          phone_number: "+1234567890",
          constituency_id: "507f1f77bcf86cd799439011",
          panchayat_id: "507f1f77bcf86cd799439012",
          ward_no: "W001",
        },
      });

      const loginResponse = await request.post(
        `${API_BASE_URL}/api/auth/login/email`,
        {
          data: {
            email: "shortnewpass@example.com",
            password: "oldpassword",
          },
        }
      );

      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Test with short new password
      const response = await request.post(
        `${API_BASE_URL}/api/auth/change-password`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            currentPassword: "oldpassword",
            newPassword: "12345", // 5 characters (minimum is 6)
          },
        }
      );

      expect(response.status()).toBe(400);
    });
  });
});
