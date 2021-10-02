"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OfferDetail extends Model {
    static associate(models) {
      // define association here
    }
  }
  OfferDetail.init(
    {
      offerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "Offers",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "OfferDetail",
    }
  );
  return OfferDetail;
};
