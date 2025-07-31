#!/usr/bin/env node
// import nodemailer from "nodemailer"
// const {Command} =require('Commander')
import { Command } from 'commander';
const Program = new Command();
// const {Configure} =require('./Main_Function/Configuration.js')
import Configure from './Main_Function/Configuration.js';
Program.name("SendMail").description("package to send to everyone throught just cli commands")
    .version('1.0.0');
///Command for Configure 1
Program.command('configure')
    .description('Add Or Update Your Email or Password')
    .action(async () => {
    await Configure();
});
Program.command('send mail').
    description("send mail to anyone through the gmaiil")
    .action(async () => {
});
Program.parse();
