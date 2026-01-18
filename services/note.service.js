import mongoose from "mongoose";
import { Note } from "../models/note.model.js";

const getNote = {
    byId: async (id) => {
        const note = await Note.findById(id)
            .populate({
                path: "versionId",
                select: "content title tag editedBy",
                populate: {
                    path: "editedBy",
                    select: "name email",
                },
            })
            .populate("ownerId", "name email")
            .populate({ path: "members.id", select: "name email" });
        if (!note) {
            return null;
        }
        return note;
    },
    byUser: async (userId, filter) => {
        let query;

        const userCondition = {
            $or: [
                { ownerId: userId },
                {
                    members: {
                        $elemMatch: {
                            id: mongoose.Types.ObjectId(userId),
                            status: "active",
                        },
                    },
                },
            ],
        };

        if (filter.$or) {
            query = {
                $and: [
                    userCondition,
                    { $or: filter.$or }, // This searches in versionId fields
                ],
            };
        } else {
            // Simple case: just user condition
            query = userCondition;
        }
        console.log("query", query);
        const notes = await Note.find(query)
            .populate({
                path: "versionId",
                select: "content title tag editedBy",
                populate: {
                    path: "editedBy",
                    select: "name email",
                },
            })
            .populate("ownerId", "name email");
        return notes.sort((a, b) => b.createdAt - a.createdAt);
    },
};

export { getNote };
