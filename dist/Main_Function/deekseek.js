import OpenAI from 'openai';
import { exec } from "child_process";
import fs from 'fs';
import readline from 'readline';
const key = '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';
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: key,
    defaultHeaders: {
        "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
        "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
    },
});
async function polishDraft(draft) {
    const res = await openai.chat.completions.create({
        model: "gpt-4o-mini", // or your deepseek with baseURL
        messages: [
            { role: "system", content: "You are an assistant that refines email drafts." },
            { role: "user", content: `Polish this email without changing its intent:\n${draft}` }
        ]
    });
    return res.choices[0].message.content || "";
}
function openEditor(file) {
    return new Promise((resolve, reject) => {
        exec(`notepad ${file}`, (err) => {
            if (err)
                reject(err);
            else
                resolve('');
        });
    });
}
function askUser(question) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}
export const main = async (info) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-r1-0528:free",
            messages: [
                {
                    role: "system",
                    content: `You are an assistant that writes polished, unique, and professional email drafts.

      Rules:
      - Structure: Greeting → Body → Polite Closing.
      - Adapt the tone exactly as requested:
        • professional → clear, concise, respectful.
        • casual → relaxed, conversational, but still polite.
        • friendly → warm, approachable, encouraging.
        • formal → very polite, respectful, and structured.
        • funny → witty, lighthearted, but not unprofessional.
      - If user input is incomplete (missing names, details, etc.), fill in placeholders like [Recipient] or [Company].
      - Avoid clichés; use fresh, natural expressions.`
                },
                {
                    role: "user",
                    content: `Write a ${info.tone} email for the following purpose: ${info.purpose}`,
                },
            ]
        });
        let draft = completion.choices[0].message.content || "";
        fs.writeFileSync('./draft.txt', draft);
        let keepEditing = true;
        while (keepEditing) {
            console.log("\n✅ Draft saved to draft.txt. Opening Notepad...");
            await openEditor("draft.txt");
            // Read user-edited version
            draft = fs.readFileSync('./draft.txt', "utf8");
            console.log("\n📄 Current draft:\n", draft);
            // Ask user if they want AI to polish again
            const choice = await askUser("Polish with AI? (y/done): ");
            if (choice === "y") {
                draft = await polishDraft(draft);
                fs.writeFileSync("draft.txt", draft);
                console.log("✨ Polished draft updated in draft.txt.");
            }
            else if (choice === "done") {
                keepEditing = false;
                console.log("🎉 Final draft ready in draft.txt!");
            }
        }
        return draft ?? "";
    }
    catch (err) {
        console.log(err);
        return '';
    }
};
