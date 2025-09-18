const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const membershipController = require("../controllers/membershipController");

router.post(
  "/",
  upload.fields([
    { name: "husbandIdCard", maxCount: 1 },
    { name: "wifeIdCard", maxCount: 1 },
    { name: "husbandPhoto", maxCount: 1 },
    { name: "wifePhoto", maxCount: 1 },
  ]),
  membershipController.createMembership
);

router.get("/", membershipController.getAllMemberships);

router.get("/:id", membershipController.getMembershipById);

router.put(
  "/:id",
  upload.fields([
    { name: "husbandIdCard", maxCount: 1 },
    { name: "wifeIdCard", maxCount: 1 },
    { name: "husbandPhoto", maxCount: 1 },
    { name: "wifePhoto", maxCount: 1 },
  ]),
  membershipController.updateMembership
);

router.delete("/:id", membershipController.deleteMembership);

module.exports = router;
