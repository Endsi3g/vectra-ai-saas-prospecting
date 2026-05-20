const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logFilePath = 'C:\\Users\\upris\\.gemini\\antigravity\\brain\\2147ffbd-752b-4024-a122-61e0cb883110\\.system_generated\\logs\\transcript.jsonl';

async function findInstructions() {
  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('d12165a7-6c3b-4efc-a754-e9fdb60833fe')) {
      const obj = JSON.parse(line);
      console.log("FOUND USER INPUT:");
      console.log(obj.content);
      // Write it to a file for easy viewing
      fs.writeFileSync('C:\\Users\\upris\\content-osv2\\Vectra OS\\apps\\web\\nylas_ui_instructions.md', obj.content);
      console.log("Written to apps/web/nylas_ui_instructions.md");
      break;
    }
  }
}

findInstructions();
