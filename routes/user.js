/** importy bibliotek */
const express = require('express');
/** walidator */
const { body } = require('express-validator/check');

/** init router-a */
const router = express.Router();
/** middleware dla sprawdzenia czy użytkownik zalogowany */
const isAuth =  require('../middleware/is-auth');
/** router test auth */
const userController = require('../controllers/user');

const User = require('../models/user'); 
const Exit = require('../models/exits'); 
const Overtime = require('../models/overTimes'); 
const extendUser = require('../models/extendUser'); 



router.get('/userLogin', isAuth, userController.userMy);

router.get('/usersAll',isAuth, userController.usersAll);
router.get('/usersTimetables',isAuth, userController.usersTimetables);
router.post('/setDeputy', [
    body('id').not().isEmpty().withMessage('Brak id użytkownika'),
    body('id')
    .custom((value, {req}) => {
        return User.find({
            where: {
                user_id:value,
            }
        }).then(user => {
            if(!user) {
                return Promise.reject('Podany użytkownik nie istnieje w bazie !');
            }else if(user.role_id === 2) {
                return Promise.reject('Podany użytkownik ma już nadane prawa !');

            }
        });
    }),
    body('endExtend').not().isEmpty().withMessage('Brak endExtend'),
    body('startExtend').not().isEmpty().withMessage('Brak startExtend')
] ,isAuth, userController.setDeputy);


module.exports = router;