const specs = {
  signin: {
    summary: "Sign in and receive a JWT",
    security: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["email", "pass"],
            properties: {
              email: { type: "string", format: "email" },
              pass: { type: "string", format: "password" },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Authenticated user with JWT token",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/test:user" },
                token: { type: "string" },
              },
            },
          },
        },
      },
      401: { description: "Wrong credentials" },
      422: { description: "Missing email or password" },
    }
  },
  signup: {
    summary: "Register a new user (MongoDB)",
    security: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["name", "email", "alias", "password"],
            properties: {
              name: { type: "string" },
              email: { type: "string", format: "email" },
              alias: { type: "string" },
              password: { type: "string", format: "password", minLength: 6 },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Created user",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/test:user" },
          },
        },
      },
      400: { description: "Email already exists" },
    }
  },
  forget: {
    summary: "Drop user collection (test mode only)",
    security: [],
    responses: {
      200: { description: "Collection dropped" },
    },
  }
}

export default specs;