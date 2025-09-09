const fs = require("fs");
const path = require("path");

// Check if .env files exist
const envTestPath = path.join(__dirname, ".env.test");

// Create .env.test if missing
if (!fs.existsSync(envTestPath)) {
  console.log("Creating .env.test for test environment...");
  const envTestContent = `# Test Environment Configuration
PORT=3333
MONGO_URI=mongodb://localhost:27017/citizen-api-test
JWT_SECRET=test-secret-key
NODE_ENV=test
`;
  fs.writeFileSync(envTestPath, envTestContent);
  console.log("✅ .env.test file created successfully!");
} else {
  console.log("✅ .env.test file already exists");
}

// Check if MongoDB is running
const { exec } = require("child_process");

console.log("\n🔍 Checking MongoDB connection...");
exec(
  'mongosh --eval "db.runCommand({ping: 1})" --quiet',
  (error, stdout, stderr) => {
    if (error) {
      console.log("❌ MongoDB is not running or not accessible");
      console.log("Please start MongoDB before running tests:");
      console.log('  - Windows: Start MongoDB service or run "mongod"');
      console.log("  - macOS: brew services start mongodb-community");
      console.log("  - Linux: sudo systemctl start mongod");
    } else {
      console.log("✅ MongoDB is running and accessible");
    }
  }
);
