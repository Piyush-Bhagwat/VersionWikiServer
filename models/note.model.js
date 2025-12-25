const mongoose = require("mongoose");
const { User } = require("./user.model");

const memberSchema = new mongoose.Schema({
    id: mongoose.Schema.ObjectId,
    role: {
        type: String,
        enum: ["viewer", "editor"],
    },
    status: {
        type: String,
        enum: ["pending", "active", "removed"],
    },
});

const noteModel = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
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
        members: [memberSchema],
    },
    {
        timestamps: true,
        methods: {
            async addEditor(editorId) {
                const existingMember = this.members.find(
                    (mem) => mem.id.toString() === editorId.toString()
                );
                if (existingMember) {
                    if (
                        existingMember.role == "editor" &&
                        existingMember.status == "active"
                    ) {
                        return;
                    }
                    existingMember.role = "editor";
                    existingMember.status = "pending";
                } else {
                    this.members.push({
                        id: editorId,
                        status: "pending",
                        role: "editor",
                    });
                }

                await this.save();
            },
            async removeMember(editorId) {
                const member = this.members.find(
                    (mem) => editorId.toString() == mem.id.toString()
                );
                if (member) {
                    member.status = "removed";
                }
                await this.save();
            },
            async addViewer(viewerId) {
                const existingMember = this.members.find(
                    (mem) => mem.id.toString() === viewerId.toString()
                );
                if (existingMember) {
                    if (
                        existingMember.role == "viewer" &&
                        existingMember.status == "active"
                    ) {
                        return;
                    }
                    existingMember.role = "viewer";
                    existingMember.status = "pending";
                } else {
                    this.members.push({
                        id: viewerId,
                        status: "pending",
                        role: "viewer",
                    });
                }

                await this.save();
            },
            async acceptInvite(userId) {
                const member = this.members.find(
                    (mem) => mem.id.toString() === userId.toString()
                );
                if (member && member.status === "pending") {
                    member.status = "active";
                    await this.save();
                }
            },
        },
    }
);

const Note = mongoose.model("Note", noteModel);

module.exports = { Note };
