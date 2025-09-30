import keytar from 'keytar';
import inquirer from 'inquirer';
const Service = 'sendmail-cli';
const Account = 'Email';
export const SetAccount = async (email, password) => {
    //first checking weather email is already present or not
    if (!email || !password) {
        console.log("please provide the email or password");
        return;
    }
    const result = await keytar.getPassword(Service, email);
    if (result) {
        console.log("email is already present");
        return;
    }
    await keytar.setPassword(Service, email, password);
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
    const { enteredPassword } = await inquirer.prompt([
        {
            type: "password",
            name: "enteredPassword",
            message: `Enter the app password for '${selectedEmail}':`,
            mask: "*",
        },
    ]);
    // Step 3: Compare with stored password
    const savedPassword = await keytar.getPassword(Service, selectedEmail);
    if (enteredPassword === savedPassword) {
        await keytar.deletePassword(Service, selectedEmail);
        console.log(`✅ Credentials for '${selectedEmail}' deleted successfully.`);
    }
    else {
        console.log("❌ Incorrect password. Email was not deleted.");
    }
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
export const showStatus = async () => {
    const user_information = await listAllSenders();
    let result = [];
    user_information.map(c => {
        result.push({ account: c.account });
    });
    console.log(result);
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
