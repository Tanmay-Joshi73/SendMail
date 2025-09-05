import { exec } from "child_process";
import fs from "fs";
import readline from "readline";
import { loadModel, createCompletion } from "gpt4all";

interface Info {
  tone?: string;
  to?: string;
  purpose?: string;
  [key: string]: string | undefined;
}

const model = await loadModel("orca-mini-3b-gguf2-q4_0.gguf", {
  verbose: true,
  device: "gpu",
  nCtx: 2048,
});

const chat = await model.createChatSession({
  temperature: 0.7,
  systemPrompt: `### System:
You are an assistant that writes polished, unique, and professional email drafts.
Before writing the email:
- First list all the details you need (e.g., recipient name, company, subject, sender name, etc.).
- Wait until the user provides them.
Then generate the complete email.
Email structure: Greeting → Body → Polite Closing.`,
});

// Ask user in terminal
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

// Helper → query AI
async function getAIResponse(prompt: string): Promise<string> {
  const res = await createCompletion(chat, prompt);
  return res.choices[0].message?.content?.trim() || "";
}

// Step 1 → Ask AI what info is needed
async function collectDetails(info: Info): Promise<Info> {
  const missing = await getAIResponse(
    `The user wants to write a ${info.tone} email for this purpose: ${info.purpose}.
List what details you need before drafting.`
  );

  console.log("\n🤖 AI says it needs:\n", missing);

  // Extract simple bullet-style items (fallback if model returns plain text)
  const details: Info = { ...info };
  const lines = missing.split("\n").filter((l) => l.trim().startsWith("-"));
  for (const line of lines) {
    const key = line.replace("-", "").trim();
    details[key] = await askUser(`Enter ${key}: `);
  }
  return details;
}

// Step 2 → Generate email
async function generateEmail(details: Info): Promise<string> {
  const res = await getAIResponse(
    `Now write the complete ${details.tone} email using these details: ${JSON.stringify(details)}`
  );
  return res;
}

// Step 3 → Polish draft
async function polishDraft(draft: string): Promise<string> {
  return await getAIResponse(`Polish this email without changing its intent:\n${draft}`);
}

// Open in Notepad
function openEditor(file: string) {
  return new Promise((resolve, reject) => {
    exec(`notepad ${file}`, (err) => {
      if (err) reject(err);
      else resolve("");
    });
  });
}

// Main flow
export const main = async (info: Info): Promise<string> => {
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
  } finally {
    model.dispose();
  }
};
