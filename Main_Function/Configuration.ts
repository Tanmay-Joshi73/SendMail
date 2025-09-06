import inquirer from 'inquirer';
import validator from 'validator';
import {SetAccount} from '../utls/Credentials.js';
const Configure=async():Promise<void>=>{
const Data = await inquirer.prompt([
  {
    type: 'input',
    name: 'email',
    message: '📧 Enter your email:',
    validate: (input: any) =>
      validator.isEmail(input) || '❌ Please enter a valid email address'
  },
  {
    type: 'password',
    name: 'password',
    message: '🔒 Enter your email password:',
    mask: '*',
    validate: (input: string) =>
      input.length >= 6 || '❌ Password must be at least 6 characters'
  },
  {
    type: 'password',
    name: 'masterKey',
    message: '🔑 Enter your Master Key (will be used to encrypt/decrypt credentials):',
    mask: '*',
    validate: (input: string) =>
      input.length >= 8 || '❌ Master Key must be at least 8 characters'
  },
  {
    type: 'input',
    name: 'smtp',
    message: '🌐 Enter SMTP server (e.g. smtp.gmail.com):',
    validate: (input: string) =>
      input.trim().length > 0 || '❌ SMTP server is required'
  }
]);

  await SetAccount(Data.email,Data.password,Data.masterKey)

}
export default Configure
// module.exports=Configure