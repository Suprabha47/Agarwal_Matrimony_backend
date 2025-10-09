const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

console.log(typeof sequelize);

const AdminUser = sequelize.define(
  "AdminUser",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 2,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "admin_users",
    timestamps: false,
  }
);

module.exports = AdminUser;
