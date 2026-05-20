const fs = require('fs');
const readline = require('readline');

const logFilePath = 'C:\\Users\\upris\\.gemini\\antigravity\\brain\\2147ffbd-752b-4024-a122-61e0cb883110\\.system_generated\\logs\\transcript.jsonl';

async function scanKeys() {
  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (line.includes('nyk_v0_hXl') || line.includes('63917b1a-d25e-44f5-a637-e48b276d5412') || line.includes('d12165a7-6c3b-4efc-a754-e9fdb60833fe')) {
      console.log(`Line ${lineCount}: contains Nylas info. Length: ${line.length}`);
    }
  }
}

scanKeys();
