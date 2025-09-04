import { exec } from "child_process";
import fs from "fs";
import readline from "readline";
import { loadModel, createCompletion } from "gpt4all";

interface Info {
  tone?: string;
  to?: string;
  purpose?: string;
}

// 1️⃣ Load model
const model = await loadModel("orca-mini-3b-gguf2-q4_0.gguf", {
  verbose: true,
  device: "gpu",
  nCtx: 2048,
});

// 2️⃣ Start a chat session
const chat = await model.createChatSession({
  temperature: 0.8,
  systemPrompt: `### System:
You are an assistant that writes polished, unique, and professional email drafts.

Rules:
- Structure: Greeting → Body → Polite Closing.
- Adapt the tone exactly as requested:
  • professional → clear, concise, respectful.
  • casual → relaxed, conversational, but still polite.
  • friendly → warm, approachable, encouraging.
  • formal → very polite, respectful, and structured.
  • funny → witty, lighthearted, but not unprofessional.
- If user input is incomplete (missing names, details, etc.), fill in placeholders like [Recipient] or [Company].
- Avoid clichés; use fresh, natural expressions.`,
});

// 3️⃣ Polishing helper
async function polishDraft(draft: string): Promise<string> {
  const res = await createCompletion(chat, `Polish this email without changing its intent:\n${draft}`);
  return res.choices[0].message?.content?.trim() || draft;
}

// 4️⃣ Open editor
function openEditor(file: string) {
  return new Promise((resolve, reject) => {
    exec(`notepad ${file}`, (err) => {
      if (err) reject(err);
      else resolve("");
    });
  });
}

// 5️⃣ Ask user input
function askUser(question: string): Promise<string> {
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

// 6️⃣ Main flow
export const main = async (info: Info): Promise<string> => {
  try {
    // Generate initial draft
    const res = await createCompletion(chat, `Write a ${info.tone} email for the following purpose: ${info.purpose}`);
    let draft = res.choices[0].message?.content?.trim() || "";

    fs.writeFileSync("./draft.txt", draft);

    let keepEditing = true;
    while (keepEditing) {
      console.log("\n✅ Draft saved to draft.txt. Opening Notepad...");
      await openEditor("draft.txt");

      // Read updated draft
      draft = fs.readFileSync("./draft.txt", "utf8");
      console.log("\n📄 Current draft:\n", draft);

      const choice = await askUser("Polish with AI? (y/done): ");
      if (choice === "y") {
        draft = await polishDraft(draft);
        fs.writeFileSync("draft.txt", draft);
        console.log("✨ Polished draft updated in draft.txt.");
      } else if (choice === "done") {
        keepEditing = false;
        console.log("🎉 Final draft ready in draft.txt!");
      }
    }

    return draft;
  } catch (err) {
    console.error("🚨 Error:", err);
    throw new Error("Something went wrong while generating draft.");
  } finally {
    model.dispose(); // cleanup
  }
};
