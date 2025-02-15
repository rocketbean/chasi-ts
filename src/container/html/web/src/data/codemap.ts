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
  },
  testing:{
    vitestConfig: `
/// <reference types="vitest" />
import { defineConfig} from 'vitest/config'
import { loadEnv } from 'vite'

export default defineConfig({
  test: {
    exclude: ['dist/*', "node_modules"],
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    env: loadEnv('test', process.cwd() + "/test", "")
  },
})`,
    env: 
`## environment ##
testMode="enabled"
environment=<SERVER_ENVIRONMENT>
ServerPort=<SERVER_PORT>


## app ##
database=<DB_REGISTRY>
testDatabaseName=<DB_NAME>
dbConStringTest=<DB_CONNECTION_STRING>

## log controls ##
Log_History=false
Log_Level=0`,
    usage: {
      initial: `import { describe } from 'vitest'
import request from "supertest"
import instance from "../src/server"
let app = instance.$app.$server

console.clear();
describe("[api]/Users endpoint", async () => {
  const basepath = "/api/users"
})
`,
      signup: `import { describe, expect, test } from 'vitest'
import request from "supertest"
import instance from "../src/server"
let app = instance.$app.$server

console.clear();
describe("[api]/Users endpoint", async () => {
  const basepath = "/api/users"

  describe("[POST /signup]", async () => {
    test("status 200: must be able to signup", async() => {
      let res = await request(app).post(basepath + "/signup")
      .send({
        "name": "test user",
        "password": "securepass",
        "alias": "test",
        "email": "test@test.com"
      })
      expect(res.statusCode).toBe(200)
    })
  })
})`,
    signin: `import { describe, expect, test } from 'vitest'
import request from "supertest"
import instance from "../src/server"
let app = instance.$app.$server

console.clear();
const user = {
  "name": "test user",
  "password": "securepass",
  "alias": "test",
  "email": "test@test.com"
}

describe("[api]/Users endpoint", async () => {
  const basepath = "/api/users"
  describe("[POST /signup]", async () => {
    test("status 200: must be able to signup", async() => {
      let res = await request(app).post(basepath + "/signup")
      .send(user)
      expect(res.statusCode).toBe(200)
    })
  })
})

describe("[POST /signin]", async () => {
  test("status 422: must return an error when params is missing", async() => {
    let res = await request(app).post(basepath + "/signin").send({email: "testemail@test.com"})
    expect(res.statusCode).toBe(422)
    expect(res.body.message).toBe("missing required parameters['email','password']")
  })

  test("status 200: must return a valid token", async() => {
    let res = await request(app).post(basepath + "/signin").send({email:user.email, pass: user.password})
    expect(res.statusCode).toBe(200)
    expect(res.body.user.email).toBe(user.email)
    expect(res.body).toHaveProperty("token")
  })
})`,
    addBeforeAll: `import { describe, expect, test, beforeAll } from 'vitest'
    import request from "supertest"
    import instance from "../src/server"
    let app = instance.$app.$server
    
    console.clear();
    const basepath = "/api/users"
    const user = {
      "name": "test user",
      "password": "securepass",
      "alias": "test",
      "email": "test@test.com"
    }

    beforeAll(async () =>{ 
      //endpoint to drop user collections before the test begin
      await request(app).post(basepath+"/forget").send()
    })
    
    describe("[api]/Users endpoint", async () => {
      describe("[POST /signup]", async () => {
        test("status 200: must be able to signup", async() => {
          let res = await request(app).post(basepath + "/signup")
          .send(user)
          expect(res.statusCode).toBe(200)
        })
      })
    })
    
    describe("[POST /signin]", async () => {
      test("status 422: must return an error when params is missing", async() => {
        let res = await request(app).post(basepath + "/signin").send({email: "testemail@test.com"})
        expect(res.statusCode).toBe(422)
        expect(res.body.message).toBe("missing required parameters['email','password']")
      })
    
      test("status 200: must return a valid token", async() => {
        let res = await request(app).post(basepath + "/signin").send({email:user.email, pass: user.password})
        expect(res.statusCode).toBe(200)
        expect(res.body.user.email).toBe(user.email)
        expect(res.body).toHaveProperty("token")
      })
    })`,
    onSuccessTest: `$ npm run test
RERUN  test/user.test.ts x2

✓ test/user.test.ts (3)
  ✓ [api]/Users endpoint (1)
    ✓ [POST /signup] (1)
      ✓ status 200: must be able to signup
  ✓ [POST /signin] (2)
    ✓ status 422: must return an error when params is missing
    ✓ status 200: must return a valid token

Test Files  1 passed (1)
      Tests  3 passed (3)
  Start at  10:32:40
  Duration  510ms


PASS  Waiting for file changes...
      press h to show help, press q to quit`
    }
  }
}