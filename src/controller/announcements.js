const models = require("../models");
const sequelize = require("../models").sequelize;
const { destroy, upload } = require("../cloudinary");
module.exports = {

    allAnnouncements: async (req, res, next) => {
        try {
            const result = await models.Announcement.findAll({
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

            const result = await models.Announcement.create({
                ...body,
                announcementImageUrl: image ? imageUploadResponse.url : null,
            });

            res.status(201).json({ status: "success", result });
        } catch (error) {
            console.log("Error:", error);
            next(error);
        }
    },
    deleteAnnouncements: async (req, res, next) => {
        const announcementsId = req.params.announcementsId
        try {
            await models.Announcement.destroy({
                where: {
                    id: announcementsId
                }
            })
            res.status(201).json({ status: "success", message: 'Announcement deleted successfully' });
        } catch (error) {
            console.log("Error:", error);
            next(error);
        }
    }
};
