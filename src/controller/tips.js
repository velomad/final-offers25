const models = require("../models");
const sequelize = require("../models").sequelize;
const { destroy, upload } = require("../cloudinary");

module.exports = {
    allTips: async (req, res, next) => {
        try {
            const result = await models.Tip.findAll({
            });
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        const body = req.body;
        let image, imageUploadResponse;

        try {
            if (req.file) {
                image = req.file.path;
                imageUploadResponse = await upload(image);
            }

            const result = await models.Tip.create({
                ...body,
                tipImageUrl: image ? imageUploadResponse.url : null,
            });

            res.status(201).json({ status: "success", result });
        } catch (error) {
            console.log("Error:", error);
            next(error);
        }
    },
    deleteTip: async (req, res, next) => {
        const tipId = req.params.tipId
        try {
            await models.Tip.destroy({
                where: {
                    id: tipId
                }
            })
            res.status(201).json({ status: "success", message: 'Tip deleted successfully' });
        } catch (error) {
            console.log("Error:", error);
            next(error);
        }
    }
};
