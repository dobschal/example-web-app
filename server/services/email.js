const Email         = require('email-templates');
const nodemailer    = require('nodemailer');
const path          = require("path");

const transporter = nodemailer.createTransport({
    pool: true,
    host: process.env.EmailHost,
    port: process.env.EmailPort,
    secure: false, // use TLS
    auth: {
        user: process.env.EmailUser,
        pass: process.env.EmailPassword
    }
});

const email = new Email({
    message: {
        from: process.env.EmailSender
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

function sendRegistrationEmail( username, emailOfUser )
{

    email
        .send({
            template: 'registration',
            message: {
                to: emailOfUser
            },
            locals: {
                name: username
            }
        })
        .then(console.log)
        .catch(console.error);
}

module.exports = { sendRegistrationEmail };