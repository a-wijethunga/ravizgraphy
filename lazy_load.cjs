const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src/components');

function processDirectory(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;
      
      // Add loading="lazy" and decoding="async" to img and motion.img if not present
      newContent = newContent.replace(/<(img|motion\.img)([^>]+)>/g, (match, tag, attrs) => {
        let newAttrs = attrs;
        if (!newAttrs.includes('loading=')) {
          newAttrs = ' loading="lazy"' + newAttrs;
        }
        if (!newAttrs.includes('decoding=')) {
          newAttrs = ' decoding="async"' + newAttrs;
        }
        return `<${tag}${newAttrs}>`;
      });
      
      // Same for iframe
      newContent = newContent.replace(/<iframe([^>]+)>/g, (match, attrs) => {
        let newAttrs = attrs;
        if (!newAttrs.includes('loading=')) {
          newAttrs = ' loading="lazy"' + newAttrs;
        }
        return `<iframe${newAttrs}>`;
      });

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated images/iframes in: ${fullPath}`);
      }
    }
  });
}

processDirectory(directoryPath);
