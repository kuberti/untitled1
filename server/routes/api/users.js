const express = require('express');
const router = express.Router();

const gravatar = require('gravatar');

const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

const User = require('../../models/User');

const keys = require('../../config/keys');

const passport = require('passport');

const validateLoginInput = require('../../validation/login');


router.get('/test', (req, res)  => res.json({msg: "Users works!"}));

router.post('/register', (req, res) => {
    User.findOne({email: req.body.email })
        . then(user => {
            if (user) {
                return res.status(r00).json({email: 'Email already exists'})
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200',
                    r: 'pg',
                    d: 'nm',
                    });
                const newUser = new User ({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                });

                bcryypt.genSalt(10, (err, salt) => {
                    bcrypt.has(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log (err))
                    })
                })
            }
        })
    }
);

router.post('/login', (req, res) => {
    const {errors, isValid } = validateLoginInput(req.body);
    if(!isValid) {
        return res.status(400).json(errors);
    }
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email: email})
        .then(user => {
            if (!user) {
                return res.status(404).json({errors: 'User not found'});
            }

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                       const payload = {id: user.id, name: user.name, avatar: user.avatar};
                       jwt.sign(
                           payload,
                           keys.SecretOrKey,
                           { expiresIn: 36000},
                           (err, token) => {
                               res.json({
                                   success: true,
                                   token: 'Bearer' + token
                               });
                           });
                        res.json({msg: "Success"});
                    } else {
                        errors.password = 'Password invalid';
                        return res.status(400).json(errors);
                        return res.status(400).json({password: 'Password invalid'});
                    }
                });
        });
});

router.get('/current', passport.authenticate('jwt', { session:false }), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});

module.exports = router;