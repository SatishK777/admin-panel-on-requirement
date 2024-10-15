const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'rb063257@gmail.com',
        pass: 'qyhcwijewhbitgoi'
    }
});

module.exports = transporter