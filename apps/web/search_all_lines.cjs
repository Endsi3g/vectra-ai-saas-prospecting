const fs = require('fs');
const readline = require('readline');

const logFilePath = 'C:\\Users\\upris\\.gemini\\antigravity\\brain\\2147ffbd-752b-4024-a122-61e0cb883110\\.system_generated\\logs\\transcript.jsonl';

async function search() {
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
        console.log(`Line ${lineCount}: step_index=${obj.step_index}, type=${obj.type}, source=${obj.source}`);
        if (obj.content && obj.content.includes("Guide d'Intégration UI/UX")) {
          console.log("FOUND IT! Content length:", obj.content.length);
          fs.writeFileSync('C:\\Users\\upris\\content-osv2\\Vectra OS\\apps\\web\\ui_guidelines_extracted.md', obj.content);
          console.log("Wrote to ui_guidelines_extracted.md");
          return;
        }
      } catch (err) {}
    }
  }
}

search();
