import express from "express"
import { fileURLToPath } from "url"

import indexRouter from "./routes/index.js"

import multer from "multer"
import path from "path"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Cấu hình EJS
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Middleware static
app.use(express.static(path.join(__dirname, "../public")))

// Routes
app.use("/", indexRouter)

// Thư mục lưu ảnh
const uploadDir = path.join(__dirname, "images")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Cấu hình Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname
    cb(null, uniqueName)
  },
})

const upload = multer({ storage })

// API upload nhiều ảnh
app.post("/api/upload", upload.array("images", 10), (req, res) => {
  try {
    const files = req.files.map((file) => ({
      filename: file.filename,
      url: `/images/${file.filename}`,
    }))

    res.json({
      message: "Upload thành công",
      files,
    })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Cho phép truy cập ảnh tĩnh
app.use("/images", express.static(uploadDir))

app.listen(PORT, () => {
  console.log(`>>> Server running at http://localhost:${PORT}`)
})
