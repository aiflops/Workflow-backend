/** routing autoryzacji */

/** importy bibliotek */
const express = require('express');
/** walidator */
const { body } = require('express-validator/check');

const User = require('../models/user'); 


/** init router-a */
const router = express.Router();

/** middleware dla sprawdzenia czy użytkownik zalogowany */
const isAuth =  require('../middleware/is-auth');
/** router test auth */
const exitController = require('../controllers/exits');

/** tworzy nowe wyjscie  */
router.post('/create',isAuth, [
    body('date').not().isEmpty().withMessage('Podaj datę wyjścia')
    .custom((value) => {
        if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) return false;
        const date = new Date(value);
        if (!date.getTime()) return false;
        return date.toISOString().slice(0, 10) === value;
    }).withMessage('Nie spełnia YYYY-MM-DD'),
    
    body('timeStart').not().isEmpty().withMessage('Podaj początek wyjścia')
    .custom((value)=> {
        if (!value.match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)) return false;
        else return true;
    }).withMessage('Nie spełnia HH:MM'),
    body('duration').not().isEmpty().withMessage('Podaj czas trwania wyjścia')
    .custom((value)=> {
        if (!value.match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)) return false;
        else return true;
    }).withMessage('Nie spełnia HH:MM'),
    body('topic').not().isEmpty().withMessage('Podaj temat wyjścia'),
    body('desc').not().isEmpty().withMessage('Podaj opis wyjścia'),
    body('idUser').not().isEmpty().withMessage('Podaj id użytkownika'),
    body('overTimeDate').not().isEmpty().withMessage('Podaj datę terminu odróbczego'),
    body('timeStartOverTime').not().isEmpty().withMessage('Podaj czas teminu odróbczego')
], exitController.createExit);

/** edycja wydarzenia */
router.put('/edit',isAuth, [
    body('idExit').not().isEmpty().withMessage('Podaj id wyjścia'),
    body('date').not().isEmpty().withMessage('Podaj datę wyjścia')
    .custom((value) => {
        if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) return false;
        const date = new Date(value);
        if (!date.getTime()) return false;
        return date.toISOString().slice(0, 10) === value;
    }).withMessage('Nie spełnia YYYY-MM-DD'),
    
    body('timeStart').not().isEmpty().withMessage('Podaj początek wyjścia')
    .custom((value)=> {
        if (!value.match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)) return false;
        else return true;
    }).withMessage('Nie spełnia HH:MM'),
    body('duration').not().isEmpty().withMessage('Podaj czas trwania wyjścia')
    .custom((value)=> {
        if (!value.match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)) return false;
        else return true;
    }).withMessage('Nie spełnia HH:MM'),
    body('topic').not().isEmpty().withMessage('Podaj temat wyjścia'),
    body('desc').not().isEmpty().withMessage('Podaj opis wyjścia'),
    body('overTimeDate').not().isEmpty().withMessage('Podaj datę terminu odróbczego'),
    body('timeStartOverTime').not().isEmpty().withMessage('Podaj czas teminu odróbczego')
],exitController.editExit);


/** pobiera pojedyncze wyjcie */
router.get('/get',isAuth, [
], exitController.getExit);


/** pobiera historie wyjsc dla zalogowane */
router.get('/getUserExits', isAuth, exitController.getUserExits)

/** usuniecie wyjscia */
router.post('/delete',isAuth,[
    body('idExit').not().isEmpty().withMessage('Podaj id wyjścia'),
] ,exitController.deleteExit);


/** pobiera wyjścia z przedziału czasowego */
router.get('/getExitsFromTime', isAuth, exitController.getExitsFromTime);


router.get('/getUsersExits', isAuth,[

] , exitController.getUsersExits);

module.exports = router;