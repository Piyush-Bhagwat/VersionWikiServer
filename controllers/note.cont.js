const { Note } = require("../models/note.model");

const getNote = {
  byId: async (id) => {
    const note = await Note.findById(id);
    if (!note) {
      return null;
    }
    return note;
  },
};

module.exports = { getNote };
