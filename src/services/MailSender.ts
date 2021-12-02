import nodemailer from 'nodemailer';

const email = process.env.SMTP_AUTH_USER;

const transporter = nodemailer.createTransport(
    {
        service: 'Gmail',
        auth: {
            user: email,
            pass: process.env.SMTP_AUTH_PASSWORD
        }
    })

class MailSender {

    async sendMail(to: string, subject: string, text = "hello world", html: string) {
        return transporter.sendMail({
            from: `FindIt <${email}>`,
            to,
            subject,
            text,
            html,
        });
    }
}

export default new MailSender();
