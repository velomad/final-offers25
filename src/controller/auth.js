const { Op } = require("sequelize");
const sequelize = require("../models").sequelize;
const createError = require("http-errors");
const models = require("../models");
const { codeGen } = require("../utils/uniqueCodeGenerator");
const uniqueCodeGenerator = require("../utils/uniqueCodeGenerator");
const { signAccessToken } = require("../middlewares/jwt");
const { sendMessages, createMessages } = require("../utils/expoNotification");

module.exports = {
  register: async (req, res, next) => {
    const body = req.body;
    let result, referCodeUser;
    try {
      if (body.referCode) {
        referCodeUser = await models.User.findOne({
          where: { uniqueCode: body.referCode },
        });
      }

      if(!referCodeUser && body.referCode){
        throw new createError.NotFound(
          "Invalid refferal code"
        );
      }

      await sequelize.transaction(async (t) => {
        const find = await models.User.findOne(
          {
            where: {
              [Op.or]: [
                {
                  email: body.email,
                },
                {
                  phoneNumber: body.phoneNumber,
                },
              ],
            },
          },
          { transaction: t }
        );

        if (find)
          throw new createError.Conflict(
            "Phone Number or Email-Id already in use."
          );

        const uniqueCode = await codeGen(models.User);

        result = await models.User.create(
          {
            ...body,
            uniqueCode,
          },
          { transaction: t }
        );

        if (body.referCode) {
          await models.User.update(
            { isRefered: "1" },
            { where: { uniqueCode: body.referCode } },
            { transaction: t }
          );

          // await models.Network.create(
          //   {
          //     uniqueCode: body.referCode,
          //     referralUserId: result.id,
          //   },
          //   { transaction: t }
          // );

          await models.UserNetwork.create(
            {
              userId: referCodeUser.id,
              refferedByUserId: result.id,
            },
            { transaction: t }
          );

          if (referCodeUser.isRefered == 0) {
            let messageBody = `Referral Bonus Unlocked`;
            let messages = createMessages(
              messageBody,
              {
                messageBody,
              },
              [referCodeUser.expoToken]
            );

            sendMessages(messages);
            await models.Notification.create({
              userId: referCodeUser.id,
              message: messageBody,
            });
          }

          let messageBody = `${body.name} has been added to your network`;
          let messages = createMessages(
            messageBody,
            {
              messageBody,
            },
            [referCodeUser.expoToken]
          );

          sendMessages(messages);
          await models.Notification.create({
            userId: referCodeUser.id,
            message: messageBody,
          });
        }

        await models.Stat.create(
          {
            userId: result.id,
          },
          { transaction: t }
        );

        await models.Wallet.create(
          {
            userId: result.id,
          },
          { transaction: t }
        );
      });

      res.status(200).json({
        status: "success",
        result,
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    const body = req.body;
    try {
      const result = await models.User.findOne({
        where: {
          phoneNumber: body.phoneNumber ? body.phoneNumber : null,
        },
      });

      if (!result) {
        throw createError.Unauthorized("Phone number not found");
      }

      const token = await signAccessToken(
        JSON.stringify(result.id),
        process.env.USER_ACCESS_TOKEN_SECRET
      );

      res.status(200).json({ status: "success", token });
    } catch (error) {
      next(error);
    }
  },
  validateUser: async (req, res, next) => {
    const phoneNumber = req.body.phoneNumber;
    try {
      const found = await models.User.findOne({
        where: {
          phoneNumber: phoneNumber,
        },
      });
      if (!found) throw new createError.NotFound("Phone number not exist.");

      res
        .status(201)
        .json({ status: "success", message: "Authentication Successfull" });
    } catch (error) {
      console.log("Error:", error);
      next(error);
    }
  },

  validateReferralCode: async (req, res, next) => {
    const referralCode = req.body.referralCode;

    try {
      const result = await models.User.findOne({
        where: { uniqueCode: referralCode },
      });

      if (!result)
        throw new createError.NotFound(
          `Referral Code ${referralCode} not exist.`
        );

      res.status(200).json({
        status: "success",
        message: "Referral code successfully validated",
      });
    } catch (error) {
      next(error);
    }
  },
};
