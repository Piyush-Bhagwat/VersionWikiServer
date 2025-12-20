const mongoose = require("mongoose");
const { User } = require("./user.model");

const noteModel = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        pastVersions: [{ type: mongoose.Schema.ObjectId, ref: "Version" }],
        versionId: {
            type: mongoose.Schema.ObjectId,
            ref: "Version",
            default: null,
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
    {
        timestamps: true,
        methods: {
            async addEditor(editorId) {
                if (this.editors.includes(editorId)) return;

                this.viewers = this.viewers.filter(
                    (id) => id.toString() !== editorId.toString()
                );
                this.editors.push(editorId);

                await this.save();
            },
            async removeEditor(editorId) {
                this.editors = this.editors.filter(
                    (id) => id.toString() != editorId.toString()
                );
                await this.save();
            },
            async addViewer(viewerId) {
                if (this.viewers.includes(viewerId)) return;

                this.editors = this.editors.filter(
                    (id) => id.toString() !== viewerId.toString()
                );
                this.viewers.push(viewerId);

                await this.save();
            },
            async removeViewer(viewerId) {
                this.viewers = this.viewers.filter(
                    (id) => id.toString() !== viewerId.toString()
                );
                await this.save();
            },
        },
        virtuals: {
            versionCount: {
                get() {
                    return this.pastVersions.length;
                },
            },
        },
    }
);

const Note = mongoose.model("Note", noteModel);

module.exports = { Note };
