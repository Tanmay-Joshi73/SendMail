import inquirer from 'inquirer';
import validator from 'validator';
import {SetAccount} from '../utls/Credentials.js';
const Configure=async():Promise<void>=>{
 const Data = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Enter your email:',
      validate: (input: any) => {
        return validator.isEmail(input) || '❌ Please enter a valid email address' 
    }
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter your email password:',
      mask: '*',
      validate: (input: string) =>
        input.length >= 6 || '❌ Password must be at least 6 characters'
    },
    {
      type: 'input',
      name: 'smtp',
      message: 'Enter SMTP server (e.g. smtp.gmail.com):',
      validate: (input: string) =>
        input.trim().length > 0 || '❌ SMTP server is required'
    }
    // }
  ]);
  await SetAccount(Data.email,Data.password)

}
export default Configure
// module.exports=Configure