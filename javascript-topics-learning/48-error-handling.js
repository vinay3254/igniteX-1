// Topic 48: Error handling

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

function parseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Invalid JSON:', error.message);
    throw error;
  }
}
parseJSON('{"ok":true}');
