import { alleMitarbeiter, mitarbeiterAnlegen, nameEntfernen, mitarbeiterLeistungen, welcherMitarbeiterProLeistung, mitarbeiterLeistungZufuegen, mitarbeiterLeistungEntferen, freietagen, neuerFreierTag, tagEntfernen } from "../service/mitarbeiter.service.js"

export async function alleMitarbeiterHolen(req,res) {
    const result = await alleMitarbeiter()
    return res.status(200).json(result)
}

export async function neuMitarbeiterErstellen(req,res) {
    const ergebnis = await mitarbeiterAnlegen(req.body ?? {})
    return res.status(201).json(ergebnis)
}
export async function personEntfernen(req,res) {
    const ids = {
        idMitarbeiter : req.params.id
    }
    const result = await nameEntfernen(ids)
    return res.status(200).json(result)
}
export async function mitarbeiterUndLeistungen(req,res) {
    const ids={
        idMitarbeiter: req.params.id
    }
    const ergebnis = await mitarbeiterLeistungen(ids)
    return res.status(200).json(ergebnis)
}
export async function mitarbeiterBietenLeistung(req,res) {
    const ids={
        idLeistung: req.params.id
    }
    const ergebnis = await welcherMitarbeiterProLeistung(ids)
    return res.status(200).json(ergebnis)
}
export async function nochLeistungZuMitarbeiter(req,res) {
    const ids={
        mitarbeiter_Id: req.body?.mitarbeiter_Id,
        leistung_Id: req.body?.leistung_Id,
    }
    const ergebnis = await mitarbeiterLeistungZufuegen(ids)
    return res.status(201).json(ergebnis)
}
export async function lesitungVonMitarbeiterLoeschen(req,res) {
    const ids={
        idMitarbeiter_leistung: req.params.id
    }
    await mitarbeiterLeistungEntferen(ids)
    return res.status(204).end()
}
export async function holeFreieTagen(req,res) {
    const ids={
        idMitarbeiter: req.params.id,
    }
    const ergebnis = await freietagen(ids)
    return res.status(200).json(ergebnis)
}
export async function freierTagAnlegen(req,res) {
    const ids={
        tag_id: req.body?.tag_id,
        mitarbeiter_id: req.body?.mitarbeiter_id
    }
    const ergebnis = await neuerFreierTag(ids)
    return res.status(201).json(ergebnis)
}
export async function freiTagLoeschen(req,res) {
    const ids={
        idFreieTagen: req.params.id,
    }
    await tagEntfernen(ids)
    return res.status(204).end()
}
