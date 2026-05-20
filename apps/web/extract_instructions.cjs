const fs = require('fs');

const logFilePath = 'C:\\Users\\upris\\.gemini\\antigravity\\brain\\2147ffbd-752b-4024-a122-61e0cb883110\\.system_generated\\logs\\transcript.jsonl';

function findInstructions() {
  const content = fs.readFileSync(logFilePath, 'utf8');
  console.log("File length:", content.length);
  
  let pos = 0;
  let count = 0;
  while ((pos = content.indexOf('d12165a7-6c3b-4efc-a754-e9fdb60833fe', pos)) !== -1) {
    count++;
    console.log(`Match ${count} at pos ${pos}`);
    // Print 100 characters before and 1000 characters after
    const start = Math.max(0, pos - 100);
    const end = Math.min(content.length, pos + 1000);
    console.log("Context:", content.substring(start, end));
    pos += 1;
  }
}

findInstructions();
