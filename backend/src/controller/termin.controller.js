import { alleTermine, mitarbeiterTermineZeigen, welcherMitarbeiterVerfuegbar, pruefeTerminObVerfuegbar, egalWirdAusgewaehlt, terminBuchen, stornierenPerCode, terminStatusSetzen, tagesuebersicht } from "../service/termin.service.js"
import { positiveGanzzahl } from "../util/validierung.js"

export async function gesamteTermine(req,res) {
    const ergebnis = await alleTermine()
    return res.status(200).json(ergebnis)
}

export async function terminFuerMitarbeiter(req,res) {
    const ids ={
        mitarbeiter_id: positiveGanzzahl(req.params.id, "Mitarbeiter")
    }
    const ergebnis = await mitarbeiterTermineZeigen(ids)
    return res.status(200).json(ergebnis)
}
export async function verfuegbarerMitarbeiter(req,res) {
    const ids ={
        idLeistung: positiveGanzzahl(req.params.id, "Leistung")
    }
    const ergebnis = await welcherMitarbeiterVerfuegbar(ids)
    return res.status(200).json(ergebnis)
}
export async function verfuegbarkeitDesTermin(req,res) {
    const ids = {
        idLeistung: positiveGanzzahl(req.params.idLeistung, "Leistung"),
        idMitarbeiter: positiveGanzzahl(req.params.idMitarbeiter, "Mitarbeiter"),
        mitarbeiter_id: positiveGanzzahl(req.params.idMitarbeiter, "Mitarbeiter")
    }
    const ergebnis = await pruefeTerminObVerfuegbar(ids)
    return res.status(200).json(ergebnis.filter(zeit => zeit.verfuegbar))
}
export async function termineWennEgal(req,res) {
    const ids ={
        idLeistung: positiveGanzzahl(req.params.id, "Leistung")
    }
    const ergebnis = await egalWirdAusgewaehlt(ids)
    return res.status(200).json(ergebnis.filter(zeit => zeit.verfuegbar))
}

export async function neuerTermin(req,res) {
    const ergebnis = await terminBuchen(req.body ?? {})
    return res.status(201).json(ergebnis)
}

export async function terminStornieren(req,res) {
    const ergebnis = await stornierenPerCode(req.body?.stornocode)
    return res.status(200).json(ergebnis)
}

export async function terminStatus(req,res) {
    const ergebnis = await terminStatusSetzen(req.params.id, req.body?.termin_status)
    return res.status(200).json(ergebnis)
}

export async function tagesuebersichtHolen(req,res) {
    const ergebnis = await tagesuebersicht(req.query.datum)
    return res.status(200).json(ergebnis)
}
