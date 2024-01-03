const Note = require('../models/Note');

const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ owner: req.userId });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getNote = async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            owner: req.userId
        })
        if (!note) throw new Error("Note not found!")
        res.status(200).json(note);
        return;
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const postNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const newNote = new Note({
            title,
            content,
            owner: req.userId
        })
        await newNote.save();
        res.status(201).json(newNote);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const updatedNote = await Note.findOneAndUpdate(
            { _id: req.params.id, owner: req.userId },
            { title, content },
            { new: true, runValidators: true }
        );

        if (!updatedNote) {
            throw new Error('Note not found');
        }

        res.status(200).json(updatedNote);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteNote = async (req, res) => {
    try {
        const deletedNote = await Note.findOneAndDelete({
            _id: req.params.id,
            owner: req.userId,
        });

        if (!deletedNote) {
            throw new Error('Note not found');
        }

        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

const shareNote = async (req, res) => {
    try {
        const { sharedWithUserId } = req.body;

        // Ensure the user to share with exists
        const sharedWithUser = await User.findById(sharedWithUserId);
        if (!sharedWithUser) {
            throw new Error('User to share with not found');
        }

        // Ensure the note exists and is owned by the authenticated user
        const noteToShare = await Note.findOne({
            _id: req.params.id,
            owner: req.userId,
        });

        if (!noteToShare) {
            throw new Error('Note not found or you do not have permission to share it');
        }

        // Ensure the note is not already shared with the user
        if (noteToShare.sharedWith.includes(sharedWithUserId)) {
            throw new Error('Note is already shared with this user');
        }

        // Share the note with the user
        noteToShare.sharedWith.push(sharedWithUserId);
        await noteToShare.save();

        res.status(200).json({ message: 'Note shared successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



module.exports = { getNotes, getNote, postNote, updateNote, deleteNote, shareNote }