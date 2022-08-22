import fs from "fs";

export default async (dir, content) => {
  return new Promise(async (resolve, reject) => {
    fs.writeFileSync(dir, content);
    resolve(1);
  });
};
