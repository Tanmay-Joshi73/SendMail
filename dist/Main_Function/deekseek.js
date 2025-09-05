import { exec } from "child_process";
import fs from "fs";
import readline from "readline";
import { loadModel, createCompletion } from "gpt4all";
// 1️⃣ Load model
const model = await loadModel("orca-mini-3b-gguf2-q4_0.gguf", {
    verbose: true,
    device: "gpu",
    nCtx: 2048,
});
// 2️⃣ Start a chat session
const chat = await model.createChatSession({
    temperature: 0.7,
    systemPrompt: `### System:
You are an assistant that writes polished, unique, visually appealing HTML email drafts and professional email drafts to the recipient on the behalf of me it should look like i am sending the email.

Rules:
- Always return emails in valid HTML format with inline CSS.
- Use emojis for warmth and friendliness when suitable.
- Apply a clean structure: <div> with font-family: Arial, sans-serif; line-height: 1.6; padding: 20px;
- Ensure it looks good in email clients (Gmail, Outlook).
- First, ask for any missing details needed (recipient, subject, sender, etc.).
- Email must always follow: Greeting → Body → Polite Closing.
- Avoid placeholders like [Friend’s Name]. If info is missing, politely ask the user for it instead.
- When user adds new info later, rewrite the draft to include it naturally.`,
});
// 🔹 Utility → ask user in terminal
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
// 🔹 Utility → query AI
async function getAIResponse(prompt) {
    const res = await createCompletion(chat, prompt);
    return res.choices[0].message?.content?.trim() || "";
}
// Step 1 → Ask AI what info is needed
async function collectDetails(info) {
    const missing = await getAIResponse(`The user wants to write a ${info.tone} email for this purpose: ${info.purpose}.
List what details you need before drafting. Return as simple bullet points.`);
    console.log("\n🤖 AI says it needs:\n", missing);
    const details = { ...info };
    const lines = missing.split("\n").filter((l) => l.trim().startsWith("-"));
    for (const line of lines) {
        const key = line.replace("-", "").trim();
        details[key] = await askUser(`Enter ${key}: `);
    }
    return details;
}
// Step 2 → Generate email
async function generateEmail(details) {
    const res = await getAIResponse(`Write a complete ${details.tone} email using these details: ${JSON.stringify(details)}`);
    return res;
}
// Step 3 → Polish draft
async function polishDraft(draft) {
    return await getAIResponse(`Polish this email without changing its intent:\n${draft}`);
}
// Step 4 → Update with new info
async function updateWithNewInfo(draft, details) {
    const newInfo = await askUser("📝 Want to add new information? (e.g., 'add friend's name') or press Enter to skip: ");
    if (newInfo) {
        const res = await getAIResponse(`Here is the current email draft:\n${draft}\n\nThe user wants to add this info: "${newInfo}". 
       Please rewrite the full email including this info. Tone: ${details.tone}.`);
        return res;
    }
    return draft;
}
// 🔹 Open in Notepad
function openEditor(file) {
    return new Promise((resolve, reject) => {
        exec(`notepad ${file}`, (err) => {
            if (err)
                reject(err);
            else
                resolve("");
        });
    });
}
// 🔹 Main flow
export const main = async (info) => {
    try {
        // Collect details first
        const completeInfo = await collectDetails(info);
        // Generate draft
        let draft = await generateEmail(completeInfo);
        fs.writeFileSync("./draft.txt", draft);
        let keepEditing = true;
        while (keepEditing) {
            console.log("\n✅ Draft saved to draft.txt. Opening Notepad...");
            await openEditor("draft.txt");
            draft = fs.readFileSync("./draft.txt", "utf8");
            console.log("\n📄 Current draft:\n", draft);
            // 🔹 New feature → Add info later
            draft = await updateWithNewInfo(draft, completeInfo);
            fs.writeFileSync("draft.txt", draft);
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
        return draft;
    }
    finally {
        model.dispose();
    }
};
