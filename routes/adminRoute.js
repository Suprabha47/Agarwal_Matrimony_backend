const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../middlewares/authenticateAdmin");

const {
  signUp,
  signIn,
  deleteUser,
  getAllUsers,
  createAdminUser,
  roleUpdate,
} = require("../controllers/adminController");

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/create-admin", authenticateAdmin, createAdminUser);
router.put("/:id", authenticateAdmin, roleUpdate);
router.get("/admins", getAllUsers);
router.delete("/:id", authenticateAdmin, deleteUser);

module.exports = router;
