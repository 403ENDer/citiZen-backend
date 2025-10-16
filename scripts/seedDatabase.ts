import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Constituency from "../src/models/constituencyModel";
import Panchayat from "../src/models/panchayatModel";
import { userModel } from "../src/models/userModel";
import Department from "../src/models/departmentModel";
import DepartmentEmployee from "../src/models/departmentEmployeeModel";
import { RoleTypes } from "../src/utils/types";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://harish11ndsh:076tEvAECOovofvS@citizen.v1ca4hs.mongodb.net/citizen";
console.log("MONGO_URI", MONGO_URI);

// Sample data for seeding
const constituencies = [
  {
    name: "Test Constituency 1",
    constituency_id: "TEST_CONST001",
    total_voters: 50000,
    active_voters: 45000,
    area: "Urban",
    population: 75000,
    literacy_rate: 85.5,
  },
  {
    name: "Test Constituency 2",
    constituency_id: "TEST_CONST002",
    total_voters: 35000,
    active_voters: 32000,
    area: "Rural",
    population: 55000,
    literacy_rate: 78.2,
  },
  {
    name: "Admin Test Constituency",
    constituency_id: "ADMIN_CONST001",
    total_voters: 60000,
    active_voters: 55000,
    area: "Mixed",
    population: 90000,
    literacy_rate: 88.1,
  },
];

const panchayats = [
  {
    name: "Test Panchayat 1",
    panchayat_id: "TEST_PANCH001",
    ward_list: [
      { ward_id: "W001", ward_name: "Ward 1" },
      { ward_id: "W002", ward_name: "Ward 2" },
      { ward_id: "W003", ward_name: "Ward 3" },
    ],
  },
  {
    name: "Test Panchayat 2",
    panchayat_id: "TEST_PANCH002",
    ward_list: [
      { ward_id: "W004", ward_name: "Ward 4" },
      { ward_id: "W005", ward_name: "Ward 5" },
    ],
  },
  {
    name: "Admin Test Panchayat",
    panchayat_id: "ADMIN_PANCH001",
    ward_list: [
      { ward_id: "W006", ward_name: "Ward 6" },
      { ward_id: "W007", ward_name: "Ward 7" },
      { ward_id: "W008", ward_name: "Ward 8" },
    ],
  },
];

const adminUsers = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    phone_number: "+1234567890",
    role: RoleTypes.ADMIN,
    is_verified: true,
  },
  {
    name: "MLA Test User",
    email: "mla_test@example.com",
    password: "password123",
    phone_number: "+1234567891",
    role: RoleTypes.MLASTAFF,
    is_verified: true,
  },
  {
    name: "Department Head 1",
    email: "depthead1@example.com",
    password: "password123",
    phone_number: "+1234567892",
    role: RoleTypes.DEPT,
    is_verified: true,
  },
  {
    name: "Department Head 2",
    email: "depthead2@example.com",
    password: "password123",
    phone_number: "+1234567893",
    role: RoleTypes.DEPT,
    is_verified: true,
  },
  {
    name: "Department Staff 1",
    email: "deptstaff1@example.com",
    password: "password123",
    phone_number: "+1234567894",
    role: RoleTypes.DEPT_STAFF,
    is_verified: true,
  },
  {
    name: "Department Staff 2",
    email: "deptstaff2@example.com",
    password: "password123",
    phone_number: "+1234567895",
    role: RoleTypes.DEPT_STAFF,
    is_verified: true,
  },
  {
    name: "Department Staff 3",
    email: "deptstaff3@example.com",
    password: "password123",
    phone_number: "+1234567896",
    role: RoleTypes.DEPT_STAFF,
    is_verified: true,
  },
];

const departments = [
  {
    name: "Public Works Department",
  },
  {
    name: "Health Department",
  },
  {
    name: "Education Department",
  },
  {
    name: "Transport Department",
  },
];

async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
      console.log("✅ Connected to MongoDB");
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

async function clearDatabase() {
  try {
    console.log("🗑️ Clearing existing data...");
    await Constituency.deleteMany({});
    await Panchayat.deleteMany({});
    await userModel.deleteMany({});
    await Department.deleteMany({});
    await DepartmentEmployee.deleteMany({});
    console.log("✅ Database cleared");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    throw error;
  }
}

async function seedConstituencies() {
  try {
    console.log("🏛️ Seeding constituencies...");
    const createdConstituencies = await Constituency.insertMany(constituencies);
    console.log(`✅ Created ${createdConstituencies.length} constituencies`);
    return createdConstituencies;
  } catch (error) {
    console.error("❌ Error seeding constituencies:", error);
    throw error;
  }
}

async function seedPanchayats(constituencies: any[]) {
  try {
    console.log("🏘️ Seeding panchayats...");
    const panchayatData = panchayats.map((panchayat, index) => ({
      ...panchayat,
      constituency_id: constituencies[index % constituencies.length]._id,
    }));

    const createdPanchayats = await Panchayat.insertMany(panchayatData);
    console.log(`✅ Created ${createdPanchayats.length} panchayats`);
    return createdPanchayats;
  } catch (error) {
    console.error("❌ Error seeding panchayats:", error);
    throw error;
  }
}

