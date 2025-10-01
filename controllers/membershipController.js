const Membership = require("../models/membershipModel");

exports.createMembership = async (req, res) => {
  try {
    const body = { ...req.body };

    console.log("req::: ", req.body);

    // 🚫 Ensure membershipNumber never sneaks in
    delete body.membershipNumber;

    // 🔍 Check if member already exists (by email + dob + applicantName + telephone)
    const existingMember = await Membership.findOne({
      where: {
        applicantName: body.applicantName,
        applicantDob: body.applicantDob,
        faxEmail: body.faxEmail,
        telephone: body.telephone,
      },
    });

    if (existingMember) {
      return res.status(400).json({
        message: "This person is already a registered member.",
      });
    }

    // Handle uploaded files safely
    const husbandIdCard = req.files?.husbandIdCard?.[0]?.filename || null;
    const wifeIdCard = req.files?.wifeIdCard?.[0]?.filename || null;
    const husbandPhoto = req.files?.husbandPhoto?.[0]?.filename || null;
    const wifePhoto = req.files?.wifePhoto?.[0]?.filename || null;

    // ✅ Create new membership without membershipNumber
    const membership = await Membership.create({
      ...body,
      husbandIdCard,
      wifeIdCard,
      husbandPhoto,
      wifePhoto,
    });

    res.status(201).json({ message: "Membership created!", membership });
  } catch (error) {
    console.error("Validation details:", error.errors || error.message);
    res.status(500).json({
      message: "Error creating membership",
      error: error.message,
    });
  }
};

// READ ALL
exports.getAllMemberships = async (req, res) => {
  try {
    const memberships = await Membership.findAll();
    res.json(memberships);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching memberships", error: error.message });
  }
};

// READ ONE
exports.getMembershipById = async (req, res) => {
  try {
    const membership = await Membership.findByPk(req.params.id);
    if (!membership) return res.status(404).json({ message: "Not found" });
    res.json(membership);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching membership", error: error.message });
  }
};

// UPDATE
exports.updateMembership = async (req, res) => {
  try {
    const membership = await Membership.findByPk(req.params.id);
    if (!membership) return res.status(404).json({ message: "Not found" });

    const husbandIdCard =
      req.files["husbandIdCard"]?.[0]?.filename || membership.husbandIdCard;
    const wifeIdCard =
      req.files["wifeIdCard"]?.[0]?.filename || membership.wifeIdCard;
    const husbandPhoto =
      req.files["husbandPhoto"]?.[0]?.filename || membership.husbandPhoto;
    const wifePhoto =
      req.files["wifePhoto"]?.[0]?.filename || membership.wifePhoto;

    await membership.update({
      ...req.body,
      husbandIdCard,
      wifeIdCard,
      husbandPhoto,
      wifePhoto,
    });

    res.json({ message: "Membership updated!", membership });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating membership", error: error.message });
  }
};

// DELETE
exports.deleteMembership = async (req, res) => {
  try {
    const membership = await Membership.findByPk(req.params.id);
    if (!membership) return res.status(404).json({ message: "Not found" });

    await membership.destroy();
    res.json({ message: "Membership deleted!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting membership", error: error.message });
  }
};
