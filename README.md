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

mailstream = new MailStream({
	user: 'CHANGEME@gmail.com',
	password: 'CHANGEME',
	host: 'imap.gmail.com',
	port: 993,
	secure: true
});


mailstream.on('data', function(mail){
	console.log(mail);
});

process.on('SIGINT', function() {
	console.log('\nAbout to exit.');
	mailstream.disconnect();
	console.log('Got mails until '+mailstream.since.format('LLL'));
	process.exit();
});


```