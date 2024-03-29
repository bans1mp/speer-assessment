const Note = require('../models/Note');
const User = require("../models/User");

//Getting all notes
const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ owner: req.userId });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//Getting note by ID
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
        res.status(404).json({ error: error.message });
    }
}

//Posting note
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

//Updating a note
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
        res.status(404).json({ error: error.message });
    }
}

//Deleting a note
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

//Sharing a note
const shareNote = async (req, res) => {
    try {
        const { sharedWithUserId } = req.body;

        const sharedWithUser = await User.findById(sharedWithUserId);
        if (!sharedWithUser) {
            throw new Error('User to share with not found');
        }

        const noteToShare = await Note.findOne({
            _id: req.params.id
        });



        if (!noteToShare) {
            throw new Error('Note not found or you do not have permission to share it');
        }


        if (noteToShare.sharedWith.includes(sharedWithUserId)) {
            throw new Error('Note is already shared with this user');
        }


        noteToShare.sharedWith.push(sharedWithUserId);
        await noteToShare.save();

        res.status(200).json(noteToShare);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};



module.exports = { getNotes, getNote, postNote, updateNote, deleteNote, shareNote }