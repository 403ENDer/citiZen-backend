import { test, expect } from "@playwright/test";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3333";

// Helper function to get admin auth token (mock implementation)
async function getAdminAuthToken(request: any) {
  // In a real implementation, you would have proper admin credentials
  // For testing purposes, we'll use a mock token
  return "mock-admin-token";
}

test.describe("Admin Workflow Integration Tests", () => {
  test("TC-INT-005: Complete constituency and panchayat management workflow", async ({
    request,
  }) => {
    const adminToken = await getAdminAuthToken(request);

    // Step 1: Create a constituency
    const constituencyResponse = await request.post(
      `${API_BASE_URL}/api/constituencies`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        data: {
          name: "Test Constituency for Admin Workflow",
          constituency_id: "ADMIN_CONST001",
          mla_id: "MLA_ADMIN001",
        },
      }
    );
    console.log(constituencyResponse);
    expect(constituencyResponse.status()).toBe(201);
    const constituencyData = await constituencyResponse.json();
    expect(constituencyData).toHaveProperty("constituency");
    expect(constituencyData.constituency.name).toBe(
      "Test Constituency for Admin Workflow"
    );

    const constituencyId = constituencyData.constituency._id;

    // Step 2: Get constituency details
    const getConstituencyResponse = await request.get(
      `${API_BASE_URL}/api/constituencies/${constituencyId}`
    );
    expect(getConstituencyResponse.status()).toBe(200);
    const getConstituencyData = await getConstituencyResponse.json();
    expect(getConstituencyData.constituency._id).toBe(constituencyId);

    // Step 3: Create panchayats for the constituency
    const panchayatsResponse = await request.post(
      `${API_BASE_URL}/api/constituencies/${constituencyId}/panchayats`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        data: {
          panchayats: [
            {
              name: "Test Panchayat 1",
              panchayat_id: "PANCH_ADMIN001",
              constituency_id: constituencyId,
              ward_list: [
                {
                  ward_id: "WARD001",
                  ward_name: "Ward 1",
                },
                {
                  ward_id: "WARD002",
                  ward_name: "Ward 2",
                },
              ],
            },
            {
              name: "Test Panchayat 2",
              panchayat_id: "PANCH_ADMIN002",
              constituency_id: constituencyId,
              ward_list: [
                {
                  ward_id: "WARD003",
                  ward_name: "Ward 3",
                },
              ],
            },
          ],
        },
      }
    );

    expect(panchayatsResponse.status()).toBe(200);
    const panchayatsData = await panchayatsResponse.json();
    expect(panchayatsData).toHaveProperty("panchayats");
    expect(panchayatsData.panchayats).toHaveLength(2);

    // Step 4: Get all panchayats for the constituency
    const getPanchayatsResponse = await request.get(
      `${API_BASE_URL}/api/panchayats/constituency/${constituencyId}`
    );
    expect(getPanchayatsResponse.status()).toBe(200);
    const getPanchayatsData = await getPanchayatsResponse.json();
    expect(getPanchayatsData.panchayats.length).toBeGreaterThanOrEqual(2);

    // Step 5: Update constituency
    const updateConstituencyResponse = await request.put(
      `${API_BASE_URL}/api/constituencies/${constituencyId}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        data: {
          name: "Updated Test Constituency",
          mla_id: "MLA_ADMIN002",
        },
      }
    );

    expect(updateConstituencyResponse.status()).toBe(200);
    const updateConstituencyData = await updateConstituencyResponse.json();
    expect(updateConstituencyData.constituency.name).toBe(
      "Updated Test Constituency"
    );

    // Step 6: Add more wards to a panchayat
    const panchayatId = panchayatsData.panchayats[0]._id;
    const addWardsResponse = await request.put(
      `${API_BASE_URL}/api/panchayats/add-wards/${panchayatId}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        data: {
          ward_list: [
            {
              ward_id: "WARD004",
              ward_name: "Ward 4",
            },
            {
              ward_id: "WARD005",
              ward_name: "Ward 5",
            },
          ],
        },
      }
    );

    expect(addWardsResponse.status()).toBe(200);

    // Step 7: Get updated panchayat details
    const getPanchayatResponse = await request.get(
      `${API_BASE_URL}/api/panchayats/${panchayatId}`
    );
    expect(getPanchayatResponse.status()).toBe(200);
    const getPanchayatData = await getPanchayatResponse.json();
    expect(getPanchayatData.panchayat.ward_list.length).toBeGreaterThanOrEqual(
      4
    );
  });

  test("TC-INT-006: Bulk operations workflow", async ({ request }) => {
    const adminToken = await getAdminAuthToken(request);

    // Step 1: Create bulk constituencies
    const bulkConstituenciesResponse = await request.post(
      `${API_BASE_URL}/api/constituencies/bulk`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        data: {
          constituencies: [
            {
              name: "Bulk Constituency 1",
              constituency_id: "BULK_CONST001",
              mla_id: "MLA_BULK001",
            },
            {
              name: "Bulk Constituency 2",
              constituency_id: "BULK_CONST002",
              mla_id: "MLA_BULK002",
            },
            {
              name: "Bulk Constituency 3",
              constituency_id: "BULK_CONST003",
              mla_id: "MLA_BULK003",
            },
          ],
        },
      }
    );

    expect(bulkConstituenciesResponse.status()).toBe(201);
    const bulkConstituenciesData = await bulkConstituenciesResponse.json();
    expect(bulkConstituenciesData.constituencies).toHaveLength(3);

    const constituencyIds = bulkConstituenciesData.constituencies.map(
      (c: any) => c._id
    );

    // Step 2: Create bulk panchayats
    const bulkPanchayatsResponse = await request.post(
      `${API_BASE_URL}/api/panchayats/bulk`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        data: {
          panchayats: [
            {
              name: "Bulk Panchayat 1",
              panchayat_id: "BULK_PANCH001",
              constituency_id: constituencyIds[0],
              ward_list: [
                {
                  ward_id: "BULK_WARD001",
                  ward_name: "Bulk Ward 1",
                },
              ],
            },
            {
              name: "Bulk Panchayat 2",
              panchayat_id: "BULK_PANCH002",
              constituency_id: constituencyIds[1],
              ward_list: [
                {
                  ward_id: "BULK_WARD002",
                  ward_name: "Bulk Ward 2",
                },
              ],
            },
          ],
        },
      }
    );

    expect(bulkPanchayatsResponse.status()).toBe(201);
    const bulkPanchayatsData = await bulkPanchayatsResponse.json();
    expect(bulkPanchayatsData.panchayats).toHaveLength(2);

    // Step 3: Verify all constituencies exist
    const allConstituenciesResponse = await request.get(
      `${API_BASE_URL}/api/constituencies`
    );
    expect(allConstituenciesResponse.status()).toBe(200);
    const allConstituenciesData = await allConstituenciesResponse.json();
    expect(allConstituenciesData.constituencies.length).toBeGreaterThanOrEqual(
      3
    );

    // Step 4: Verify all panchayats exist
    const allPanchayatsResponse = await request.get(
      `${API_BASE_URL}/api/panchayats`
    );
    expect(allPanchayatsResponse.status()).toBe(200);
    const allPanchayatsData = await allPanchayatsResponse.json();
    expect(allPanchayatsData.panchayats.length).toBeGreaterThanOrEqual(2);
  });

  test("TC-INT-007: Issue management and assignment workflow", async ({
    request,
  }) => {
    // Step 1: Create a regular user
    const userSignupResponse = await request.post(
      `${API_BASE_URL}/api/auth/signup/email`,
      {
        data: {
          email: "issuemanager@example.com",
          password: "password123",
          name: "Issue Manager User",
          phone_number: "+1234567890",
          constituency_id: "507f1f77bcf86cd799439011",
          panchayat_id: "507f1f77bcf86cd799439012",
          ward_no: "W001",
        },
      }
    );

    const userData = await userSignupResponse.json();
    const userToken = userData.token;

    // Step 2: Create an issue
    const issueResponse = await request.post(`${API_BASE_URL}/api/issues`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      data: {
        title: "Admin Management Test Issue",
        detail: "This is a test issue for admin management workflow",
        locality: "Test Locality",
        is_anonymous: false,
      },
    });

    const issueData = await issueResponse.json();
    const issueId = issueData.issue._id;

    // Step 3: Admin assigns the issue (mock admin token)
    const adminToken = await getAdminAuthToken(request);
    const assignResponse = await request.patch(
      `${API_BASE_URL}/api/issues/${issueId}/assign`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        data: {
          handled_by: "Department Head 1",
        },
      }
    );

    expect(assignResponse.status()).toBe(200);
    const assignData = await assignResponse.json();
    expect(assignData.issue.handled_by).toBe("Department Head 1");

    // Step 4: Update issue status to in_progress
    const statusResponse = await request.patch(
      `${API_BASE_URL}/api/issues/${issueId}/status`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        data: {
          status: "in_progress",
        },
      }
    );

    expect(statusResponse.status()).toBe(200);
    const statusData = await statusResponse.json();
    expect(statusData.issue.status).toBe("in_progress");

    // Step 5: Get issue statistics
    const statsResponse = await request.get(
      `${API_BASE_URL}/api/issues/statistics`
    );
    expect(statsResponse.status()).toBe(200);
    const statsData = await statsResponse.json();
    expect(statsData).toHaveProperty("totalIssues");
    expect(statsData).toHaveProperty("issuesByStatus");

    // Step 6: Filter issues by status
    const inProgressResponse = await request.get(
      `${API_BASE_URL}/api/issues?status=in_progress`
    );
    expect(inProgressResponse.status()).toBe(200);
    const inProgressData = await inProgressResponse.json();
    expect(inProgressData.issues.length).toBeGreaterThan(0);

    // Step 7: Update status to resolved
    const resolveResponse = await request.patch(
      `${API_BASE_URL}/api/issues/${issueId}/status`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        data: {
          status: "resolved",
        },
      }
    );

    expect(resolveResponse.status()).toBe(200);

    // Step 8: Add feedback
    const feedbackResponse = await request.post(
      `${API_BASE_URL}/api/issues/${issueId}/feedback`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        data: {
          feedback: "Issue was resolved satisfactorily by the department",
          satisfaction_score: "good",
        },
      }
    );

    expect(feedbackResponse.status()).toBe(200);

    // Step 9: Verify final issue state
    const finalIssueResponse = await request.get(
      `${API_BASE_URL}/api/issues/${issueId}`
    );
    expect(finalIssueResponse.status()).toBe(200);
    const finalIssueData = await finalIssueResponse.json();
    expect(finalIssueData.issue.status).toBe("resolved");
    expect(finalIssueData.issue.handled_by).toBe("Department Head 1");
    expect(finalIssueData.issue.feedback).toBeDefined();
  });

  test("TC-INT-008: Data integrity and cleanup workflow", async ({
    request,
  }) => {
    const adminToken = await getAdminAuthToken(request);

    // Step 1: Create test data
    const constituencyResponse = await request.post(
      `${API_BASE_URL}/api/constituencies`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        data: {
          name: "Cleanup Test Constituency",
          constituency_id: "CLEANUP_CONST001",
          mla_id: "MLA_CLEANUP001",
        },
      }
    );

    const constituencyData = await constituencyResponse.json();
    const constituencyId = constituencyData.constituency._id;

    // Step 2: Create panchayat
    const panchayatResponse = await request.post(
      `${API_BASE_URL}/api/panchayats`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        data: {
          name: "Cleanup Test Panchayat",
          panchayat_id: "CLEANUP_PANCH001",
          constituency_id: constituencyId,
          ward_list: [
            {
              ward_id: "CLEANUP_WARD001",
              ward_name: "Cleanup Ward 1",
            },
          ],
        },
      }
    );

    const panchayatData = await panchayatResponse.json();
    const panchayatId = panchayatData.panchayat._id;

    // Step 3: Verify data exists
    const getConstituencyResponse = await request.get(
      `${API_BASE_URL}/api/constituencies/${constituencyId}`
    );
    expect(getConstituencyResponse.status()).toBe(200);

    const getPanchayatResponse = await request.get(
      `${API_BASE_URL}/api/panchayats/${panchayatId}`
    );
    expect(getPanchayatResponse.status()).toBe(200);

    // Step 4: Update panchayat
    const updatePanchayatResponse = await request.put(
      `${API_BASE_URL}/api/panchayats/${panchayatId}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        data: {
          name: "Updated Cleanup Test Panchayat",
          ward_list: [
            {
              ward_id: "CLEANUP_WARD001",
              ward_name: "Updated Cleanup Ward 1",
            },
            {
              ward_id: "CLEANUP_WARD002",
              ward_name: "Cleanup Ward 2",
            },
          ],
        },
      }
    );

    expect(updatePanchayatResponse.status()).toBe(200);
    const updatePanchayatData = await updatePanchayatResponse.json();
    expect(updatePanchayatData.panchayat.name).toBe(
      "Updated Cleanup Test Panchayat"
    );
    expect(updatePanchayatData.panchayat.ward_list).toHaveLength(2);

    // Step 5: Update constituency
    const updateConstituencyResponse = await request.put(
      `${API_BASE_URL}/api/constituencies/${constituencyId}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        data: {
          name: "Updated Cleanup Test Constituency",
          mla_id: "MLA_CLEANUP002",
        },
      }
    );

    expect(updateConstituencyResponse.status()).toBe(200);
    const updateConstituencyData = await updateConstituencyResponse.json();
    expect(updateConstituencyData.constituency.name).toBe(
      "Updated Cleanup Test Constituency"
    );

    // Step 6: Clean up - Delete panchayat
    const deletePanchayatResponse = await request.delete(
      `${API_BASE_URL}/api/panchayats/${panchayatId}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(deletePanchayatResponse.status()).toBe(200);

    // Step 7: Verify panchayat is deleted
    const getDeletedPanchayatResponse = await request.get(
      `${API_BASE_URL}/api/panchayats/${panchayatId}`
    );
    expect(getDeletedPanchayatResponse.status()).toBe(404);

    // Step 8: Clean up - Delete constituency
    const deleteConstituencyResponse = await request.delete(
      `${API_BASE_URL}/api/constituencies/${constituencyId}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(deleteConstituencyResponse.status()).toBe(200);

    // Step 9: Verify constituency is deleted
    const getDeletedConstituencyResponse = await request.get(
      `${API_BASE_URL}/api/constituencies/${constituencyId}`
    );
    expect(getDeletedConstituencyResponse.status()).toBe(404);
  });
});
