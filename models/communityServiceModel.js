const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const CommunityService = sequelize.define(
  "CommunityService",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    learn_more_link: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    card_color: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    tableName: "community_services",
    timestamps: false,
  }
);

module.exports = CommunityService;
