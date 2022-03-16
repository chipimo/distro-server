const router = require("express").Router();
const AuthService = require('../services/auth_service');
const UserService = require('../services/user_service');


router.post('/register', async (req, res, next) => {
    try {
        const register = await AuthService.register(req.body);
        if (!register.success)
            return res.status(register.statusCode).send(register);
        res.status(200).send(register);
    }
    catch (err) { 
        next(err);  
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const login = await AuthService.login(req.body);
        if (!login.success)
            return res.status(login.statusCode).send(login);
        res.status(200).header('Authorization', 'Bearer ' + login.result).send(login);
    }
    catch (err) {
        next(err);
    }

});

router.post('/new-release', async (req, res, next) => {
    try {
        const created = await UserService.setNewRelease(req.body);
        // console.log(created);
        if (!created.success)
            return res.status(created.statusCode).send(created);
        res.status(200).send(created);
    }
    catch (err) { 
        next(err);
    }

});

module.exports = router;