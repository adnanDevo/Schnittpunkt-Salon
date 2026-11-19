import { getAlleLeistungen, neueLeistung, leistungAendern, leistungStatusAendern } from "../repository/leistung.repository.js"
import { HttpFehler } from "../util/fehler.js"
import { pflichtText, positiveGanzzahl, preis } from "../util/validierung.js"

export async function alleLeistungen() {
    const result = await getAlleLeistungen()
    return result
}

export async function leistungErstellen(daten) {
    const ergebnis = await neueLeistung({
        leistung_name: pflichtText(daten.leistung_name, "Leistungsname"),
        dauer_in_minuten: positiveGanzzahl(daten.dauer_in_minuten, "Dauer"),
        preis: preis(daten.preis)
    })
    return ergebnis
}

export async function leistungUpdaten(ids) {
    const aenderung = { idLeistung: positiveGanzzahl(ids.idLeistung, "Leistung") }
    if (ids.leistung_name !== undefined) {
        aenderung.leistung_name = pflichtText(ids.leistung_name, "Leistungsname")
    }
    if (ids.dauer_in_minuten !== undefined) {
        aenderung.dauer_in_minuten = positiveGanzzahl(ids.dauer_in_minuten, "Dauer")
    }
    if (ids.preis !== undefined) {
        aenderung.preis = preis(ids.preis)
    }
    if (ids.aktiv !== undefined) {
        if (typeof ids.aktiv !== "boolean") throw new HttpFehler(400, "aktiv muss true oder false sein")
        aenderung.aktiv = ids.aktiv ? 1 : 0
    }
    const result = await leistungAendern(aenderung)
    if (result === null) throw new HttpFehler(404, "Leistung nicht gefunden")
    return result
}

export async function statusAendern(ids) {
    const ergebnis = await leistungStatusAendern({ idLeistung: positiveGanzzahl(ids.idLeistung, "Leistung") })
    return ergebnis
}
