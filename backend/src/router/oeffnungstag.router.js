import express from "express"
import { gesamteTagen, tageUpdaten } from "../controller/oeffnungstag.controller.js"
import { salonAuth } from "../util/salonAuth.js"

export const router = new express.Router()

router.get("/oeffnungstag", gesamteTagen)
router.patch("/oeffnungstag/update/:id", salonAuth, tageUpdaten)
