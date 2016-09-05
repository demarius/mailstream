var cadence = require('cadence')

var test = cadence(function (async) {
    var mailer = require('./mailer'),
        MailStream = require('../index.js')

    async(function () {
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
        }, async())

    }, function (mailstream) {
        console.log('got a stream')
        mailstream.on('data', function (mail) {
            console.log(mail)
        })

        mailer.sendMail({
            from: 'test@testing.mailstream.com',
            to: 'randomimapaddress@gmx.com',
            subject: 'something',
            html: 'whoopty',
            headers: {
                'mailstream-test-header': 'mailstream-test'
            }
        }, async())

    }, function () {
        console.log('failure', arguments)
    })
})(function (err) {
    console.log('mailstream args', arguments)
    if (err) throw err
})
