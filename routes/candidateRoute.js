const express = require("express");
const router = express.Router();
const candidateController = require("../controllers/candidateController");
const upload = require("../middlewares/uploadMiddleware");
const {
  validateCandidate,
  validateCandidateUpdate,
} = require("../middlewares/candidateValidation");

router.post(
  "/",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "image_path", maxCount: 1 },
    { name: "additionalPhotos", maxCount: 5 },
  ]),
  validateCandidate,
  candidateController.createCandidate
);

router.get("/", candidateController.getAllCandidates);
router.get("/:id", candidateController.getCandidateById);
router.post("/:id/connect", candidateController.sendConnectionRequest);
router.patch(
  "/:id",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "image_path", maxCount: 1 },
    { name: "additionalPhotos", maxCount: 5 },
  ]),
  validateCandidateUpdate,
  candidateController.updateCandidate
);
router.delete("/:id", candidateController.deleteCandidate);

module.exports = router;
