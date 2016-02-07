var MailStream = require('./lib/mailstream');

var mailstream = MailStream({
    user: 'demarius2010@live.com',
    password: 'badgers%10',
    host: 'outlook.office365.com',
    port: 993,
    tls: true
})

mailstream.go(function (err) {
    if (err) throw err
    mailstream.on('data', function(mail){
        console.log(mail);
    });
})

process.on('SIGINT', function() {
    console.log('\nAbout to exit.');
    mailstream.disconnect();
    console.log('Got mails until '+mailstream.since.format('LLL'));
    process.exit();
});
