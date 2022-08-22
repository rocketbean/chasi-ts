import fs from "fs";

export default async (dir) => {
  return new Promise((resolve, reject) => {
    fs.readFile(dir, (err, data) => {
      if (err) reject(data);
      resolve(data.toString());
    });
  });
};
