const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Attribute = require("./AttributeModel");

const AttributeValue = sequelize.define(
  "AttributeValue",
  {
    value_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    attribute_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "attributes", // table name, not model name
        key: "attribute_id",
      },
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    tableName: "attribute_values",
    timestamps: false,
  }
);

Attribute.hasMany(AttributeValue, { foreignKey: "attribute_id" });
AttributeValue.belongsTo(Attribute, { foreignKey: "attribute_id" });

module.exports = AttributeValue;
