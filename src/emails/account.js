/**
 * Sendgrid email API is being used to send emails to the user regarding signup
 * STEP1) Make an account in sendGrid
 * Step 2) Generate an API key
 * Step 3) download npm module 
 * Step 4) make sure to do sender verification
 */
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendWelcomeEmail(email, name){
    sgMail.send({
        to: email,
        from: 'abhigyanrahawork76@gmail.com',
        subject: "Welcome to the family!",
        text: `${name}, we would like to heartily welcome you to the titu Task Manager family! We believe that work is worship and here we are dedicated to help you complete all the work you have! Swipe Away!`
    }).then(() => console.log('Done!'))
    .catch((e) => console.log(e))
}

function sendCancellationMail(email, name){
    sgMail.send({
        to: email,
        from: 'abhigyanrahawork76@gmail.com',
        subject: "Departing? :(",
        text: `${name}, is it us? Let us know.`
    }).then(() => console.log('Done!'))
    .catch((e) => console.log(e))
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationMail
}
