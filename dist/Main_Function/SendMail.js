import inquirer from "inquirer";
import validator from 'validator';
import nodemailer from 'nodemailer';
import nfd from 'node-file-dialog';
import { pickSender } from '../utls/Credentials.js';
const ctx = {};
//Functon for accepting file path
const acceptFilePath = async () => {
    try {
        const files = await nfd({
            type: "open-file",
            multiple: true,
        });
        ctx.attachment = files.map((filePath) => ({
            filename: filePath.split(/[/\\]/).pop() || "file",
            path: filePath,
        }));
        console.log("✅ Files attached:", files);
    }
    catch (error) {
        if (error instanceof Error && error.message === "Nothing selected") {
            console.log("⚠ No files selected.");
        }
        else {
            console.error("❌ Error selecting files:", error);
        }
    }
};
export const Sendmail = async () => {
    const data = await pickSender();
    const { account: From, password } = { ...data };
    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "to",
            message: "Recipient's Email:",
            validate: (input) => {
                return validator.isEmail(input) || '❌ Please enter a valid email address';
            }
        },
        {
            type: "input",
            name: "subject",
            message: "Email Subject:",
        },
        {
            type: "input",
            name: "body",
            message: "Email Message:",
        },
        {
            type: "confirm",
            name: "addAttachment",
            message: "Do you want to attach files?",
            default: false,
        },
    ]);
    ctx.From = From;
    ctx.to = answers.to;
    ctx.subject = answers.subject;
    ctx.text = answers.body;
    if (answers.addAttachment === true) {
        await acceptFilePath();
    }
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: From,
            pass: password,
        }, tls: {
            rejectUnauthorized: false, // 👈 BYPASS self-signed certificate error
        },
    });
    const mailOptions = {
        from: From,
        to: ctx.to,
        subject: ctx.subject,
        html: ctx.text,
        attachments: ctx.attachment || []
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('error is', error);
        }
        else {
            console.log(`email is send-> ${info.response}`);
        }
    });
};
