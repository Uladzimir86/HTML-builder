const path = require('path');
const { mkdir, writeFile, readFile } = require('fs/promises');

const { concatStyles } = require('../05-merge-styles/index');
const { copyDir, setErr } = require('../04-copy-directory/index');

const buildDirPath = path.join(__dirname, 'project-dist');
const componentsDirPath = path.join(__dirname, 'components');
const assetsDirPath = path.join(__dirname, 'assets');
const stylesDirPath = path.join(__dirname, 'styles');
const templatePath = path.join(__dirname, 'template.html');

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
