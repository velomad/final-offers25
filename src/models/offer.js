"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Offer extends Model {
    static associate(models) {
      // define association here
      Offer.belongsTo(models.OfferType, { as: "offerType" });
      Offer.hasOne(models.OfferDetail, { foreignKey: "id", as: "details" });

      Offer.hasMany(models.Info, {
        foreignKey: "offerId",
        as: "infos",
      });
      Offer.hasMany(models.Step, {
        foreignKey: "offerId",
        as: "steps",
      });
      Offer.hasMany(models.Benefit, {
        foreignKey: "offerId",
        as: "benefits",
      });
    }
  }
  Offer.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      offerImageUrl: {
        type: DataTypes.STRING,
      },
      formOfferUrl: {
        type: DataTypes.STRING,
      },
      offerUrl: {
        type: DataTypes.STRING,
      },
      userPayout: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      payoutOnText: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      taskTest: {
        type: DataTypes.STRING,
      },
      reportingDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isLive: {
        type: DataTypes.ENUM,
        values: ["0", "1", "2"],
        defaultValue: "1",
        allowNull: true,
      },
      offerTypeId: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: {
          model: "OfferTypes",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      isTop: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ["0", "1"],
        defaultValue: "0",
        allowNull: true,
      },
      isFormEnabled: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ["0", "1"],
        defaultValue: "0",
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Offer",
    }
  );
  return Offer;
};
