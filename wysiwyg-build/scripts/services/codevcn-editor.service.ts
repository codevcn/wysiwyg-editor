import { TUploadImageRes } from "@/types/api-types"
import axios from "axios"

export class CodeVCNEditorService {
  static clientAxios = axios.create({
    baseURL: "http://localhost:3000/api",
  })

  static async uploadImage(
    endpoint: string,
    files: File[],
    onProgress: (progress: number) => void
  ): Promise<TUploadImageRes> {
    const formData = new FormData()
    for (const file of files) {
      formData.append("images", file)
    }
    const { data } = await this.clientAxios.post<TUploadImageRes>(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
        onProgress(progress)
      },
    })
    return data
  }
}
