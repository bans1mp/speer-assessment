const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { getNotes, getNote, postNote, updateNote, deleteNote, shareNote } = require("../controllers/noteController");

const router = express.Router();

router.use(authMiddleware)

router.get('/notes', getNotes);
router.get('/notes/:id', getNote);
router.post('/notes', postNote);
router.put('/notes/:id', updateNote);
router.delete('/notes/:id', deleteNote);
router.post('/notes/:id/share', shareNote);


module.exports = router;