const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src', 'models');

function findDuplicateIndexes() {
  console.log('Searching for duplicate timestamp indexes...\n');
  
  if (!fs.existsSync(modelsDir)) {
    console.log('Models directory not found');
    return;
  }
  
  const files = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));
  
  files.forEach(file => {
    const filePath = path.join(modelsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for potential duplicate index patterns
    const hasTimestamps = content.includes('timestamps: true');
    const hasTimestampIndex = content.includes('timestamp') && content.includes('index');
    const hasCreatedAtIndex = content.includes('createdAt') && content.includes('index');
    const hasUpdatedAtIndex = content.includes('updatedAt') && content.includes('index');
    
    if (hasTimestamps && (hasTimestampIndex || hasCreatedAtIndex || hasUpdatedAtIndex)) {
      console.log(`⚠️  Potential duplicate in ${file}:`);
      if (hasTimestampIndex) console.log('   - Found timestamp index');
      if (hasCreatedAtIndex) console.log('   - Found createdAt index');
      if (hasUpdatedAtIndex) console.log('   - Found updatedAt index');
      console.log('   - Also has timestamps: true');
      console.log('');
    }
  });
  
  console.log('Search complete. Remove duplicate indexes from flagged files.');
}

findDuplicateIndexes();
