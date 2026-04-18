const nodemailer = require("nodemailer");

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,    // your Gmail address
    pass: process.env.EMAIL_PASS,    // Gmail App Password (not your login password)
  },
});

// ── 1. Booking Confirmation Email ─────────────────────────────
const sendBookingConfirmation = async (userEmail, userName, bookingDetails) => {
  const {
    bookingId,
    tripName,
    location,
    travelDate,
    duration,
    totalAmount,
    paymentMethod,
    guideEmail,
    guideName,
    guidePhone,
  } = bookingDetails;

  const formattedDate = new Date(travelDate).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const mailOptions = {
    from: `"GoBeyond Travel" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Booking Confirmed! Your trip to ${tripName} is booked 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: #0f5132; color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 5px 0 0; font-size: 14px; opacity: 0.85; }
          .body { padding: 30px; }
          .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
          .card { background: #f8fffe; border: 1px solid #d4edda; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .card h3 { margin: 0 0 15px; color: #0f5132; font-size: 16px; border-bottom: 2px solid #0f5132; padding-bottom: 8px; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }
          .row:last-child { border-bottom: none; font-weight: bold; font-size: 15px; color: #0f5132; }
          .label { color: #666; font-size: 13px; }
          .value { color: #333; font-size: 13px; font-weight: 600; }
          .guide-box { background: #fff8e6; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
          .guide-box h3 { margin: 0 0 10px; color: #856404; font-size: 15px; }
          .guide-box p { margin: 4px 0; font-size: 13px; color: #555; }
          .tips { background: #e8f4f8; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
          .tips h3 { margin: 0 0 10px; color: #0c5460; font-size: 15px; }
          .tips ul { margin: 0; padding-left: 20px; }
          .tips ul li { font-size: 13px; color: #555; margin-bottom: 5px; }
          .footer { background: #0f5132; color: white; text-align: center; padding: 20px; font-size: 12px; }
          .booking-id { background: #0f5132; color: white; text-align: center; padding: 10px; border-radius: 5px; font-size: 13px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌿 GoBeyond</h1>
            <p>Your adventure begins here!</p>
          </div>
          <div class="body">
            <p class="greeting">Dear <strong>${userName}</strong>, your booking is <strong style="color:#0f5132">confirmed!</strong> 🎉</p>

            <div class="booking-id">
              Booking ID: <strong>${bookingId}</strong>
            </div>

            <div class="card">
              <h3>📋 Booking Details</h3>
              <div class="row"><span class="label">Trip Name</span><span class="value">${tripName}</span></div>
              <div class="row"><span class="label">Location</span><span class="value">${location}</span></div>
              <div class="row"><span class="label">Travel Date</span><span class="value">${formattedDate}</span></div>
              <div class="row"><span class="label">Duration</span><span class="value">${duration}</span></div>
              <div class="row"><span class="label">Payment Method</span><span class="value">${paymentMethod}</span></div>
              <div class="row"><span class="label">Total Amount Paid</span><span class="value">₹${totalAmount}</span></div>
            </div>

            ${guideName ? `
            <div class="guide-box">
              <h3>👤 Your Guide Details</h3>
              <p><strong>Name:</strong> ${guideName}</p>
              ${guidePhone ? `<p><strong>Contact:</strong> ${guidePhone}</p>` : ""}
              ${guideEmail ? `<p><strong>Email:</strong> ${guideEmail}</p>` : ""}
              <p style="font-size:12px; color:#856404; margin-top:8px;">
                Your guide will contact you 24 hours before your trip starts.
              </p>
            </div>
            ` : ""}

            <div class="tips">
              <h3>💡 Travel Tips</h3>
              <ul>
                <li>Carry a valid government ID proof during your trip.</li>
                <li>Pack according to the weather forecast for your travel date.</li>
                <li>Reach the meeting point 15 minutes early.</li>
                <li>Keep this email handy as your booking reference.</li>
              </ul>
            </div>

            <p style="font-size:13px; color:#666; text-align:center;">
              Need help? Contact us at <strong>hello@gobeyond.in</strong>
            </p>
          </div>
          <div class="footer">
            <p>© 2026 GoBeyond | FCAIT, GLS University, Ahmedabad</p>
            <p>This is an automated email. Please do not reply directly.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};


// ── 2. Discount Coupon Email ──────────────────────────────────
const sendFirstBookingDiscount = async (userEmail, userName, couponCode) => {
  const mailOptions = {
    from: `"GoBeyond Travel" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `🎁 Special Gift for You — 10% Off Your Next Trip!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 10px; overflow: hidden; }
          .header { background: #0f5132; color: white; padding: 30px; text-align: center; }
          .body { padding: 30px; text-align: center; }
          .coupon { border: 3px dashed #0f5132; border-radius: 10px; padding: 25px; margin: 20px 0; background: #f8fffe; }
          .coupon-code { font-size: 32px; font-weight: bold; color: #0f5132; letter-spacing: 5px; margin: 10px 0; }
          .footer { background: #0f5132; color: white; text-align: center; padding: 15px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Thank You, ${userName}!</h1>
            <p>You completed your first booking with GoBeyond</p>
          </div>
          <div class="body">
            <p style="font-size:15px; color:#333;">As a thank you for being our explorer, here is a special discount for your next adventure!</p>
            <div class="coupon">
              <p style="margin:0; color:#666; font-size:13px;">USE CODE AT CHECKOUT</p>
              <div class="coupon-code">${couponCode}</div>
              <p style="margin:5px 0 0; color:#0f5132; font-weight:bold; font-size:18px;">GET 10% OFF</p>
              <p style="margin:5px 0 0; color:#999; font-size:11px;">Valid for 30 days from today</p>
            </div>
            <p style="font-size:13px; color:#666;">Apply this code at checkout on your next booking to save 10% on the base price.</p>
          </div>
          <div class="footer">© 2026 GoBeyond | GLS University, Ahmedabad</div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};


// ── 3. Booking Approved Email ─────────────────────────────────
const sendBookingApproved = async (userEmail, userName, tripName, travelDate) => {
  const formattedDate = new Date(travelDate).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const mailOptions = {
    from: `"GoBeyond Travel" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `✅ Booking Approved — Get Ready for ${tripName}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
        <div style="max-width:600px;margin:30px auto;background:white;border-radius:10px;overflow:hidden;">
          <div style="background:#0f5132;color:white;padding:30px;text-align:center;">
            <h1 style="margin:0;">✅ Booking Approved!</h1>
          </div>
          <div style="padding:30px;">
            <p style="font-size:16px;">Dear <strong>${userName}</strong>,</p>
            <p>Great news! Your booking for <strong>${tripName}</strong> on <strong>${formattedDate}</strong> has been <strong style="color:#0f5132;">approved</strong> by our team.</p>
            <p style="background:#f8fffe;border-left:4px solid #0f5132;padding:15px;border-radius:5px;">
              Pack your bags and get ready for an amazing journey! Your guide will contact you 24 hours before departure.
            </p>
            <p style="font-size:13px;color:#666;">Questions? Email us at hello@gobeyond.in</p>
          </div>
          <div style="background:#0f5132;color:white;text-align:center;padding:15px;font-size:12px;">
            © 2026 GoBeyond | GLS University, Ahmedabad
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendBookingConfirmation,
  sendFirstBookingDiscount,
  sendBookingApproved,
};