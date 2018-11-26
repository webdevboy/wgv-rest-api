const multer = require('multer');
const upload = multer();

const User = require('./controllers/user');
const Appointment = require('./controllers/appointment');
const isLoggedIn = require('./middlewares/requireLogin');

module.exports = function(app, passport) {

    app.post('/api/users/login',
        passport.authenticate('local-login'), function(req, res) {
            if(req.user) {
                res.status(200).send({
                    data: req.user,
                    token: req.user.generateJwt()
                })
            } else {
                res.status(401).send({ error: 'login failed' })
            }
        }
    );

    app.get('/api/user/logout', function(req, res) {
        req.logout();
        res.status(200).send({ data: 'logout success' });
    });

    app.post('/api/user', User.create);
    app.get('/api/user', User.list);
    app.get('/api/user/:userId', User.getOne);
    app.delete('/api/user/:userId', User.remove);
    app.put('/api/user/:userId', upload.single('photo'), User.update);

    app.post('/api/appointment', Appointment.create);
    app.put('/api/appointment', Appointment.update);
    app.get('/api/appointment', Appointment.list);
    app.get('/api/bookingdate', Appointment.getBookingDates);

};
