const models = require("../models");
const sequelize = require("../models").sequelize;
const createError = require("http-errors");
const { upload, destroy } = require("../cloudinary");
const { getPublicId } = require("../utils/cloudinary");

module.exports = {
  allOffers: async (req, res, next) => {
    try {
      const result = await models.Offer.findAll({
        attributes: { exclude: ["offerTypeId"] },
        include: [
          {
            model: models.OfferType,
            required: true,
            as: "offerType",
          },
          { model: models.Info, as: "infos" },
          { model: models.Step, as: "steps" },
          { model: models.Benefit, as: "benefits" },
          // {
          //   model: models.OfferDetail,
          //   required: true,
          //   as: "details",
          //   include: [],
          // },
        ],
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    const body = req.body;
    let image, imageUploadResponse;

    let infosData = [];
    let benefitsData = [];
    let stepsData = [];

    let offer, infos, benefits, steps;

    const obj = [
      {
        mapKey: "infos",
        pushKey: "infosData",
        dataKey: "info",
      },
      {
        mapKey: "benefits",
        pushKey: "benefitsData",
        dataKey: "benefit",
      },
      {
        mapKey: "steps",
        pushKey: "stepsData",
        dataKey: "step",
      },
    ];

    try {
      if (req.file) {
        image = req.file.path;
        imageUploadResponse = await upload(image);
      } else {
        throw new createError.NotFound("Image not found");
      }

      await sequelize.transaction(async (t) => {
        // create the offer
        offer = await models.Offer.create(
          {
            ...body,
            offerImageUrl: image ? imageUploadResponse.url : null,
          },
          { transaction: t }
        );

        obj.map((el) => {
          JSON.parse(body[el.mapKey]).map((value) => {
            eval(el.pushKey).push({
              offerId: offer.id,
              [el.dataKey]: value,
            });
          });
        });

        console.log(benefitsData);

        // create infos
        infos = await models.Info.bulkCreate(infosData, {
          transaction: t,
        });
        // create benefits
        benefits = await models.Benefit.bulkCreate(benefitsData, {
          transaction: t,
        });
        // create steps
        steps = await models.Step.bulkCreate(stepsData, {
          transaction: t,
        });
      });
      res
        .status(201)
        .json({ status: "success", offer, infos, benefits, steps });
    } catch (error) {
      next(error);
    }
  },

  updateOffer: async (req, res, next) => {
    const body = req.body;
    const offerId = req.params.offerId;
    let image, imageUploadResponse;

    try {
      const find = await models.Offer.findOne({ where: { id: offerId } });

      if (!find) throw new createError.NotFound("Offer not found");

      if (req.file) {
        image = req.file.path;
        imageUploadResponse = await upload(image);

        find.offerImageUrl !== null && destroy(getPublicId(find.offerImageUrl));
      }

      await models.Offer.update(
        {
          ...body,
          offerImageUrl: image ? imageUploadResponse.url : find.offerImageUrl,
        },
        { where: { id: offerId } }
      );

      res.status(201).json({ status: "success", message: "offer Updated" });
    } catch (error) {
      next(error);
    }
  },

  removeOfferImage: async (req, res, next) => {
    const offerId = req.params.offerId;
    try {
      const find = await models.Offer.findOne({ where: { id: offerId } });

      if (!find) throw new createError.NotFound("Offer not found");

      if (!find.offerImageUrl)
        throw new createError.NotFound("Image not found");

      if (find.offerImageUrl !== null) {
        destroy(getPublicId(find.offerImageUrl));

        await models.Offer.update(
          {
            offerImageUrl: null,
          },
          { where: { id: offerId } }
        );
      }
      res.status(200).json({
        status: "success",
        message: "offer image removed",
      });
    } catch (error) {
      next(error);
    }
  },

  suspendOffer: async (req, res, next) => {
    const offerId = req.params.offerId;
    try {
      const find = await models.Offer.findOne({ where: { id: offerId } });

      if (!find) throw new createError.NotFound("Offer not found");

      await models.Offer.update({ isLive: "0" }, { where: { id: offerId } });

      res.status(200).json({ status: "success", message: "Offer suspended" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  pauseOffer: async (req, res, next) => {
    const offerId = req.params.offerId;
    try {
      const find = await models.Offer.findOne({ where: { id: offerId } });

      if (!find) throw new createError.NotFound("Offer not found");

      await models.Offer.update({ isLive: "2" }, { where: { id: offerId } });

      res.status(200).json({ status: "success", message: "Offer Paused" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  setTop: async (req, res, next) => {
    const offerId = req.params.offerId;
    try {
      const find = await models.Offer.findOne({ where: { id: offerId } });

      if (!find) throw new createError.NotFound("Offer not found");

      await models.Offer.update(
        { isTop: find.isTop == 1 ? "0" : "1" },
        { where: { id: offerId } }
      );

      res
        .status(200)
        .json({ status: "success", message: "Top offer toggeled" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  setFormEnable: async (req, res, next) => {
    const offerId = req.params.offerId;
    try {
      const find = await models.Offer.findOne({ where: { id: offerId } });

      if (!find) throw new createError.NotFound("Offer not found");

      await models.Offer.update(
        { isFormEnabled: find.isFormEnabled == 1 ? "0" : "1" },
        { where: { id: offerId } }
      );

      res
        .status(200)
        .json({ status: "success", message: "Offer lead Form toggeled " });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};
