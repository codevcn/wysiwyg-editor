import { Router } from "express"
const router = Router()

router.get("/", (req, res) => {
  res.render("pages/home", { title: "Trang chủ", message: "Hello Express + EJS (ES6)!" })
})

export default router
