const fs = require('fs');
const path = require('path');

function inspectSteps() {
  const dir = __dirname;
  const files = fs.readdirSync(dir).filter(f => f.startsWith('nylas_ui_raw_step'));
  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`File: ${file} | Length: ${content.length}`);
    try {
      const obj = JSON.parse(content);
      console.log(`  Keys: ${Object.keys(obj).join(', ')}`);
      if (obj.type) console.log(`  Type: ${obj.type}`);
      if (obj.source) console.log(`  Source: ${obj.source}`);
      if (obj.content) console.log(`  Content prefix: ${obj.content.substring(0, 100)}`);
      if (obj.tool_calls) console.log(`  Has tool_calls`);
    } catch (err) {
      console.log(`  JSON parse failed`);
    }
  }
}

inspectSteps();