async function seedUsers(constituencies: any[]) {
  try {
    console.log("👥 Seeding users...");
    const usersWithHashedPasswords = await Promise.all(
      adminUsers.map(async (user) => ({
        ...user,
        password_hash: await bcrypt.hash(user.password, 10),
      }))
    );

    // Remove password field and add password_hash
    const userData = usersWithHashedPasswords.map(
      ({ password, ...user }) => user
    );

    const createdUsers = await userModel.insertMany(userData);
    console.log(`✅ Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
}

async function updateConstituenciesWithMLA(
  constituencies: any[],
  users: any[]
) {
  try {
    console.log("🔗 Linking MLA to constituencies...");
    const mlaUser = users.find((user) => user.role === RoleTypes.MLASTAFF);

    if (mlaUser) {
      await Constituency.updateMany(
        { constituency_id: { $in: ["TEST_CONST001", "TEST_CONST002"] } },
        { mla_id: mlaUser._id }
      );
      console.log("✅ Linked MLA to constituencies");
    }
  } catch (error) {
    console.error("❌ Error linking MLA to constituencies:", error);
    throw error;
  }
}

async function updateConstituenciesWithPanchayats(
  constituencies: any[],
  panchayats: any[]
) {
  try {
    console.log("🔗 Linking panchayats to constituencies...");

    for (const constituency of constituencies) {
      const constituencyPanchayats = panchayats.filter(
        (panchayat) =>
          panchayat.constituency_id.toString() === constituency._id.toString()
      );

      if (constituencyPanchayats.length > 0) {
        await Constituency.findByIdAndUpdate(constituency._id, {
          panchayats: constituencyPanchayats.map((p) => p._id),
        });
      }
    }

    console.log("✅ Linked panchayats to constituencies");
  } catch (error) {
    console.error("❌ Error linking panchayats to constituencies:", error);
    throw error;
  }
}

async function seedDepartments(users: any[]) {
  try {
    console.log("🏢 Seeding departments...");

    // Get department heads (users with DEPT role)
    const deptHeads = users.filter((user) => user.role === RoleTypes.DEPT);

    const departmentData = departments.map((dept, index) => ({
      ...dept,
      head_id: deptHeads[index % deptHeads.length]._id,
    }));

    const createdDepartments = await Department.insertMany(departmentData);
    console.log(`✅ Created ${createdDepartments.length} departments`);
    return createdDepartments;
  } catch (error) {
    console.error("❌ Error seeding departments:", error);
    throw error;
  }
}

async function seedDepartmentEmployees(departments: any[], users: any[]) {
  try {
    console.log("👨‍💼 Seeding department employees...");

    // Get department staff (users with DEPT_STAFF role)
    const deptStaff = users.filter(
      (user) => user.role === RoleTypes.DEPT_STAFF
    );

    const employeeData: { user_id: any; dept_id: any }[] = [];

    // Assign staff to departments
    departments.forEach((dept, deptIndex) => {
      // Assign 1-2 staff members per department
      const staffCount = deptIndex < 2 ? 2 : 1; // First 2 departments get 2 staff, others get 1
      const startIndex = deptIndex * 2;

      for (
        let i = 0;
        i < staffCount && startIndex + i < deptStaff.length;
        i++
      ) {
        employeeData.push({
          user_id: deptStaff[startIndex + i]._id,
          dept_id: dept._id,
        });
      }
    });

    const createdEmployees = await DepartmentEmployee.insertMany(employeeData);
    console.log(`✅ Created ${createdEmployees.length} department employees`);
    return createdEmployees;
  } catch (error) {
    console.error("❌ Error seeding department employees:", error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    console.log("🚀 Starting database seeding...");

    await connectToDatabase();
    await clearDatabase();

    const constituencies = await seedConstituencies();
    const panchayats = await seedPanchayats(constituencies);
    const users = await seedUsers(constituencies);
    const departments = await seedDepartments(users);
    const departmentEmployees = await seedDepartmentEmployees(
      departments,
      users
    );

    await updateConstituenciesWithMLA(constituencies, users);
    await updateConstituenciesWithPanchayats(constituencies, panchayats);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- Constituencies: ${constituencies.length}`);
    console.log(`- Panchayats: ${panchayats.length}`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Departments: ${departments.length}`);
    console.log(`- Department Employees: ${departmentEmployees.length}`);
    console.log("\n🔑 Test Credentials:");
    console.log("Admin: admin@example.com / admin123");
    console.log("MLA: mla_test@example.com / password123");
    console.log("Dept Head 1: depthead1@example.com / password123");
    console.log("Dept Head 2: depthead2@example.com / password123");
    console.log("Dept Staff 1: deptstaff1@example.com / password123");
    console.log("Dept Staff 2: deptstaff2@example.com / password123");
    console.log("Dept Staff 3: deptstaff3@example.com / password123");
    console.log("\n🏢 Departments:");
    departments.forEach((dept, index) => {
      console.log(
        `${index + 1}. ${dept.name} (Head: ${
          users.find((u) => u._id.toString() === dept.head_id.toString())?.name
        })`
      );
    });
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
