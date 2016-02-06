var Imap = require('imap'),
	MailParser = require("mailparser").MailParser,
	moment = require('moment'),
	Readable = require('stream').Readable;
	
	
function MailStream(imapOptions, options) {
	if (!(this instanceof MailStream))
		return new MailStream(imapOptions, options);

	Readable.call(this, {objectMode: true});
  
	this._imapOptions = imapOptions;
	this._options = options || {};
	this.since = moment.utc(this._options.since);
	if (!this.since.isValid()) throw new Error('date is not valid');
	if (!this._options.box) this._options.box = 'INBOX';
	if (!this._options.mailparser) this._options.mailparser = {};
	this._imap = new Imap(this._imapOptions);
}

MailStream.prototype = Object.create(Readable.prototype, { constructor: { value: MailStream }});

MailStream.prototype._read = function(n) {
	var self = this;
	if (!this._imap.connected) this._imap.connect(function(err) {
		if (err) self._die(err);
		
		self._search();

	});
};

MailStream.prototype._die = function() {
    console.log('die')
	this.disconnect();
	this.emit('error', err);
	this.push(null);
};

MailStream.prototype.disconnect = function() {
	if (this._imap.connected) this._imap.logout();
};

MailStream.prototype._fetch = function(uids) {
	var self = this;
	self._imap.fetch(uids, { 
		headers: {
			parse: false
		},
		body: true,
		cb: function(fetch) {
			fetch.on('message', function(msg) {
				var mailparser = new MailParser(self._options.mailparser);
		
				msg.on('data', function(chunk) {
					mailparser.write(chunk);
				});
				
				msg.on('end', function() {
					mailparser.end();
				});
			
				mailparser.on('end', function(mail){
					mail.imap = msg;
					delete mail.imap._events;
					if (!self.push(mail)) {
						console.log('mailstream should stop');
					}
				});
		
			});
		}
	}, function(err) {
		if (err) self._die(err);
	});
};

MailStream.prototype._search = function() {
	var self = this;
		if (err) self._die(err);
		self._imap.search([ 'ALL', ['SINCE', self.since.format('DD-MMM-YYYY')] ], function(err, results) {
			if (err) self._die(err);
			var uids = [];
			self._imap.fetch(results, { 
				headers: ['date'],
				body: false,
				cb: function(fetch) {
					fetch.on('message', function(msg) {
						msg.on('end', function() {
							if (self.since.isBefore(msg.date)) {
								uids.push(msg.uid);
							}
						});
					});
				}
			}, function(err) {
				if (err) self._die(err);
				if (uids.length) self._fetch(uids);
				self.since = moment.utc();
			});
		});
};

module.exports = MailStream;
