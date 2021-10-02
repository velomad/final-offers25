"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Stat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Stat.init(
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
      pending: {
        type: DataTypes.INTEGER,
        defaultValue: "0",
      },
      totalEarnings: {
        type: DataTypes.INTEGER,
        defaultValue: "0",
      },
    },
    {
      sequelize,
      modelName: "Stat",
    }
  );
  return Stat;
};
