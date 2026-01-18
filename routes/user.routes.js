import { Router } from "express";
import jwtVerify from "../middleware/auth.js";
import { Notification } from "../models/notification.model.js";
import ApiError from "../utils/apierror.util.js";
import { Note } from "../models/note.model.js";
import {
    NOTE_MESSAGES,
    AUTH_MESSAGES,
    USER_MESSAGES,
} from "../constants/responseMessages.js";
import { getNote } from "../services/note.service.js";

const userRouter = Router();
userRouter.use(jwtVerify);

userRouter.get("/notifications", async (req, res) => {
    const notifications = await Notification.find({
        recipientId: req.user.id,
    })
        .populate("actorId", "name email")
        .populate({
            path: "relatedNoteId",
            select: "color versionId",
            populate: { path: "versionId", select: "title" },
        })
        .sort({ createdAt: -1 });

    return res.sendResponse(200, notifications, USER_MESSAGES.NOTIFICATIONS);
});

userRouter.patch("/notification/:id/read", async (req, res) => {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
        id,
        {
            isRead: true,
        },
        { new: true }
    );

    if (!notification) {
        throw new ApiError(404, "Notification Not Found");
    }

    res.sendResponse(200, notification, "Notification read");
});

userRouter.post("/notification/:id/accept", async (req, res) => {
    const { id } = req.params;

    const notification = await Notification.findOne({ _id: id, isRead: false });

    if (!notification) {
        throw new ApiError(404, "notification not found");
    }
    const note = await Note.findById(notification.relatedNoteId);
    // console.log(notification);

    if (!note) {
        throw new ApiError(404, NOTE_MESSAGES.NOT_FOUND);
    }

    const member = note.members.find((m) => m.id.toString() == req.user.id);
    notification.isRead = true;
    await notification.save();
    await Notification.create({
        recipientId: notification.actorId,
        type: "invite_accepted",
        relatedNoteId: note._id,
        role: notification.role,
        actorId: req.user.id,
        message: `Notification accepted for ${note.title}`,
    });

    if (member && member.status == "pending") {
        member.status = "active";
        await note.save();
        res.sendResponse(200, note, "Invitation accepted");
    } else {
        throw new ApiError(403, AUTH_MESSAGES.UNAUTHORIZED);
    }
});

userRouter.post("/notification/:notificationId/decline", async (req, res) => {
    const notification = await Notification.find({
        _id: req.params.notificationId,
        isRead: false,
    });

    if (!notification || notification.recipientId.toString() !== req.user.id) {
        throw new ApiError(404, "Notification not found");
    }

    const note = await getNote.byId(notification.relatedNoteId);
    if (note) {
        await note.removeMember(req.user.id);
    }

    notification.isRead = true;
    await notification.save();

    await Notification.create({
        recipientId: notification.actorId,
        type: "invite_rejected",
        relatedNoteId: note._id,
        role: notification.role,
        actorId: req.user.id,
        message: `Notification accepted for ${note.title}`,
    });

    return res.status(200).json({ message: "Invitation declined" });
});

export { userRouter };
