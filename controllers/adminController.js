const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/adminModel");

exports.signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await AdminUser.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const usernameTaken = await AdminUser.findOne({ where: { username } });
    if (usernameTaken) {
      return res.status(400).json({ error: "Username already taken." });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newUser = await AdminUser.create({
      username,
      email,
      password_hash,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await AdminUser.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid Credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    return res.json({
      message: "Login successful",
      token,
      role: user.role,
      id: user.id,
      name: user.username,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await AdminUser.findAll({
      attributes: ["id", "username", "email", "role", "created_at"],
    });
    return res.status(200).json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

exports.createAdminUser = async (req, res) => {
  try {
    if (req.user.role !== 1) {
      return res.status(403).json({
        message: "Access denied: Only Super Admins can create admin users",
      });
    }

    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await AdminUser.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const assignedRole = [1, 2].includes(role) ? role : 2;

    const newAdmin = await AdminUser.create({
      username,
      email,
      password_hash,
      role: assignedRole,
    });

    return res.status(201).json({
      message: "Admin user created successfully",
      user: {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.error("Error creating admin:", error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Duplicate entry",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: `${err.path} must be unique`,
        })),
      });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await AdminUser.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

exports.roleUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await AdminUser.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.role = role;
    await user.save();

    return res.status(200).json({ message: "User role updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
