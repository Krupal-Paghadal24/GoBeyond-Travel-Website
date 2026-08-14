const express = require("express");
const router = express.Router();

const tripController = require("../controllers/admin/tripController");
const upload = require("../middleware/upload");


/* ================= ADD TRIP ================= */
/* Upload multiple images */

router.post(
 "/trips",
 upload.array("images",5),
 tripController.addTrip
);


/* ================= GET ALL TRIPS ================= */

router.get(
 "/trips",
 tripController.getTrips
);


/* ================= UPDATE TRIP ================= */

router.put(
 "/trips/:id",
 upload.array("images",5),
 tripController.updateTrip
);


/* ================= DELETE TRIP ================= */

router.delete(
 "/trips/:id",
 tripController.deleteTrip
);


module.exports = router;