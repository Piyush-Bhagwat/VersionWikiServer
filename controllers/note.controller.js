const { Note } = require("../models/note.model");
const { Versions } = require("../models/version.model");
const { getNote } = require("../services/note.service");

async function createNote(req, res) {
    const { title, content, color, tag } = req.body;
    const uid = req.user.id;

    console.log(req.body);

    if (content === null || title === null) return res.sendStatus(401);

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
    note.pastVersions.push(version._id);
    await note.save();

    return res.status(200).json({
        id: note._id,
        title: version.title,
        content: version.content,
        tag: version.tag,
        isPinned: note.pinned,
        color: note.color,
        date: note.createdAt,
        versionCount: note.versionCount,
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
    

    const formatted = notes.map((n) => {
        return {
            id: n._id,
            title: n.versionId.title,
            content: n.versionId.content,
            tag: n.versionId.tag,
            isPinned: n.pinned,
            color: n.color,
            updatedAt: n.updatedAt,
            date: n.createdAt,
            versionCount: n.versionCount
        };
    });
    res.status(200).json(formatted);
};

module.exports = { createNote, getUserNotes };
