mail-stream
===========

nodejs imap mail stream wrapper

Requirements
============

* [node.js](http://nodejs.org/) -- v0.10.0 or newer
* An IMAP server -- tested with gmail


Installation
============

    npm install mailstream

Example
=======

```javascript

var MailStream = require('mailstream');

MailStream({
    imap: {
        user: 'CHANGEME@gmail.com',
        password: 'CHANGEME',
        host: 'imap.gmail.com',
        port: 993,
        tls: true
    },
    filter: function (mail) { // Optional
        return mail.headers['in-reply-to'] == 'header'
    }
}, function (error, mailstream) {
    mailstream.on('data', function(mail) {
        console.log(mail)
    })

    process.on('SIGINT', function() {
        console.log('\nAbout to exit.')
        mailstream.disconnect()
        console.log('Got mails until '+mailstream.since)
        process.exit()
    })
})
```
