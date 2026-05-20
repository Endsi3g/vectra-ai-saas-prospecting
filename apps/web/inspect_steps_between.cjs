const fs = require('fs');
const readline = require('readline');

const logFilePath = 'C:\\Users\\upris\\.gemini\\antigravity\\brain\\2147ffbd-752b-4024-a122-61e0cb883110\\.system_generated\\logs\\transcript.jsonl';

async function inspect() {
  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (lineCount >= 710 && lineCount <= 765) {
      try {
        const obj = JSON.parse(line);
        console.log(`Line ${lineCount}: step_index=${obj.step_index}, type=${obj.type}, source=${obj.source}, contentPrefix=${(obj.content || '').substring(0, 50).replace(/\n/g, ' ')}`);
      } catch (err) {}
    }
  }
}

inspect();
