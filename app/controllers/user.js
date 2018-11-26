const moment = require('moment');
const bcrypt = require('bcrypt-nodejs');
const _ = require('lodash');

const User = require('../models/user');
const fileUpload = require('../services/fileUpload');

module.exports = {
    create(req, res) {
        User.findOne({ email: req.body.email }, function (error, user) {
            if (user) {
                return res.status(500).send({ error: 'this email already exists' });
            } else {
                const user = new User(req.body);
                user.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
                user.save(function (err, result) {
                    if (err) {
                        res.status(500).send({ error: err });
                    } else {
                        res.status(200).send({ data: result, token: result.generateJwt() });
                    }
                })
            }
        });
    },

    list(req, res) {
        User.find({isAdmin: false}, function (err, users) {

            if (err) {
                return res.status(500).send({ error: err });
            }
            res.status(200).send({ data: users });
        });
    },

    update(req, res) {
        User.findById(req.params.userId, function (err, user) {
            if (err) {
                return res.status(500).send({ error: err });
            }
            if (user) {
                if (req.file) {
                    fileUpload.uploadPhoto(req, function (perr, pres) {
                        if (perr) {
                            return res.status(500).send({ error: perr });
                        }
                        user.pictureUrl = pres;
                        user = _.merge(user, req.body);
                        user.save(function (error) {
                            if (error) {
                                return res.status(500).send({ error: error });
                            } else {
                                res.status(200).send({ data: user });
                            }
                        })
                    })

                } else {
                    user = _.merge(user, req.body);
                    user.save(function (error) {
                        if (error) {
                            return res.status(500).send({ error: error });
                        } else {
                            res.status(200).send({ data: user });
                        }
                    })
                }


            } else {
                res.status(404).send({ error: 'Not found' });
            }

        });
    },

    remove(req, res) {
        User.findByIdAndRemove(req.params.userId, function (err, data) {
            if (err) {
                return res.status(500).send({ error: err });
            } else {
                if (data) {
                    res.status(200).send({
                        success: true,
                        message: 'delete success'
                    })
                } else {
                    res.status(404).send({ error: 'Not found' });
                }
            }
        });
    },
    getOne(req, res) {
        User.findById(req.params.userId, function (err, user) {
            if (err) {
                return res.status(500).send({ error: err });
            }
            if (user) {
                res.status(200).send({ data: user });
            } else {
                res.status(404).send({ error: 'Not found' });
            }

        });
    }
}