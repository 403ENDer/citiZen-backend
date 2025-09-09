import { test, expect } from "@playwright/test";
import { setupTestData, createTestUser } from "../setup/testData";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3333";

// Setup test data before all tests
test.beforeAll(async ({ request }) => {
  await setupTestData(request);
});

// Helper function to get auth token
async function getAuthToken(request: any) {
  return await createTestUser(request, "upvotetest@example.com");
}

// Helper function to create an issue and return its ID
async function createTestIssue(request: any, token: string) {
  const createResponse = await request.post(`${API_BASE_URL}/api/issues`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      title: "Test Issue for Upvote",
      detail: "This is a test issue for upvoting functionality",
      locality: "Test Locality",
      is_anonymous: false,
    },
  });

  const createData = await createResponse.json();
  return createData.issue._id;
}

test.describe("Upvotes API - Unit Tests", () => {
  test.describe("POST /api/upvotes/:issue_id - Add Upvote", () => {
    test("TC-UPVOTE-001: Add upvote to existing issue (ECP - Valid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);
      const issueId = await createTestIssue(request, token);

      const response = await request.post(
        `${API_BASE_URL}/api/upvotes/${issueId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status()).toBe(201);
      const responseData = await response.json();
      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toContain("upvoted");
    });

    test("TC-UPVOTE-002: Add upvote to non-existent issue (ECP - Invalid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      const response = await request.post(
        `${API_BASE_URL}/api/upvotes/507f1f77bcf86cd799439011`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status()).toBe(404);
    });

    test("TC-UPVOTE-003: Add upvote with invalid issue ID format (ECP - Invalid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      const response = await request.post(
        `${API_BASE_URL}/api/upvotes/invalid-id`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status()).toBe(400);
    });

    test("TC-UPVOTE-004: Add upvote without authentication (ECP - Invalid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);
      const issueId = await createTestIssue(request, token);

      const response = await request.post(
        `${API_BASE_URL}/api/upvotes/${issueId}`
      );

      expect(response.status()).toBe(401);
    });

    test("TC-UPVOTE-005: Add duplicate upvote (ECP - Invalid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);
      const issueId = await createTestIssue(request, token);

      // First upvote
      await request.post(`${API_BASE_URL}/api/upvotes/${issueId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Second upvote (should fail)
      const response = await request.post(
        `${API_BASE_URL}/api/upvotes/${issueId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status()).toBe(400);
    });
  });

  test.describe("DELETE /api/upvotes/:issue_id - Remove Upvote", () => {
    test("TC-UPVOTE-006: Remove existing upvote (ECP - Valid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);
      const issueId = await createTestIssue(request, token);

      // First add upvote
      await request.post(`${API_BASE_URL}/api/upvotes/${issueId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Then remove upvote
      const response = await request.delete(
        `${API_BASE_URL}/api/upvotes/${issueId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status()).toBe(200);
      const responseData = await response.json();
      expect(responseData).toHaveProperty("message");
      expect(responseData.message).toContain("removed");
    });

    test("TC-UPVOTE-007: Remove non-existent upvote (ECP - Invalid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);
      const issueId = await createTestIssue(request, token);

      const response = await request.delete(
        `${API_BASE_URL}/api/upvotes/${issueId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status()).toBe(404);
    });

    test("TC-UPVOTE-008: Remove upvote from non-existent issue (ECP - Invalid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      const response = await request.delete(
        `${API_BASE_URL}/api/upvotes/507f1f77bcf86cd799439011`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status()).toBe(404);
    });

    test("TC-UPVOTE-009: Remove upvote without authentication (ECP - Invalid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);
      const issueId = await createTestIssue(request, token);

      // First add upvote
      await request.post(`${API_BASE_URL}/api/upvotes/${issueId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Then try to remove without auth
      const response = await request.delete(
        `${API_BASE_URL}/api/upvotes/${issueId}`
      );

      expect(response.status()).toBe(401);
    });
  });

  test.describe("GET /api/upvotes/:issue_id/check - Check User Upvote", () => {
    test("TC-UPVOTE-010: Check upvote status when user has upvoted (ECP - Valid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);
      const issueId = await createTestIssue(request, token);

      // First add upvote
      await request.post(`${API_BASE_URL}/api/upvotes/${issueId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Then check upvote status
      const response = await request.get(
        `${API_BASE_URL}/api/upvotes/${issueId}/check`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status()).toBe(200);
      const responseData = await response.json();
      expect(responseData).toHaveProperty("hasUpvoted");
      expect(responseData.hasUpvoted).toBe(true);
    });

    test("TC-UPVOTE-011: Check upvote status when user has not upvoted (ECP - Valid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);
      const issueId = await createTestIssue(request, token);

      // Check upvote status without upvoting
      const response = await request.get(
        `${API_BASE_URL}/api/upvotes/${issueId}/check`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status()).toBe(200);
      const responseData = await response.json();
      expect(responseData).toHaveProperty("hasUpvoted");
      expect(responseData.hasUpvoted).toBe(false);
    });

    test("TC-UPVOTE-012: Check upvote status for non-existent issue (ECP - Invalid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      const response = await request.get(
        `${API_BASE_URL}/api/upvotes/507f1f77bcf86cd799439011/check`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status()).toBe(404);
    });

    test("TC-UPVOTE-013: Check upvote status without authentication (ECP - Invalid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);
      const issueId = await createTestIssue(request, token);

      const response = await request.get(
        `${API_BASE_URL}/api/upvotes/${issueId}/check`
      );

      expect(response.status()).toBe(401);
    });

    test("TC-UPVOTE-014: Check upvote status with invalid issue ID format (ECP - Invalid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      const response = await request.get(
        `${API_BASE_URL}/api/upvotes/invalid-id/check`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status()).toBe(400);
    });
  });

  test.describe("Upvote Workflow Tests", () => {
    test("TC-UPVOTE-015: Complete upvote workflow - add, check, remove (Integration Test)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);
      const issueId = await createTestIssue(request, token);

      // Step 1: Check initial status (should be false)
      let response = await request.get(
        `${API_BASE_URL}/api/upvotes/${issueId}/check`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      expect(response.status()).toBe(200);
      let responseData = await response.json();
      expect(responseData.hasUpvoted).toBe(false);

      // Step 2: Add upvote
      response = await request.post(`${API_BASE_URL}/api/upvotes/${issueId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      expect(response.status()).toBe(201);

      // Step 3: Check status after upvoting (should be true)
      response = await request.get(
        `${API_BASE_URL}/api/upvotes/${issueId}/check`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      expect(response.status()).toBe(200);
      responseData = await response.json();
      expect(responseData.hasUpvoted).toBe(true);

      // Step 4: Remove upvote
      response = await request.delete(
        `${API_BASE_URL}/api/upvotes/${issueId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      expect(response.status()).toBe(200);

      // Step 5: Check final status (should be false again)
      response = await request.get(
        `${API_BASE_URL}/api/upvotes/${issueId}/check`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      expect(response.status()).toBe(200);
      responseData = await response.json();
      expect(responseData.hasUpvoted).toBe(false);
    });

    test("TC-UPVOTE-016: Multiple users upvoting same issue (Integration Test)", async ({
      request,
    }) => {
      // Create first user and issue
      const token1 = await getAuthToken(request);
      const issueId = await createTestIssue(request, token1);

      // Create second user
      await request.post(`${API_BASE_URL}/api/auth/signup/email`, {
        data: {
          email: "upvotetest2@example.com",
          password: "password123",
          name: "Upvote Test User 2",
          phone_number: "+1234567891",
          constituency_id: "507f1f77bcf86cd799439011",
          panchayat_id: "507f1f77bcf86cd799439012",
          ward_no: "W002",
        },
      });

      const loginResponse = await request.post(
        `${API_BASE_URL}/api/auth/login/email`,
        {
          data: {
            email: "upvotetest2@example.com",
            password: "password123",
          },
        }
      );

      const loginData = await loginResponse.json();
      const token2 = loginData.token;

      // First user upvotes
      let response = await request.post(
        `${API_BASE_URL}/api/upvotes/${issueId}`,
        {
          headers: {
            Authorization: `Bearer ${token1}`,
          },
        }
      );
      expect(response.status()).toBe(201);

      // Second user upvotes
      response = await request.post(`${API_BASE_URL}/api/upvotes/${issueId}`, {
        headers: {
          Authorization: `Bearer ${token2}`,
        },
      });
      expect(response.status()).toBe(201);

      // Both users should see they have upvoted
      response = await request.get(
        `${API_BASE_URL}/api/upvotes/${issueId}/check`,
        {
          headers: {
            Authorization: `Bearer ${token1}`,
          },
        }
      );
      expect(response.status()).toBe(200);
      let responseData = await response.json();
      expect(responseData.hasUpvoted).toBe(true);

      response = await request.get(
        `${API_BASE_URL}/api/upvotes/${issueId}/check`,
        {
          headers: {
            Authorization: `Bearer ${token2}`,
          },
        }
      );
      expect(response.status()).toBe(200);
      responseData = await response.json();
      expect(responseData.hasUpvoted).toBe(true);
    });
  });
});
