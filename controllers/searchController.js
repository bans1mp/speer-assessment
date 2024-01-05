const Note = require("../models/Note");

//Searching note
const searchNote = async (req, res) => {
    try {
        const query = req.query.q;
        const notes = await Note.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } },
            ],
            owner: req.userId,
        });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { searchNote };