const fs = require('fs');
const path = require('path');

function extract() {
  const linePath = path.join(__dirname, 'matching_conversation_line.txt');
  if (!fs.existsSync(linePath)) {
    console.error("matching_conversation_line.txt does not exist!");
    return;
  }
  const content = fs.readFileSync(linePath, 'utf8');
  try {
    const obj = JSON.parse(content);
    console.log(`Parsed line: step_index=${obj.step_index}, type=${obj.type}, source=${obj.source}`);
    const reqContent = obj.content || '';
    console.log("Length of request content:", reqContent.length);
    fs.writeFileSync(path.join(__dirname, 'nylas_ui_instructions.md'), reqContent);
    console.log("Successfully wrote full request to apps/web/nylas_ui_instructions.md");
  } catch (err) {
    console.error("JSON parse error on matching line:", err);
  }
}

extract();
