const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => {
        console.log("DB Error:", err);
        process.exit(1);
    });

const createAdmin = async () => {
    try {
        const existingAdmin = await User.findOne({ email: "admin@gmail.com" });

        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit();
        }

        const admin = new User({
            firstName: "Admin",
            lastName: "User",
            email: "admin@gmail.com",
            password: "Admin@123", // will be hashed if your model uses pre-save hook
            role: "admin",
            isEmailVerified: true
        });

        await admin.save();

        console.log("Admin created successfully!");
        process.exit();

    } catch (error) {
        console.log("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();