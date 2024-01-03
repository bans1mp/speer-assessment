const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { searchNote } = require('../controllers/searchController');

const router = express.Router();

router.use(authMiddleware);

router.get('/search', searchNote);

module.exports = router;
