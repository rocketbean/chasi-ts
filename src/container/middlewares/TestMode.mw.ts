export default async (request, response, next) => {
    if(!__isTest()) {
      response.status(404).send("page not found.")
    } else next();
  };