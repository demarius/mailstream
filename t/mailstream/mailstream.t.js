var mailer = require('../setup')

console.log(mailer)

mailer.sendMail({
    from: 'test@testing.mailstream.com',
    to: 'randomimapaddress@gmx.com',
    subject: '',
    html: ''
}, function (err, info) {
    console.log(info)
})
