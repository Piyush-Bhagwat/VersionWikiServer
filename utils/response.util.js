export function noteResponse(note, versionCount) {
    console.log(note.versionId);

    return {
        id: note._id,
        title: note.versionId.title,
        content: note.versionId.content,
        tag: note.versionId.tag,
        isPinned: note.pinned,
        color: note.color,
        updatedAt: note.updatedAt,
        date: note.createdAt,
        versionCount,
        members: note.members,
        createdBy: note.ownerId,
        lastEditedBy: note.versionId.editedBy,
    };
}
