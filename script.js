/**
 * merge-tips.js
 * ------------------------------------------------
 * This script merges "VS Code GUI Tip" and "Azure DevOps Tip"
 * sub-items into their parent description as Markdown notes.
 * ------------------------------------------------
 */

import fs from 'fs';

// ------------ CONFIGURATION ------------
const INPUT_FILE = 'public/json/content.json'; // your current full JSON file
const OUTPUT_FILE = 'public/json/content-merged.json';
// ---------------------------------------

/**
 * Creates a blockquote text line for the merged tip.
 */
function formatTip(title, description) {
  const label = title.replace(/Tip$/i, 'Tip').trim();
  return `\n\n> **${label}:** ${description.trim()}`;
}

/**
 * Recursively traverses items, merging 'VS Code GUI Tip' and 'Azure DevOps Tip' children.
 */
function mergeTips(items = []) {
  for (const item of items) {
    if (Array.isArray(item.items) && item.items.length > 0) {
      const tips = item.items.filter((sub) => /(VS Code|Azure DevOps).*Tip/i.test(sub.title));
      const others = item.items.filter((sub) => !/(VS Code|Azure DevOps).*Tip/i.test(sub.title));

      // If we found any tip items, merge their descriptions
      if (tips.length > 0) {
        let newDescription = item.description || '';
        for (const tip of tips) {
          newDescription += formatTip(tip.title, tip.description);
        }
        item.description = newDescription.trim();
        item.items = others;
      }

      // Recurse
      mergeTips(item.items);
    }
  }
  return items;
}

/**
 * MAIN EXECUTION
 */
try {
  const raw = fs.readFileSync(INPUT_FILE, 'utf-8');
  const data = JSON.parse(raw);

  const merged = mergeTips(data);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2), 'utf-8');

  console.log(`✅ Successfully merged tips!`);
  console.log(`Output saved to: ${OUTPUT_FILE}`);
} catch (err) {
  console.error('❌ Error processing:', err.message);
}
