const fs = require('fs');
const c = fs.readFileSync('public/Cursive-Bl.svg', 'utf8');

// Find all style attributes to understand which paths are fills vs strokes
const pathMatches = c.match(/<path[^>]+>/g) || [];
pathMatches.forEach((p, i) => {
  const style = (p.match(/style="([^"]+)"/) || [])[1] || '';
  const d = (p.match(/ d="([^"]+)"/) || [])[1] || '';
  console.log(`\nPATH ${i}:`);
  console.log('  style:', style);
  console.log('  d (first 200):', d.substring(0, 200));
  console.log('  d length:', d.length);
  // Count sub-paths (M commands)
  const mCount = (d.match(/M/g) || []).length;
  console.log('  Subpaths (M commands):', mCount);
});
