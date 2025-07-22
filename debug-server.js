require("dotenv").config({ path: require("path").join(__dirname, ".env") });
console.log("🔧 Environment loaded, PORT:", process.env.PORT);

console.log("📦 Loading Express...");
const express = require("express");
console.log("✅ Express loaded");

const app = express();
console.log("✅ Express app created");

const PORT = process.env.PORT || 3001;
console.log("✅ About to start server on port:", PORT);

require("dotenv").config({ path: require("path").join(__dirname, ".env") });
console.log("🔧 Environment loaded, PORT:", process.env.PORT);

console.log("Step 1: Starting debug server...");

try {
  console.log("Step 2: Loading Express...");
  const express = require("express");
  
  console.log("Step 3: Creating Express app...");
  const app = express();
  
  console.log("Step 4: Setting up basic middleware...");
  app.use(express.json());
  
  console.log("Step 5: Setting up basic route...");
  app.get("/", (req, res) => {
    res.json({ message: "Debug server is working!" });
  });
  
  console.log("Step 6: Testing Twilio import...");
  try {
    const twilioService = require("./services/twilioService");
    console.log("✅ Twilio service loaded successfully");
  } catch (twilioError) {
    console.log("⚠️ Twilio service failed:", twilioError.message);
  }
  
  console.log("Step 7: Testing database helper...");
  try {
    const DatabaseHelp = require("./src/utils/DatabaseHelp");
    console.log("✅ Database helper loaded successfully");
  } catch (dbError) {
    console.log("⚠️ Database helper failed:", dbError.message);
  }
  
  console.log("Step 8: Testing logger...");
  try {
    const LoggerUtils = require("./src/utils/LoggerUtils");
    console.log("✅ Logger loaded successfully");
  } catch (logError) {
    console.log("⚠️ Logger failed:", logError.message);
  }
  
  console.log("Step 9: Testing middleware imports...");
  try {
    const reqSanitization = require("./src/middleware/reqSanitization");
    console.log("✅ Request sanitization loaded successfully");
  } catch (sanitError) {
    console.log("⚠️ Request sanitization failed:", sanitError.message);
  }
  
  console.log("Step 10: Starting server...");
  const PORT = process.env.PORT || 3001;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Debug server running on port ${PORT}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
  });
  
  server.on("error", (error) => {
    console.error("❌ Server error:", error);
    process.exit(1);
  });
  
} catch (error) {
  console.error("❌ Debug server error:", error);
  console.error("Stack:", error.stack);
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`🚀 TechTrainer Server running on port ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("❌ Server error:", error);
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use.`);
  }
});

console.log("✅ Server setup complete");
