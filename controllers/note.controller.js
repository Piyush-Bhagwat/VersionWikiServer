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
const { noteResponse } = require("../utils/response.util");

async function createNote(req, res) {
    const { title, content, color, tag } = req.body;
    const uid = req.user.id;

    // console.log(req.body);

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
    let noteIds = [];
    const visibilityQuery = {
        $or: [
            { ownerId: uid },
            {
                members: {
                    $elemMatch: {
                        id: uid,
                        status: "active",
                    },
                },
            },
        ],
        isDeleted: false,
    };

    if (search) {
        // First, find all versions that match the search criteria
        const matchingVersions = await Versions.find({
            $or: [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
                { tag: { $regex: search, $options: "i" } },
            ],
        }).select("noteID");

        // Extract the noteIDs from matching versions
        noteIds = matchingVersions.map((v) => v.noteID);
    }

    // Build the query
    let query = { ...visibilityQuery };

    if (search && noteIds.length > 0) {
        // Only get notes whose versionId matches our search results
        query._id = { $in: noteIds };
    } else if (search && noteIds.length === 0) {
        // No versions matched, return empty array
        res.sendResponse(200, [], NOTE_MESSAGES.FETCHED);
        return;
    }

    const notes = await Note.find(query)
        .populate({
            path: "versionId",
            select: "content title tag editedBy",
            populate: {
                path: "editedBy",
                select: "name email",
            },
        })
        .populate("ownerId", "name email")
        .sort({ createdAt: -1 });

    const formatted = await Promise.all(
        notes.map(async (n) => {
            return noteResponse(n);
        })
    );

    res.sendResponse(200, formatted, NOTE_MESSAGES.FETCHED);
};

const updateNoteVersion = async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    const { title, content, tag, commitMessage } = req.body;
    const note = await getNote.byId(id);

    if (!note) {
        throw new ApiError(404, NOTE_MESSAGES.NOT_FOUND);
    }

    const isMember = note.members.some((e) => {
        return e.id._id.toString() == user.id.toString() && e.role == "editor";
    });
    // console.log("idddddd", note.ownerId._id, user.id);

    if (note.ownerId._id.toString() != user.id.toString() && !isMember) {
        throw new ApiError(403, AUTH_MESSAGES.UNAUTHORIZED);
    }

    if (
        note.versionId.content == content?.trim() &&
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
    await note.populate([
        {
            path: "versionId",
            populate: {
                path: "editedBy",
                select: "name email",
            },
        },
        {
            path: "ownerId",
            select: "name email",
        },
    ]);
    const versionCount = await Versions.countDocuments({ noteID: note._id });
    const data = noteResponse(note, versionCount);
    res.sendResponse(200, data, NOTE_MESSAGES.UPDATED);
};

const getNoteById = async (req, res) => {
    const id = req.params.id;
    const uid = req.user.id;

    const note = await getNote.byId(id);

    // console.log("memberss: ", note);
    if (!note) {
        throw new ApiError(404, NOTE_MESSAGES.NOT_FOUND);
    }

    const canView = note.members.some((m) => {
        return (
            m.id._id.toString() === uid.toString() &&
            (m.role == "viewer" || m.role == "editor")
        );
    });

    // console.log("hellooo->", note.ownerId._id.toString(), uid);

    if (note.ownerId._id.toString() !== uid && !canView) {
        throw new ApiError(403, AUTH_MESSAGES.UNAUTHORIZED);
    }
    const versionCount = await Versions.countDocuments({ noteID: note._id });

    res.sendResponse(
        200,
        noteResponse(note, versionCount),
        NOTE_MESSAGES.FETCHED
    );
};

module.exports = { createNote, getUserNotes, updateNoteVersion, getNoteById };
