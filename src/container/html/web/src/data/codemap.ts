export const codemap = {
  installation: {
    npm: `$ npm init @rocketbean/chasi-ts`,
    installcli: `$ npm i -g @rocketbean/create-chasi`,
    cli: `$ chasi init`
  },
  gettingStarted: {
    localBoot: `$ npm run dev`,
    manualBoot: `$ tsc -w`,
    manualBootNode: `$ node ./dist/server.js`,
  },
  server: {
    configuration: {
      hooks: {
        beforeApp: `
export default <serverConfig> {
  hooks: {
    beforeApp: async (getConfig: Function): void => {
      /** getConfig()
       * function to get a
       * <serviceProvider>config.
       * */
      const someconfig = getConfig("someconfig");
      // do something here
    }
  }
}`
      },
      modes: {
        serverModeConfig: `
export default <serverConfig> {
  environment: <string>'environmentname', // activates the 'environmentname'
  modes: {
    /** 
     * configure 
     * <env> options
     * */
    environmentname: {
      key: 'path/to/key',
      cert: 'path/to/certificate',
      protocol: "https", // or "http"
    }
  }
}`
      }
    }
  },
  router: {
    routerNamespace: `
import Route from "../../package/statics/Route.js";
export default (route: Route) => {
  route.group({ prefix: "user" }, () => {
    route.get("/", "UserController@create");
    route.post("create", "UserController@create");
    route.get("/:user", "UserController@index");
  });
};`,
  routeGroup: `
import Route from "../../package/statics/Route.js";

export default (route: Route) => {

  route.group({ 
    prefix: "post", 
    controller: "posts@PostController",
    before: async (req, res, data) => {
      /**
       * do something here before  
       * processing the request.
       * @param req<RequestObject>
       * @param res<ResponseObject>
       * @param data -> must be invoked in order to gain
       * access in router[data] declared in 
       * <RouterConfigInterface>[data] property
       */
      Logger.log(data())
    },
    after: async (req, res) => {
      /**
       * do something here
       * before sending 
       * the response back to the client.
       */
    }
  }, 
    () => {
      route.post("/", "create");
      route.get("/:postid", "index");
      route.delete("/:postid", "delete");
  });
};`,
  rgpController: `
import Route from "../../package/statics/Route.js";

export default (route: Route) => {
  route.group({ 
    prefix: "post", 
    controller: "posts@PostController"
  }, () => {
    // [↓] this will be translated to 
    // "posts/PostController@index"
    route.post("/", "index"); 
    route.get("/:postId", "create");
    route.delete("/:postId", "delete");
    // [↓] this will be "posts/CommentController@list"
    route.get(":postId/comments", "CommentController@list"); 
  });
};`
  },
  controller: {
    implementation: {
      controller: `
import Controller from "../../package/statics/Controller.js";
export default class UserController extends Controller {
  get user() {
    return this.models.user;
  }

  async create(request, response) {
    // maybe add some validations here ?
    return await this.user.create({...request.body})
  }

  async index(request, response) {
    return await this.user.findOne({id: request.params.user})
  }

  async list(request, response) {
    return await this.user.find({})
  }

  async delete(request, response) {
    return await request.params.__user.delete()
  }


  async update(request, response) {
    let user = request.params.__user;
    // maybe add some validations here ?
    user = Object.assign(user, request.body)
    return await user.save();
  }
}`,
      router: `
import Route from "../../package/statics/Route.js";

export default (route: Route) => {
  route.group({ prefix: "user", controller: "@UserController"}, () => {
      route.post("/", "create");
      route.get("/", "list");
      route.get("/:user", "index");
      route.patch("/:user", "update");
      route.delete("/:user", "delete");
  });
};
`,
      model: `
import Model from "../../package/statics/Model.js";
import mongoose from "mongoose";
import bc from "bcryptjs";

export type UserModelSchema = {
  name: string;
  password: string;
  alias: string;
  email: string;
};

var userSchema = new mongoose.Schema<UserModelSchema>({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  password: {
    type: String,
    trim: true,
    minlength: 6,
    validate(v) {
      if (v.toLowerCase().includes("password"))
        throw new Error("entry with the word 'password' cannot be used. ");
    },
  },

  alias: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
  },
});

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bc.hash(user.password, 8);
  }
  next();
});


const User = Model.connect("user", userSchema);
export default User;`
    },
    gettingModelServices:`
import Controller from "../../../package/statics/Controller.js";

export default class PostController extends Controller {
  get user() {
    return this.models.user;
  }

  get user() {
    return this.models.user;
  }
}`,

  },
  database: {
    config: {
      connections: `
connections: {
  local: {
    driver: "mongodb",
    url: process.env.dbUrl,
    db: process.env.dbName,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 4000,
      socketTimeoutMS: 4000,
      serverSelectionTimeoutMS: 5000,
    },
  },
},
`
    }
  }
}