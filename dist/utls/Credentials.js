import keytar from 'keytar';
import inquirer from 'inquirer';
import bcrypt from "bcryptjs";
import { CreateSession } from "./session.js";
import crypto from 'crypto';
const Service = 'sendmail-cli';
const MasterService = 'SecretKey';
const Account = 'Email';
const MasterAccount = 'user';
export const setSecreat = async (Key) => {
    const existing = await keytar.getPassword(MasterService, MasterAccount);
    if (!existing) {
        const hash = await bcrypt.hash(Key, 10);
        await keytar.setPassword(MasterService, MasterAccount, hash);
        console.log("✅ Master key set successfully!");
        return;
    }
    const isMatched = await bcrypt.compare(Key, existing);
    if (!isMatched) {
        console.log("Wrong Master key");
        return;
    }
    await CreateSession(Key); //This will create an random session key with Master key   //Second Layer;
};
const isEmailPresent = async (email) => {
    const existing = await keytar.getPassword(Service, email);
    if (existing)
        return true;
    return false;
};
//code to encrypt the email's password
export const Encrypt = async (pass, Master) => {
    const key = crypto.createHash('sha256').update(Master).digest(); // derive 256-bit key
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(pass, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};
//code to decrypt the password
export const decryptPassword = (encryptedData, masterKey) => {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.createHash('sha256').update(masterKey).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
export const SetAccount = async (email, password, masterKey) => {
    //first checking weather email is already present or not
    if (!email || !password || !masterKey) {
        console.log("please provide the email or password");
        return;
    }
    setSecreat(masterKey); // here it check weather || create master key
    const result = await isEmailPresent(email);
    if (result) {
        return;
    }
    const pass = await Encrypt(password, masterKey); //password is encrypted;
    await keytar.setPassword(Service, email, pass);
    await CreateSession(masterKey); //this will create the session for the further use;
    console.log("Email is Successfully configured");
};
export const DeleteAccount = async () => {
    const creds = await keytar.findCredentials(Service);
    if (creds.length === 0) {
        console.log("❌ No saved emails found.");
        return;
    }
    // Step 1: Ask user to choose email
    const { selectedEmail } = await inquirer.prompt([
        {
            type: "list",
            name: "selectedEmail",
            message: "Which email do you want to delete?",
            choices: creds.map((c) => c.account),
        },
    ]);
    // Step 2: Ask user to input password
    // const { enteredPassword } = await inquirer.prompt([
    //   {
    //     type: "password",
    //     name: "enteredPassword",
    //     message: `Enter the app password for '${selectedEmail}':`,
    //     mask: "*",
    //   },
    // ]);
    // // Step 3: Compare with stored password
    // const savedPassword = await keytar.getPassword(Service, selectedEmail);
    // if (enteredPassword === savedPassword) {
    await keytar.deletePassword(Service, selectedEmail);
    // console.log(`✅ Credentials for '${selectedEmail}' deleted successfully.`);
    // } else {
    // console.log("❌ Incorrect password. Email was not deleted.");
    // }
};
export const GetUserEmail = async () => {
    const Credentials = await keytar.findCredentials(Service);
    if (Credentials.length == 0) {
        console.log("Authenticate first");
        return;
    }
    return Credentials;
};
const listAllSenders = async () => {
    const creds = await keytar.findCredentials(Service); // returns [{ account, password }]
    return creds;
};
// Pick one sender email
export const pickSender = async () => {
    const creds = await listAllSenders();
    if (creds.length === 0) {
        throw new Error("❌ No sender credentials found. Run `sendmail configure`.");
    }
    const { chosenEmail } = await inquirer.prompt([
        {
            type: "list",
            name: "chosenEmail",
            message: "Choose sender email:",
            choices: creds.map(c => c.account),
        },
    ]);
    const selected = creds.find(c => c.account === chosenEmail);
    return selected; // { account: email, password }
};
export default SetAccount;
