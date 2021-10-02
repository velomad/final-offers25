"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Network extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Network.belongsTo(models.User, {
        foreignKey: "referralUserId",
        as: "user",
      });
    }
  }
  Network.init(
    {
      uniqueCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      referralUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Network",
    }
  );
  return Network;
};
