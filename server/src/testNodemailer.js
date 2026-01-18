const nodemailer = require("nodemailer");

console.log("Checking Nodemailer...");
console.log("Type of nodemailer:", typeof nodemailer);
console.log("Keys in nodemailer:", Object.keys(nodemailer));

if (typeof nodemailer.createTransport === "function") {
  console.log("✅ nodemailer.createTransport exists!");
} else {
  console.log("❌ nodemailer.createTransport is MISSING!");
  // Check if it's a default export issue (sometimes happens with ESM/CommonJS mix)
  if (
    nodemailer.default &&
    typeof nodemailer.default.createTransport === "function"
  ) {
    console.log("💡 Found it under nodemailer.default.createTransport");
  }
}
