"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
      User.belongsTo(models.Level, { as: "level" });
      User.hasOne(models.BankAccountDetail, {
        foreignKey: "userId",
        as: "bankAccountDetails",
      });
      User.hasOne(models.Wallet, { foreignKey: "userId", as: "wallet" });
      User.hasOne(models.Stat, { foreignKey: "userId", as: "stats" });
      User.hasMany(models.Earning, { foreignKey: "userId", as: "earnings" });
      User.hasMany(models.Notification, {
        foreignKey: "userId",
        as: "notifications",
      });
      User.hasMany(models.Withdrawal, {
        foreignKey: "userId",
        as: "withdrawls",
      });
    }
  }
  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING(13),
        allowNull: false,
      },
      uniqueCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      isRefered: {
        type: DataTypes.ENUM,
        values: ["0", "1"],
        defaultValue: "0",
      },
      levelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "Levels",
          key: "id",
        },
        defaultValue: "1",
      },
      expoToken: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
