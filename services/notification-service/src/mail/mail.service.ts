import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config()

@Injectable()
export class MailService {
    private readonly transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: 587,
    secure: false,
    auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  },
  
});

    async loginSucceeded(data: any) {
      const {email, username, ip} = data
    /*
       await this.transporter.sendMail({
  from: process.env.MAIL_USERNAME,
  to: email,
  subject: "OrderFlow - Login Notification",
  html: `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #4CAF50;">OrderFlow - Login Notification</h2>
      <p>Hello <strong>${username}</strong>,</p>
      <p>Your account has been <span style="color: #4CAF50;">successfully logged in</span>.</p>
      <p><strong>IP Address:</strong> ${ip}</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
      <p style="font-size: 12px; color: #777;">
        If this wasn’t you, please reset your password immediately or contact support.
      </p>
    </div>
  `
});*/
return "Email sent successfully";


}
    async registerSucceeded(data: any) {
      const {email, username} = data
    
       await this.transporter.sendMail({
  from: "e5m2software@gmail.com",
  to: email,
  subject: "OrderFlow - Register Notification",
  html: `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #4CAF50;">OrderFlow - Register Notification</h2>
      <p>Hello <strong>${username}</strong>,</p>
      <p>Your account has been <span style="color: #0fdb00ff;">successfully created</span>.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
      <p style="font-size: 12px; color: #777;">
        Welcome to OrderFlow! We're excited to have you on board.
      </p>
    </div>
  `
    }
)}
}
