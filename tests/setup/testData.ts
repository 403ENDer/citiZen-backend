import { test } from "@playwright/test";
import mongoose from "mongoose";
import Department from "../../src/models/departmentModel";
import DepartmentEmployee from "../../src/models/departmentEmployeeModel";
import { userModel } from "../../src/models/userModel";
import { RoleTypes } from "../../src/utils/types";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3333";

// Test data IDs that will be created during setup
export let testConstituencyId: string;
export let testPanchayatId: string;
export let testWardId: string;

// Setup test data before all tests
export async function setupTestData(request: any) {
  console.log("Setting up test data...");

  try {
    // Ensure DB connection for direct model writes (departments, roles)
    if (mongoose.connection.readyState === 0) {
      const uri =
        process.env.MONGO_URI || "mongodb://localhost:27017/citizen_db";
      await mongoose.connect(uri);
    }

    // Reset test database to ensure clean slate across runs
    try {
      if (process.env.NODE_ENV === "test" && mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
      }
    } catch {}

    // Ensure signup tests can pass consistently by removing known conflicting identities
    try {
      await userModel.deleteMany({
        $or: [{ email: "test@example.com" }, { phone_number: "+1234567890" }],
      });
    } catch {}
    // Idempotently ensure test constituency exists (find by constituency_id)
    const existingConstRes = await request.get(
      `${API_BASE_URL}/api/constituencies`
    );
    if (existingConstRes.status() === 200) {
      const existingData = await existingConstRes.json();
      const list = existingData.constituencies || existingData.data || [];
      const found = list.find(
        (c: any) => c.constituency_id === "TEST_CONST001"
      );
      if (found) {
        testConstituencyId = found._id;
      }
    }

    if (!testConstituencyId) {
      const constituencyResponse = await request.post(
        `${API_BASE_URL}/api/constituencies`,
        {
          headers: {
            Authorization: "Bearer mock-admin-token",
          },
          data: {
            name: "Test Constituency",
            constituency_id: "TEST_CONST001",
            mla_id: "507f1f77bcf86cd799439011",
          },
        }
      );

      if (constituencyResponse.status() === 201) {
        const constituencyData = await constituencyResponse.json();
        testConstituencyId = constituencyData.constituency._id;
        console.log("Test constituency created:", testConstituencyId);
      }
    }

    // Idempotently ensure test panchayat exists (find by panchayat_id)
    const existingPanchRes = await request.get(
      `${API_BASE_URL}/api/panchayats`
    );
    if (existingPanchRes.status() === 200) {
      const existingP = await existingPanchRes.json();
      const plist = existingP.panchayats || existingP.data || [];
      const pfound = plist.find((p: any) => p.panchayat_id === "TEST_PANCH001");
      if (pfound) {
        testPanchayatId = pfound._id;
        testWardId =
          (pfound.ward_list && pfound.ward_list[0]?.ward_id) || "WARD001";
      }
    }

    if (!testPanchayatId) {
      const panchayatResponse = await request.post(
        `${API_BASE_URL}/api/panchayats`,
        {
          headers: {
            Authorization: "Bearer mock-admin-token",
          },
          data: {
            name: "Test Panchayat",
            panchayat_id: "TEST_PANCH001",
            constituency_id: testConstituencyId,
            ward_list: [
              {
                ward_id: "WARD001",
                ward_name: "Test Ward 1",
              },
              {
                ward_id: "WARD002",
                ward_name: "Test Ward 2",
              },
            ],
          },
        }
      );

      if (panchayatResponse.status() === 201) {
        const panchayatData = await panchayatResponse.json();
        testPanchayatId = panchayatData.panchayat._id;
        testWardId = "WARD001";
        console.log("Test panchayat created:", testPanchayatId);
      }
    }

    // 4) Create users and roles
    // 4.1 MLA user
    const mlaEmail = "mla_test@example.com";
    let mlaToken: string | undefined;
    let mlaUserId: string | undefined;
    {
      const res = await request.post(`${API_BASE_URL}/api/auth/signup/email`, {
        data: {
          email: mlaEmail,
          password: "password123",
          name: "MLA Test User",
          phone_number: "+1111111111",
          constituency_id: testConstituencyId,
          panchayat_id: testPanchayatId,
          ward_no: "WARD001",
        },
      });
      if (res.status() === 201) {
        const d = await res.json();
        mlaToken = d.token;
        mlaUserId = d.user.id;
      } else {
        // try login if exists
        const login = await request.post(
          `${API_BASE_URL}/api/auth/login/email`,
          {
            data: { email: mlaEmail, password: "password123" },
          }
        );
        if (login.status() === 200) {
          const d = await login.json();
          mlaToken = d.token;
          // fetch profile
          const meRes = await request.get(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${mlaToken}` },
          });
          if (meRes.status() === 200) {
            const me = await meRes.json();
            mlaUserId = me.user.id;
          }
        }
      }

      // Set role to MLA staff directly in DB
      if (mlaUserId) {
        await userModel.findByIdAndUpdate(mlaUserId, {
          role: RoleTypes.MLASTAFF,
        });
      }
    }

    // Update constituency with MLA id if possible
    if (mlaUserId) {
      await request.put(
        `${API_BASE_URL}/api/constituencies/${testConstituencyId}`,
        {
          headers: { Authorization: "Bearer mock-admin-token" },
          data: { mla_id: mlaUserId },
        }
      );
    }

    // 4.2 Department head (dept) and dept staff
    const deptHeadEmail = "dept_head@example.com";
    let deptHeadUserId: string | undefined;
    {
      const res = await request.post(`${API_BASE_URL}/api/auth/signup/email`, {
        data: {
          email: deptHeadEmail,
          password: "password123",
          name: "Dept Head",
          phone_number: "+1222222222",
          constituency_id: testConstituencyId,
          panchayat_id: testPanchayatId,
          ward_no: "WARD001",
        },
      });
      if (res.status() === 201) {
        const u = await res.json();
        deptHeadUserId = u.user.id;
      } else {
        const login = await request.post(
          `${API_BASE_URL}/api/auth/login/email`,
          {
            data: { email: deptHeadEmail, password: "password123" },
          }
        );
        if (login.status() === 200) {
          const u = await login.json();
          deptHeadUserId = u.user.id;
        }
      }
      if (deptHeadUserId) {
        await userModel.findByIdAndUpdate(deptHeadUserId, {
          role: RoleTypes.DEPT,
        });
      }
    }

    // Dept staff user
    const deptStaffEmail = "dept_staff@example.com";
    let deptStaffUserId: string | undefined;
    {
      const res = await request.post(`${API_BASE_URL}/api/auth/signup/email`, {
        data: {
          email: deptStaffEmail,
          password: "password123",
          name: "Dept Staff",
          phone_number: "+1333333333",
          constituency_id: testConstituencyId,
          panchayat_id: testPanchayatId,
          ward_no: "WARD001",
        },
      });
      if (res.status() === 201) {
        const u = await res.json();
        deptStaffUserId = u.user.id;
      } else {
        const login = await request.post(
          `${API_BASE_URL}/api/auth/login/email`,
          {
            data: { email: deptStaffEmail, password: "password123" },
          }
        );
        if (login.status() === 200) {
          const u = await login.json();
          deptStaffUserId = u.user.id;
        }
      }
      if (deptStaffUserId) {
        await userModel.findByIdAndUpdate(deptStaffUserId, {
          role: RoleTypes.DEPT_STAFF,
        });
      }
    }

    // 3) Create test department and attach head and an employee
    let departmentId: string | undefined;
    if (deptHeadUserId) {
      const existingDept = await Department.findOne({
        name: "Electricity Department",
      });
      if (existingDept) {
        departmentId = existingDept._id.toString();
        if (existingDept.head_id.toString() !== deptHeadUserId) {
          existingDept.head_id = new mongoose.Types.ObjectId(deptHeadUserId);
          await existingDept.save();
        }
      } else {
        const dept = await Department.create({
          name: "Electricity Department",
          head_id: new mongoose.Types.ObjectId(deptHeadUserId),
        });
        departmentId = dept._id.toString();
      }
    }

    if (departmentId && deptStaffUserId) {
      const existingEmp = await DepartmentEmployee.findOne({
        user_id: new mongoose.Types.ObjectId(deptStaffUserId),
        dept_id: new mongoose.Types.ObjectId(departmentId),
      });
      if (!existingEmp) {
        await DepartmentEmployee.create({
          user_id: new mongoose.Types.ObjectId(deptStaffUserId),
          dept_id: new mongoose.Types.ObjectId(departmentId),
        });
      }
    }

    // 4.3 Normal user is created via createTestUser during tests

    console.log("Test data setup completed");
  } catch (error) {
    console.error("Error setting up test data:", error);
  }
}

// Helper function to get test data IDs
export function getTestDataIds() {
  return {
    constituency_id: testConstituencyId || "507f1f77bcf86cd799439011",
    panchayat_id: testPanchayatId || "507f1f77bcf86cd799439012",
    ward_no: testWardId || "WARD001",
  };
}

// Helper function to create a test user and get token
export async function createTestUser(
  request: any,
  email: string = "test@example.com"
) {
  const testData = getTestDataIds();
  const uniquePhone = () => `+1${Date.now().toString().slice(-10)}`;

  // First attempt: signup with unique phone to avoid collisions
  let response = await request.post(`${API_BASE_URL}/api/auth/signup/email`, {
    data: {
      email: email,
      password: "password123",
      name: "Test User",
      phone_number: uniquePhone(),
      constituency_id: testData.constituency_id,
      panchayat_id: testData.panchayat_id,
      ward_no: testData.ward_no,
    },
  });

  if (response.status() === 201) {
    const data = await response.json();
    return data.token;
  }

  // If failure, inspect error and recover
  let errorBody: any = {};
  try {
    errorBody = await response.json();
  } catch {}
  const errorMsg = (errorBody?.message || errorBody?.error || "")
    .toString()
    .toLowerCase();

  // If email exists, login instead
  if (response.status() === 400 || response.status() === 409) {
    if (errorMsg.includes("email")) {
      const loginRes = await request.post(
        `${API_BASE_URL}/api/auth/login/email`,
        {
          data: { email: email, password: "password123" },
        }
      );
      if (loginRes.status() === 200) {
        const data = await loginRes.json();
        return data.token;
      }
    }

    // If phone exists, retry signup once with a fresh unique phone
    if (errorMsg.includes("phone")) {
      response = await request.post(`${API_BASE_URL}/api/auth/signup/email`, {
        data: {
          email: email,
          password: "password123",
          name: "Test User",
          phone_number: uniquePhone(),
          constituency_id: testData.constituency_id,
          panchayat_id: testData.panchayat_id,
          ward_no: testData.ward_no,
        },
      });
      if (response.status() === 201) {
        const data = await response.json();
        return data.token;
      }
    }
  }

  throw new Error("Failed to create test user");
}

// Helper function to get admin auth token
export function getAdminAuthToken() {
  return "mock-admin-token";
}
