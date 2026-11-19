import express from "express"
import { getMeldungen, neueSchrieben, neueStatus, neueText } from "../controller/meldung.controller.js"
import { salonAuth } from "../util/salonAuth.js"

export const router = new express.Router()
router.get("/meldung", salonAuth, getMeldungen)
router.post("/meldung", salonAuth, neueSchrieben)
router.patch("/meldung/:id/status", salonAuth, neueStatus)
router.patch("/meldung/:id/text", salonAuth, neueText)
