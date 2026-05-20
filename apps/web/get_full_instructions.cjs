const fs = require('fs');
const path = require('path');
const readline = require('readline');

const logFilePath = 'C:\\Users\\upris\\.gemini\\antigravity\\brain\\2147ffbd-752b-4024-a122-61e0cb883110\\.system_generated\\logs\\transcript.jsonl';

async function extract() {
  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (line.includes('nyk_v0_hXl')) {
      try {
        const obj = JSON.parse(line);
        // Let's print info
        console.log(`Line ${lineCount}: step_index=${obj.step_index}, type=${obj.type}, source=${obj.source}`);
        let content = obj.content || '';
        if (content.length > 500) {
          console.log(`Found long content on line ${lineCount} (length ${content.length})`);
          fs.writeFileSync('C:\\Users\\upris\\content-osv2\\Vectra OS\\apps\\web\\ui_guidelines_extracted.md', content);
          console.log("Wrote to ui_guidelines_extracted.md");
          return;
        }
      } catch (err) {
        console.error("Error parsing JSON:", err);
      }
    }
  }
}

extract();
