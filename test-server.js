require("dotenv").config({ path: require("path").join(__dirname, ".env") });
console.log("✅ Environment loaded, PORT:", process.env.PORT);
console.log("✅ Test file working!");

const express = require("express");
console.log("✅ Express loaded");

const app = express();
console.log("✅ Express app created");

const PORT = process.env.PORT || 5000;
console.log("✅ PORT set to:", PORT);

const server = app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});

console.log("✅ Server started successfully");
