import { alleLeistungen, leistungErstellen, leistungUpdaten, statusAendern } from "../service/leistung.service.js"

export async function gesamteLeistungen(req,res) {
    const ergebnisse = await alleLeistungen()
    return res.status(200).json(ergebnisse)
}

export async function leistungZufuegen(req,res) {
    const ergebnis = await leistungErstellen(req.body)
    return res.status(201).json(ergebnis)
}

export async function leistungAktualiesieren(req,res) {
    const ids ={
        idLeistung: Number(req.params.id),
        leistung_name: req.body.leistung_name,
        dauer_in_minuten: req.body.dauer_in_minuten,
        preis: req.body.preis,
        aktiv: req.body.aktiv
    }
    const ergebnis = await leistungUpdaten(ids)
    return res.status(200).json(ergebnis)
}
export async function andereStatus(req,res) {
     const ids ={
        idLeistung: Number(req.params.id)
    }
    const ergebnis = await statusAendern(ids)
    return res.status(200).json(ergebnis)
}