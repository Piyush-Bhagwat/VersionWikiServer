const { Router } = require("express");
const jwtVerify = require("../middleware/auth");

const userRouter = Router();
userRouter.use(jwtVerify);
userRouter.get("/notifications", async (req, res) => {
    const notifications = await Notification.find({
        recipientId: req.user.id,
        isRead: false,
    })
        .populate("actorId", "name email")
        .populate("relatedNoteId", "color title")
        .sort({ createdAt: -1 });

    return res.status(200).json(notifications);
});
