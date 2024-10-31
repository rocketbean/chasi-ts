export default class CustomError extends Error {
  constructor (public message: string, public status?: number) {
    super(message)
    if(!this.status) this.status = 500
  }
}