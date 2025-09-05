import { exec } from "child_process";
import fs from "fs";
import readline from "readline";
import { loadModel, createCompletion } from "gpt4all";
// 🔹 Global model + chat references
let model = null;
let chat = null;
// 🔹 Load model and start chat session
async function LoadModel() {
    if (!model) {
        model = await loadModel("orca-mini-3b-gguf2-q4_0.gguf", {
            verbose: true,
            device: "gpu",
            nCtx: 2048,
        });
        chat = await model.createChatSession({
            temperature: 0.7,
            systemPrompt: `### System:
You are an assistant that writes polished, unique, and visually appealing HTML email drafts.

🎯 Writing Style Rules:
- Always write the email **from me directly to the recipient** (first-person voice).
- Do NOT say "my friend", "he", "she", or "they" when referring to the recipient — always use "you".
- Keep the tone natural, personal, and aligned with the requested style (professional, casual, friendly, etc.).
- Add emojis where appropriate for warmth and clarity, but do not overuse them.

📑 Formatting Rules:
- Always return valid, complete HTML with inline CSS for compatibility.
- Wrap content in: 
  <!DOCTYPE html><html><body> ... </body></html>
- Use a clean structure:
  <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px;">
- Ensure readability across Gmail, Outlook, and mobile clients.

📝 Workflow Rules:
1. If key details (recipient name, subject, sender name, etc.) are missing, politely ask the user to provide them.
2. Structure every email as: Greeting → Body → Polite Closing.
3. Avoid placeholders like [Name]. Instead, ask the user for missing information.
4. When the user provides new info later, seamlessly rewrite the draft to include it.

✅ Goal:
Produce emails that look like **I am personally sending them**, well-formatted in HTML, engaging, and easy to read.`,
        });
    }
    return chat;
}
// 🔹 Dispose model
async function EndModel() {
    if (model) {
        model.dispose();
        model = null;
        chat = null;
    }
}
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
    const chat = await LoadModel();
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
    return await getAIResponse(`Write a complete ${details.tone} email using these details: ${JSON.stringify(details)}`);
}
// Step 3 → Polish draft
async function polishDraft(draft) {
    return await getAIResponse(`Polish this email without changing its intent:\n${draft}`);
}
// Step 4 → Update with new info
async function updateWithNewInfo(draft, details) {
    const newInfo = await askUser("📝 Want to add new information? (e.g., 'add friend's name') or press Enter to skip: ");
    if (newInfo) {
        return await getAIResponse(`Here is the current email draft:\n${draft}\n\nThe user wants to add this info: "${newInfo}". 
       Please rewrite the full email including this info. Tone: ${details.tone}.`);
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
            // 🔹 Add new info if user wants
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
        await EndModel();
    }
};
