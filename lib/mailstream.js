var Imap = require('imap'),
    Readable = require('stream').Readable,
    MailParser = require('mailparser').MailParser

function mailstream (options, callback) {
    if (!(this instanceof mailstream)) return new mailstream(options, callback)

    Readable.call(this, { objectMode: true })

    this._imapConfig = options.imap
    this._options = options || {}
    this.since = new Date
    if (!this._options.box) this._options.box = 'INBOX';
    if (!this._options.mailparser) this._options.mailparser = {};
    this._imap = new Imap(this._imapConfig);

    var self = this
    this._imap.once('ready', function () {
        self._imap.openBox(self._options.box, true, function (error, box) {
            if (error) callback (error)
            self._imap.on('mail', function (count) {
                self._search()
            })

            callback(null, self)
        })
    })

    this._imap.once('error', function (e) { callback(e) })
    this._imap.connect()
}

mailstream.prototype = Object.create(Readable.prototype, {
    constructor: {
        value: mailstream
    }
})

mailstream.prototype._read = function () {
    this._search()
}

mailstream.prototype.disconnect = function () {
    this._imap.end()
}

mailstream.prototype._search = function () {
    var self = this
    self._imap.search(['ALL', ['SINCE', self.since]], function (err, results) {
        if (err) { return }
        if (!results) return
        var f = self._imap.fetch(results, {
            bodies: 'HEADER.FIELDS (DATE)'
        })

        f.on('message', function (msg, s) {
            var buffer = ''
            msg.on('body', function (stream) {
                stream.on('data', function (chunk) {
                    buffer += chunk
                })
            })
        })
    })
}

module.exports = mailstream
