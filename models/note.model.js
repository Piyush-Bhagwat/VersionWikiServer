const mongoose = require("mongoose");
const { User } = require("./user.model");

const noteModel = new mongoose.Schema({
    title: {
        type: String,
        trim: true
    },
    content: {
        type: String
    },
    userID: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    tag: {
        type: String,
        trim: true
    },
    pinned: {
        type: Boolean,
        default: false
    },
    color: {
        type: String,
        default: "#fff"
    }


}, { timestamps: true });

const Note = mongoose.model("Note", noteModel);

module.exports = { Note }