import express from "express"
import { gesamteLeistungen, leistungZufuegen, leistungAktualiesieren, andereStatus } from "../controller/leistung.controller.js"
import { salonAuth } from "../util/salonAuth.js"

export const router = new express.Router()

router.get("/leistung", gesamteLeistungen)
router.post("/leistung/neu", salonAuth, leistungZufuegen)
router.patch("/leistung/update/:id", salonAuth, leistungAktualiesieren)
router.patch("/leistung/aktiv/:id", salonAuth, andereStatus)
