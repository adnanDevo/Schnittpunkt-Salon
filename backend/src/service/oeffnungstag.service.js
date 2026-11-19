import { getAlleTagen, tageAendern } from "../repository/oeffnungstag.repository.js"
import { HttpFehler } from "../util/fehler.js"
import { positiveGanzzahl, istUhrzeit } from "../util/validierung.js"

export async function alleTagen() {
    const tagen = await getAlleTagen()
    return tagen
}

export async function aendereTagen(ids) {
    const anfang = istUhrzeit(ids.arbeit_anfang, "Beginn")
    const ende = istUhrzeit(ids.arbeit_ende, "Ende")
    if (anfang >= ende) {
        throw new HttpFehler(400, "Beginn muss vor dem Ende liegen")
    }
    const ergebnis = await tageAendern({
        idOeffnungstag: positiveGanzzahl(ids.idOeffnungstag, "Tag"),
        arbeit_anfang: anfang,
        arbeit_ende: ende
    })
    return ergebnis
}
