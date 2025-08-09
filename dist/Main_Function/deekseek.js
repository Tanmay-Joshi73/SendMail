import OpenAI from 'openai';
const key = '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';
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: key,
    defaultHeaders: {
        "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
        "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
    },
});
export const main = async (info) => {
    console.log("before calling the main conent of the function");
    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-r1-0528:free",
            messages: [
                {
                    "role": "user",
                    "content": "You are a helpful assistant that writes professional email messages based on the given purpose and tone.",
                },
                {
                    role: "user",
                    content: `Write a ${info.tone} email for the following purpose: ${info.purpose}`,
                },
            ]
        });
        console.log('hey before logging the chatbot message');
        console.log(completion.choices[0].message);
        return completion;
    }
    catch (err) {
        console.log(err);
    }
};
