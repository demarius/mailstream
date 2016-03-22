var nodemailer = require('nodemailer')
var mandrill = require('nodemailer-mandrill-transport')

mailer = nodemailer.createTransport(mandrill())
