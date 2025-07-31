import keytar from 'keytar'
interface AccountDetails{
    Email:string,
    Password:string
}
const Service='sendmail-cli'
const Account='Email'
const SetAccount=async(email:string,password:string):Promise<any>=>{
await keytar.setPassword(Service,email,password)
}
const DeleteAccount=async(email:string,password:string):Promise<any>=>{
if(!email) return "Please provide the email";
const Exist=await keytar.getPassword(Service, email);
if(!Exist) return "Please the appropriate email";
// if(Exist.password!==password){
//     return 
// }

const Result=await keytar.deletePassword(Service,email)
if(Result)return;
else{
    console.log("Email is not Exist ")
}
}

export default SetAccount;