const path = require('path');
const { readdir, writeFile, appendFile, readFile } = require('fs/promises');
const { exit } = require('process');

const setErr = (err) => {
  console.log('Error: ', err.message);
  exit();
};

const stylesDirPath = path.join(__dirname, 'styles');
const stylesBundlePath = path.join(__dirname, 'project-dist', 'bundle.css');

const appendData = async (arr) => {
  if (!arr.length) return null;
  try {
    const filePath = path.join(arr[0].path, arr[0].name);
    const data = await readFile(filePath);
    const isAppendFile = await appendFile(stylesBundlePath, data);
    if (!isAppendFile) return appendData(arr.slice(1));
    throw new Error(`Something wrong with ${filePath}`);
  } catch (err) {
    setErr(err);
  }
};

const concatStyles = async () => {
  try {
    const files = await readdir(stylesDirPath, { withFileTypes: true });
    const cssFiles = files.filter(
      (item) => item.isFile() && path.extname(item.name) === '.css',
    );
    if (cssFiles.length) {
      const bundle = await writeFile(stylesBundlePath, '');
      if (!bundle) {
        appendData(cssFiles).then((data) => {
          if (data === null)
            console.log(
              `CSS files from folder  ${stylesDirPath} put in ${stylesBundlePath}`,
            );
        });
      }
    }
  } catch (err) {
    setErr(err);
  }
};

concatStyles();
