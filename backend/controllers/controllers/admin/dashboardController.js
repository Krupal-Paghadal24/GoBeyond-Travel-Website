const User    = require("../../models/User");
const Trip    = require("../../models/Trip");
const Booking = require("../../models/Booking");

exports.getDashboardStats = async (req, res) => {
  try {

    /* ── Basic counts ── */
    const totalUsers    = await User.countDocuments({ role: "user" });
    const totalTrips    = await Trip.countDocuments();
    const totalBookings = await Booking.countDocuments();

    /* ── Pending bookings ── */
    const pendingBookings = await Booking.countDocuments({
      booking_status: "Pending"
    });

    /* ── New users this week ── */
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({
      role: "user",
      createdAt: { $gte: oneWeekAgo }
    });

    /* ── Recent 5 bookings for dashboard table ── */
    const recentBookings = await Booking.find()
      .populate("user_id", "firstName lastName email")
      .populate("trip_id", "title location price")
      .sort({ booking_date: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalTrips,
      totalBookings,
      pendingBookings,
      newUsersThisWeek,
      recentBookings
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Dashboard error" });
  }
};