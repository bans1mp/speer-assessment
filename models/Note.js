const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    owner: {
        type: String,
        required: true
    },
    sharedWith: {
        type: [String]
    }
}, { timestamps: true });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
