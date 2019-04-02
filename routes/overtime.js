/** routing autoryzacji */

/** importy bibliotek */
const express = require('express');
/** walidator */
const { body } = require('express-validator/check');

const User = require('../models/user'); 
const Exit = require('../models/exits'); 


/** init router-a */
const router = express.Router();

/** middleware dla sprawdzenia czy użytkownik zalogowany */
const isAuth =  require('../middleware/is-auth');
/** router test auth */
const overtimeController = require('../controllers/overtime');

/** sprawdza czy użytkownk jest zalogowany, wymagany token  */

router.get('/get/:id',isAuth, overtimeController.getOvertime);

module.exports = router;