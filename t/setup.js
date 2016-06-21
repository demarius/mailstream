var nodemailer = require('nodemailer')

mailer = nodemailer.createTransport({
    auth: {
        user: '',
        pass: ''
    }
})

module.exports = mailer
