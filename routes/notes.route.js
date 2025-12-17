require("dotenv").config();
const { Router } = require("express");
const jwtVerify = require("../middleware/auth");
const { Note } = require("../models/note.model");
const notesRouter = Router();

notesRouter.get("/", jwtVerify, async (req, res) => {
    const { search } = req.query;
    const uid = req.user.id;
    const query = { userID: uid };

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } },
            { tag: { $regex: search, $options: "i" } },
        ];
    }

    const notes = await Note.find(query)
        .sort({ updatedAt: -1 })
        .populate("userID", "name")
        .lean();

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

notesRouter.post("/", jwtVerify, async (req, res) => {
    const { title, content, color, tag } = req.body;
    const uid = req.user.id;

    if (content === null || title === null) return res.sendStatus(400);

    const newNote = { userID: uid, content, title, color, tag };
    // console.log(newNote);

    const note = await Note.create(newNote);
    return res.status(200).json({
        id: note._id,
        title: note.title,
        content: note.content,
        tag: note.tag,
        isPinned: note.pinned,
        color: note.color,
        date: note.createdAt,
    });
});

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



module.exports = notesRouter;
