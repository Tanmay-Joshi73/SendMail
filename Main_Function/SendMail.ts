import inquirer from "inquirer";
import validator from 'validator';
import nodemailer from 'nodemailer';
import nfd from 'node-file-dialog'
import { main } from "./deekseek.js";
import {requireSession} from '../utls/session.js'
import {DeleteAccount} from '../utls/Credentials.js'
import { GetUserEmail, pickSender } from '../utls/Credentials.js';
import fs from 'fs'
const ctx: {
  From?: string,
  to?: string,
  subject?: string,
  text?: string,
  attachment?: { filename: string, path: string }[];
} = {}

const Ptx: {
  to?: string,
  purpose?: string,
  tone?: string,
  subject?: string
} = {}


//Function for accepting file path
const acceptFilePath = async (): Promise<void> => {
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
  } catch (error) {
    if (error instanceof Error && error.message === "Nothing selected") {
      console.log("⚠ No files selected.");
    } else {
      console.error("❌ Error selecting files:", error);
    }
  }

}

export async function Compose(From: string | '',
  password: string,
  ctx: { to: string; subject: string; text: string; attachment?: any[] }): Promise<void> {
DeleteAccount()
return;
    //Here we first check weather Session Key is present for sending email or not 
    requireSession()

      console.log('hey just before sending the mail')
      return;
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: From,
        pass: password,
      },
      tls: {
        rejectUnauthorized: false, // 👈 Bypass self-signed cert error
      },
    });

    const mailOptions = {
      from: From,
      to: ctx.to,
      subject: ctx.subject,
      html:`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${ctx.subject}</title>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f5f7fa;">
    <div style="max-width:600px; margin:20px auto; background-color:#ffffff; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.08); overflow:hidden;">
        
        <!-- Header Section -->
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding:30px 20px; text-align:center;">
            <h2 style="color:#ffffff; margin:0; font-size:24px; font-weight:600; text-shadow:0 2px 4px rgba(0,0,0,0.1);">
                ✨ ${ctx.subject}
            </h2>
        </div>
        
        <!-- Main Content -->
        <div style="padding:30px 25px;">
            <p style="font-size:18px; color:#2c3e50; margin:0 0 25px 0; font-weight:500;">
                👋 Hello <span style="color:#4CAF50; font-weight:600;">${ctx.to.split("@")[0]}</span>,
            </p>
            
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding:25px; border-radius:10px; border-left:5px solid #4CAF50; margin:25px 0; position:relative;">
                <div style="position:absolute; top:15px; right:15px; font-size:24px; opacity:0.3;">🎉</div>
                <p style="margin:0; line-height:1.7; color:#34495e; font-size:16px;">
                    ${ctx.text}
                </p>
            </div>
            
            <!-- Signature Section -->
            <div style="margin-top:40px; padding-top:25px; border-top:2px solid #e9ecef;">
                <p style="margin:0; font-size:16px; color:#2c3e50; line-height:1.6;">
                    🚀 Stay awesome,<br>
                    <span style="color:#4CAF50; font-weight:600; font-size:18px;">Tanmay Joshi</span>
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color:#f8f9fa; padding:20px; text-align:center; border-top:1px solid #e9ecef;">
            <p style="margin:0; color:#6c757d; font-size:12px;">
                Made with ❤️ by your AI Email Assistant
            </p>
        </div>
    </div>
</body>
</html>`,
      attachments: ctx.attachment || [],
      headers: {
    'Content-Type': 'text/html; charset=UTF-8',
    'MIME-Version': '1.0'
  }
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${ctx.to}. Response: ${info.response}`)


  }
  catch (err) {
    console.log(err)
  }
}



export const Sendmail = async (): Promise<void> => {
  const data = await pickSender()
  const { account: From, password } = { ...data };
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "to",
      message: "Recipient's Email:",
      validate: (input: any) => {
        return validator.isEmail(input) || '❌ Please enter a valid email address'
      }
    },
    {
      type: "input",
      name: "subject",
      message: "Email Subject:",
    },
    {
      name: "addAttachment",
      message: "Do you want to attach files?",
      default: false,
      type: "confirm",
    },
    {
      type: "editor",
      name: "body",
      message: "Email Message:",
    },
  ]);
  console.log(`-> ${answers.body}`)
  ctx.From = From;
  ctx.to = answers.to;
  ctx.subject = answers.subject;
  ctx.text = answers.body;
  if (answers.addAttachment === true) {
    await acceptFilePath()
  }



  await Compose(From || "", password || "", {
    to: ctx.to ?? "",
    subject: ctx.subject ?? "",
    text: ctx.text ?? "",
    attachment: ctx.attachment,
  });

}


export const ComposeWithAI = async (): Promise<void> => {
  const data = await pickSender()
  const { account: From, password } = { ...data };
  const info = await inquirer.prompt([
    {
      type: "input",
      name: "to",
      message: "Recipient's Email:",
      validate: (input: any) => {
        return validator.isEmail(input) || '❌ Please enter a valid email address'
      }
    },
    {
      type: "input",
      name: "subject",
      message: "Email Subject:",
    },
    {
      type: "input",
      name: "purpose",
      message: "Briefly describe the purpose of the email:",
    },
    {
      type: "select",
      name: "tone",
      message: "Choose the tone of the email:",
      choices: [
        {
          name: "Professional", value: "professional",

        },
        { name: "Casual", value: "casual" },
        { name: "Friendly", value: "friendly" },
        { name: "Formal", value: "formal" },
        { name: "Funny", value: "funny" },
      ]
    }

  ])
  Ptx.to = info.to;
  Ptx.purpose = info.purpose;
  Ptx.tone = info.tone;
  Ptx.subject = info.subject;
  


  //AI function call for composing Email;
  const draft = await main(Ptx)
 
  await Compose(From || "", password || "", {
    to: info.to ?? "",
    subject: info.subject ?? "",
    text: draft ?? "",
    attachment: ctx.attachment ?? [],
  });

}