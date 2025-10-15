const fs = require('fs');
const path = require('path');

// Read the content.json file
const jsonPath = path.join(__dirname, 'public', 'json', 'new-content.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let idCounter = 1;

// Recursive function to reassign IDs
function reassignIds(items) {
  items.forEach((item) => {
    item.id = idCounter++;
    if (item.items && item.items.length > 0) {
      reassignIds(item.items);
    }
  });
}

console.log('Before: Total items with IDs:', countAllItems(data));

// Reassign all IDs
reassignIds(data);

console.log('After: Total items with IDs:', countAllItems(data));
console.log('New ID range: 1 to', idCounter - 1);

// Write back to file
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
console.log('\n✅ Successfully reassigned all IDs in content.json');

// Helper function to count all items
function countAllItems(items) {
  let count = 0;
  items.forEach((item) => {
    count++;
    if (item.items && item.items.length > 0) {
      count += countAllItems(item.items);
    }
  });
  return count;
}
