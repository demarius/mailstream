var nodemailer = require('nodemailer')

mailer = nodemailer.createTransport({
    auth: {
        user: 'randomimapaddress@gmx.com',
        pass: '0nSw1tching'
    }
})

mailer.sendMail({
    from: 'demarius2010@live.com',
    to: 'taylorbria1@gmail.com',
    subject: 'baby',
    html: '<p>should be there at 3 actually</p>'
}, function () {
    console.log(arguments)
})

module.exports = mailer
