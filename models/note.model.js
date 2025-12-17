const mongoose = require("mongoose");
const { User } = require("./user.model");

const noteModel = new mongoose.Schema(
    {
        ownerID: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        versionId: {
            type: mongoose.Schema.ObjectId,
            ref: "Version",
            required: true,
        },
        pinned: {
            type: Boolean,
            default: false,
        },
        color: {
            type: String,
            default: "#fff",
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        editors: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "User",
            },
        ],

        viewers: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

const Note = mongoose.model("Note", noteModel);

module.exports = { Note };
