const AttributeValue = require("../models/AttributeValueModel");
const Attribute = require("../models/AttributeModel");

exports.getAllAttributeValues = async (req, res) => {
  try {
    const values = await AttributeValue.findAll({
      include: [{ model: Attribute, attributes: ["attribute_name"] }],
      order: [["sort_order", "ASC"]],
    });

    res.status(200).json({ success: true, data: values });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getValuesByAttribute = async (req, res) => {
  try {
    const { attribute_id } = req.params;

    const values = await AttributeValue.findAll({
      where: { attribute_id },
      order: [["sort_order", "ASC"]],
    });

    if (!values.length) {
      return res.status(404).json({
        success: false,
        message: "No values found for this attribute.",
      });
    }

    res.status(200).json({ success: true, data: values });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addAttributeValue = async (req, res) => {
  try {
    const { attribute_id, value, sort_order } = req.body;

    if (!attribute_id || !value) {
      return res.status(400).json({
        success: false,
        message: "attribute_id and value are required.",
      });
    }

    const attribute = await Attribute.findByPk(attribute_id);
    if (!attribute) {
      return res
        .status(404)
        .json({ success: false, message: "Attribute not found." });
    }

    const newValue = await AttributeValue.create({
      attribute_id,
      value,
      sort_order: sort_order || 0,
      is_active: true,
    });

    res.status(201).json({ success: true, data: newValue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAttributeValue = async (req, res) => {
  try {
    const { value_id } = req.params;
    const { value, is_active, sort_order } = req.body;

    const existingValue = await AttributeValue.findByPk(value_id);
    if (!existingValue) {
      return res
        .status(404)
        .json({ success: false, message: "Value not found." });
    }

    await existingValue.update({
      value: value || existingValue.value,
      is_active:
        typeof is_active !== "undefined" ? is_active : existingValue.is_active,
      sort_order: sort_order ?? existingValue.sort_order,
    });

    res.status(200).json({ success: true, data: existingValue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAttributeValue = async (req, res) => {
  try {
    const { value_id } = req.params;

    const existingValue = await AttributeValue.findByPk(value_id);
    if (!existingValue) {
      return res
        .status(404)
        .json({ success: false, message: "Value not found." });
    }

    await existingValue.destroy();
    res.status(200).json({
      success: true,
      message: "Attribute value deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
