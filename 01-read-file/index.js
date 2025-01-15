const { createReadStream } = require('fs');
const path = require('path');
const { stdout } = process;

const file = path.join(__dirname, 'text.txt');

const readStream = createReadStream(file);
let fileData = '';
readStream.on('data', (data) => {
  fileData += data;
});
readStream.on('end', () => stdout.write(fileData));
readStream.on('error', (err) => console.log('Error: ', err.message));
