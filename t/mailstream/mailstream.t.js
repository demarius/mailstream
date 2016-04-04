var mailer = require('../setup'),
    MailStream = require('../../lib/mailstream')

MailStream({
    imap: {
        user: 'randomimapaddress@gmx.com',
        password: '0nSw1tching',
        host: 'imap.gmx.com',
        port: 993,
        tls: true
}, function (error, mailstream) {
    mailer.sendMail({
        from: 'test@testing.mailstream.com',
        to: 'randomimapaddress@gmx.com',
        subject: '',
        html: ''
    }, function (err, info) {
        console.log(info)
    })
})
