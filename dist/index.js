#!/usr/bin/env node
// import nodemailer from "nodemailer"
// const {Command} =require('Commander')
import { Command } from 'commander';
const Program = new Command();
import { Sendmail, ComposeWithAI } from "./Main_Function/SendMail.js";
import { DeleteAccount } from "./utls/Credentials.js";
import Configure from './Main_Function/Configuration.js';
Program.name("SendMail").description("package to send to everyone throught just cli commands")
    .version('1.0.0');
///Command for Configure 1
Program.command('configure')
    .description('Add Or Update Your Email or Password')
    .action(async () => {
    await Configure();
});
Program.command('compose').
    description("send mail to anyone through the gmaiil")
    .action(async () => {
    Sendmail();
});
Program.command('ComposeAi').
    description("Allow the user to generate mail with Ai")
    .action(() => {
    ComposeWithAI();
});
Program.command('Delete')
    .description('delete the email auth')
    .action(async () => {
    DeleteAccount();
});
Program.parse();
