import { test, expect } from "@playwright/test";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3333";

// Helper function to get test data IDs
async function getTestDataIds(request: any) {
  // Get constituency by ID
  const constituencyResponse = await request.get(
    `${API_BASE_URL}/api/constituencies`
  );
  const constituencies = await constituencyResponse.json();
  const testConstituency = constituencies.data?.find(
    (c: any) => c.constituency_id === "TEST_CONST001"
  );

  // Get panchayat by ID
  const panchayatResponse = await request.get(`${API_BASE_URL}/api/panchayats`);
  const panchayats = await panchayatResponse.json();
  const testPanchayat = panchayats.data?.find(
    (p: any) => p.panchayat_id === "TEST_PANCH001"
  );

  return {
    constituency_id: testConstituency?._id || "TEST_CONST001",
    panchayat_id: testPanchayat?._id || "TEST_PANCH001",
  };
}

test.describe("User Workflow Integration Tests", () => {
  test("TC-INT-001: Complete user registration and issue creation workflow", async ({
    request,
  }) => {
    // Get test data IDs
    const testData = await getTestDataIds(request);

    // Step 1: User signup
    const signupResponse = await request.post(
      `${API_BASE_URL}/api/auth/signup/email`,
      {
        data: {
          email: "workflow@example.com",
          password: "password123",
          name: "Workflow Test User",
          phone_number: "+1234567890",
          constituency_id: testData.constituency_id,
          panchayat_id: testData.panchayat_id,
          ward_no: "W001",
        },
      }
    );

    expect(signupResponse.status()).toBe(201);
    const signupData = await signupResponse.json();
    expect(signupData).toHaveProperty("token");
    expect(signupData).toHaveProperty("user");

    const token = signupData.token;
    const userId = signupData.user.id;

    // Step 2: Get user profile
    const profileResponse = await request.get(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(profileResponse.status()).toBe(200);
    const profileData = await profileResponse.json();
    expect(profileData.user.email).toBe("workflow@example.com");

    // Step 3: Create an issue
    const issueResponse = await request.post(`${API_BASE_URL}/api/issues`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        title: "Integration Test Issue",
        detail: "This is a test issue created during integration testing",
        locality: "Test Locality",
        is_anonymous: false,
      },
    });

    expect(issueResponse.status()).toBe(201);
    const issueData = await issueResponse.json();
    expect(issueData).toHaveProperty("issue");
    expect(issueData.issue.title).toBe("Integration Test Issue");

    const issueId = issueData.issue._id;

    // Step 4: Get issues by user
    const userIssuesResponse = await request.get(
      `${API_BASE_URL}/api/issues/user/${userId}`
    );

    expect(userIssuesResponse.status()).toBe(200);
    const userIssuesData = await userIssuesResponse.json();
    expect(userIssuesData.issues).toHaveLength(1);
    expect(userIssuesData.issues[0]._id).toBe(issueId);

    // Step 5: Update the issue
    const updateResponse = await request.put(
      `${API_BASE_URL}/api/issues/${issueId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "Updated Integration Test Issue",
          detail: "This is an updated test issue",
          locality: "Updated Test Locality",
        },
      }
    );

    expect(updateResponse.status()).toBe(200);
    const updateData = await updateResponse.json();
    expect(updateData.issue.title).toBe("Updated Integration Test Issue");

    // Step 6: Change password
    const changePasswordResponse = await request.post(
      `${API_BASE_URL}/api/auth/change-password`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          currentPassword: "password123",
          newPassword: "newpassword123",
        },
      }
    );

    expect(changePasswordResponse.status()).toBe(200);

    // Step 7: Login with new password
    const newLoginResponse = await request.post(
      `${API_BASE_URL}/api/auth/login/email`,
      {
        data: {
          email: "workflow@example.com",
          password: "newpassword123",
        },
      }
    );

    expect(newLoginResponse.status()).toBe(200);
    const newLoginData = await newLoginResponse.json();
    expect(newLoginData).toHaveProperty("token");
  });

  test("TC-INT-002: Issue lifecycle with upvoting workflow", async ({
    request,
  }) => {
    // Get test data IDs
    const testData = await getTestDataIds(request);

    // Step 1: Create user and issue
    const signupResponse = await request.post(
      `${API_BASE_URL}/api/auth/signup/email`,
      {
        data: {
          email: "lifecycle@example.com",
          password: "password123",
          name: "Lifecycle Test User",
          phone_number: "+1234567890",
          constituency_id: testData.constituency_id,
          panchayat_id: testData.panchayat_id,
          ward_no: "W001",
        },
      }
    );

    const signupData = await signupResponse.json();
    const token = signupData.token;

    const issueResponse = await request.post(`${API_BASE_URL}/api/issues`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        title: "Lifecycle Test Issue",
        detail: "This is a test issue for lifecycle testing",
        locality: "Test Locality",
        is_anonymous: false,
      },
    });

    const issueData = await issueResponse.json();
    const issueId = issueData.issue._id;

    // Step 2: Add upvote to the issue
    const upvoteResponse = await request.post(
      `${API_BASE_URL}/api/upvotes/${issueId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(upvoteResponse.status()).toBe(201);

    // Step 3: Check upvote status
    const checkUpvoteResponse = await request.get(
      `${API_BASE_URL}/api/upvotes/${issueId}/check`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(checkUpvoteResponse.status()).toBe(200);
    const checkUpvoteData = await checkUpvoteResponse.json();
    expect(checkUpvoteData.hasUpvoted).toBe(true);

    // Step 4: Update issue status
    const statusResponse = await request.patch(
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

    expect(statusResponse.status()).toBe(200);
    const statusData = await statusResponse.json();
    expect(statusData.issue.status).toBe("in_progress");

    // Step 5: Update status to resolved
    const resolveResponse = await request.patch(
      `${API_BASE_URL}/api/issues/${issueId}/status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          status: "resolved",
        },
      }
    );

    expect(resolveResponse.status()).toBe(200);

    // Step 6: Add feedback
    const feedbackResponse = await request.post(
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

    expect(feedbackResponse.status()).toBe(200);

    // Step 7: Remove upvote
    const removeUpvoteResponse = await request.delete(
      `${API_BASE_URL}/api/upvotes/${issueId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(removeUpvoteResponse.status()).toBe(200);

    // Step 8: Verify final state
    const finalCheckResponse = await request.get(
      `${API_BASE_URL}/api/upvotes/${issueId}/check`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(finalCheckResponse.status()).toBe(200);
    const finalCheckData = await finalCheckResponse.json();
    expect(finalCheckData.hasUpvoted).toBe(false);
  });

  test("TC-INT-003: Multi-user issue interaction workflow", async ({
    request,
  }) => {
    // Get test data IDs
    const testData = await getTestDataIds(request);

    // Step 1: Create first user
    const user1Signup = await request.post(
      `${API_BASE_URL}/api/auth/signup/email`,
      {
        data: {
          email: "user1@example.com",
          password: "password123",
          name: "User One",
          phone_number: "+1234567890",
          constituency_id: testData.constituency_id,
          panchayat_id: testData.panchayat_id,
          ward_no: "W001",
        },
      }
    );

    const user1Data = await user1Signup.json();
    const user1Token = user1Data.token;
    const user1Id = user1Data.user.id;

    // Step 2: Create second user
    const user2Signup = await request.post(
      `${API_BASE_URL}/api/auth/signup/email`,
      {
        data: {
          email: "user2@example.com",
          password: "password123",
          name: "User Two",
          phone_number: "+1234567891",
          constituency_id: testData.constituency_id,
          panchayat_id: testData.panchayat_id,
          ward_no: "W002",
        },
      }
    );

    const user2Data = await user2Signup.json();
    const user2Token = user2Data.token;
    const user2Id = user2Data.user.id;

    // Step 3: User 1 creates an issue
    const issueResponse = await request.post(`${API_BASE_URL}/api/issues`, {
      headers: {
        Authorization: `Bearer ${user1Token}`,
      },
      data: {
        title: "Multi-user Test Issue",
        detail: "This is a test issue for multi-user interaction",
        locality: "Test Locality",
        is_anonymous: false,
      },
    });

    const issueData = await issueResponse.json();
    const issueId = issueData.issue._id;

    // Step 4: User 2 upvotes the issue
    const user2UpvoteResponse = await request.post(
      `${API_BASE_URL}/api/upvotes/${issueId}`,
      {
        headers: {
          Authorization: `Bearer ${user2Token}`,
        },
      }
    );

    expect(user2UpvoteResponse.status()).toBe(201);

    // Step 5: User 1 upvotes their own issue
    const user1UpvoteResponse = await request.post(
      `${API_BASE_URL}/api/upvotes/${issueId}`,
      {
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      }
    );

    expect(user1UpvoteResponse.status()).toBe(201);

    // Step 6: Both users check upvote status
    const user1CheckResponse = await request.get(
      `${API_BASE_URL}/api/upvotes/${issueId}/check`,
      {
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      }
    );

    expect(user1CheckResponse.status()).toBe(200);
    const user1CheckData = await user1CheckResponse.json();
    expect(user1CheckData.hasUpvoted).toBe(true);

    const user2CheckResponse = await request.get(
      `${API_BASE_URL}/api/upvotes/${issueId}/check`,
      {
        headers: {
          Authorization: `Bearer ${user2Token}`,
        },
      }
    );

    expect(user2CheckResponse.status()).toBe(200);
    const user2CheckData = await user2CheckResponse.json();
    expect(user2CheckData.hasUpvoted).toBe(true);

    // Step 7: Get issue statistics
    const statsResponse = await request.get(
      `${API_BASE_URL}/api/issues/statistics`
    );

    expect(statsResponse.status()).toBe(200);
    const statsData = await statsResponse.json();
    expect(statsData).toHaveProperty("totalIssues");
    expect(statsData).toHaveProperty("totalUpvotes");

    // Step 8: User 2 removes their upvote
    const user2RemoveUpvoteResponse = await request.delete(
      `${API_BASE_URL}/api/upvotes/${issueId}`,
      {
        headers: {
          Authorization: `Bearer ${user2Token}`,
        },
      }
    );

    expect(user2RemoveUpvoteResponse.status()).toBe(200);

    // Step 9: Verify user 2's upvote is removed but user 1's remains
    const user2FinalCheckResponse = await request.get(
      `${API_BASE_URL}/api/upvotes/${issueId}/check`,
      {
        headers: {
          Authorization: `Bearer ${user2Token}`,
        },
      }
    );

    expect(user2FinalCheckResponse.status()).toBe(200);
    const user2FinalCheckData = await user2FinalCheckResponse.json();
    expect(user2FinalCheckData.hasUpvoted).toBe(false);

    const user1FinalCheckResponse = await request.get(
      `${API_BASE_URL}/api/upvotes/${issueId}/check`,
      {
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      }
    );

    expect(user1FinalCheckResponse.status()).toBe(200);
    const user1FinalCheckData = await user1FinalCheckResponse.json();
    expect(user1FinalCheckData.hasUpvoted).toBe(true);
  });

  test("TC-INT-004: Issue filtering and pagination workflow", async ({
    request,
  }) => {
    // Get test data IDs
    const testData = await getTestDataIds(request);

    // Step 1: Create user
    const signupResponse = await request.post(
      `${API_BASE_URL}/api/auth/signup/email`,
      {
        data: {
          email: "filtertest@example.com",
          password: "password123",
          name: "Filter Test User",
          phone_number: "+1234567890",
          constituency_id: testData.constituency_id,
          panchayat_id: testData.panchayat_id,
          ward_no: "W001",
        },
      }
    );

    const signupData = await signupResponse.json();
    const token = signupData.token;

    // Step 2: Create multiple issues with different statuses
    const issues = [
      { title: "Pending Issue 1", status: "pending" },
      { title: "In Progress Issue 1", status: "in_progress" },
      { title: "Resolved Issue 1", status: "resolved" },
      { title: "Pending Issue 2", status: "pending" },
      { title: "Rejected Issue 1", status: "rejected" },
    ];

    const createdIssues = [];

    for (const issue of issues) {
      const issueResponse = await request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: issue.title,
          detail: `This is a ${issue.status} issue for filtering tests`,
          locality: "Test Locality",
          is_anonymous: false,
        },
      });

      const issueData = await issueResponse.json();
      const issueId = issueData.issue._id;

      // Update status if not pending
      if (issue.status !== "pending") {
        await request.patch(`${API_BASE_URL}/api/issues/${issueId}/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            status: issue.status,
          },
        });
      }

      createdIssues.push({ id: issueId, status: issue.status });
    }

    // Step 3: Test filtering by status
    const pendingResponse = await request.get(
      `${API_BASE_URL}/api/issues?status=pending`
    );
    expect(pendingResponse.status()).toBe(200);
    const pendingData = await pendingResponse.json();
    expect(pendingData.issues.length).toBeGreaterThanOrEqual(2);

    const resolvedResponse = await request.get(
      `${API_BASE_URL}/api/issues?status=resolved`
    );
    expect(resolvedResponse.status()).toBe(200);
    const resolvedData = await resolvedResponse.json();
    expect(resolvedData.issues.length).toBeGreaterThanOrEqual(1);

    // Step 4: Test pagination
    const page1Response = await request.get(
      `${API_BASE_URL}/api/issues?page=1&limit=2`
    );
    expect(page1Response.status()).toBe(200);
    const page1Data = await page1Response.json();
    expect(page1Data.issues.length).toBeLessThanOrEqual(2);
    expect(page1Data.pagination.page).toBe(1);

    const page2Response = await request.get(
      `${API_BASE_URL}/api/issues?page=2&limit=2`
    );
    expect(page2Response.status()).toBe(200);
    const page2Data = await page2Response.json();
    expect(page2Data.pagination.page).toBe(2);

    // Step 5: Test sorting
    const sortedResponse = await request.get(
      `${API_BASE_URL}/api/issues?sortBy=title&sortOrder=asc`
    );
    expect(sortedResponse.status()).toBe(200);
    const sortedData = await sortedResponse.json();
    expect(sortedData.issues.length).toBeGreaterThan(0);

    // Step 6: Test date range filtering
    const startDate = new Date("2024-01-01").toISOString();
    const endDate = new Date("2025-12-31").toISOString();

    const dateRangeResponse = await request.get(
      `${API_BASE_URL}/api/issues?startDate=${startDate}&endDate=${endDate}`
    );
    expect(dateRangeResponse.status()).toBe(200);
    const dateRangeData = await dateRangeResponse.json();
    expect(dateRangeData.issues.length).toBeGreaterThan(0);
  });
});
