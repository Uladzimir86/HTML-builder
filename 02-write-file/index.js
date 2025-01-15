const { createWriteStream } = require('fs');
const path = require('path');
const { stdout, stdin, exit } = process;

const file = path.join(__dirname, 'text.txt');
const output = createWriteStream(file);
const setBuy = () => stdout.write('Goodbye!');

stdin.on('start', () => stdout.write('Greetings! Please, enter some text...'));
stdin.on('data', (data) => {
  if (data.toString().trim() === 'exit') exit();
  output.write(data);
});
stdin.on('end', () => setBuy());
process.on('exit', () => setBuy());
