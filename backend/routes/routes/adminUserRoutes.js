const express = require("express");
const router = express.Router();
const User = require("../models/User"); // ✅ path is correct (used at /api/admin level)


/* ================= GET ALL USERS ================= */

router.get("/users", async (req, res) => {

  try {

    const users = await User.find({ role: "user" }).select("-password"); // ✅ ADDED: never send passwords to frontend

    res.json(users);

  } catch (error) {

    res.status(500).json({ message: "Error fetching users" });

  }

});


/* ================= DELETE USER ================= */

router.delete("/users/:id", async (req, res) => {

  try {

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" }); // ✅ ADDED: handle missing user
    }

    res.json({ message: "User deleted successfully" });

  } catch (error) {

    res.status(500).json({ message: "Error deleting user" });

  }

});


/* ================= BLOCK USER ================= */
// Sets isActive = false → user cannot login

router.put("/users/block/:id", async (req, res) => {

  try {

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },  // ✅ matches your User model's isActive field
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User blocked successfully",
      user
    });

  } catch (error) {

    res.status(500).json({ message: "Error blocking user" });

  }

});


/* ================= ACTIVATE USER ================= */
// Sets isActive = true → restores user login access

router.put("/users/activate/:id", async (req, res) => {

  try {

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },  // ✅ matches your User model's isActive field
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User activated successfully",
      user
    });

  } catch (error) {

    res.status(500).json({ message: "Error activating user" });

  }

});


module.exports = router;