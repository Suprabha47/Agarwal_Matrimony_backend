// models/Membership.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db"); // your sequelize instance

const Membership = sequelize.define(
  "Membership",
  {
    membershipNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    applicantName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    wifeName: {
      type: DataTypes.STRING,
    },
    husbandIdCard: {
      type: DataTypes.STRING, // store uploaded file path or URL
    },
    wifeIdCard: {
      type: DataTypes.STRING,
    },
    applicantDob: {
      type: DataTypes.DATEONLY,
    },
    marriageDate: {
      type: DataTypes.DATEONLY,
    },
    wifeDob: {
      type: DataTypes.DATEONLY,
    },
    fatherHusbandName: {
      type: DataTypes.STRING,
    },
    gotra: {
      type: DataTypes.STRING,
    },
    resAddress: {
      type: DataTypes.TEXT,
    },
    villageCity: {
      type: DataTypes.STRING,
    },
    district: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    pincode: {
      type: DataTypes.STRING,
    },
    telephone: {
      type: DataTypes.STRING,
    },
    mobileSelf: {
      type: DataTypes.STRING,
    },
    mobileWife: {
      type: DataTypes.STRING,
    },
    faxEmail: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true, // simple validation
      },
    },
    occupation: {
      type: DataTypes.STRING,
    },
    origin: {
      type: DataTypes.STRING,
    },
    corpusFund: {
      type: DataTypes.INTEGER,
    },
    lifeMagazineFee: {
      type: DataTypes.INTEGER,
    },
    membershipFee: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    husbandPhoto: {
      type: DataTypes.STRING,
    },
    wifePhoto: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "memberships",
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = Membership;
