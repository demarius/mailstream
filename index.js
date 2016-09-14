const Imap = require('imap'),
    ews = require('ews-javascript-api'),
    Readable = require('stream').Readable,
    MailParser = require('mailparser').MailParser

function mailstream (options, callback) {
    if (!(this instanceof mailstream)) return new mailstream(options, callback)

    Readable.call(this, { objectMode: true })

    this._options = options || {}
    this.since = new Date
    this._filter = options.filter || function () { return true }
    if (!this._options.box) this._options.box = 'INBOX'
    if (!this._options.mailparser) this._options.mailparser = {}
    var stream = this

    if (options.imap) {
        stream._imapConfig = options.imap
        stream._imap = new Imap(stream._imapConfig)

        stream._imap.once('ready', function () {
            stream._imap.openBox(stream._options.box, true, function (error, box) {
                if (error) callback (error)
                stream._imap.on('mail', function (count) {
                    stream._search()
                })

                callback(null, stream)
            })
        })

        stream._imap.once('error', function (e) { callback(e) })
        stream._imap.connect()
    }

}

mailstream.prototype = Object.create(Readable.prototype, {
    constructor: { value: mailstream }
})

mailstream.prototype._read = function () {
    this._search()
}

mailstream.prototype.disconnect = function () {
    this._imap.end()
}

mailstream.prototype._die = function (err) {
    this.emit('error', err)
    this._imap.destroy()
    this.push(null)
}

mailstream.prototype._fetch = function (uids) {
    var that = this,
        fetch = this._imap.fetch(uids, { bodies: '', struct: true })

    fetch.on('message', function (msg) {
        var mailparser = new MailParser(that._options.mailparser),
            mail = { body: '' }

        msg.on('body', function (stream) {
            stream.on('data', function (chunk) {
                mail.body += chunk
            })
        })

        msg.on('end', function () {
            mailparser.write(mail.body)
            mailparser.end()
        })

        mailparser.on('end', function (mail) {
            if (that._filter(mail)) that.push(mail)
        })
    })
}

mailstream.prototype._search = function () {
    var that = this
    that._imap.search(['ALL', ['SINCE', that.since]], function (err, results) {
        if (err) { that._die(err) }
        if (!results) return
        var uids = [], fetch = that._imap.fetch(results, {
            bodies: 'HEADER.FIELDS (DATE)'
        })

        fetch.on('message', function (msg, s) {
            var buffer = ''
            msg.on('body', function (stream) {
                stream.on('data', function (chunk) {
                    buffer += chunk
                })
            })

            msg.on('attributes', function (attrs) {
                msg.uid = attrs.uid
            })

            msg.on('end', function () {
                var date = new Date(Imap.parseHeader(buffer).date[0])
                if (that.since.getTime() < date.getTime()) {
                    uids.push(msg.uid)
                }
            })

            fetch.once('end', function () {
                if (uids.length > 0) {
                    that._fetch(uids)
                }
                that.since = new Date
            })
        })
    })
}

function exchange (options) {
    var uri, ewsConfig = options.ews || {}

    ewsConfig.version = ewsConfig.version || '2010_SP1'

    if (uri = (ewsConfig.uri || ewsConfig.URI)) {
    }
}

function connect (options) {
    imap.once('ready', function () {
        imap.openBox(options.box, true, function (error, box) {
            if (error) callback (error)
            that._imap.on('mail', function (count) {
                that._search()
            })

            //callback(null, )
        })
    })
}

function AutodiscoverUrl (options, callback) {

    this.autod = new ews.AutodiscoverService(new ews.Uri(
                "https://autodiscover-s.outlook.com/autodiscover/autodiscover.svc"
                ))
    this._ews = new ews.ExchangeService(ews.ExchangeVersion['Exchange' + options.ews.version])
    this._ews.Credentials = new ews.ExchangeCredentials(options.ews.user, options.ews.password)

    this.autod.Credentials = this._ews.Credentials

    autod.GetUserSettings([ options.ews.user ], [
        ews.UserSettingName.ExternalEwsUrl,
        ews.UserSettingName.UserDisplayName,
        ews.UserSettingName.ActiveDirectoryServer,
        ews.UserSettingName.AlternateMailboxes
    ]).then(function (response) {
        console.log('Autodiscovered URL', response.Responses[0].Settings['58'])
        callback(null, response.Responses[0].Settings['58'])
            //this._ews.Url = new ews.Uri(response.Responses[0].Settings['58'])
    }, function (e) {
        console.log(e)
    })
}

module.exports = mailstream
