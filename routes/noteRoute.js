const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { getNotes, getNote, postNote, updateNote, deleteNote, shareNote } = require("../controllers/noteController");

const router = express.Router();

router.use(authMiddleware)

router.get('/notes', getNotes);
router.get('/notes/:id', getNote);
router.post('/notes', postNote);
router.put('/posts/:id', updateNote);
router.delete('/posts/:id', deleteNote);
router.post('/posts/:id/share', shareNote);


module.exports = router;