export class EditorInternalErrorHelper {
  static createError(message: string): Error {
    return new Error(message)
  }
}
