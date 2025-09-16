// models/communityService.js
module.exports = (sequelize, DataTypes) => {
  const CommunityService = sequelize.define(
    "CommunityService",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
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
      link: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      card_color: {
        type: DataTypes.STRING(50), // allows Tailwind class names
        allowNull: true,
      },
    },
    {
      tableName: "community_services",
      timestamps: false,
    }
  );

  return CommunityService;
};
