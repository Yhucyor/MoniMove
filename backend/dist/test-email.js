"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
async function test() { const transporter = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: 'trinhphuhao2108@gmail.com', pass: 'psqszyubugalwvbd' } }); try {
    const info = await transporter.sendMail({ from: 'trinhphuhao2108@gmail.com', to: 'trinhphuhao2108@gmail.com', subject: 'Test', text: 'Test' });
    console.log('Success:', info.messageId);
}
catch (e) {
    console.error('Error:', e);
} }
test();
//# sourceMappingURL=test-email.js.map