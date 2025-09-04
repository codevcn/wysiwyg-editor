export class EditorErrorHelper {
  static createError(message: string): Error {
    return new Error(message)
  }
}
