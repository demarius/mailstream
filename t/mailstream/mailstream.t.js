var cadence = require('cadence')

var test = cadence(function (async) {
    var mailer = require('../setup'),
        MailStream = require('../../lib/mailstream')

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
        console.log(mailstream)
        mailstream.on('data', function (mail) {
            console.log(mail)
            //need to assert here
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

    }, function (info) {
        console.log(info)
        //keeps failing here??
    })
})(function (err) {
    console.log(arguments)
    if (err) throw err
})
