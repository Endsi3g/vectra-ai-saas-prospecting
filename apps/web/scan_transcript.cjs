const fs = require('fs');
const readline = require('readline');

const logFilePath = 'C:\\Users\\upris\\.gemini\\antigravity\\brain\\2147ffbd-752b-4024-a122-61e0cb883110\\.system_generated\\logs\\transcript.jsonl';

async function scan() {
  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (line.includes('d12165a7-6c3b-4efc-a754-e9fdb60833fe')) {
      try {
        const obj = JSON.parse(line);
        console.log(`Line ${lineCount}: type=${obj.type}, source=${obj.source}, contentPrefix=${(obj.content || '').substring(0, 100)}`);
      } catch (err) {
        console.log(`Line ${lineCount}: regex match, but parse failed`);
      }
    }
  }
}

scan();
