export default async (request, response, next) => {
  console.log("fired:: Auth mw", process.pid);
  next();
};
