const express = require("express");
const router = express.Router();
const attributeValueController = require("../controllers/attributeController");
const authenticateAdmin = require("../middlewares/authenticateAdmin");

router.get("/", attributeValueController.getAllAttributeValues);

router.get("/:attribute_id", attributeValueController.getValuesByAttribute);

router.post("/", authenticateAdmin, attributeValueController.addAttributeValue);

router.put(
  "/:value_id",
  authenticateAdmin,
  attributeValueController.updateAttributeValue
);

router.delete(
  "/:value_id",
  authenticateAdmin,
  attributeValueController.deleteAttributeValue
);

module.exports = router;
