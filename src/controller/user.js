const models = require("../models");
const { Op } = require("sequelize");
const paginate = require("../utils/paginate");
const { sendMessages, createMessages } = require("../utils/expoNotification");

module.exports = {
  getUserProfile: async (req, res, next) => {
    const { aud } = req.payload;
    try {
      const result = await models.User.findOne({
        where: { id: aud },
        attributes: { exclude: ["levelId"] },
        include: [
          {
            model: models.Level,
            as: "level",
            attributes: ["name", "target", "updatedAt"]
          },
          {
            model: models.Stat,
            attributes: { exclude: ["id", "userId", "createdAt"] },
            as: "stats"
          },
          {
            model: models.BankAccountDetail,
            attributes: { exclude: ["id", "userId"] },
            as: "bankAccountDetails"
          },
          {
            model: models.Wallet,
            attributes: ["balance", "updatedAt"],
            as: "wallet"
          }
        ]
      });

      res.status(200).json({ status: "success", result });
    } catch (error) {
      next(error);
    }
  },

  search: async (req, res, next) => {
    const { query } = req.query;
    try {
      const result = await models.User.findAll({
        where: {
          [Op.or]: [
            { uniqueCode: { [Op.like]: "%" + query + "%" } },
            { name: { [Op.like]: "%" + query + "%" } },
            { email: { [Op.like]: "%" + query + "%" } }
          ]
        },
        limit: 10
      });

      res.status(200).json({
        status: "success",
        results: result.length,
        suggestions: result
      });
    } catch (error) {
      next(error);
    }
  },

  getAllUsers: async (req, res, next) => {
    const { page, limit } = req.query;
    try {
      const paginatedResponse = await paginate(
        models.User,
        [],
        page,
        limit,
        {},
        next
      );

      res.status(200).json({ status: "success", users: paginatedResponse });
    } catch (error) {
      next(error);
    }
  },

  getUser: async (req, res, next) => {
    const userId = req.params.userId;
    try {
      const result = await models.User.findOne({
        attributes: { exclude: ["levelId"] },
        where: { id: userId },
        include: [
          { model: models.Level, as: "level", attributes: ["name", "target"] },
          {
            model: models.Stat,
            as: "stats",
            attributes: ["pending", "totalEarnings", "updatedAt"]
          },
          {
            model: models.Withdrawal,
            as: "withdrawls",
            attributes: ["amount", "updatedAt"]
          }
          // { model: models.Earning, as: "earnings" },
        ]
      });

      res.status(200).json({ status: "success", user: result });
    } catch (error) {
      next(error);
    }
  },

  network: async (req, res, next) => {
    const { aud } = req.payload;
    try {
      const result = await models.UserNetwork.findAll({
        where: { userId: aud },
        include: [
          {
            model: models.User,
            include: [
              {
                model: models.Stat,
                as: "stats"
              }
            ]
          }
        ]
      });

      res.status(200).json({ status: "success", result });
    } catch (error) {
      next(error);
    }
  },

  addLead: async (req, res, next) => {
    const { aud } = req.payload;
    const body = req.body;
    try {
      const result = await models.Lead.create({
        ...body,
        userId: aud
      });

      res.status(201).json({ status: "success", result });
    } catch (error) {
      next(error);
    }
  },

  leads: async (req, res, next) => {
    const { page, limit } = req.query;
    try {
      const association = [{ include: [{ model: models.User, as: "user" }] }];

      const paginatedResponse = await paginate(
        models.Lead,
        association,
        page,
        limit,
        {},
        next
      );

      res.status(200).json({ status: "success", leads: paginatedResponse });
    } catch (error) {
      next(error);
    }
  },

  addExpoToken: async (req, res, next) => {
    const { aud } = req.payload;
    const { expoToken } = req.body;
    try {
      const result = await models.User.update(
        { expoToken },
        { where: { id: aud } }
      );

      res.status(200).json({
        status: "success",
        message: `expoToken - ${expoToken} added`,
        result
      });
    } catch (error) {
      next(error);
    }
  }
};
