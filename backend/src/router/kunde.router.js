import express from "express"
import { zeigeAlleKunden, neueKundeErstellen, kundeZeigenBeiEmail } from "../controller/kunde.controller.js"
import { salonAuth } from "../util/salonAuth.js"

export const router = new express.Router()

router.get("/kunde", salonAuth, zeigeAlleKunden)
router.post("/kunde/neu", salonAuth, neueKundeErstellen)
router.get("/kunde/email", salonAuth, kundeZeigenBeiEmail)
