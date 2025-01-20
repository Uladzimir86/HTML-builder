const path = require('path');
const { readdir, writeFile, appendFile, readFile } = require('fs/promises');

const { setErr, isNotSideEffectCheck } = require('../04-copy-directory/index');

const appendData = async (arr, bundlePath) => {
  if (!arr.length) return null;
  try {
    const filePath = path.join(arr[0].path, arr[0].name);
    const data = await readFile(filePath);
    const isAppendFile = await appendFile(bundlePath, data);
    if (!isAppendFile) return appendData(arr.slice(1), bundlePath);
    throw new Error(`Something wrong with ${filePath}`);
  } catch (err) {
    setErr(err);
  }
};

const concatStyles = async (stylesDirPath, stylesBundlePath) => {
  try {
    const files = await readdir(stylesDirPath, { withFileTypes: true });
    const cssFiles = files.filter(
      (item) => item.isFile() && path.extname(item.name) === '.css',
    );
    if (cssFiles.length) {
      const bundle = await writeFile(stylesBundlePath, '');
      if (!bundle) {
        return appendData(cssFiles, stylesBundlePath).then(() =>
          console.log(
            `CSS files from folder  ${stylesDirPath} put in ${stylesBundlePath}`,
          ),
        );
      }
    }
  } catch (err) {
    setErr(err);
  }
};

const stylesDirPath = path.join(__dirname, 'styles');
const stylesBundlePath = path.join(__dirname, 'project-dist', 'bundle.css');

if (isNotSideEffectCheck(__dirname))
  concatStyles(stylesDirPath, stylesBundlePath);

module.exports = { concatStyles };
