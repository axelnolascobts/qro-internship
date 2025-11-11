import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export const inputPrompt = async (prompt = "") => {
  const rl = createInterface({ input, output, terminal: true });
  try {
    const line = await rl.question(prompt);
    return line;
  } catch (error) {
    console.error(error);
  } finally {
    rl.close();
  }
}

