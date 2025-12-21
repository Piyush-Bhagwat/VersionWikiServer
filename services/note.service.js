const { Note } = require("../models/note.model");

const getNote = {
    byId: async (id) => {
        const note = await Note.findById(id);
        if (!note) {
            return null;
        }
        return note;
    },
    byUser: async (userId, filter) => {
        const query = { ownerId: userId, ...filter };

        const notes = await Note.find(query).populate({
            path: "versionId",
            select: "content title tag",
        });
        return notes.sort((a, b) => b.createdAt - a.createdAt);
    },
};

module.exports = { getNote };
