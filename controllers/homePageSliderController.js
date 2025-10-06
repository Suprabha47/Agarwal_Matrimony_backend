const HomePageSlider = require("../models/homePageSliderModel");
const path = require("path");
const fs = require("fs");
// const {
//   buildSliderImageUrl,
//   handleSliderImage,
// } = require("../utils/sliderHelpers");

exports.createSlider = async (req, res) => {
  try {
    const sliderData = {
      image_path: req.file ? req.file.filename : null,
      alt_text: req.body.alt_text || null,
    };

    if (!sliderData.image_path) {
      return res.status(400).json({ error: "Image is required" });
    }

    const newSlider = await HomePageSlider.create(sliderData);

    res.status(201).json({
      message: "Slider created successfully",
      slider: {
        ...newSlider.toJSON(),
        image_path: `/uploads/${newSlider.image_path}`,
      },
    });
  } catch (error) {
    console.error("Error creating slider:", error);
    res.status(500).json({ error: "Failed to create slider" });
  }
};

exports.getSliders = async (req, res) => {
  try {
    const sliders = await HomePageSlider.findAll({
      order: [["created_at", "DESC"]],
    });
    console.log("sliderssssss: ", sliders);
    const response = sliders.map((s) => ({
      ...s.toJSON(),
      image_path: `/uploads/${s.image_path}`,
    }));
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sliders" });
  }
};

exports.getSliderById = async (req, res) => {
  try {
    const slider = await HomePageSlider.findByPk(req.params.id);
    if (!slider) return res.status(404).json({ error: "Slider not found" });

    const response = slider.toJSON();
    response.image_path = `/uploads/${response.image_path}`;
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch slider" });
  }
};

exports.updateSlider = async (req, res) => {
  try {
    const slider = await HomePageSlider.findByPk(req.params.id);
    if (!slider) return res.status(404).json({ error: "Slider not found" });

    if (req.file && slider.image_path) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "uploads",
        slider.image_path
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      slider.image_path = req.file.filename;
    }

    slider.alt_text = req.body.alt_text || slider.alt_text;

    await slider.save();

    res.status(200).json({
      message: "Slider updated successfully",
      slider: {
        ...slider.toJSON(),
        image_path: `/uploads/${slider.image_path}`,
      },
    });
  } catch (error) {
    console.error("Error updating slider:", error);
    res.status(500).json({ error: "Failed to update slider" });
  }
};

exports.deleteSlider = async (req, res) => {
  try {
    const slider = await HomePageSlider.findByPk(req.params.id);
    if (!slider) return res.status(404).json({ error: "Slider not found" });

    if (slider.image_path) {
      const imagePath = path.join(
        __dirname,
        "..",
        "uploads",
        slider.image_path
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await slider.destroy();

    res.json({ message: "Slider and image deleted successfully" });
  } catch (error) {
    console.error("Error deleting slider:", error);
    res.status(500).json({ error: "Failed to delete slider" });
  }
};
