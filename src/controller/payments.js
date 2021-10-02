const createError = require("http-errors");
const models = require("../models");
const sequelize = require("../models").sequelize;
const { Op } = require("sequelize");
const { addToUserWalletSchema } = require("../validation/payments");
const axios = require("axios").default;

module.exports = {
  create: async (req, res, next) => {
    const body = req.body;
    const { aud } = req.payload;
    try {
      const find = await models.BankAccountDetail.findOne({
        where: { userId: aud },
      });

      if (find)
        throw new createError.Conflict("bank account details already exist.");

      const result = await models.BankAccountDetail.create({
        ...body,
        userId: aud,
      });
      res.status(201).json({
        status: "success",
        message: "bank account created successfully",
        result: result,
      });
    } catch (error) {
      console.log("Error:", error);
      next(error);
    }
  },

  addToUserWallet: async (req, res, next) => {
    const { userId, earningId } = req.params;
    const amount = req.body.amount;
    let wallet, stats;
    try {
      await addToUserWalletSchema.validateAsync({ amount });

      const find = await models.Earning.findOne({
        where: { [Op.and]: [{ id: earningId }, { userId }] },
      });

      if (!find)
        throw new createError.NotFound(
          `earning ID ${earningId} or User ID ${userId} not found`
        );

      if (find.status === "paid")
        throw new createError.UnprocessableEntity(
          `Payout for this ${find.offerName} offer already paid`
        );

      stats = await models.Stat.findOne({
        where: { userId },
      });

      if (amount > stats.pending)
        throw new createError.Forbidden(
          `Wallet transfer amount cannot be greater than pending amount.`
        );

      await sequelize.transaction(async (t) => {
        wallet = await models.Wallet.findOne(
          {
            where: { userId },
          },
          { transaction: t }
        );

        const updateBalance = parseInt(wallet.balance) + parseInt(amount);

        result = await models.Wallet.update(
          {
            balance: updateBalance,
          },
          { where: { userId } },
          { transaction: t }
        );

        await models.Earning.update(
          {
            status: "paid",
          },
          { where: { [Op.and]: [{ userId }, { id: earningId }] } },
          { transaction: t }
        );

        const updatedPendingAmount = parseInt(stats.pending) - parseInt(amount);
        const updatedTotalEarnings =
          parseInt(stats.totalEarnings) + parseInt(amount);

        await models.Stat.update(
          {
            pending: updatedPendingAmount,
            totalEarnings: updatedTotalEarnings,
          },
          { where: { userId } },
          { transaction: t }
        );
        if(parseInt(stats.totalEarnings) + amount < 500 ) {
          await models.User.update(
            { levelId: 1 },
            { where: { id: userId } },
            { transaction: t }
          );
        }
        else if (
          parseInt(stats.totalEarnings) + amount >= 500 &&
          parseInt(stats.totalEarnings) + amount < 2000
        ) {
          await models.User.update(
            { levelId: 2 },
            { where: { id: userId } },
            { transaction: t }
          );
        } else if (
          parseInt(stats.totalEarnings) + amount >= 2000 &&
          parseInt(stats.totalEarnings) + amount < 10000
        ) {
          await models.User.update(
            { levelId: 3 },
            { where: { id: userId } },
            { transaction: t }
          );
        } else {
          await models.User.update(
            { levelId: 4 },
            { where: { id: userId } },
            { transaction: t }
          );
        }

        // check for link
        // if link found then pay 10% of amount to the parent

        const link = await models.UserNetwork.findOne({
          include: [
            {
              model: models.User,
              include: [
                {
                  model: models.Wallet,
                  as: "wallet",
                },
                {
                  model: models.Stat,
                  as: "stats",
                },
              ],
            },
          ],
          where: { refferedByUserId: userId },
        });

        if (link) {
          const updateBal =
            (amount / 100) * 10 + Number(link.User.wallet.balance);
          await models.Wallet.update(
            {
              balance: updateBal,
            },
            { where: { userId: link.userId } },
            { transaction: t }
          );
          await models.Stat.update(
            {
              totalEarnings:
                (amount / 100) * 10 + Number(link.User.stats.totalEarnings),
            },
            { where: { userId: link.userId } },
            { transaction: t }
          );
        }
      });

      res.status(200).json({
        status: "success",
        wallet,
        stats,
        updatedWallet: wallet.balance + amount,
        updatedStats: stats.pending - amount,
      });
    } catch (error) {
      next(error);
      console.log(error);
    }
  },

  withdrawFromWallet: async (req, res, next) => {
    const { amount } = req.body;
    const { aud } = req.payload;
    let userAccountDetails, userWallet, withdraw, makePayout;

    try {
      if (amount < 500)
        throw new createError.NotAcceptable(
          `Withdrawal amount should be more than ₹ 500`
        );

      await sequelize.transaction(async (t) => {
        userAccountDetails = await models.BankAccountDetail.findOne(
          {
            include: [{ model: models.User, as: "user" }],
            where: { userId: aud },
          },
          { transaction: t }
        );

        console.log(userAccountDetails);

        userWallet = await models.Wallet.findOne(
          {
            where: { userId: aud },
          },
          { transaction: t }
        );

        if (!userAccountDetails)
          throw new createError.NotFound(`User Bank Details not Found`);

        if (amount > userWallet.balance) {
          throw new createError.NotAcceptable(`Not enough balance`);
        }
        withdraw = await models.Withdrawal.create(
          {
            userId: aud,
            amount,
          },
          { transaction: t }
        );

        const { accountNumber, ifscCode } = userAccountDetails;
        const { name, email, phoneNumber, uniqueCode } =
          userAccountDetails.user;

        const data = JSON.stringify({
          account_number: "2323230024948434",
          amount: amount * 100,
          currency: "INR",
          mode: "NEFT",
          purpose: "payout",
          fund_account: {
            account_type: "bank_account",
            bank_account: {
              name: name,
              ifsc: ifscCode,
              account_number: JSON.stringify(accountNumber),
            },
            contact: {
              name: name,
              email: email,
              contact: JSON.stringify(phoneNumber),
              type: "customer",
              reference_id: JSON.stringify(uniqueCode),
            },
          },
          queue_if_low_balance: true,
          reference_id: JSON.stringify(withdraw.id),
          narration: "Offer payout",
        });

        makePayout = await axios.post(
          "https://api.razorpay.com/v1/payouts",
          data,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Basic cnpwX3Rlc3RfV2JSVHc0bEZSUDdrUm46djV0TFhDU3o0dUtnWDc1anR6aGRuejNC",
            },
          }
        );

        const updatedWalletBalance = parseInt(userWallet.balance) - amount;

        if (makePayout)
          await models.Wallet.update(
            {
              balance: updatedWalletBalance,
            },
            { where: { userId: aud } },
            { transaction: t }
          );
      });

      res.status(201).json({
        status: "success",
        message: "Wallet amount transfered successfully.",
        payout: makePayout.data,
      });
    } catch (error) {
      next(error);
      console.log(error);
    }
  },

  view: async (req, res, next) => {
    const { aud } = req.payload;
    try {
      const result = await models.BankAccountDetail.findOne({
        where: { userId: aud },
      });
      res.status(201).json({ status: "success", result: result });
    } catch (error) {
      console.log("Error:", error);
      next(error);
    }
  },

  update: async (req, res, next) => {
    const body = req.body;
    const { aud } = req.payload;
    try {
      await models.BankAccountDetail.update(
        {
          ...body,
          userId: aud,
        },
        { where: { userId: aud } }
      );

      // const result = await models.BankAccountDetail.findOne({
      //   where: { userId: aud },
      // });

      res.status(201).json({
        status: "success",
        message: "Bank account details updated",
        // result,
      });
    } catch (error) {
      next(error);
    }
  },

  remove: async (req, res, next) => {
    const { aud } = req.payload;
    try {
      await models.BankAccountDetail.destroy({
        where: { userId: aud },
      });
      res
        .status(201)
        .json({ status: "success", message: "bank account details removed" });
    } catch (error) {
      next(error);
    }
  },

  viewAllTransactions: async (req, res, next) => {
    let response;
    try {
      var config = {
        method: "get",
        url: "https://api.razorpay.com/v1/transactions?account_number=2323230024948434",
        headers: {
          Authorization:
            "Basic cnpwX3Rlc3RfV2JSVHc0bEZSUDdrUm46djV0TFhDU3o0dUtnWDc1anR6aGRuejNC",
        },
      };

      response = await axios(config);

      res.status(200).json({ status: "successsss", result: response.data });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  getUserWithdrawals: async (req, res, next) => {
    const { aud } = req.payload;

    try {
      const result = await models.Withdrawal.findAll({
        where: { userId: aud },
        attributes: { exclude: ["userId"] },
      });

      res.status(200).json({ status: "success", withdrawals: result });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};
