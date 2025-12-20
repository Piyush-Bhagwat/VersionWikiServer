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
        const query = { ownerID: userId, filter };

        const notes = await Note.find(query);
        return notes;
    },
};

module.exports = { getNote };
