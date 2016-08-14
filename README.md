mail-stream
===========

nodejs imap mail stream wrapper

Get notified of mailbox updates - inbox, outbox, etc.

Requirements
============

* [node.js](http://nodejs.org/) -- v0.10.0 or newer
* An IMAP or EWS server


Installation
============

    npm install mailstream

IMAP
====

```javascript

var MailStream = require('mailstream')

MailStream({
    imap: {
        user: 'mailstreamtest@gmail.com',
        password: 'm@1lstr3@m%',
        host: 'imap.gmail.com',
        port: 993,
        tls: true
    },
    filter: function (mail) { // Optional.
        //mail parsed through MailParser.

        return mail.headers['in-reply-to'] == 'header-value'
    },
    box: 'INBOX' // Optional. Can be 'OUTBOX', 'DRAFTS', etc.
}, function (error, mailstream) {
    mailstream.on('data', function (mail) {
        console.log(mail)
    })

    process.on('SIGINT', function () {
        console.log('\nAbout to exit.')
        mailstream.disconnect()
        console.log('Got mails until '+mailstream.since)
        process.exit()
    })
})
