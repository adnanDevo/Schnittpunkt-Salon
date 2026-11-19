import express from "express"
import { alleMitarbeiterHolen, neuMitarbeiterErstellen, personEntfernen, mitarbeiterUndLeistungen, mitarbeiterBietenLeistung, nochLeistungZuMitarbeiter, lesitungVonMitarbeiterLoeschen, holeFreieTagen, freierTagAnlegen, freiTagLoeschen } from "../controller/mitarbeiter.controller.js"
import { salonAuth } from "../util/salonAuth.js"

export const router = new express.Router()

router.get("/mitarbeiter_leistung/leistung/:id", mitarbeiterBietenLeistung)

router.get("/mitarbeiter", salonAuth, alleMitarbeiterHolen)
router.post("/mitarbeiter/neu", salonAuth, neuMitarbeiterErstellen)
router.patch("/mitarbeiter/inaktive/:id", salonAuth, personEntfernen)
router.get("/mitarbeiter_leistung/mitarbeiter/:id", salonAuth, mitarbeiterUndLeistungen)
router.post("/mitarbeiter_leistung/neu", salonAuth, nochLeistungZuMitarbeiter)
router.delete("/mitarbeiter_leistung/del/:id", salonAuth, lesitungVonMitarbeiterLoeschen)
router.get("/freietagen/:id", salonAuth, holeFreieTagen)
router.post("/freietagen/neu", salonAuth, freierTagAnlegen)
router.delete("/freietagen/del/:id", salonAuth, freiTagLoeschen)
