import crypto from 'crypto'
import NodeCache from "node-cache" 
const myCache = new NodeCache( { stdTTL: 1800, checkperiod: 120 } );
export const CreateSession=async(Key:string):Promise<void>=>{
//here an random session key will be provided;
 const randomBytes = crypto.randomBytes(32); // 256-bit random value
    const sessionKey = crypto.createHmac('sha256', Key)
                             .update(randomBytes)
                             .digest('hex');
    ///Now create a session in cache
    await SetSession(sessionKey);                             
}

export const SetSession=async(SessionKey:string):Promise<void>=>{
///create an session Here;
 myCache.set('Token',SessionKey);
}