const { createWriteStream } = require('fs');
const path = require('path');
const { stdout, stdin, exit } = process;

console.log('Greetings! Please, enter some text...');

const file = path.join(__dirname, 'text.txt');
const output = createWriteStream(file);
const setBuy = () => stdout.write('Goodbye!');

stdin.on('data', (data) => {
  if (data.toString().trim() === 'exit') exit();
  output.write(data);
});
process.on('SIGINT', () => exit());
process.on('exit', () => setBuy());
