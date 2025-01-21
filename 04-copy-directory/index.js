const path = require('path');
const { readdir, mkdir, copyFile, rm } = require('fs/promises');
const { access } = require('fs');
const { exit, argv } = require('process');

const setErr = (err) => {
  console.log('Error: ', err.message);
  exit();
};

const isNotSideEffectCheck = (dirname) =>
  argv[1].split('\\').at(-1).length === dirname.split('\\').at(-1).length;

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

const dirAddr = path.join(__dirname, 'files');
const newDirAddr = path.join(__dirname, 'files-copy');
if (isNotSideEffectCheck(__dirname)) copyDir(dirAddr, newDirAddr);

module.exports = { copyDir, setErr, isNotSideEffectCheck };
