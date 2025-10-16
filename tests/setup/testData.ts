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
export let testMlaUserId: string;

// Setup test data before all tests
export async function setupTestData(request: any) {
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
    } catch (error) {
      console.error("Error dropping test database:", error);
    }

    // Ensure signup tests can pass consistently by removing known conflicting identities
    try {
      const result = await userModel.deleteMany({
        $or: [
          { email: "test@example.com" },
          { email: "logintest@example.com" },
          { email: "profiletest@example.com" },
          { email: "changepass@example.com" },
          { email: "wrongcurrent@example.com" },
          { email: "passwordtest@example.com" },
          { email: "nametest@example.com" },
          { phone_number: "+1234567890" },
          { phone_number: "+1234567891" },
          { phone_number: "+1234567892" },
        ],
      });
    } catch (error) {
      console.error("Error cleaning up test users:", error);
    }
    // Create test constituency directly in database
    const Constituency = require("../../src/models/constituencyModel").default;
    let existingConstituency = await Constituency.findOne({
      constituency_id: "TEST_CONST001",
    });

    if (!existingConstituency) {
      existingConstituency = await Constituency.create({
        name: "Test Constituency",
        constituency_id: "TEST_CONST001",
        mla_id: "507f1f77bcf86cd799439011",
      });
    }
    testConstituencyId = existingConstituency._id.toString();

    // Create test panchayat directly in database
    const Panchayat = require("../../src/models/panchayatModel").default;
    let existingPanchayat = await Panchayat.findOne({
      panchayat_id: "TEST_PANCH001",
    });

    if (!existingPanchayat) {
      existingPanchayat = await Panchayat.create({
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
      });
    }
    testPanchayatId = existingPanchayat._id.toString();
    testWardId = "WARD001";

    // 4) Create users and roles directly in database
    // 4.1 MLA user
    const mlaEmail = "mla_test@example.com";
    let mlaUserId: string | undefined;

    // Check if MLA user exists, if not create it
    let mlaUser = await userModel.findOne({ email: mlaEmail });
    if (!mlaUser) {
      const { hashPassword } = require("../../src/utils/auth");
      const hashedPassword = await hashPassword("password123");

      mlaUser = await userModel.create({
        name: "MLA Test User",
        email: mlaEmail,
        password_hash: hashedPassword,
        phone_number: "+1111111111",
        role: RoleTypes.MLASTAFF,
      });

      // Create user details
      const UserDetails = require("../../src/models/userDetailsModel").default;
      await UserDetails.create({
        user_id: mlaUser._id,
        constituency: testConstituencyId,
        panchayat_id: testPanchayatId,
        ward_no: "WARD001",
      });
    }
    mlaUserId = mlaUser._id.toString();
    testMlaUserId = mlaUserId!;

    // Update constituency with MLA id if possible
    if (mlaUserId) {
      await Constituency.findByIdAndUpdate(testConstituencyId, {
        mla_id: mlaUserId,
      });
    }

    // 4.2 Department head (dept) and dept staff
    const deptHeadEmail = "dept_head@example.com";
    let deptHeadUserId: string | undefined;

    // Check if dept head exists, if not create it
    let deptHeadUser = await userModel.findOne({ email: deptHeadEmail });
    if (!deptHeadUser) {
      const { hashPassword } = require("../../src/utils/auth");
      const hashedPassword = await hashPassword("password123");

      deptHeadUser = await userModel.create({
        name: "Dept Head",
        email: deptHeadEmail,
        password_hash: hashedPassword,
        phone_number: "+1222222222",
        role: RoleTypes.DEPT,
      });

      // Create user details
      const UserDetails = require("../../src/models/userDetailsModel").default;
      await UserDetails.create({
        user_id: deptHeadUser._id,
        constituency: testConstituencyId,
        panchayat_id: testPanchayatId,
        ward_no: "WARD001",
      });
    }
    deptHeadUserId = deptHeadUser._id.toString();

    // Dept staff user
    const deptStaffEmail = "dept_staff@example.com";
    let deptStaffUserId: string | undefined;

    // Check if dept staff exists, if not create it
    let deptStaffUser = await userModel.findOne({ email: deptStaffEmail });
    if (!deptStaffUser) {
      const { hashPassword } = require("../../src/utils/auth");
      const hashedPassword = await hashPassword("password123");

      deptStaffUser = await userModel.create({
        name: "Dept Staff",
        email: deptStaffEmail,
        password_hash: hashedPassword,
        phone_number: "+1333333333",
        role: RoleTypes.DEPT_STAFF,
      });

      // Create user details
      const UserDetails = require("../../src/models/userDetailsModel").default;
      await UserDetails.create({
        user_id: deptStaffUser._id,
        constituency: testConstituencyId,
        panchayat_id: testPanchayatId,
        ward_no: "WARD001",
      });
    }
    deptStaffUserId = deptStaffUser._id.toString();

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
  } catch (error) {
    console.error("Error setting up test data:", error);
  }
}

// Helper function to get test data IDs
export function getTestDataIds() {
  return {
    constituency_id: testConstituencyId || "68c01b684a4dc6b542fd36a4",
    panchayat_id: testPanchayatId || "68c01b694a4dc6b542fd36c5",
    ward_no: testWardId || "WARD001",
    mla_user_id: testMlaUserId || "68c01b684a4dc6b542fd36a6",
  };
}

// Helper function to create a test user and get token
export async function createTestUser(
  request: any,
  email: string = "test@example.com"
) {
  const testData = getTestDataIds();
  const uniquePhone = () => `+1${Math.floor(Math.random() * 9e9 + 1e9)}`;

  const attemptSignup = async (signupEmail: string, phone: string) => {
    return await request.post(`${API_BASE_URL}/api/auth/signup/email`, {
      data: {
        email: signupEmail,
        password: "password123",
        name: "Test User",
        phone_number: phone,
        constituency_id: testData.constituency_id,
        panchayat_id: testData.panchayat_id,
        ward_no: testData.ward_no,
      },
    });
  };

  // 1) Try signup
  let response = await attemptSignup(email, uniquePhone());
  if (response.status() === 201) {
    const data = await response.json();
    return data.token;
  }

  // 2) If email exists, try login
  try {
    const body = await response.json();
    const msg = (body?.message || body?.error || "").toString().toLowerCase();
    if (
      (response.status() === 400 || response.status() === 409) &&
      msg.includes("email")
    ) {
      const loginRes = await request.post(
        `${API_BASE_URL}/api/auth/login/email`,
        {
          data: { email, password: "password123" },
        }
      );
      if (loginRes.status() === 200) {
        const data = await loginRes.json();
        return data.token;
      }
    }
  } catch {}

  // 3) Retry with a fresh retry email and phone
  const retryEmail = email.includes("@")
    ? email.replace("@", "+retry@")
    : `${email}+retry`;
  response = await attemptSignup(retryEmail, uniquePhone());
  if (response.status() === 201) {
    const data = await response.json();
    return data.token;
  }

  // 4) Final fallback: login with retry email
  const loginRes = await request.post(`${API_BASE_URL}/api/auth/login/email`, {
    data: { email: retryEmail, password: "password123" },
  });
  if (loginRes.status() === 200) {
    const data = await loginRes.json();
    return data.token;
  }

  throw new Error("Failed to create test user");
}

// Helper function to get admin auth token
export function getAdminAuthToken() {
  return "mock-admin-token";
}
