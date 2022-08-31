export default async (request, response, next) => {
  console.log("this is from user middleware");
  next();
};
