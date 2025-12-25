const { Note } = require("../models/note.model");
const { Versions } = require("../models/version.model");
const { getNote } = require("../services/note.service");

async function createNote(req, res) {
    const { title, content, color, tag } = req.body;
    const uid = req.user.id;

    console.log(req.body);

    const note = await Note.create({ ownerId: uid, color });
    const version = await Versions.create({
        content,
        title,
        tag,
        noteID: note._id,
        commitMessage: "init",
        editedBy: uid,
    });

    note.versionId = version._id;
    await note.save();

    return res.status(200).json({
        id: note._id,
        title: version.title,
        content: version.content,
        tag: version.tag,
        isPinned: note.pinned,
        color: note.color,
        date: note.createdAt,
        versionCount: await Versions.countDocuments({ noteID: note._id }),
    });
}

const getUserNotes = async (req, res) => {
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
    console.log("notes: ", notes);

    const formatted = await Promise.all(
        notes.map(async (n) => {
            const versionCount = await Versions.countDocuments({
                noteID: n._id,
            });
            return {
                id: n._id,
                title: n.versionId.title,
                content: n.versionId.content,
                tag: n.versionId.tag,
                isPinned: n.pinned,
                color: n.color,
                updatedAt: n.updatedAt,
                date: n.createdAt,
                versionCount,
            };
        })
    );
    res.status(200).json(formatted);
};

const updateNoteVersion = async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    const { title, content, tag, commitMessage } = req.body;
    const note = await Note.findById(id).populate("versionId");

    if (!note) return res.status(404).json({ message: "Note not found" });

    if (
        note.versionId.content == content.trim() &&
        note.versionId.title == title &&
        note.versionId.tag == tag
    ) {
        return res
            .status(200)
            .json({ message: "noting changed, no version created" });
    }
    if (
        note.ownerId.toString() != user.id.toString() &&
        note.editors.every((e) => e.toString() != user.id.toString())
    )
        return res.status(403).json({ message: "unauthorized" });

    const newVersion = await Versions.create({
        title,
        content,
        tag,
        noteID: note._id,
        editedBy: user.id,
        commitMessage,
    });

    note.versionId = newVersion._id;
    await note.save();
    const versionCount = await Versions.countDocuments({ noteID: note._id });
    res.status(200).json({
        id: note._id,
        title: newVersion.title,
        content: newVersion.content,
        tag: newVersion.tag,
        isPinned: note.pinned,
        color: note.color,
        updatedAt: note.updatedAt,
        date: note.createdAt,
        versionCount,
    });
};

module.exports = { createNote, getUserNotes, updateNoteVersion };
