const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


/* ================= SIGNUP ================= */

exports.signup = async (req, res) => {

  try {

    const { firstName, lastName, gender, email, password, phone } = req.body;

    // ✅ ADDED: Basic validation — don't save empty fields
    if (!firstName || !lastName || !email || !password || !phone || !gender) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      gender,
      email,
      password: hashedPassword,
      phone
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {

    console.log(error); // ✅ ADDED: log error for debugging
    res.status(500).json({ message: "Server error" });

  }

};


/* ================= LOGIN ================= */

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    // ✅ ADDED: Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Email" });

    if (!user.isActive)
      return res.status(403).json({ message: "Account blocked. Contact admin." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

    // ✅ FIXED: JWT secret now from .env instead of hardcoded "secretkey"
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      user: {
        _id: user._id,
        firstName: user.firstName,   // ✅ FIXED: was "user.name" which doesn't exist
        lastName: user.lastName,     // ✅ FIXED: your User model has firstName + lastName
        email: user.email
      }
    });

  } catch (error) {

    console.log(error); // ✅ ADDED: log error for debugging
    res.status(500).json({ message: "Server error" });

  }

};