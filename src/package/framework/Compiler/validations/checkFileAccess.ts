import fs from "fs";

export default async (dir, content) => {
  return new Promise((resolve, reject) => {
    fs.promises
      .access(dir, fs.constants.F_OK)
      .catch(async (err) => {
        if (err) {
          await fs.promises.writeFile(dir, content).catch((e) => {
            if (err) reject(`cannot create file: ${dir}, ${e}`);
          });
          resolve(1);
        }
      })
      .then(() => {
        resolve(1);
      });
  });
};
