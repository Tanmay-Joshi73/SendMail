import inquirer from 'inquirer';
import validator from 'validator';
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
    // {
    //   type: 'input',
    //   name: 'port',
    //   message: 'Enter SMTP port (e.g. 587):',
    //   validate: (input: string) => {
    //     const port = parseInt(input, 10);
    //     return (port >= 1 && port <= 65535) || '❌ Enter a valid port number (1-65535)';
    //   }
    // }
  ]);
}
export default Configure
// module.exports=Configure