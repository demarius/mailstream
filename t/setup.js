var nodemailer = require('nodemailer')

mailer = nodemailer.createTransport({
    auth: {
        user: 'randomimapaddress@gmx.com',
        pass: '0nSw1tching'
    }
})

console.log(mailer)
