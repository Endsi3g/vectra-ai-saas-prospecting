const fs = require('fs');
const path = require('path');
const readline = require('readline');

const brainDir = 'C:\\Users\\upris\\.gemini\\antigravity\\brain';

async function search() {
  const files = fs.readdirSync(brainDir);
  for (const file of files) {
    const fullPath = path.join(brainDir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const transcriptPath = path.join(fullPath, '.system_generated', 'logs', 'transcript.jsonl');
      if (fs.existsSync(transcriptPath)) {
        const fileStream = fs.createReadStream(transcriptPath);
        const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity
        });

        let lineNum = 0;
        for await (const line of rl) {
          lineNum++;
          if (line.includes("Guide d'Int") || line.includes("Barre d'Annonce") || line.includes("Sidebar")) {
            try {
              const obj = JSON.parse(line);
              console.log(`Conv: ${file} | Line ${lineNum} | step_index=${obj.step_index} | type=${obj.type} | source=${obj.source} | length=${(obj.content || '').length}`);
            } catch (err) {
              console.log(`Conv: ${file} | Line ${lineNum} | parse failed`);
            }
          }
        }
      }
    }
  }
}

search();
