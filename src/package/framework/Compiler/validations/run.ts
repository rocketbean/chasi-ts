import { exec } from "child_process";

export default async (command, callback) => {
  return new Promise((resolve, reject) => {
    exec(command, function (error, stdout, stderr) {
      if (error) reject(stderr + "\n");
      callback(stdout + "\n");
      resolve(1);
    });
  });
};
