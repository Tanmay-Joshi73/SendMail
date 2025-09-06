import crypto from 'crypto';
import NodeCache from "node-cache";
import inquirer from 'inquirer';
import bcrypt from 'bcryptjs';
import keytar from 'keytar';
const Service = 'sendmail-cli';
const MasterService = 'SecretKey';
const Account = 'Email';
const MasterAccount = 'user';
const myCache = new NodeCache({ stdTTL: 1800, checkperiod: 120 });
export const CreateSession = async (Key) => {
    //here an random session key will be provided;
    const randomBytes = crypto.randomBytes(32); // 256-bit random value
    const sessionKey = crypto.createHmac('sha256', Key)
        .update(randomBytes)
        .digest('hex');
    ///Now create a session in cache
    await SetSession(sessionKey, Key);
};
export const SetSession = async (SessionKey, masterKey) => {
    ///create an session Here;
    myCache.set('Token', SessionKey);
    myCache.set('masterKey', masterKey);
};
///This funtion will check weather the Session is still present to allow for the further use
export const requireSession = async () => {
    let sessionKey = myCache.get('Token');
    // console.log('Session key is present',sessionKey)
    if (!sessionKey) {
        // Prompt user for master key
        const { masterKey } = await inquirer.prompt([
            { type: 'password', name: 'masterKey', message: 'Enter master key:', mask: '*' }
        ]);
        // Verify master key
        const storedHash = await keytar.getPassword(MasterService, MasterAccount);
        if (!storedHash || !(await bcrypt.compare(masterKey, storedHash))) {
            throw new Error("❌ Master key is incorrect. Cannot create session.");
        }
        // Create new session
        sessionKey = CreateSession(masterKey);
    }
    return sessionKey;
};
//This function will delete the Sesssion when the app is closed ,After opening user need to create a new session to use email service
export const Logout = () => {
    myCache.del('sessionKey');
};
