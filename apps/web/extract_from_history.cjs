const fs = require('fs');
const path = require('path');

function extract() {
  const historyPath = path.join(__dirname, 'history_step_content.txt');
  if (!fs.existsSync(historyPath)) {
    console.error("history_step_content.txt does not exist!");
    return;
  }
  const content = fs.readFileSync(historyPath, 'utf8');
  console.log("History content length:", content.length);
  
  const searchStr = 'd12165a7-6c3b-4efc-a754-e9fdb60833fe';
  const pos = content.indexOf(searchStr);
  if (pos === -1) {
    console.log("Could not find Nylas client ID in history content.");
    return;
  }
  
  console.log(`Found client ID at index ${pos}`);
  
  // Let's find the start of the instructions. The user's prompt was:
  // "9. Voici ma cle API de Nylas ; nyk_v0_hXlOGTOUj2hlnJ6fIFQ8we00aBqjM2R3fNvZLYJeLHzhg7jKtYE7Hzx31JEdXJDg +Account added! ... et recrée la section de la premiere image fournie avec la 2e image avec ces instructions que tu vas prendre..."
  // The guide starts with "# 📘 Guide d'Intégration UI/UX : Clone d'Interface SaaS" or similar.
  const guideStartStr = "# 📘 Guide";
  const guideStartPos = content.indexOf(guideStartStr, pos);
  
  if (guideStartPos === -1) {
    console.log("Could not find '# 📘 Guide' starting from the client ID. Searching from start of file...");
    const guideStartPos2 = content.indexOf(guideStartStr);
    if (guideStartPos2 === -1) {
      console.log("Could not find '# 📘 Guide' anywhere in the file.");
      // Just output 20k characters after the client ID
      const extracted = content.substring(pos, pos + 25000);
      fs.writeFileSync(path.join(__dirname, 'nylas_ui_instructions.md'), extracted);
      console.log("Wrote 25k characters from client ID to nylas_ui_instructions.md");
      return;
    } else {
      const extracted = content.substring(guideStartPos2);
      fs.writeFileSync(path.join(__dirname, 'nylas_ui_instructions.md'), extracted);
      console.log("Wrote from '# 📘 Guide' to the end of file in nylas_ui_instructions.md");
    }
  } else {
    const extracted = content.substring(guideStartPos);
    fs.writeFileSync(path.join(__dirname, 'nylas_ui_instructions.md'), extracted);
    console.log("Wrote from '# 📘 Guide' to the end of file in nylas_ui_instructions.md");
  }
}

extract();
