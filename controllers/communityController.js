const CommunityService = require("../models/communityServiceModel");
const fs = require("fs");
const path = require("path");

exports.createService = async (req, res) => {
  try {
    const { title, description, learn_more_link, card_color } = req.body;
    const icon_url = req.file ? req.file.path : null; // uploaded image path

    const newService = await CommunityService.create({
      title,
      description,
      learn_more_link,
      icon_url,
      card_color,
    });

    res.status(201).json({ success: true, data: newService });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const services = await CommunityService.findAll();
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await CommunityService.findByPk(req.params.id);
    if (!service)
      return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { title, description, learn_more_link, card_color } = req.body;
    const icon_url = req.file ? req.file.path : null;

    const service = await CommunityService.findByPk(req.params.id);
    if (!service)
      return res.status(404).json({ success: false, message: "Not found" });

    await service.update({
      title,
      description,
      learn_more_link,
      card_color,
      icon_url: icon_url || service.icon_url,
    });

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await CommunityService.findByPk(req.params.id);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    if (service.icon_url) {
      const filePath = path.join(__dirname, "..", service.icon_url);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    await service.destroy();
    res
      .status(200)
      .json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
