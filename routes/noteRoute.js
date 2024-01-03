const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { getNotes } = require("../controllers/noteController");

const router = express.Router();

router.use(authMiddleware)

router.get('/notes', getNotes);

module.exports = router;