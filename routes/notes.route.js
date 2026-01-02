require("dotenv").config();
const { Router } = require("express");
cons = require("../middleware/auth");
const { Note } = require("../models/note.model");
const { getUser } = require("../services/user.service");
const { getNote } = require("../services/note.service");
const {
    createNote,
    getUserNotes,
    updateNoteVersion,
    getNoteById,
} = require("../controllers/note.controller");
const jwtVerify = require("../middleware/auth");
const { Notification } = require("../models/notification.model");
const { default: ApiError } = require("../utils/apierror.util");
const {
    NOTE_MESSAGES,
    USER_MESSAGES,
    AUTH_MESSAGES,
    COMMON_MESSAGES,
} = require("../constants/responseMessages");
const { noteResponse } = require("../utils/response.util");
const notesRouter = Router();

notesRouter.use(jwtVerify);

notesRouter.get("/", getUserNotes);

notesRouter.get("/:id", getNoteById);

notesRouter.post("/", createNote);

notesRouter.patch("/pin/:id", async (req, res) => {
    const id = req.params.id;
    const note = await Note.findById(id);

    if (!note) {
        throw new ApiError(404, NOTE_MESSAGES.NOT_FOUND);
    }

    note.pinned = !note.pinned;
    await note.save();
    return res.sendResponse(200, note, NOTE_MESSAGES.PINNED);
});

notesRouter.patch("/color/:id", async (req, res) => {
    const id = req.params.id;
    const { color } = req.body;

    const note = await Note.findById(id);

    if (!note) {
        throw new ApiError(404, NOTE_MESSAGES.NOT_FOUND);
    }

    note.color = color;
    await note.save();
    return res.sendResponse(200, note, NOTE_MESSAGES.UPDATED);
});

notesRouter.delete("/:id", async (req, res) => {
    const id = req.params.id;

    await Note.deleteOne({ _id: id, userID: req.user.id });
    return res.sendResponse(200, {}, NOTE_MESSAGES.DELETED);
});

notesRouter.patch("/:id", updateNoteVersion);

notesRouter.patch("/:id/viewer", async (req, res) => {
    const { email, message } = req.body;
    const id = req.params.id;
    if (!email) {
        throw new ApiError(400, "Email?");
    }

    const member = await getUser.byEmail(email);

    if (!member) {
        throw new ApiError(404, USER_MESSAGES.NOT_FOUND);
    }
    const note = await getNote.byId(id);
    if (!note) {
        throw new ApiError(404, NOTE_MESSAGES.NOT_FOUND);
    }

    if (member._id.toString() === note.ownerId.toString()) {
        throw new ApiError(403, NOTE_MESSAGES.INVALID_MEMBER);
    }
    // console.log("checkingg: ", req.user.id, note.ownerId);

    if (req.user.id.toString() !== note.ownerId._id.toString()) {
        throw new ApiError(403, AUTH_MESSAGES.UNAUTHORIZED);
    }

    await note.addViewer(member._id);
    await Notification.create({
        recipientId: member._id,
        type: "note_invitation",
        relatedNoteId: note._id,
        role: "viewer",
        actorId: req.user.id,
        message,
    });
    return res.sendResponse(201, note, NOTE_MESSAGES.VIEWER);
});

notesRouter.patch("/:id/editor", async (req, res) => {
    const { email, message } = req.body;
    const id = req.params.id;
    if (!email) {
        throw new ApiError(400, "Email?");
    }

    const member = await getUser.byEmail(email);

    if (!member) {
        throw new ApiError(404, USER_MESSAGES.NOT_FOUND);
    }

    const note = await getNote.byId(id);
    if (!note) {
        throw new ApiError(404, NOTE_MESSAGES.NOT_FOUND);
    }

    if (member._id.toString() === note.ownerId.toString()) {
        throw new ApiError(403, NOTE_MESSAGES.INVALID_MEMBER);
    }

    if (req.user.id.toString() !== note.ownerId.toString()) {
        throw new ApiError(403, AUTH_MESSAGES.UNAUTHORIZED);
    }

    await note.addEditor(member._id);
    await Notification.create({
        recipientId: member._id,
        type: "note_invitation",
        relatedNoteId: note._id,
        role: "editor",
        message,
        actorId: req.user.id,
    });

    return res.sendResponse(201, note, NOTE_MESSAGES.EDITOR);
});

notesRouter.delete("/:id/member", async (req, res) => {
    const { email } = req.body;
    const id = req.params.id;
    if (!email) {
        throw new ApiError(400, "Email?");
    }

    const member = await getUser.byEmail(email);

    if (!member) {
        throw new ApiError(404, USER_MESSAGES.NOT_FOUND);
    }
    const note = await getNote.byId(id);
    if (!note) {
        throw new ApiError(404, NOTE_MESSAGES.NOT_FOUND);
    }
    if (req.user.id.toString() !== note.ownerId.toString()) {
        throw new ApiError(403, AUTH_MESSAGES.UNAUTHORIZED);
    }

    await note.removeMember(member._id);
    return res.sendResponse(200, "Removed Member");
});

module.exports = notesRouter;
