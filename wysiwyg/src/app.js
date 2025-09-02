import express from "express"
import path from "path"
import { fileURLToPath } from "url"

import indexRouter from "./routes/index.js"

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

app.listen(PORT, () => {
  console.log(`>>> Server running at http://localhost:${PORT}`)
})
