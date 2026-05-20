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
    // We want to find the user input that contains the Nylas credentials and instructions
    // but isn't our own script files.
    if (line.includes('d12165a7-6c3b-4efc-a754-e9fdb60833fe') && line.includes('Guide d\'Intégration UI/UX')) {
      try {
        const obj = JSON.parse(line);
        // Find where the content is
        let content = obj.content || '';
        if (!content && obj.tool_calls) {
          content = JSON.stringify(obj.tool_calls);
        }
        
        console.log(`Line ${lineCount}: Found step of type=${obj.type}, source=${obj.source}, content length=${content.length}`);
        
        // Write the content to a file
        const targetPath = path.join(__dirname, 'ui_guidelines_extracted.md');
        fs.writeFileSync(targetPath, content);
        console.log(`Successfully wrote extracted guidelines to ${targetPath}`);
        return;
      } catch (err) {
        console.error(`Error parsing line ${lineCount}:`, err);
      }
    }
  }
  console.log("Finished reading file. No matching line found with both client ID and Guide d'Intégration UI/UX.");
}

extract();
