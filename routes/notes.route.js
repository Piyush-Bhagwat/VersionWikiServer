require("dotenv").config();
const { Router } = require("express");
const jwtVerify = require("../middleware/auth");
const { Note } = require("../models/note.model");
const { getUser } = require("../services/user.service");
const { getNote } = require("../services/note.service");
const { createNote } = require("../controllers/note.controller");
const notesRouter = Router();

notesRouter.get("/", jwtVerify, async (req, res) => {
    const { search } = req.query;
    const uid = req.user.id;
    const query = {};

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } },
            { tag: { $regex: search, $options: "i" } },
        ];
    }

    const notes = await getNote.byUser(uid, query);

    const formatted = notes.map((n) => {
        return {
            id: n._id,
            title: n.title,
            content: n.content,
            tag: n.tag,
            isPinned: n.pinned,
            color: n.color,
            updatedAt: n.updatedAt,
            date: n.createdAt,
        };
    });
    res.status(200).json(formatted);
});

notesRouter.get("/:id", jwtVerify, async (req, res) => {
    const id = req.params.id;
    const uid = req.user.id;

    const note = await Note.findOne({ _id: id, userID: uid });

    res.json(note);
});

notesRouter.post("/", jwtVerify, createNote);

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

notesRouter.delete("/:id", jwtVerify, async (req, res) => {
    const id = req.params.id;

    await Note.deleteOne({ _id: id, userID: req.user.id });
    return res.sendStatus(200);
});

notesRouter.patch("/tag/:id", jwtVerify, async (req, res) => {
    const id = req.params.id;
    const tag = req.body.tag;

    console.log("tag updte: ", tag);

    if (!tag) return res.sendStatus(404);

    const note = await Note.findById(id);

    note.tag = tag;
    await note.save();
    res.status(200).json(note);
});

notesRouter.patch("/:id", jwtVerify, async (req, res) => {
    const id = req.params.id;
    const { title, content } = req.body;
    const note = await Note.findById(id);
    note.title = title;
    note.content = content;
    await note.save();
    res.status(200).json(note);
});

notesRouter.patch("/addViewer/:id", jwtVerify, async (req, res) => {
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

    await note.addViewer(usr._id);
    return res.status(200).json(note);
});

notesRouter.patch("/removeViewer/:id", jwtVerify, async (req, res) => {
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

notesRouter.patch("/addEditor/:id", jwtVerify, async (req, res) => {
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

notesRouter.patch("/removeEditor/:id", jwtVerify, async (req, res) => {
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
