"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Offers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      offerImageUrl: {
        type: Sequelize.STRING,
      },
      formOfferUrl: {
        type: Sequelize.STRING,
      },
      offerUrl: {
        type: Sequelize.STRING,
      },

      userPayout: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      payoutOnText: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      taskTest: {
        type: Sequelize.STRING,
      },
      reportingDays: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      isLive: {
        type: Sequelize.ENUM,
        values: ["0", "1","2"],
        defaultValue: "1",
        allowNull: true,
      },
      offerTypeId: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: {
          model: "OfferTypes",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      isTop: {
        type: Sequelize.ENUM,
        allowNull: true,
        values: ["0", "1"],
        defaultValue: "0",
        allowNull: true,
      },
      isFormEnabled: {
        type: Sequelize.ENUM,
        allowNull: true,
        values: ["0", "1"],
        defaultValue: "0",
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Offers");
  },
};
