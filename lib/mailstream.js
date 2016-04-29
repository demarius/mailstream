var Imap = require('imap'),
    Readable = require('stream').Readable,
    MailParser = require('mailparser').MailParser

function mailstream (options, callback) {
    if (!(this instanceof mailstream)) return new mailstream(options, callback)

    Readable.call(this, { objectMode: true })

    this._imapConfig = options.imap
    this._options = options || {}
    this.since = new Date
    this._filter = options.filter || function () { return true }
    if (!this._options.box) this._options.box = 'INBOX'
    if (!this._options.mailparser) this._options.mailparser = {}
    this._imap = new Imap(this._imapConfig)

    var that = this
    this._imap.once('ready', function () {
        that._imap.openBox(that._options.box, true, function (error, box) {
            if (error) callback (error)
            that._imap.on('mail', function (count) {
                that._search()
            })

            callback(null, that)
        })
    })

    this._imap.once('error', function (e) { callback(e) })
    this._imap.connect()
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
    var that = this
    var fetch = this._imap.fetch(uids, { bodies: '', struct: true })

    f.on('message', function (msg) {
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
        var fetch = that._imap.fetch(results, {
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

module.exports = mailstream
