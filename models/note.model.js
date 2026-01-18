import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
    {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // 👈 THIS is the missing piece
            required: true,
        },
        role: {
            type: String,
            enum: ["viewer", "editor"],
        },
        status: {
            type: String,
            enum: ["pending", "active", "removed"],
        },
    },
    { id: false },
);

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
                const existingMember = this.members.find((mem) =>
                    mem.id.equals(editorId),
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
                const member = this.members.find((mem) => {
                    const memberId = mem.id._id || mem.id; // populated OR raw
                    // console.log("note.model1", mem.id._id, editorId);
                    return editorId.toString() == memberId.toString();
                });
                // console.log("note.model2", member);
                if (member) {
                    member.status = "removed";
                }
                await this.save();
            },
            async addViewer(viewerId) {
                const existingMember = this.members.find(
                    (mem) => mem.id.toString() === viewerId.toString(),
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
                    (mem) => mem.id.toString() === userId.toString(),
                );
                if (member && member.status === "pending") {
                    member.status = "active";
                    await this.save();
                }
            },
        },
    },
);

const Note = mongoose.model("Note", noteModel);
export { Note };
