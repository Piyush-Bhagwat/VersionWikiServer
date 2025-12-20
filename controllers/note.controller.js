const { Note } = require("../models/note.model");

async function createNote (req, res) {
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
}

module.exports = {createNote}
