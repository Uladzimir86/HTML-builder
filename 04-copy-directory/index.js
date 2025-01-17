const path = require('path');
const { readdir, mkdir, copyFile, rm } = require('fs/promises');
const { access } = require('fs');
const { exit } = require('process');

const setErr = (err) => {
  console.log('Error: ', err.message);
  exit();
};

const dirAddr = path.join(__dirname, 'files');
const newDirAddr = path.join(__dirname, 'files-copy');

const copyDir = (files) => {
  mkdir(newDirAddr, { recursive: true }).then(() => {
    files.forEach((file) => {
      if (file.isFile()) {
        const fileName = file.name;
        copyFile(path.join(dirAddr, fileName), path.join(newDirAddr, fileName));
      }
    });
  });
};

readdir(dirAddr, { withFileTypes: true })
  .then((files) => {
    if (files && Array.isArray(files)) {
      access(newDirAddr, (err) => {
        if (!err) {
          readdir(newDirAddr, { withFileTypes: true })
            .then((data) => {
              if (data && Array.isArray(data)) {
                data.forEach((dataFile) => {
                  const dataFileName = dataFile.name;
                  rm(path.join(newDirAddr, dataFileName));
                });
              }
            })
            .then(() => copyDir(files));
        } else copyDir(files);
      });
    } else throw new Error('no data');
  })
  .catch((err) => setErr(err));
