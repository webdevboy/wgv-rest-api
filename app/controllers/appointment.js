const _ = require('lodash');
const sgMail = require('@sendgrid/mail');

const Appointment = require('../models/appointment');
const config = require('../config/config');

module.exports = {
    create(req, res) {
        const appointment = new Appointment(req.body);
        appointment.save(function (err, result) {
            if (err) {
                return res.status(500).send({ error: err });
            } else {
                const mail = req.body.email
                console.log(mail)
                sgMail.setApiKey(config.mail.key);
                const msg = {
                    to: mail,
                    from: 'noreply@gmail.com',
                    subject: 'Appointment',
                    text: 'Booking Appointment',
                    html: `<strong>Date: </strong><p>${appointment.bookingDate} ${appointment.bookingTime}</p> </br>
                            <strong>appointment: </strong><p>${appointment.appointment}</p> </br>
                            <strong>type: </strong><p>${appointment.type}</p> </br> `,
                };
                sgMail.send(msg)
                res.status(200).send({ data: result });
            }
        })
    },

    update(req, res) {
        console.log(req.body);
        Appointment.findById(req.body.id, function (err, appointment) {
            if (err) {
                return res.status(500).send({ error: err });
            }
            if (appointment) {
                appointment.status = req.body.status
                appointment.save(function (err, result) {
                    if (err) {
                        res.status(500).send({ error: err });
                    } else {
                        res.status(200).send({ data: result });
                    }
                })

            } else {
                res.status(404).send({ error: 'Not found' });
            }

        });
    },

    async getBookingDates(req, res) {
        const appointments = await Appointment.aggregate([
            {
                '$sort': {"bookingDate": 1 }
            }
        ])

        let data = {};
        appointments.map(appointment => {
            if (data.hasOwnProperty(appointment.bookingDate)) {
                data[appointment.bookingDate].push(appointment.bookingTime);
            } else {
                data[appointment.bookingDate] = [appointment.bookingTime];
            }
        })
        res.status(200).send({ data });

    },

    list(req, res) {
        Appointment.find(function (err, appointments) {
            if(err)
                return res.status(500).send({ error: err });

            res.status(200).send({ data: appointments });
        });
    },
}