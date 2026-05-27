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
  logger: {
    methods: `
// Logger is a global — no import needed anywhere in your app.
// All methods accept multiple arguments and pretty-print objects.

Logger.log("Server initialized")         // plain, no prefix

Logger.info("Listening on port", 3000)   // ℹ  cyan

Logger.warn("Deprecation: use newMethod()")  // ⚠  yellow

Logger.error("DB connection failed", err)    // ✖  red on black
`
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
    },
    drizzle: {
      connection: `
// src/config/database.ts
connections: {
  // PostgreSQL  →  npm i pg @types/pg
  pg: {
    driver: "drizzle",
    url: process.env.PG_URL,   // "postgresql://user:pass@host:5432/db"
    options: {
      adapter: "node-postgres",
      schema: "./container/drizzle/schema",
    },
  },

  // SQLite  →  npm i better-sqlite3 @types/better-sqlite3
  sqlite: {
    driver: "drizzle",
    url: "./data/app.db",      // file path, or ":memory:"
    options: {
      adapter: "better-sqlite3",
      schema: "./container/drizzle/schema",
    },
  },

  // MySQL  →  npm i mysql2  (client-based: pass via globals.client)
  mysql: {
    driver: "drizzle",
    url: process.env.MYSQL_URL,
    options: {
      adapter: "mysql2",
      schema: "./container/drizzle/schema",
      globals: { client: mysqlConnection },
    },
  },
}`,
      schema: `
// src/container/drizzle/schema.ts
// Use named exports only — no default export.

import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
// MySQL:  import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";
// SQLite: import { sqliteTable, integer, text }  from "drizzle-orm/sqlite-core";

export const users = pgTable("users", {
  id:        serial("id").primaryKey(),
  name:      text("name").notNull(),
  email:     text("email").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id:       serial("id").primaryKey(),
  title:    text("title").notNull(),
  authorId: serial("author_id").references(() => users.id),
});`,
      query: `
import Controller from "../../package/statics/Controller.js";
import { eq } from "drizzle-orm";

export default class UserController extends Controller {

  // Drizzle query client for the "pg" connection
  get db() { return this.models.pg._db; }

  // Table definition loaded from the schema file
  get users() { return this.models.pg.users; }

  async list(request, response) {
    return await this.db.select().from(this.users);
  }

  async index(request, response) {
    const [user] = await this.db
      .select()
      .from(this.users)
      .where(eq(this.users.id, Number(request.params.id)));
    return user;
  }

  async create(request, response) {
    const [created] = await this.db
      .insert(this.users)
      .values(request.body)
      .returning();
    return created;
  }

  async update(request, response) {
    const [updated] = await this.db
      .update(this.users)
      .set(request.body)
      .where(eq(this.users.id, Number(request.params.id)))
      .returning();
    return updated;
  }

  async delete(request, response) {
    await this.db
      .delete(this.users)
      .where(eq(this.users.id, Number(request.params.id)));
    return { deleted: true };
  }
}`,
      modelMethod: `
// Use Model.drizzle() anywhere outside a controller —
// service providers, event handlers, scripts, etc.

import Model from "../../package/statics/Model.js";
import { users } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

// Returns the live Drizzle query client for "pg"
const db = Model.drizzle("pg");

const allUsers  = await db.select().from(users);
const oneUser   = await db.select().from(users).where(eq(users.id, 1));
const [created] = await db.insert(users).values({ name: "Alice", email: "alice@example.com" }).returning();`
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
    },
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
  },
  observer: {
    config: {
      events: `
export default <ObserverConfig>{
  events: {
    // alias → path relative to src/ (no extension)
    authorized: "container/events/Authorize",
  },
  beforeEmit: async function (params) {},
  afterEmit: async function (params) {},
}`,
      beforeEmit: `
// Global hook — runs before every event's fire() (via onemit)
// this = Event instance, params = emit payload
beforeEmit: async function (params) {
  Logger.info("Event starting", params);
}`,
      afterEmit: `
// Global hook — runs after fire() and listeners complete (via emitted)
afterEmit: async function (params) {
  Logger.info("Event finished", params);
}`,
    },
    events: {
      emit: `
// Inside any controller — "authorized" must be in src/config/observer.ts events map

async index() {
  // Fire-and-forget: response returns while the event still runs
  this.$observer.emit("authorized", {
    userId: this.req.user?.id,
    action: "login",
  });
  return this.res.json({ ok: true });

  // Or await when the client must wait for the event to finish:
  // await this.$observer.emit("authorized", { userId: this.req.user?.id });
}`,
      eventClass: `
import Event, { EventInterface } from "../../package/Observer/Event.js";

export default class Authorize extends Event implements EventInterface {
  async validate(params, next) {
    if (!params?.userId) throw new Error("userId required");
    next();
  }

  async fire(params) {
    // side effects: audit log, notify, etc.
    Logger.info("User authorized", params.userId);
  }
}`,
      when: `
// In a service provider boot() — listen for server ready
Provider.$observer.when("__ready__", async (_prop, params) => {
  const server = params.server;
  Logger.info("HTTP server listening", server?.address());
});`,
    }
  }
}