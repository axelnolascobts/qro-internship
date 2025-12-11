/*
Purpose: Route definitions, and calling security functions from
        other auth files.
*/

const express = require('express');
const router = express.Router();

const { register, login, validate } = require('../controllers/authController');
const { authRequired } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/validate', authRequired, validate);

module.exports = router;
