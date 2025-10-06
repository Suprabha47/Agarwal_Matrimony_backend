const fs = require("fs");
const path = require("path");
const Candidate = require("../models/candidateModel");
const { Op } = require("sequelize"); // Sequelize operators for flexible queries
const nodemailer = require("nodemailer");
const candidateInfoConvert = require("../utils/candidateInfoConvert");
const { emailText, mailHtml } = require("../utils/email");
const { buildImageUrl, handleProfilePhoto } = require("../utils/image");

exports.createCandidate = async (req, res) => {
  try {
    let candidateData = candidateInfoConvert(req);

    const existingCandidate = await Candidate.findOne({
      where: {
        [Op.or]: [
          { email: candidateData.email },
          { contact_no: candidateData.contact_no },
          {
            name: candidateData.name,
            dob: candidateData.dob,
            phone: candidateData.phone,
          },
        ],
      },
    });

    if (existingCandidate) {
      handleProfilePhoto(req, candidateData, existingCandidate);

      await Candidate.update(candidateData, {
        where: { id: existingCandidate.id },
      });
      const updatedCandidate = await Candidate.findByPk(existingCandidate.id);

      const response = updatedCandidate.toJSON();
      response.image_path = buildImageUrl(req, response.image_path);

      return res.status(200).json({
        message: "Candidate already existed; profile updated successfully",
        id: updatedCandidate.id,
        candidate: response,
      });
    }

    handleProfilePhoto(req, candidateData);
    const candidate = await Candidate.create(candidateData);

    const response = candidate.toJSON();
    response.image_path = buildImageUrl(req, response.image_path);

    res.status(201).json({
      message: "Candidate created successfully",
      id: candidate.id,
      candidate: response,
    });
  } catch (error) {
    console.error("Error creating candidate:", error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json(
        error.errors.map((err) => ({
          path: err.path,
          msg: err.message,
          value: err.value,
        }))
      );
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ error: "A candidate with this information already exists" });
    }

    res
      .status(500)
      .json({ error: "Failed to create candidate", details: error.message });
  }
};

exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.findAll();
    console.log("candidates: ", candidates);
    const response = candidates.map((c) => ({
      ...c.toJSON(),
      image_path: buildImageUrl(req, c.image_path),
    }));
    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch candidates", details: error.message });
  }
};

exports.getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate)
      return res.status(404).json({ error: "Candidate not found" });

    const response = candidate.toJSON();
    response.image_path = buildImageUrl(req, response.image_path); // <-- Added
    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch candidate", details: error.message });
  }
};

exports.updateCandidate = async (req, res) => {
  try {
    const candidateId = req.params.id;

    const existingCandidate = await Candidate.findByPk(candidateId);
    if (!existingCandidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    let data = req.body;

    data = handleProfilePhoto(req, data, existingCandidate);

    await Candidate.update(data, { where: { id: candidateId } });

    const updatedCandidate = await Candidate.findByPk(candidateId);

    res.status(200).json({
      message: "Candidate updated successfully",
      candidate: updatedCandidate,
    });
  } catch (error) {
    console.error("Error updating candidate:", error);
    res.status(500).json({
      error: "Failed to update candidate",
      details: error.message,
    });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const deleted = await Candidate.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Candidate not found" });

    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete candidate", details: error.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate)
      return res.status(404).json({ error: "Candidate not found" });

    if (candidate.image_path) {
      const imagePath = path.join(
        __dirname,
        "..",
        "uploads",
        path.basename(candidate.image_path)
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await candidate.destroy();

    res
      .status(200)
      .json({ message: "Candidate and profile image deleted successfully" });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({
      error: "Failed to delete candidate",
      details: error.message,
    });
  }
};

exports.sendConnectionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { senderName, senderEmail, message } = req.body;

    console.log("=== CONNECTION REQUEST DEBUG ===");
    console.log("Request params:", { id });
    console.log("Request body:", { senderName, senderEmail, message });
    console.log("SMTP Config:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER ? "SET" : "NOT SET",
      pass: process.env.SMTP_PASS ? "SET" : "NOT SET",
      from: process.env.FROM_EMAIL,
    });

    if (!senderName || !senderEmail)
      return res
        .status(400)
        .json({ error: "senderName and senderEmail are required" });

    const candidate = await Candidate.findByPk(id);
    if (!candidate)
      return res.status(404).json({ error: "Candidate not found" });
    if (!candidate.email)
      return res.status(400).json({ error: "Candidate has no email" });

    // Check if SMTP configuration is missing
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      console.error(
        "SMTP configuration missing! Sending success response without email."
      );
      return res.status(200).json({
        message: "Connection request received (email service not configured)",
        warning:
          "Email notification not sent due to missing SMTP configuration",
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure:
        process.env.SMTP_SECURE === "true" ||
        Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    console.log("Transporter created successfully");

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: candidate.email,
      replyTo: senderEmail,
      subject: `New connection request on ${
        process.env.SITE_NAME || "Agarwal Samaj Matrimony"
      }`,
      text: emailText(candidate, senderName, senderEmail, message),
      html: mailHtml(candidate, senderName, senderEmail, message),
    });

    console.log("Email sent successfully to:", candidate.email);
    res.status(200).json({ message: "Connection request email sent" });
  } catch (error) {
    console.error("=== EMAIL SENDING ERROR ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      error: "Failed to send connection request email",
      details: error.message,
    });
  }
};
