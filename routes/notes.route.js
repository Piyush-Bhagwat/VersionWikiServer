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
} = require("../controllers/note.controller");
const jwtVerify = require("../middleware/auth");
const notesRouter = Router();

notesRouter.use(jwtVerify);

notesRouter.get("/", getUserNotes);

notesRouter.get("/:id", async (req, res) => {
    const id = req.params.id;
    const uid = req.user.id;

    const note = await Note.findOne({ _id: id, userID: uid });

    res.json(note);
});

notesRouter.post("/", createNote);

notesRouter.patch("/pin/:id", async (req, res) => {
    const id = req.params.id;
    const note = await Note.findById(id);

    if (!note) {
        return res.sendStatus(404);
    }

    note.pinned = !note.pinned;
    await note.save();
    return res.status(200).json(note);
});

notesRouter.patch("/color/:id", async (req, res) => {
    const id = req.params.id;
    const { color } = req.body;

    const note = await Note.findById(id);

    if (!note) {
        return res.sendStatus(404);
    }

    note.color = color;
    await note.save();
    return res.status(200).json(note);
});

notesRouter.delete("/:id", async (req, res) => {
    const id = req.params.id;

    await Note.deleteOne({ _id: id, userID: req.user.id });
    return res.sendStatus(200);
});

notesRouter.patch("/:id", updateNoteVersion);

notesRouter.patch("/addViewer/:id", async (req, res) => {
    const { email } = req.body;
    const id = req.params.id;
    const usr = await getUser.byEmail(email);

    if (!usr) {
        return res.status(404).json({ message: "User not found" });
    }
    const note = await getNote.byId(id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (req.user._id.toString() !== note.ownerId.toString())
        return res.status(403).json({ message: "User not authorized" });

    await note.addViewer(usr._id);
    return res.status(200).json(note);
});

notesRouter.patch("/removeViewer/:id", async (req, res) => {
    const { email } = req.body;
    const id = req.params.id;
    const usr = await getUser.byEmail(email);

    if (!usr) {
        return res.status(404).json({ message: "User not found" });
    }
    const note = await getNote.byId(id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (req.user._id.toString() !== note.ownerID.toString())
        return res.status(403).json({ message: "User not authorized" });

    await note.removeViewer(usr._id);

    return res.status(200).json(note);
});

notesRouter.patch("/addEditor/:id", async (req, res) => {
    const { email } = req.body;
    const id = req.params.id;
    const usr = await getUser.byEmail(email);

    if (!usr) {
        return res.status(404).json({ message: "User not found" });
    }
    const note = await getNote.byId(id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (req.user._id.toString() !== note.ownerID.toString())
        return res.status(403).json({ message: "User not authorized" });

    await note.addEditor(usr._id);

    return res.status(200).json(note);
});

notesRouter.patch("/removeEditor/:id", async (req, res) => {
    const { email } = req.body;
    const id = req.params.id;
    const usr = await getUser.byEmail(email);

    if (!usr) {
        return res.status(404).json({ message: "User not found" });
    }
    const note = await getNote.byId(id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (req.user._id.toString() !== note.ownerID.toString())
        return res.status(403).json({ message: "User not authorized" });

    await note.removeEditor(usr._id);

    return res.status(200).json(note);
});

module.exports = notesRouter;
