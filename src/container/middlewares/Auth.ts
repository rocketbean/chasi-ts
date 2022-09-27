export default async (request, response, next) => {
  Logger.log("fired:: Auth mw", process.pid);
  next();
};
