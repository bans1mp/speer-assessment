const Note = require('../models/Note');

const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ owner: req.userId });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getNotes }