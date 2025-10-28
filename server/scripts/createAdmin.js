require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const adminExists = await User.findOne({ role: "admin" });

    if (adminExists) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    const admin = await User.create({
      name: "Admin User",
      email: "admin@aura999.com",
      password: "admin123",
      role: "admin",
      walletBalance: 0,
    });

    console.log("Admin user created successfully:", admin.email);
    console.log("Admin ID:", admin._id);
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin();
