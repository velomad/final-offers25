"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BankAccountDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      BankAccountDetail.belongsTo(models.User, { as: "user" });
    }
  }
  BankAccountDetail.init(
    {
      userId: {
        foreignKey: true,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        type: DataTypes.INTEGER,
      },
      accountNumber: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      ifscCode: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "BankAccountDetail",
    }
  );
  return BankAccountDetail;
};
