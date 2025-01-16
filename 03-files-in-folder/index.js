const path = require('path');
const { readdir } = require('fs/promises');
const { stat } = require('fs');
const { exit } = require('process');

const setErr = (err) => {
  console.log('Error: ', err.message);
  exit();
};

const dirAddr = path.join(__dirname, 'secret-folder');

readdir(dirAddr, { withFileTypes: true })
  .then((files) => {
    if (files && Array.isArray(files)) {
      const filesArr = files.map((file) => {
        if (file.isFile()) {
          const fileName = file.name;
          const suf = path.extname(fileName);
          return {
            name: path.basename(fileName, suf),
            ext: suf.slice(1),
            fileName: fileName,
          };
        }
      });
      return filesArr;
    }
    throw new Error('no data');
  })
  .then((filesArr) => {
    filesArr.forEach((file) => {
      if (file) {
        const { name, ext, fileName } = file;
        stat(path.join(dirAddr, fileName), (err, stats) => {
          if (err) setErr(err);
          const size = stats.size;
          console.log(`${name} - ${ext} - ${size}b`);
        });
      }
    });
  })
  .catch((err) => setErr(err));
