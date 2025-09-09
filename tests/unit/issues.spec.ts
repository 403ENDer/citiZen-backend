import { test, expect } from "@playwright/test";
import { setupTestData, createTestUser } from "../setup/testData";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3333";

// Setup test data before all tests
test.beforeAll(async ({ request }) => {
  await setupTestData(request);
});

// Helper function to get auth token
async function getAuthToken(request: any) {
  return await createTestUser(request, "issuetest@example.com");
}

test.describe("Issues API - Unit Tests", () => {
  test.describe("POST /api/issues - Create Issue", () => {
    test("TC-ISSUE-001: Valid issue creation (ECP - Valid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      const response = await request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "Test Issue Title",
          detail: "This is a detailed description of the test issue",
          locality: "Test Locality",
          is_anonymous: false,
        },
      });

      expect(response.status()).toBe(201);
      const responseData = await response.json();
      expect(responseData).toHaveProperty("issue");
      expect(responseData.issue.title).toBe("Test Issue Title");
    });

    test("TC-ISSUE-002: Title too short (BVA - Just below boundary)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      const response = await request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "Test", // 4 characters (minimum is 5)
          detail: "This is a detailed description of the test issue",
          locality: "Test Locality",
          is_anonymous: false,
        },
      });

      expect(response.status()).toBe(400);
    });

    test("TC-ISSUE-003: Title at minimum boundary (BVA - At boundary)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      const response = await request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "Test1", // Exactly 5 characters
          detail: "This is a detailed description of the test issue",
          locality: "Test Locality",
          is_anonymous: false,
        },
      });

      expect(response.status()).toBe(201);
    });

    test("TC-ISSUE-004: Title too long (BVA - Just above boundary)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      const response = await request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "A".repeat(201), // 201 characters (maximum is 200)
          detail: "This is a detailed description of the test issue",
          locality: "Test Locality",
          is_anonymous: false,
        },
      });

      expect(response.status()).toBe(400);
    });

    test("TC-ISSUE-005: Detail too short (BVA - Just below boundary)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      const response = await request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "Test Issue Title",
          detail: "Short", // 5 characters (minimum is 10)
          locality: "Test Locality",
          is_anonymous: false,
        },
      });

      expect(response.status()).toBe(400);
    });

    test("TC-ISSUE-006: Detail at minimum boundary (BVA - At boundary)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      const response = await request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "Test Issue Title",
          detail: "1234567890", // Exactly 10 characters
          locality: "Test Locality",
          is_anonymous: false,
        },
      });

      expect(response.status()).toBe(201);
    });

    test("TC-ISSUE-007: Locality too short (BVA - Just below boundary)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      const response = await request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "Test Issue Title",
          detail: "This is a detailed description of the test issue",
          locality: "AB", // 2 characters (minimum is 3)
          is_anonymous: false,
        },
      });

      expect(response.status()).toBe(400);
    });

    test("TC-ISSUE-008: Anonymous issue creation (ECP - Valid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      const response = await request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "Anonymous Issue Title",
          detail: "This is an anonymous issue description",
          locality: "Test Locality",
          is_anonymous: true,
        },
      });

      expect(response.status()).toBe(201);
      const responseData = await response.json();
      expect(responseData.issue.is_anonymous).toBe(true);
    });

    test("TC-ISSUE-009: Missing required fields (ECP - Invalid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      const response = await request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "Test Issue Title",
          // Missing detail, locality
        },
      });

      expect(response.status()).toBe(400);
    });

    test("TC-ISSUE-010: Unauthenticated request (ECP - Invalid Class)", async ({
      request,
    }) => {
      const response = await request.post(`${API_BASE_URL}/api/issues`, {
        data: {
          title: "Test Issue Title",
          detail: "This is a detailed description of the test issue",
          locality: "Test Locality",
          is_anonymous: false,
        },
      });

      expect(response.status()).toBe(401);
    });
  });

  test.describe("GET /api/issues - Get All Issues", () => {
    test("TC-ISSUE-011: Get all issues without filters (ECP - Valid Class)", async ({
      request,
    }) => {
      const response = await request.get(`${API_BASE_URL}/api/issues`);

      expect(response.status()).toBe(200);
      const responseData = await response.json();
      expect(responseData).toHaveProperty("issues");
      expect(Array.isArray(responseData.issues)).toBe(true);
    });

    test("TC-ISSUE-012: Get issues with valid status filter (ECP - Valid Class)", async ({
      request,
    }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/issues?status=pending`
      );

      expect(response.status()).toBe(200);
      const responseData = await response.json();
      expect(responseData).toHaveProperty("issues");
    });

    test("TC-ISSUE-013: Get issues with invalid status filter (ECP - Invalid Class)", async ({
      request,
    }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/issues?status=invalid_status`
      );

      expect(response.status()).toBe(400);
    });

    test("TC-ISSUE-014: Get issues with pagination (ECP - Valid Class)", async ({
      request,
    }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/issues?page=1&limit=5`
      );

      expect(response.status()).toBe(200);
      const responseData = await response.json();
      expect(responseData).toHaveProperty("issues");
      expect(responseData).toHaveProperty("pagination");
    });

    test("TC-ISSUE-015: Get issues with invalid pagination (ECP - Invalid Class)", async ({
      request,
    }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/issues?page=0&limit=0`
      );

      expect(response.status()).toBe(400);
    });

    test("TC-ISSUE-016: Get issues with date range filter (ECP - Valid Class)", async ({
      request,
    }) => {
      const startDate = new Date("2024-01-01").toISOString();
      const endDate = new Date("2024-12-31").toISOString();

      const response = await request.get(
        `${API_BASE_URL}/api/issues?startDate=${startDate}&endDate=${endDate}`
      );

      expect(response.status()).toBe(200);
    });

    test("TC-ISSUE-017: Get issues with invalid date range (ECP - Invalid Class)", async ({
      request,
    }) => {
      const startDate = new Date("2024-12-31").toISOString();
      const endDate = new Date("2024-01-01").toISOString(); // End date before start date

      const response = await request.get(
        `${API_BASE_URL}/api/issues?startDate=${startDate}&endDate=${endDate}`
      );

      expect(response.status()).toBe(400);
    });
  });

  test.describe("GET /api/issues/:id - Get Issue by ID", () => {
    test("TC-ISSUE-018: Get existing issue by valid ID (ECP - Valid Class)", async ({
      request,
    }) => {
      // First create an issue
      const token = await getAuthToken(request);
      const createResponse = await request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "Test Issue for Get",
          detail: "This is a test issue for getting by ID",
          locality: "Test Locality",
          is_anonymous: false,
        },
      });

      const createData = await createResponse.json();
      const issueId = createData.issue._id;

      // Then get the issue
      const response = await request.get(
        `${API_BASE_URL}/api/issues/${issueId}`
      );

      expect(response.status()).toBe(200);
      const responseData = await response.json();
      expect(responseData.issue._id).toBe(issueId);
    });

    test("TC-ISSUE-019: Get issue with invalid ID format (ECP - Invalid Class)", async ({
      request,
    }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/issues/invalid-id`
      );

      expect(response.status()).toBe(400);
    });

    test("TC-ISSUE-020: Get non-existent issue (ECP - Invalid Class)", async ({
      request,
    }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/issues/507f1f77bcf86cd799439011`
      );

      expect(response.status()).toBe(404);
    });
  });

  test.describe("PUT /api/issues/:id - Update Issue", () => {
    test("TC-ISSUE-021: Update issue with valid data (ECP - Valid Class)", async ({
      request,
    }) => {
      // First create an issue
      const token = await getAuthToken(request);
      const createResponse = await request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "Original Issue Title",
          detail: "Original issue description",
          locality: "Original Locality",
          is_anonymous: false,
        },
      });

      const createData = await createResponse.json();
      const issueId = createData.issue._id;

      // Then update the issue
      const response = await request.put(
        `${API_BASE_URL}/api/issues/${issueId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            title: "Updated Issue Title",
            detail: "Updated issue description",
            locality: "Updated Locality",
          },
        }
      );

      expect(response.status()).toBe(200);
      const responseData = await response.json();
      expect(responseData.issue.title).toBe("Updated Issue Title");
    });

    test("TC-ISSUE-022: Update issue with invalid data (ECP - Invalid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      // First create an issue
      const createResponse = await request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "Original Issue Title",
          detail: "Original issue description",
          locality: "Original Locality",
          is_anonymous: false,
        },
      });

      const createData = await createResponse.json();
      const issueId = createData.issue._id;

      // Then update with invalid data
      const response = await request.put(
        `${API_BASE_URL}/api/issues/${issueId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            title: "AB", // Too short
            detail: "Short", // Too short
            locality: "AB", // Too short
          },
        }
      );

      expect(response.status()).toBe(400);
    });

    test("TC-ISSUE-023: Update non-existent issue (ECP - Invalid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      const response = await request.put(
        `${API_BASE_URL}/api/issues/507f1f77bcf86cd799439011`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            title: "Updated Issue Title",
            detail: "Updated issue description",
            locality: "Updated Locality",
          },
        }
      );

      expect(response.status()).toBe(404);
    });
  });

  test.describe("PATCH /api/issues/:id/status - Update Issue Status", () => {
    test("TC-ISSUE-024: Update status with valid status (ECP - Valid Class)", async ({
      request,
    }) => {
      // First create an issue
      const token = await getAuthToken(request);
      const createResponse = await request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "Status Test Issue",
          detail: "This is a test issue for status update",
          locality: "Test Locality",
          is_anonymous: false,
        },
      });

      const createData = await createResponse.json();
      const issueId = createData.issue._id;

      // Then update status
      const response = await request.patch(
        `${API_BASE_URL}/api/issues/${issueId}/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            status: "in_progress",
          },
        }
      );

      expect(response.status()).toBe(200);
      const responseData = await response.json();
      expect(responseData.issue.status).toBe("in_progress");
    });

    test("TC-ISSUE-025: Update status with invalid status (ECP - Invalid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      // First create an issue
      const createResponse = await request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "Invalid Status Test Issue",
          detail: "This is a test issue for invalid status update",
          locality: "Test Locality",
          is_anonymous: false,
        },
      });

      const createData = await createResponse.json();
      const issueId = createData.issue._id;

      // Then update with invalid status
      const response = await request.patch(
        `${API_BASE_URL}/api/issues/${issueId}/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            status: "invalid_status",
          },
        }
      );

      expect(response.status()).toBe(400);
    });
  });

  test.describe("POST /api/issues/:id/feedback - Add Feedback", () => {
    test("TC-ISSUE-026: Add feedback with valid data (ECP - Valid Class)", async ({
      request,
    }) => {
      // First create an issue
      const token = await getAuthToken(request);
      const createResponse = await request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "Feedback Test Issue",
          detail: "This is a test issue for feedback",
          locality: "Test Locality",
          is_anonymous: false,
        },
      });

      const createData = await createResponse.json();
      const issueId = createData.issue._id;

      // Update status to resolved first
      await request.patch(`${API_BASE_URL}/api/issues/${issueId}/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          status: "resolved",
        },
      });

      // Then add feedback
      const response = await request.post(
        `${API_BASE_URL}/api/issues/${issueId}/feedback`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            feedback: "This issue was resolved satisfactorily",
            satisfaction_score: "good",
          },
        }
      );

      expect(response.status()).toBe(200);
    });

    test("TC-ISSUE-027: Add feedback with invalid satisfaction score (ECP - Invalid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      // First create an issue
      const createResponse = await request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "Invalid Feedback Test Issue",
          detail: "This is a test issue for invalid feedback",
          locality: "Test Locality",
          is_anonymous: false,
        },
      });

      const createData = await createResponse.json();
      const issueId = createData.issue._id;

      // Update status to resolved first
      await request.patch(`${API_BASE_URL}/api/issues/${issueId}/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          status: "resolved",
        },
      });

      // Then add feedback with invalid satisfaction score
      const response = await request.post(
        `${API_BASE_URL}/api/issues/${issueId}/feedback`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            feedback: "This issue was resolved satisfactorily",
            satisfaction_score: "excellent", // Invalid value
          },
        }
      );

      expect(response.status()).toBe(400);
    });
  });

  test.describe("DELETE /api/issues/:id - Delete Issue", () => {
    test("TC-ISSUE-028: Delete existing issue (ECP - Valid Class)", async ({
      request,
    }) => {
      // First create an issue
      const token = await getAuthToken(request);
      const createResponse = await request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "Delete Test Issue",
          detail: "This is a test issue for deletion",
          locality: "Test Locality",
          is_anonymous: false,
        },
      });

      const createData = await createResponse.json();
      const issueId = createData.issue._id;

      // Then delete the issue
      const response = await request.delete(
        `${API_BASE_URL}/api/issues/${issueId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status()).toBe(200);
    });

    test("TC-ISSUE-029: Delete non-existent issue (ECP - Invalid Class)", async ({
      request,
    }) => {
      const token = await getAuthToken(request);

      const response = await request.delete(
        `${API_BASE_URL}/api/issues/507f1f77bcf86cd799439011`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status()).toBe(404);
    });
  });
});
