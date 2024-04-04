# chasi-ts
Chasi TS Framework
CLI: https://www.npmjs.com/package/@rocketbean/chasis
github: https://github.com/rocketbean/chasi-ts

# Chasi
**RESTApi** Framework for **node.js**
this framework implements services such as
- Database
- Routing
- Middlewares
- Services
- Model
- View
- Controller

# Installation
  > fork this repo,
  ```
    $ npm i
  ```
## starting the server
    // after setting up your .env file 
run local development environment
```
  $ npm run dev
```
# Scripts


 *you can install chasi-cli globally by running or you can just run it via npx.*
 > $ npm i -g @rocketbean/chasis

chasi command lines: 

> ### Creating Controller
```
> $ chasis create -c <ControllerName> //using global chasi-cli
> $ npx chasis create -c <ControllerName> //npx
```
  > this will generate your controller inside **./container/controllers/** path, 
  which can be pointed to a certain route in route containers
  **e.g.**  
  ```
route.get("yourpath", "yourcontroller@method");
route.post("yourpath2", "yourcontroller2@method2");

route.group({ prefix: "yourPathPrefix", middleware: [ "yourMiddlewareAlias" ]}, (() => {
    route.post('endpoint', "yourcontroller3@method3");
}));
  ```
<hr/>

> ### Creating  Model
  
```
> $ chasis create -m <ModelName> //using global chasi-cli
> $ npx chasis create -m <ModelName> //npx
```

  > by default, in your **Controller** the registered models is accessible via [this] **this.models**
   you can try to check it out:
  **e.g.**
 ```
this.models.user //inside your controller methods
console.log(this.models) // or try this instead to see the registered models
 ```
 <hr/>
 
  > ### Creating Service Provider
  
```
> $ chasis create -p <ServiceProvider> //using global chasi-cli
> $ npx chasis create -p <ServiceProvider> //npx
```
  > please note that ServiceProviders must be declared in **./config/container** under **ServiceBootstrap** property before it can be utilized, by then it will be registered to the chasi third party container, and will be accessible to any registered controller via the get method
  *e.g.*
```
get yourModule () {
    return this.services.yourModule
}
```
<hr/>

> ### Creating Middleware

```
> $ chasis create -w <middleware> //using global chasi-cli
> $ npx chasis create -w <middleware> //npx
```
  > middlewares must also be registered in **./config/container** under **middlewares** property, before it can
    be attached to any route/ route group/ route container.
  **e.g.**
  ```
route.post("yourpath", "yourcontroller@method").middleware("yourmiddleware");
  ```
  *or you can add in the alias in ./config/services/RouterServiceProvider under middlewares array, this will be applied to all the routes under a routeContainer* 
# View
Chasi utilizes vite for SSR.
please check `./container/html` directorty,
and `./config/compiler` to configure the compiler engine.



# Notes
  as of this moment, MongoDB is the only database it supports, though Databases can be imported directly unto controller,
  so you can have your DB wrapper *(only if you are not using MongoDB as your database)*
  
  Might release a version built with TS. this repo was built in the most simpliest way to support any type of devs.

# Requirements 
this template requires 
- nodejs: ^16.0.0
- mongoDB: ^3.0.0
