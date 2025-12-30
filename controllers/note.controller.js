const { Note } = require("../models/note.model");
const { Versions } = require("../models/version.model");
const { getNote } = require("../services/note.service");
const {
    NOTE_MESSAGES,
    USER_MESSAGES,
    AUTH_MESSAGES,
    COMMON_MESSAGES,
} = require("../constants/responseMessages");
const { default: ApiError } = require("../utils/apierror.util");

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
    const data = {
        id: note._id,
        title: version.title,
        content: version.content,
        tag: version.tag,
        isPinned: note.pinned,
        color: note.color,
        date: note.createdAt,
        versionCount: await Versions.countDocuments({ noteID: note._id }),
    };
    return res.sendResponse(201, data, NOTE_MESSAGES.CREATED);
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
    res.sendResponse(200, formatted, NOTE_MESSAGES.FETCHED);
};

const updateNoteVersion = async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    const { title, content, tag, commitMessage } = req.body;
    const note = await Note.findById(id).populate("versionId");

    if (!note) {
        throw new ApiError(404, NOTE_MESSAGES.NOT_FOUND);
    }
    if (
        note.ownerId.toString() != user.id.toString() &&
        note.editors.every((e) => e.toString() != user.id.toString())
    ) {
        throw new ApiError(403, AUTH_MESSAGES.UNAUTHORIZED);
    }

    if (
        note.versionId.content == content.trim() &&
        note.versionId.title == title &&
        note.versionId.tag == tag
    ) {
        return res.sendResponse(200, COMMON_MESSAGES.INVALID_UPDATEs);
    }

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
    const data = {
        id: note._id,
        title: newVersion.title,
        content: newVersion.content,
        tag: newVersion.tag,
        isPinned: note.pinned,
        color: note.color,
        updatedAt: note.updatedAt,
        date: note.createdAt,
        versionCount,
    };
    res.sendResponse(200, data, NOTE_MESSAGES.UPDATED);
};

module.exports = { createNote, getUserNotes, updateNoteVersion };
