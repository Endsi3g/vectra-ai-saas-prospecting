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
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'CONVERSATION_HISTORY') {
        console.log(`Line ${lineCount}: index=${obj.step_index}, keys=${Object.keys(obj).join(', ')}`);
        // If there's another field or if the whole line is different
        if (line.length > 200) {
          console.log(`  Line length: ${line.length}. Snippet: ${line.substring(0, 300)}`);
        }
      }
    } catch (err) {}
  }
}

search();
