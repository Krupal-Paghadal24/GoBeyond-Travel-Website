const express = require("express");
const router = express.Router();

const guideController = require("../controllers/admin/guideController");


/* GET GUIDES */

router.get("/guides", guideController.getGuides);


/* ADD GUIDE */

router.post("/guides", guideController.addGuide);


/* DELETE GUIDE */

router.delete("/guides/:id", guideController.deleteGuide);


module.exports = router;