const mongoose = require("mongoose");

const versionSchema = mongoose.Schema(
    {
        noteID: {
            type: mongoose.Schema.ObjectId,
            ref: "Note",
            required: true,
        },
        content: String,
        title: String,
        editedBy: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        commitMessage: String,
    },
    { timestamps: true }
);

const Versions = mongoose.model("Version", versionSchema);
module.exports = Versions;
