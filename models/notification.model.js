const { Schema, default: mongoose } = require("mongoose");

const notificationSchema = new Schema(
    {
        recipientId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            require: true,
            index: true,
        },

        type: {
            type: String,
            enum: [
                "note_invitation",
                "note_removed",
                "invite_accepted",
                "invite_rejected",
            ],
            required: true,
        },
        relatedNoteId: {
            type: mongoose.Schema.ObjectId,
            ref: "Note",
        },
        actorId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
        },
        role: {
            type: String,
            enum: ["viewer", "editor"],
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        message: String,
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = { Notification };
