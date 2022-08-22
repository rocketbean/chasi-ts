import fs from "fs";
export const defaultPackage = {
  name: process.env.npm_package_version,
  version: process.env.npm_package_version,
  dependencies: {},
};
export default async (dir, content) => {
  return new Promise((resolve, reject) => {
    fs.promises
      .access(dir, fs.constants.F_OK)
      .catch(async (err) => {
        if (err) {
          content = JSON.stringify(
            Object.assign(defaultPackage, content),
            null,
            2,
          );
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
