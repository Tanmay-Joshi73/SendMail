import inquirer from "inquirer";
import validator from 'validator';
import nodemailer from 'nodemailer';
import {GetUserEmail,pickSender} from '../utls/Credentials.js';
export const  Sendmail=async():Promise<void>=>{
      const data=await pickSender()
      const {account:From,password}={...data};
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
      type: "input",
      name: "body",
      message: "Email Message:",
    },
  ]);
  
  
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: From,
      pass: password,
    },  tls: {
    rejectUnauthorized: false, // 👈 BYPASS self-signed certificate error
  },
  });

const mailOptions = {
  from: From,
  to: answers.to,
  subject: answers.subject,
  text: answers.body
};
transporter.sendMail(mailOptions,(error,info)=>{
if(error){
    console.log('error is',error)
}
else{
    console.log(`email is send-> ${info.response}`)
}
})
}
