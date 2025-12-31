import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import { Injectable } from "@nestjs/common";

dotenv.config();

@Injectable()
export class SendMailService {
  private readonly transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: 587,
    secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});
}
