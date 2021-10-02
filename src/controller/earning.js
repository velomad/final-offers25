const models = require("../models");
const createError = require("http-errors");
const sequelize = require("../models").sequelize;
const { Op } = require("sequelize");
const paginate = require("../utils/paginate");

module.exports = {
  addUserEarning: async (req, res, next) => {
    const body = req.body;
    const userId = req.params.userId;
    let result;

    try {
      await sequelize.transaction(async (t) => {
        result = await models.Earning.create(
          {
            ...body,
            userId,
          },
          { transaction: t }
        );

        // update the stats table

        const stats = await models.Stat.findOne(
          { where: { userId } },
          { transaction: t }
        );

        const updatePendingAmount =
          parseInt(stats.pending) + parseInt(body.amount);

        await models.Stat.update(
          {
            pending: updatePendingAmount,
          },
          { where: { userId } },
          { transaction: t }
        );
      });

      res.status(201).json({ status: "success", result });
    } catch (error) {
      next(error);
    }
  },

  userEarnings: async (req, res, next) => {
    const userId = req.params.userId;
    const { page, limit } = req.query;
    try {
      const search = {
        where: { userId },
      };

      const paginatedResponse = await paginate(
        models.Earning,
        [],
        page,
        limit,
        search,
        next
      );

      res.status(200).json({ status: "success", result: paginatedResponse });
    } catch (error) {
      next(error);
    }
  },

  userAppEarnings: async (req, res, next) => {
    const { aud } = req.payload;
    const { page, limit, status, amount, sortBy } = req.query;
    try {
      const search = {
        where: {
          [Op.and]: [
            { userId: aud },
            status && { status },
            amount && { amount: { [Op.gte]: amount.gte } },
          ],
        },
        order: [["amount", sortBy == "high" ? "DESC" : "ASC"]],
      };

      const paginatedResponse = await paginate(
        models.Earning,
        [],
        page,
        limit,
        search,
        next
      );

      res.status(200).json({ status: "success", result: paginatedResponse });
    } catch (error) {
      next(error);
    }
  },

  allUsersEarnings: async (req, res, next) => {
    const { page, limit } = req.query;

    try {
      // filter and sorting to be added to this API
      const associations = [
        {
          include: [
            {
              model: models.User,
              as: "user",
              attributes: { exclude: ["levelId"] },
              include: [{ model: models.Level, as: "level" }],
            },
          ],
        },
      ];

      const paginatedResponse = await paginate(
        models.Earning,
        associations,
        page,
        limit,
        {},
        next
      );

      res.status(200).json({ status: "success", result: paginatedResponse });
    } catch (error) {
      next(error);
    }
  },

  revertUserEarning: async (req, res, next) => {
    /*once reverted no other service in place to revert it back to the pending state.
      New earning has to be added*/

    const { userId, earningId } = req.params;
    try {
      const find = await models.Earning.findOne({
        where: { [Op.and]: [{ id: earningId }, { userId }] },
      });

      const stats = await models.Stat.findOne({
        where: { userId },
      });

      if (!find)
        throw new createError.NotFound(
          `earning ID ${earningId} or User ID ${userId} not found`
        );

      if (find.status === "reverted")
        throw new createError.Conflict("Earning already reverted.");

      const updatePendingAmount =
        parseInt(stats.pending) - parseInt(find.amount);

      if (updatePendingAmount < 0) {
        throw new createError.NotAcceptable(
          "Pending amount cannot be less than 0"
        );
      }

      await sequelize.transaction(async (t) => {
        // update the earning from pending to reverted

        await models.Earning.update(
          {
            status: "reverted",
          },
          { where: { [Op.and]: [{ userId }, { id: earningId }] } },
          { transaction: t }
        );

        // update the stats

        await models.Stat.update(
          {
            pending: updatePendingAmount,
          },
          { where: { userId } },
          { transaction: t }
        );
      });

      res.status(200).json({ status: "success", message: "Earning reverted" });
    } catch (error) {
      next(error);
    }
  },
};
