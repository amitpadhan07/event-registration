const express = require('express');
const router = express.Router();
const { createRegistration } = require('../controllers/registrationController');
const { validateRegistration } = require('../middleware/validation');

router.post('/', validateRegistration, createRegistration);

module.exports = router;