const path = require('path');
const {
  mkdir,
  writeFile,
  readFile,
  readdir,
  copyFile,
  rm,
  appendFile,
} = require('fs/promises');
const { exit } = require('process');
const { access } = require('fs');

const setErr = (err) => {
  console.log('Error: ', err.message);
  exit();
};

const buildDirPath = path.join(__dirname, 'project-dist');
const componentsDirPath = path.join(__dirname, 'components');
const assetsDirPath = path.join(__dirname, 'assets');
const stylesDirPath = path.join(__dirname, 'styles');
const templatePath = path.join(__dirname, 'template.html');

const copyFiles = (files, newDirAddr, isCopingDirs) => {
  mkdir(newDirAddr, { recursive: true }).then(() => {
    files.forEach((file) => {
      if (file.isFile()) {
        const fileName = file.name;
        copyFile(
          path.join(file.path, fileName),
          path.join(newDirAddr, fileName),
        );
      } else if (isCopingDirs) {
        copyDir(
          path.join(file.path, file.name),
          path.join(newDirAddr, file.name),
        );
      }
    });
  });
};
const delFiles = async (files, newDirAddr) => {
  try {
    if (!files.length) return null;

    const dataFileName = files[0].name;
    const isFiles = files[0].isFile();
    if (isFiles) {
      const isRemoved = await rm(path.join(newDirAddr, dataFileName));
      if (isRemoved === undefined) return delFiles(files.slice(1), newDirAddr);
    } else {
      return delFiles(files.slice(1), files[0].path);
    }

    throw new Error(
      `Something wrong with ${path.join(files[0].path, dataFileName)}`,
    );
  } catch (err) {
    setErr(err);
  }
};
const copyDir = (dirAddr, newDirAddr, isCopingDirs) => {
  readdir(dirAddr, { withFileTypes: true })
    .then((files) => {
      if (files && Array.isArray(files)) {
        access(newDirAddr, (err) => {
          if (!err) {
            readdir(newDirAddr, { withFileTypes: true })
              .then((data) => {
                if (data && Array.isArray(data)) {
                  return delFiles(data, newDirAddr);
                }
              })
              .then(() => {
                copyFiles(files, newDirAddr, isCopingDirs);
              });
          } else copyFiles(files, newDirAddr, isCopingDirs);
        });
      } else throw new Error('no data');
    })
    .catch((err) => setErr(err));
};

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

const getCompData = async (match) => {
  try {
    const compName = match.slice(2, -2);
    const compText = await readFile(
      path.join(componentsDirPath, `${compName}.html`),
      { encoding: 'utf8' },
    );
    return compText;
  } catch (err) {
    setErr(err);
  }
};

const replaceCompInHtml = async (text, matches) => {
  try {
    if (!matches || !matches.length) return text;
    const compData = await getCompData(matches[0]);
    const newText = await text.replace(matches[0], compData);
    return replaceCompInHtml(newText, matches.slice(1));
  } catch (err) {
    setErr(err);
  }
};

const buildPage = async () => {
  try {
    await mkdir(buildDirPath, { recursive: true });
    const template = await readFile(templatePath, { encoding: 'utf8' });
    const htmlMatches = await template.match(/\{\{\w+\}\}/g);

    const newHtmlText = await replaceCompInHtml(template, htmlMatches);
    await writeFile(path.join(buildDirPath, 'index.html'), newHtmlText);
    await concatStyles(stylesDirPath, path.join(buildDirPath, 'styles.css'));
    await copyDir(assetsDirPath, path.join(buildDirPath, 'assets'), true);
    console.log('Build is ready!');
  } catch (err) {
    setErr(err);
  }
};

buildPage();
