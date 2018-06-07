const Email         = require('email-templates');
const nodemailer    = require('nodemailer');
const path          = require("path");

const transporter = nodemailer.createTransport({
    pool: true,
    host: 'smtp.1und1.de',
    port: 587,
    secure: false, // use TLS
    auth: {
        user: 'test@test.de',
        pass: ''
    }
});

const email = new Email({
    message: {
        from: 'test@test.de'
    },
    send: true, // If set to false, this will display the email in the browser for debugging!!!
    transport: transporter,
    views: {
        options: {
            extension: 'ejs' // <---- HERE
        }
    },
    juice: true,
    juiceResources: {
        preserveImportant: true,
        webResources: {
            relativeTo: path.resolve('emails')
        }
    }
});

function sendRegistrationEmail()
{

    email
        .send({
            template: 'registration',
            message: {
                to: 'test@test.de'
            },
            locals: {
                name: 'Sascha'
            }
        })
        .then(console.log)
        .catch(console.error);
}

module.exports = { sendRegistrationEmail };