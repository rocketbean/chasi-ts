import { describe, expect, test, beforeAll } from 'vitest'
import request from "supertest"
import instance from "../src/server"
import * as userMock from "./mocks/user.json"
let app = instance.$app.$server

console.clear()
let users = userMock.users
describe("[Test]/Users endpoint", async () => {
  beforeAll(async () =>{ 
    let res = await request(app).post("/api/users/forget").send()
  })
  
  describe("[POST /signup]", async () => {
    test("must be able to signup", async() => {
      let res = await request(app).post("/api/users/signup").send(users[0])
      expect(res.statusCode).toBe(200)
    })
  })

  describe("[POST /signin]", async () => {
    test("must return an error when params is missing", async() => {
      let res = await request(app).post("/api/users/signin").send({email: "asdf", body: "asdf"})
      expect(res.statusCode).toBe(422)
      expect(res.body.message).toBe("missing required parameters['email','password']")
    })

    test("must return a valid token", async() => {
      let res = await request(app).post("/api/users/signin").send({email:users[0].email, pass: users[0].password})
      expect(res.statusCode).toBe(200)
      expect(res.body.user.email).toBe(users[0].email)
      expect(res.body).toHaveProperty("token")
    })
  })
})
