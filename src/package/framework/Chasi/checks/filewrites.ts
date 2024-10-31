import fs, { constants } from "fs";
import _path from "path";
var writeFile = async (_p) => {
  fs.appendFile(_p, "", (err) => {
    if (err) console.error(err, `failed to write file:: [${_p}]`);
    else {
      console.log(`[WRITER] file written to ${_p}`);
    }
  });
};

export default async (path) => {
  let _p = _path.join(___location + path);
  fs.access(_p, constants.R_OK, async (err) => {
    if (err) {
      if (err.errno == -4058) await writeFile(_p);
      return;
    }
  });
};
