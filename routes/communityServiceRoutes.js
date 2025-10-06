const express = require("express");
const router = express.Router();
const communityServiceController = require("../controllers/communityController");
const upload = require("../middlewares/uploadMiddleware");
const authenticateAdmin = require("../middlewares/authenticateAdmin");
const {
  validateCommunityService,
  validateCommunityServiceUpdate,
} = require("../middlewares/communityServiceValidation");

router.post(
  "/create",
  upload.single("icon_url"),
  validateCommunityService,
  communityServiceController.createService
);

router.get("/", communityServiceController.getAllServices);

router.get("/:id", communityServiceController.getServiceById);

router.put(
  "/:id",
  authenticateAdmin,
  upload.single("icon_url"),
  validateCommunityServiceUpdate,
  communityServiceController.updateService
);

router.delete(
  "/:id",
  authenticateAdmin,
  communityServiceController.deleteService
);

module.exports = router;
