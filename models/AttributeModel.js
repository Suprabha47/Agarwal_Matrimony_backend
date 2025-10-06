const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Attribute = sequelize.define(
  "Attribute",
  {
    attribute_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    attribute_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "attributes",
    timestamps: false,
  }
);

module.exports = Attribute;
