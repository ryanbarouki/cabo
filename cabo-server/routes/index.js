const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send({response: "Hello there, general Kenobi"}).status(200);
});

module.exports = router;