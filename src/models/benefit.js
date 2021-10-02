"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Benefit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Benefit.init(
    {
      offerId: {
        foreignKey: true,
        allowNull: false,
        references: {
          model: "Offers",
          key: "id",
        },
        type: DataTypes.INTEGER,
      },
      benefit: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Benefit",
    }
  );
  return Benefit;
};
