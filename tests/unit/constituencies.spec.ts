import { test, expect } from "@playwright/test";
import {
  setupTestData,
  getTestDataIds,
  getAdminAuthToken,
} from "../setup/testData";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3333";

// Helper function to get a unique MLA ID for testing
function getUniqueMlaId(suffix: string = ""): string {
  const testData = getTestDataIds();
  return testData.mla_user_id + suffix;
}

// Helper function to get a unique constituency ID for testing
function getUniqueConstituencyId(suffix: string = ""): string {
  const timestamp = Date.now().toString().slice(-6);
  return `CONST_${timestamp}${suffix}`;
}

// Setup test data before all tests
test.beforeAll(async ({ request }) => {
  await setupTestData(request);
});

test.describe("Constituencies API - Unit Tests", () => {
  test.describe("POST /api/constituencies - Create Constituency", () => {
    test("TC-CONST-001: Valid constituency creation (ECP - Valid Class)", async ({
      request,
    }) => {
      const adminToken = getAdminAuthToken();
      const testData = getTestDataIds();

      const response = await request.post(
        `${API_BASE_URL}/api/constituencies`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            name: "Test Constituency",
            constituency_id: getUniqueConstituencyId(),
            mla_id: testData.mla_user_id,
          },
        }
      );

      expect(response.status()).toBe(201);
      const responseData = await response.json();
      expect(responseData).toHaveProperty("constituency");
      expect(responseData.constituency.name).toBe("Test Constituency");
    });

    test("TC-CONST-002: Name too short (BVA - Just below boundary)", async ({
      request,
    }) => {
      const adminToken = getAdminAuthToken();

      const response = await request.post(
        `${API_BASE_URL}/api/constituencies`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            name: "A", // 1 character (minimum is 2)
            constituency_id: getUniqueConstituencyId(),
            mla_id: getUniqueMlaId(),
          },
        }
      );

      expect(response.status()).toBe(400);
    });

    test("TC-CONST-003: Name at minimum boundary (BVA - At boundary)", async ({
      request,
    }) => {
      const adminToken = getAdminAuthToken();

      const response = await request.post(
        `${API_BASE_URL}/api/constituencies`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            name: "AB", // Exactly 2 characters
            constituency_id: getUniqueConstituencyId(),
            mla_id: getUniqueMlaId(),
          },
        }
      );

      if (response.status() !== 201) {
        const errorData = await response.json();
      }

      expect(response.status()).toBe(201);
    });

    test("TC-CONST-004: Name too long (BVA - Just above boundary)", async ({
      request,
    }) => {
      const adminToken = getAdminAuthToken();

      const response = await request.post(
        `${API_BASE_URL}/api/constituencies`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            name: "A".repeat(101), // 101 characters (maximum is 100)
            constituency_id: getUniqueConstituencyId(),
            mla_id: getUniqueMlaId(),
          },
        }
      );

      expect(response.status()).toBe(400);
    });

    test("TC-CONST-005: Constituency ID too short (BVA - Just below boundary)", async ({
      request,
    }) => {
      const adminToken = getAdminAuthToken();

      const response = await request.post(
        `${API_BASE_URL}/api/constituencies`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            name: "Test Constituency",
            constituency_id: "", // Empty (minimum is 1)
            mla_id: getUniqueMlaId(),
          },
        }
      );

      expect(response.status()).toBe(400);
    });

    test("TC-CONST-006: Constituency ID at minimum boundary (BVA - At boundary)", async ({
      request,
    }) => {
      const adminToken = getAdminAuthToken();

      const response = await request.post(
        `${API_BASE_URL}/api/constituencies`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            name: `TC006 Constituency ${Date.now()}`,
            constituency_id: "AB", // Exactly 2 characters (minimum valid)
            mla_id: getUniqueMlaId(),
          },
        }
      );

      if (response.status() !== 201) {
        const errorData = await response.json();
      }

      expect(response.status()).toBe(201);
    });

    test("TC-CONST-007: Missing required fields (ECP - Invalid Class)", async ({
      request,
    }) => {
      const adminToken = getAdminAuthToken();

      const response = await request.post(
        `${API_BASE_URL}/api/constituencies`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            name: "Test Constituency",
            // Missing constituency_id, mla_id
          },
        }
      );

      expect(response.status()).toBe(400);
    });

    test("TC-CONST-008: Unauthorized request (ECP - Invalid Class)", async ({
      request,
    }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/constituencies`,
        {
          data: {
            name: "Test Constituency",
            constituency_id: getUniqueConstituencyId(),
            mla_id: getUniqueMlaId(),
          },
        }
      );

      expect(response.status()).toBe(401);
    });

    test("TC-CONST-009: Duplicate constituency ID (ECP - Invalid Class)", async ({
      request,
    }) => {
      const adminToken = getAdminAuthToken();

      // First create a constituency with a specific duplicate ID
      const dupId = getUniqueConstituencyId("_DUP");
      await request.post(`${API_BASE_URL}/api/constituencies`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        data: {
          name: "First Constituency",
          constituency_id: dupId,
          mla_id: getUniqueMlaId(),
        },
      });

      // Then try to create another with same ID
      const response = await request.post(
        `${API_BASE_URL}/api/constituencies`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            name: "Second Constituency",
            constituency_id: dupId, // Same ID
            mla_id: getUniqueMlaId(),
          },
        }
      );

      expect(response.status()).toBe(400);
    });
  });

  test.describe("GET /api/constituencies - Get All Constituencies", () => {
    test("TC-CONST-010: Get all constituencies (ECP - Valid Class)", async ({
      request,
    }) => {
      const response = await request.get(`${API_BASE_URL}/api/constituencies`);

      expect(response.status()).toBe(200);
      const responseData = await response.json();
      expect(responseData).toHaveProperty("constituencies");
      expect(Array.isArray(responseData.constituencies)).toBe(true);
    });
  });

  test.describe("GET /api/constituencies/:id - Get Constituency by ID", () => {
    test("TC-CONST-011: Get existing constituency by valid ID (ECP - Valid Class)", async ({
      request,
    }) => {
      // First create a constituency
      const adminToken = getAdminAuthToken();
      const createResponse = await request.post(
        `${API_BASE_URL}/api/constituencies`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            name: "Test Constituency for Get",
            constituency_id: getUniqueConstituencyId("_GET"),
            mla_id: getUniqueMlaId(),
          },
        }
      );

      const createData = await createResponse.json();
      const constituencyId = createData.constituency._id;

      // Then get the constituency
      const response = await request.get(
        `${API_BASE_URL}/api/constituencies/${constituencyId}`
      );

      expect(response.status()).toBe(200);
      const responseData = await response.json();
      expect(responseData.constituency._id).toBe(constituencyId);
    });

    test("TC-CONST-012: Get constituency with invalid ID format (ECP - Invalid Class)", async ({
      request,
    }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/constituencies/invalid-id`
      );

      // API now properly returns 400 for invalid ObjectId format
      expect(response.status()).toBe(400);
    });

    test("TC-CONST-013: Get non-existent constituency (ECP - Invalid Class)", async ({
      request,
    }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/constituencies/507f1f77bcf86cd799439011`
      );

      expect(response.status()).toBe(404);
    });
  });

  test.describe("PUT /api/constituencies/:id - Update Constituency", () => {
    test("TC-CONST-014: Update constituency with valid data (ECP - Valid Class)", async ({
      request,
    }) => {
      // First create a constituency (unique name to avoid name collision)
      const adminToken = getAdminAuthToken();
      const createResponse = await request.post(
        `${API_BASE_URL}/api/constituencies`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            name: `Original Constituency Name ${Date.now()}`,
            constituency_id: getUniqueConstituencyId("_UPDATE"),
            mla_id: getUniqueMlaId(),
          },
        }
      );

      const createData = await createResponse.json();

      if (createResponse.status() !== 201) {
        throw new Error(
          `Failed to create constituency: ${JSON.stringify(createData)}`
        );
      }

      const constituencyId = createData.constituency._id;

      // Then update the constituency
      const response = await request.put(
        `${API_BASE_URL}/api/constituencies/${constituencyId}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            name: "Updated Constituency Name",
            // keep same MLA; updating MLA is not required for this test
          },
        }
      );

      expect(response.status()).toBe(200);
      const responseData = await response.json();
      expect(responseData.constituency.name).toBe("Updated Constituency Name");
    });

    test("TC-CONST-015: Update constituency with invalid data (ECP - Invalid Class)", async ({
      request,
    }) => {
      const adminToken = getAdminAuthToken();

      // First create a constituency (unique name to avoid name collision)
      const createResponse = await request.post(
        `${API_BASE_URL}/api/constituencies`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            name: `Original Constituency Name ${Date.now()}`,
            constituency_id: getUniqueConstituencyId("_INVALID"),
            mla_id: getUniqueMlaId(),
          },
        }
      );

      const createData = await createResponse.json();
      if (createResponse.status() !== 201) {
        throw new Error(
          `Failed to create constituency: ${JSON.stringify(createData)}`
        );
      }
      const constituencyId = createData.constituency._id;

      // Then update with invalid data
      const response = await request.put(
        `${API_BASE_URL}/api/constituencies/${constituencyId}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            name: "A", // Too short
            constituency_id: "", // Too short
          },
        }
      );

      expect(response.status()).toBe(400);
    });

    test("TC-CONST-016: Update non-existent constituency (ECP - Invalid Class)", async ({
      request,
    }) => {
      const adminToken = getAdminAuthToken();

      const response = await request.put(
        `${API_BASE_URL}/api/constituencies/507f1f77bcf86cd799439011`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            name: "Updated Constituency Name",
            mla_id: getUniqueMlaId("_2"),
          },
        }
      );

      expect(response.status()).toBe(404);
    });
  });

  test.describe("DELETE /api/constituencies/:id - Delete Constituency", () => {
    test("TC-CONST-017: Delete existing constituency (ECP - Valid Class)", async ({
      request,
    }) => {
      // First create a constituency
      const adminToken = getAdminAuthToken();
      const createResponse = await request.post(
        `${API_BASE_URL}/api/constituencies`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            name: "Delete Test Constituency",
            constituency_id: getUniqueConstituencyId("_DELETE"),
            mla_id: getUniqueMlaId(),
          },
        }
      );

      const createData = await createResponse.json();
      const constituencyId = createData.constituency._id;

      // Then delete the constituency
      const response = await request.delete(
        `${API_BASE_URL}/api/constituencies/${constituencyId}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      expect(response.status()).toBe(200);
    });

    test("TC-CONST-018: Delete non-existent constituency (ECP - Invalid Class)", async ({
      request,
    }) => {
      const adminToken = getAdminAuthToken();

      const response = await request.delete(
        `${API_BASE_URL}/api/constituencies/507f1f77bcf86cd799439011`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      expect(response.status()).toBe(404);
    });
  });

  test.describe("POST /api/constituencies/bulk - Create Bulk Constituencies", () => {
    test("TC-CONST-019: Create bulk constituencies with valid data (ECP - Valid Class)", async ({
      request,
    }) => {
      const adminToken = getAdminAuthToken();

      const response = await request.post(
        `${API_BASE_URL}/api/constituencies/bulk`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            constituencies: [
              {
                name: "Bulk Constituency 1",
                constituency_id: getUniqueConstituencyId("_BULK1"),
                mla_id: getUniqueMlaId(),
              },
              {
                name: "Bulk Constituency 2",
                constituency_id: getUniqueConstituencyId("_BULK2"),
                mla_id: getUniqueMlaId("_2"),
              },
            ],
          },
        }
      );

      expect(response.status()).toBe(201);
      const responseData = await response.json();
      expect(responseData).toHaveProperty("constituencies");
      expect(responseData.constituencies).toHaveLength(2);
    });

    test("TC-CONST-020: Create bulk constituencies with empty array (ECP - Invalid Class)", async ({
      request,
    }) => {
      const adminToken = getAdminAuthToken();

      const response = await request.post(
        `${API_BASE_URL}/api/constituencies/bulk`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            constituencies: [], // Empty array
          },
        }
      );

      expect(response.status()).toBe(400);
    });

    test("TC-CONST-021: Create bulk constituencies with invalid data (ECP - Invalid Class)", async ({
      request,
    }) => {
      const adminToken = getAdminAuthToken();

      const response = await request.post(
        `${API_BASE_URL}/api/constituencies/bulk`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            constituencies: [
              {
                name: "A", // Too short
                constituency_id: "", // Too short
                mla_id: getUniqueMlaId(),
              },
            ],
          },
        }
      );

      expect(response.status()).toBe(400);
    });
  });

  test.describe("POST /api/constituencies/:constituency_id/panchayats - Add Panchayats to Constituency", () => {
    test("TC-CONST-022: Add panchayats to existing constituency (ECP - Valid Class)", async ({
      request,
    }) => {
      // First create a constituency
      const adminToken = getAdminAuthToken();
      const createResponse = await request.post(
        `${API_BASE_URL}/api/constituencies`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            name: "Constituency for Panchayats",
            constituency_id: getUniqueConstituencyId("_PANCH"),
            mla_id: getUniqueMlaId(),
          },
        }
      );

      const createData = await createResponse.json();
      const constituencyId = createData.constituency._id;

      // Then add panchayats
      const response = await request.post(
        `${API_BASE_URL}/api/constituencies/${constituencyId}/panchayats`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            panchayats: [
              {
                name: "Test Panchayat 1",
                panchayat_id: "PANCH001",
                constituency_id: constituencyId,
                ward_list: [
                  {
                    ward_id: "WARD001",
                    ward_name: "Ward 1",
                  },
                ],
              },
            ],
          },
        }
      );

      expect(response.status()).toBe(200);
    });

    test("TC-CONST-023: Add panchayats to non-existent constituency (ECP - Invalid Class)", async ({
      request,
    }) => {
      const adminToken = getAdminAuthToken();

      const response = await request.post(
        `${API_BASE_URL}/api/constituencies/507f1f77bcf86cd799439011/panchayats`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            panchayats: [
              {
                name: "Test Panchayat",
                panchayat_id: "PANCH001",
                constituency_id: getUniqueConstituencyId("_NONEXISTENT"),
                ward_list: [
                  {
                    ward_id: "WARD001",
                    ward_name: "Ward 1",
                  },
                ],
              },
            ],
          },
        }
      );

      expect(response.status()).toBe(404);
    });
  });
});
