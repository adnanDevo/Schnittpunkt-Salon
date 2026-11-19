import express from "express"
import { gesamteTermine, terminFuerMitarbeiter, verfuegbarerMitarbeiter, verfuegbarkeitDesTermin, termineWennEgal, neuerTermin, terminStornieren, terminStatus, tagesuebersichtHolen } from "../controller/termin.controller.js"
import { salonAuth } from "../util/salonAuth.js"

export const router = new express.Router()

router.get("/termin", salonAuth, gesamteTermine)
router.get("/termin/tag", salonAuth, tagesuebersichtHolen)
router.patch("/termin/:id/status", salonAuth, terminStatus)

router.get("/termin/leistung/:id", verfuegbarerMitarbeiter)
router.get("/termin/egal/:id", termineWennEgal)
router.get("/termin/:idLeistung/:idMitarbeiter", verfuegbarkeitDesTermin)
router.post("/termin", neuerTermin)
router.post("/termin/storno", terminStornieren)

router.get("/termin/:id", salonAuth, terminFuerMitarbeiter)
