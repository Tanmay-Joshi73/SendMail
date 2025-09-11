import {expect, jest, test,describe} from '@jest/globals';
// import {expect, jest, test} from '@jest/globals';
import { Compose } from '../Main_Function/SendMail.js';

describe('Mail sending',()=>{
    test('It sends the mail successfully',async()=>{
    const result=await Compose("Test@Person",'1234',{
        to:"Test@gmail.com",
        subject:'SampleMail',
        text:"SampleText",
        attachment:undefined

    });
  expect(result).toBe(true)


    })
})