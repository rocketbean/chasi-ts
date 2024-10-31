export default async (request, response, next) => {
    if(!__testMode()) {
      response.status(404).send("page not found.")
    } else next();
  };