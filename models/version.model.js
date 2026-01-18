import mongoose from "mongoose";

const versionSchema = new mongoose.Schema(
    {
        noteID: {
            type: mongoose.Schema.ObjectId,
            ref: "Note",
            required: true,
        },
        content: { type: String, trim: true, default: "" },
        title: { type: String, trim: true, default: "" },
        tag: { type: String, trim: true },
        editedBy: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        commitMessage: { type: String, trim: true },
    },
    { timestamps: true },
);

const Versions = mongoose.model("Version", versionSchema);
export { Versions };
