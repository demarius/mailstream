var mailer = require('../setup'),
    MailStream = require('../../lib/mailstream')

MailStream({
    imap: {
        user: 'randomimapaddress@gmx.com',
        password: '0nSw1tching',
        host: 'imap.gmx.com',
        port: 993,
        tls: true
    },
    filter: function (mail) {
        return mail.headers['mailstream-test-header'] ? true : false
    }
}, function (error, mailstream) {
    mailstream.on('data', function (mail) {
        console.log(mail)
    })

    mailer.sendMail({
        from: 'test@testing.mailstream.com',
        to: 'randomimapaddress@gmx.com',
        subject: '',
        html: '',
        headers: {
            'mailstream-test-header': 'mailstream-test'
        }
    }, function (err, info) {
        console.log(info)
    })
})
