"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Earning extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Earning.belongsTo(models.User, { as: "user" });
    }
  }
  Earning.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      offerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      offerImageUrl: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.ENUM,
        values: ["pending", "paid"],
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "Earning",
    }
  );
  return Earning;
};
