const fs = require('fs');
const readline = require('readline');

const logFilePath = 'C:\\Users\\upris\\.gemini\\antigravity\\brain\\2147ffbd-752b-4024-a122-61e0cb883110\\.system_generated\\logs\\transcript.jsonl';

async function printLine762() {
  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (lineCount === 762) {
      try {
        const obj = JSON.parse(line);
        console.log(`Line 762: step_index=${obj.step_index}, type=${obj.type}, source=${obj.source}`);
        // Let's write the entire content of this step to a separate file to see if the UI instructions are there
        fs.writeFileSync('C:\\Users\\upris\\content-osv2\\Vectra OS\\apps\\web\\history_step_content.txt', obj.content || JSON.stringify(obj));
        console.log("Successfully wrote line 762 content to apps/web/history_step_content.txt");
      } catch (err) {
        console.error("Failed to parse/write line 762:", err);
      }
      break;
    }
  }
}

printLine762();
