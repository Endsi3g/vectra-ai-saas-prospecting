const fs = require('fs');
const path = require('path');
const readline = require('readline');

const brainDir = 'C:\\Users\\upris\\.gemini\\antigravity\\brain';

async function search() {
  console.log("Starting search for Nylas across all conversations...");
  const files = fs.readdirSync(brainDir);
  for (const file of files) {
    const fullPath = path.join(brainDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      const transcriptPath = path.join(fullPath, '.system_generated', 'logs', 'transcript.jsonl');
      if (fs.existsSync(transcriptPath)) {
        console.log(`Searching in conversation ${file} (size: ${fs.statSync(transcriptPath).size} bytes)...`);
        const fileStream = fs.createReadStream(transcriptPath);
        const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity
        });

        let lineNum = 0;
        for await (const line of rl) {
          lineNum++;
          if (line.includes("nyk_v0_hXl") || line.includes("63917b1a") || line.includes("d12165a7")) {
            try {
              const obj = JSON.parse(line);
              console.log(`  Match on line ${lineNum}: type=${obj.type}, source=${obj.source}, contentPrefix=${(obj.content || '').substring(0, 100).replace(/\n/g, ' ')}`);
            } catch (err) {
              console.log(`  Match on line ${lineNum} but parse failed`);
            }
          }
        }
      }
    }
  }
  console.log("Search finished.");
}

search();
