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

test.describe("End-to-End System Tests", () => {
  test("TC-SYS-001: Complete citizen journey from registration to issue resolution", async ({
    request,
  }) => {
    // Get test data IDs
    const testData = await getTestDataIds(request);

    // Phase 1: User Registration and Authentication
    console.log("Phase 1: User Registration and Authentication");

    const signupResponse = await request.post(
      `${API_BASE_URL}/api/auth/signup/email`,
      {
        data: {
          email: "citizen@example.com",
          password: "password123",
          name: "John Citizen",
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
    expect(signupData.user.role).toBe("citizen");

    const token = signupData.token;
    const userId = signupData.user.id;

    // Verify user can access their profile
    const profileResponse = await request.get(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(profileResponse.status()).toBe(200);
    const profileData = await profileResponse.json();
    expect(profileData.user.email).toBe("citizen@example.com");

    // Phase 2: Issue Creation and Management
    console.log("Phase 2: Issue Creation and Management");

    const issueResponse = await request.post(`${API_BASE_URL}/api/issues`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        title: "Road Repair Required on Main Street",
        detail:
          "The main street in our locality has several potholes that need immediate attention. This is causing inconvenience to commuters and vehicles.",
        locality: "Main Street, Downtown Area",
        is_anonymous: false,
      },
    });

    expect(issueResponse.status()).toBe(201);
    const issueData = await issueResponse.json();
    expect(issueData).toHaveProperty("issue");
    expect(issueData.issue.title).toBe("Road Repair Required on Main Street");
    expect(issueData.issue.status).toBe("pending");

    const issueId = issueData.issue._id;

    // Phase 3: Issue Upvoting and Community Engagement
    console.log("Phase 3: Issue Upvoting and Community Engagement");

    // User upvotes their own issue
    const upvoteResponse = await request.post(
      `${API_BASE_URL}/api/upvotes/${issueId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(upvoteResponse.status()).toBe(201);

    // Verify upvote status
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

    // Phase 4: Issue Status Updates
    console.log("Phase 4: Issue Status Updates");

    // Update issue status to in_progress
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

    // Phase 5: Issue Resolution and Feedback
    console.log("Phase 5: Issue Resolution and Feedback");

    // Update status to resolved
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

    // Add feedback
    const feedbackResponse = await request.post(
      `${API_BASE_URL}/api/issues/${issueId}/feedback`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          feedback:
            "The road has been repaired and is now in good condition. Thank you for the quick response.",
          satisfaction_score: "good",
        },
      }
    );

    expect(feedbackResponse.status()).toBe(200);

    // Phase 6: Verification and Cleanup
    console.log("Phase 6: Verification and Cleanup");

    // Verify final issue state
    const finalIssueResponse = await request.get(
      `${API_BASE_URL}/api/issues/${issueId}`
    );
    expect(finalIssueResponse.status()).toBe(200);
    const finalIssueData = await finalIssueResponse.json();
    expect(finalIssueData.issue.status).toBe("resolved");
    expect(finalIssueData.issue.feedback).toBeDefined();

    // Verify user's issue list
    const userIssuesResponse = await request.get(
      `${API_BASE_URL}/api/issues/user/${userId}`
    );
    expect(userIssuesResponse.status()).toBe(200);
    const userIssuesData = await userIssuesResponse.json();
    expect(userIssuesData.issues.length).toBeGreaterThan(0);

    // Verify issue statistics
    const statsResponse = await request.get(
      `${API_BASE_URL}/api/issues/statistics`
    );
    expect(statsResponse.status()).toBe(200);
    const statsData = await statsResponse.json();
    expect(statsData).toHaveProperty("totalIssues");
    expect(statsData).toHaveProperty("issuesByStatus");
  });

  test("TC-SYS-002: Multi-user collaborative issue management", async ({
    request,
  }) => {
    // Phase 1: Create multiple users
    console.log("Phase 1: Create multiple users");

    const users = [];
    for (let i = 1; i <= 3; i++) {
      const signupResponse = await request.post(
        `${API_BASE_URL}/api/auth/signup/email`,
        {
          data: {
            email: `user${i}@example.com`,
            password: "password123",
            name: `User ${i}`,
            phone_number: `+123456789${i}`,
            constituency_id: "507f1f77bcf86cd799439011",
            panchayat_id: "507f1f77bcf86cd799439012",
            ward_no: `W00${i}`,
          },
        }
      );

      expect(signupResponse.status()).toBe(201);
      const signupData = await signupResponse.json();
      users.push({
        token: signupData.token,
        userId: signupData.user.id,
        email: signupData.user.email,
      });
    }

    // Phase 2: User 1 creates an issue
    console.log("Phase 2: User 1 creates an issue");

    const issueResponse = await request.post(`${API_BASE_URL}/api/issues`, {
      headers: {
        Authorization: `Bearer ${users[0].token}`,
      },
      data: {
        title: "Community Park Maintenance Issue",
        detail:
          "The community park needs regular maintenance. The playground equipment is broken and the grass needs trimming.",
        locality: "Community Park, Residential Area",
        is_anonymous: false,
      },
    });

    expect(issueResponse.status()).toBe(201);
    const issueData = await issueResponse.json();
    const issueId = issueData.issue._id;

    // Phase 3: All users upvote the issue
    console.log("Phase 3: All users upvote the issue");

    for (const user of users) {
      const upvoteResponse = await request.post(
        `${API_BASE_URL}/api/upvotes/${issueId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      expect(upvoteResponse.status()).toBe(201);

      // Verify each user's upvote status
      const checkResponse = await request.get(
        `${API_BASE_URL}/api/upvotes/${issueId}/check`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      expect(checkResponse.status()).toBe(200);
      const checkData = await checkResponse.json();
      expect(checkData.hasUpvoted).toBe(true);
    }

    // Phase 4: Issue status updates by different users
    console.log("Phase 4: Issue status updates by different users");

    // User 2 updates status to in_progress
    const statusResponse = await request.patch(
      `${API_BASE_URL}/api/issues/${issueId}/status`,
      {
        headers: {
          Authorization: `Bearer ${users[1].token}`,
        },
        data: {
          status: "in_progress",
        },
      }
    );

    expect(statusResponse.status()).toBe(200);

    // User 3 updates status to resolved
    const resolveResponse = await request.patch(
      `${API_BASE_URL}/api/issues/${issueId}/status`,
      {
        headers: {
          Authorization: `Bearer ${users[2].token}`,
        },
        data: {
          status: "resolved",
        },
      }
    );

    expect(resolveResponse.status()).toBe(200);

    // Phase 5: Multiple users provide feedback
    console.log("Phase 5: Multiple users provide feedback");

    const feedbacks = [
      {
        feedback: "Great work! The park looks much better now.",
        satisfaction_score: "good",
      },
      {
        feedback:
          "The playground equipment has been fixed. Children can play safely now.",
        satisfaction_score: "good",
      },
      {
        feedback: "The maintenance was done quickly and efficiently.",
        satisfaction_score: "good",
      },
    ];

    for (let i = 0; i < users.length; i++) {
      const feedbackResponse = await request.post(
        `${API_BASE_URL}/api/issues/${issueId}/feedback`,
        {
          headers: {
            Authorization: `Bearer ${users[i].token}`,
          },
          data: feedbacks[i],
        }
      );

      expect(feedbackResponse.status()).toBe(200);
    }

    // Phase 6: Verify collaborative results
    console.log("Phase 6: Verify collaborative results");

    // Check final issue state
    const finalIssueResponse = await request.get(
      `${API_BASE_URL}/api/issues/${issueId}`
    );
    expect(finalIssueResponse.status()).toBe(200);
    const finalIssueData = await finalIssueResponse.json();
    expect(finalIssueData.issue.status).toBe("resolved");

    // Check issue statistics
    const statsResponse = await request.get(
      `${API_BASE_URL}/api/issues/statistics`
    );
    expect(statsResponse.status()).toBe(200);
    const statsData = await statsResponse.json();
    expect(statsData.totalUpvotes).toBeGreaterThan(0);
  });

  test("TC-SYS-003: System performance and data consistency", async ({
    request,
  }) => {
    // Phase 1: Create multiple issues concurrently
    console.log("Phase 1: Create multiple issues concurrently");

    const userSignupResponse = await request.post(
      `${API_BASE_URL}/api/auth/signup/email`,
      {
        data: {
          email: "perftest@example.com",
          password: "password123",
          name: "Performance Test User",
          phone_number: "+1234567890",
          constituency_id: "TEST_CONST001",
          panchayat_id: "TEST_PANCH001",
          ward_no: "W001",
        },
      }
    );

    const userData = await userSignupResponse.json();
    const token = userData.token;

    // Create multiple issues
    const issuePromises = [];
    for (let i = 1; i <= 5; i++) {
      const issuePromise = request.post(`${API_BASE_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: `Performance Test Issue ${i}`,
          detail: `This is performance test issue number ${i}`,
          locality: `Test Locality ${i}`,
          is_anonymous: false,
        },
      });
      issuePromises.push(issuePromise);
    }

    const issueResponses = await Promise.all(issuePromises);
    const issueIds = [];

    for (const response of issueResponses) {
      expect(response.status()).toBe(201);
      const issueData = await response.json();
      issueIds.push(issueData.issue._id);
    }

    // Phase 2: Concurrent upvoting
    console.log("Phase 2: Concurrent upvoting");

    const upvotePromises = issueIds.map((issueId) =>
      request.post(`${API_BASE_URL}/api/upvotes/${issueId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );

    const upvoteResponses = await Promise.all(upvotePromises);

    for (const response of upvoteResponses) {
      expect(response.status()).toBe(201);
    }

    // Phase 3: Concurrent status updates
    console.log("Phase 3: Concurrent status updates");

    const statusPromises = issueIds.map((issueId) =>
      request.patch(`${API_BASE_URL}/api/issues/${issueId}/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          status: "in_progress",
        },
      })
    );

    const statusResponses = await Promise.all(statusPromises);

    for (const response of statusResponses) {
      expect(response.status()).toBe(200);
    }

    // Phase 4: Data consistency verification
    console.log("Phase 4: Data consistency verification");

    // Verify all issues exist and have correct status
    const getIssuePromises = issueIds.map((issueId) =>
      request.get(`${API_BASE_URL}/api/issues/${issueId}`)
    );

    const getIssueResponses = await Promise.all(getIssuePromises);

    for (const response of getIssueResponses) {
      expect(response.status()).toBe(200);
      const issueData = await response.json();
      expect(issueData.issue.status).toBe("in_progress");
    }

    // Verify upvote status for all issues
    const checkUpvotePromises = issueIds.map((issueId) =>
      request.get(`${API_BASE_URL}/api/upvotes/${issueId}/check`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );

    const checkUpvoteResponses = await Promise.all(checkUpvotePromises);

    for (const response of checkUpvoteResponses) {
      expect(response.status()).toBe(200);
      const checkData = await response.json();
      expect(checkData.hasUpvoted).toBe(true);
    }

    // Phase 5: System statistics verification
    console.log("Phase 5: System statistics verification");

    const statsResponse = await request.get(
      `${API_BASE_URL}/api/issues/statistics`
    );
    expect(statsResponse.status()).toBe(200);
    const statsData = await statsResponse.json();
    expect(statsData.totalIssues).toBeGreaterThanOrEqual(5);
    expect(statsData.totalUpvotes).toBeGreaterThanOrEqual(5);

    // Phase 6: Filtering and pagination test
    console.log("Phase 6: Filtering and pagination test");

    const filterResponse = await request.get(
      `${API_BASE_URL}/api/issues?status=in_progress&page=1&limit=3`
    );
    expect(filterResponse.status()).toBe(200);
    const filterData = await filterResponse.json();
    expect(filterData.issues.length).toBeLessThanOrEqual(3);
    expect(filterData.pagination.page).toBe(1);
  });

  test("TC-SYS-004: Error handling and recovery scenarios", async ({
    request,
  }) => {
    // Phase 1: Test invalid authentication scenarios
    console.log("Phase 1: Test invalid authentication scenarios");

    // Test with invalid token
    const invalidTokenResponse = await request.get(
      `${API_BASE_URL}/api/auth/me`,
      {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      }
    );

    expect(invalidTokenResponse.status()).toBe(401);

    // Test without token
    const noTokenResponse = await request.get(`${API_BASE_URL}/api/auth/me`);
    expect(noTokenResponse.status()).toBe(401);

    // Phase 2: Test invalid data scenarios
    console.log("Phase 2: Test invalid data scenarios");

    // Test invalid email format
    const invalidEmailResponse = await request.post(
      `${API_BASE_URL}/api/auth/signup/email`,
      {
        data: {
          email: "invalid-email",
          password: "password123",
          name: "Test User",
          phone_number: "+1234567890",
          constituency_id: "TEST_CONST001",
          panchayat_id: "TEST_PANCH001",
          ward_no: "W001",
        },
      }
    );

    expect(invalidEmailResponse.status()).toBe(400);

    // Test short password
    const shortPasswordResponse = await request.post(
      `${API_BASE_URL}/api/auth/signup/email`,
      {
        data: {
          email: "test@example.com",
          password: "12345",
          name: "Test User",
          phone_number: "+1234567890",
          constituency_id: "TEST_CONST001",
          panchayat_id: "TEST_PANCH001",
          ward_no: "W001",
        },
      }
    );

    expect(shortPasswordResponse.status()).toBe(400);

    // Phase 3: Test resource not found scenarios
    console.log("Phase 3: Test resource not found scenarios");

    // Test non-existent issue
    const nonExistentIssueResponse = await request.get(
      `${API_BASE_URL}/api/issues/507f1f77bcf86cd799439011`
    );
    expect(nonExistentIssueResponse.status()).toBe(404);

    // Test non-existent user
    const nonExistentUserResponse = await request.get(
      `${API_BASE_URL}/api/issues/user/507f1f77bcf86cd799439011`
    );
    expect(nonExistentUserResponse.status()).toBe(404);

    // Phase 4: Test system recovery
    console.log("Phase 4: Test system recovery");

    // Create a valid user after errors
    const validSignupResponse = await request.post(
      `${API_BASE_URL}/api/auth/signup/email`,
      {
        data: {
          email: "recovery@example.com",
          password: "password123",
          name: "Recovery Test User",
          phone_number: "+1234567890",
          constituency_id: "TEST_CONST001",
          panchayat_id: "TEST_PANCH001",
          ward_no: "W001",
        },
      }
    );

    expect(validSignupResponse.status()).toBe(201);
    const validSignupData = await validSignupResponse.json();
    const token = validSignupData.token;

    // Create a valid issue
    const validIssueResponse = await request.post(
      `${API_BASE_URL}/api/issues`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "Recovery Test Issue",
          detail: "This is a test issue for recovery testing",
          locality: "Test Locality",
          is_anonymous: false,
        },
      }
    );

    expect(validIssueResponse.status()).toBe(201);
    const validIssueData = await validIssueResponse.json();
    const issueId = validIssueData.issue._id;

    // Verify system is working normally
    const getIssueResponse = await request.get(
      `${API_BASE_URL}/api/issues/${issueId}`
    );
    expect(getIssueResponse.status()).toBe(200);

    // Phase 5: Test rate limiting and system stability
    console.log("Phase 5: Test rate limiting and system stability");

    // Make multiple rapid requests
    const rapidRequests = [];
    for (let i = 0; i < 10; i++) {
      rapidRequests.push(request.get(`${API_BASE_URL}/api/issues/statistics`));
    }

    const rapidResponses = await Promise.all(rapidRequests);

    // All requests should succeed (or be rate limited gracefully)
    for (const response of rapidResponses) {
      expect([200, 429]).toContain(response.status());
    }
  });
});
