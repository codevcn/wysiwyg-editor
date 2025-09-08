import { EErrorMessage } from "@/enums/global-enums"

export class EditorInternalErrorHelper {
  static createError(message: EErrorMessage): Error {
    return new Error(message)
  }
}
