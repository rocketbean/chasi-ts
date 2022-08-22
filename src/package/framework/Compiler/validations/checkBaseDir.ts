import fs from "fs";

export default async (dir) => {
  return new Promise((resolve, reject) => {
    fs.promises
      .access(dir, fs.constants.F_OK)
      .catch(async (err) => {
        if (err) {
          await fs.mkdir(dir, (err) => {
            if (err) reject(`cannot create directory ${dir}, ${err}`);
          });
          resolve(1);
        }
      })
      .then(() => {
        resolve(1);
      });
  });
};
