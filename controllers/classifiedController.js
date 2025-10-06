const Classified = require("../models/classifiedModel");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

const serializePhotos = (files) => {
  if (!files) return null;
  const filenames = files.photos ? files.photos.map((f) => f.filename) : [];
  return filenames.join(",");
};

const deserializePhotos = (photosString) => {
  if (!photosString) return [];
  return photosString.split(",");
};

exports.registerListing = async (req, res) => {
  try {
    const data = req.body;
    data.photos = serializePhotos(req.files);

    const existing = await Classified.findOne({
      where: { [Op.or]: [{ email: data.email }, { phone: data.phone }] },
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Email or Phone already registered" });
    }

    const listing = await Classified.create(data);
    res.status(201).json({ message: "Listing registered", listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register listing" });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const { contact } = req.params; // either phone or email for simplicity
    const listing = await Classified.findOne({
      where: { [Op.or]: [{ email: contact }, { phone: contact }] },
      attributes: ["status"],
    });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json({ status: listing.status });
  } catch (err) {
    res.status(500).json({ error: "Error retrieving status" });
  }
};

exports.searchListings = async (req, res) => {
  try {
    const { business_category, firm_name } = req.query;
    const filters = { status: "approved" };
    if (business_category) filters.business_category = business_category;
    if (firm_name) filters.firm_name = { [Op.like]: `%${firm_name}%` };

    const listings = await Classified.findAll({ where: filters });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: "Error searching listings" });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const listing = await Classified.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: "Failed to get listing details" });
  }
};

exports.approveListing = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Fetch current listing
    const listing = await Classified.findByPk(id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (listing.status === "approved") {
      return res.status(400).json({ message: "Listing is already approved" });
    }

    // if (listing.status === "disapproved") {
    //   return res
    //     .status(400)
    //     .json({ message: "Cannot approve a disapproved listing" });
    // }

    // Update to approved
    await Classified.update(
      {
        status: "approved",
        approval_by: adminId,
        approval_date: new Date(),
      },
      { where: { id } }
    );

    res.json({ message: "Listing approved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve listing" });
  }
};

exports.disapproveListing = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Fetch current listing
    const listing = await Classified.findByPk(id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (listing.status === "disapproved") {
      return res
        .status(400)
        .json({ message: "Listing is already disapproved" });
    }

    // if (listing.status === "approved") {
    //   return res
    //     .status(400)
    //     .json({ message: "Cannot disapprove an approved listing" });
    // }

    // Update to disapproved
    await Classified.update(
      {
        status: "disapproved",
        approval_by: adminId,
        approval_date: new Date(),
      },
      { where: { id } }
    );

    res.json({ message: "Listing disapproved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to disapprove listing" });
  }
};

exports.getPendingListings = async (req, res) => {
  try {
    const listings = await Classified.findAll({ where: { status: "pending" } });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: "Failed to get pending listings" });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    let data = req.body;

    let deletedPhotos = [];
    if (data.deletedPhotos) {
      try {
        deletedPhotos = JSON.parse(data.deletedPhotos);
      } catch (err) {
        console.error("Failed to parse deletedPhotos:", err);
      }
    }

    const listing = await Classified.findByPk(id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    let existingPhotos = listing.photos ? listing.photos.split(",") : [];

    if (deletedPhotos.length > 0) {
      existingPhotos = existingPhotos.filter(
        (photo) => !deletedPhotos.includes(photo)
      );
    }

    if (req.files && req.files.photos) {
      const newPhotos = req.files.photos.map((f) => f.filename);
      existingPhotos = [...existingPhotos, ...newPhotos];
    }

    data.photos = existingPhotos.join(",");

    await Classified.update(data, { where: { id } });

    if (deletedPhotos.length > 0) {
      const fs = require("fs");
      const path = require("path");

      deletedPhotos.forEach((photo) => {
        const filePath = path.join(__dirname, "../uploads", photo);
        fs.unlink(filePath, (err) => {
          if (err) console.warn(`Could not delete file: ${photo}`, err);
        });
      });
    }

    const updatedListing = await Classified.findByPk(id);

    res.json({
      message: "Listing updated successfully",
      listing: updatedListing,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update listing" });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Classified.findByPk(id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (listing.photos) {
      const photos = listing.photos.split(",");
      photos.forEach((photo) => {
        const filePath = path.join(__dirname, "../uploads", photo);
        fs.unlink(filePath, (err) => {
          if (err) console.warn(`Could not delete file: ${photo}`, err);
        });
      });
    }

    await Classified.destroy({ where: { id } });

    res.json({ message: "Listing and associated photos deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete listing" });
  }
};

exports.fetchAllListings = async (req, res) => {
  try {
    const listings = await Classified.findAll();
    console.log("listingggg:;: ", listings);
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};
