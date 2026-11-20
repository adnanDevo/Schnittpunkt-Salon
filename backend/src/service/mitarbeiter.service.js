import { getAlleMitarbeiter, neuerMitarbeiteranlegen, getAktiveMitarbeiter, mitarbeiterEntfernen, getLeistungBeiMitarbeiter, getMitarbeiterProLeistung, leistungZuMitarbeiter, leistungVonMitarbeiterEntfernen, getFreieTage, freienTagHinzufuegen, freienTagEntfernen } from "../repository/mitarbeiter.repository.js"
import { pflichtText, positiveGanzzahl } from "../util/validierung.js"

export async function  alleMitarbeiter() {
    const alle = await getAlleMitarbeiter()
    return alle

}
export async function aktiveMitarbeiter() {
    const ergebnis = await getAktiveMitarbeiter()
    return ergebnis
}
export async function mitarbeiterAnlegen(person) {
    const mitarbeiter = await neuerMitarbeiteranlegen({
        mitarbeiter_name: pflichtText(person.mitarbeiter_name, "Name"),
        mitarbeiter_status: "aktiv"
    })
    return mitarbeiter
}

export async function nameEntfernen(person) {
    const result = await mitarbeiterEntfernen({ idMitarbeiter: positiveGanzzahl(person.idMitarbeiter, "Mitarbeiter") })
    return result
}

export async function mitarbeiterLeistungen(ids) {
    const ergebnis = await getLeistungBeiMitarbeiter({ idMitarbeiter: positiveGanzzahl(ids.idMitarbeiter, "Mitarbeiter") })
    return ergebnis
}
export async function welcherMitarbeiterProLeistung(ids) {
    const ergebnis = await getMitarbeiterProLeistung({ idLeistung: positiveGanzzahl(ids.idLeistung, "Leistung") })
    return ergebnis
}
export async function mitarbeiterLeistungZufuegen(ids) {
    const ergebnis = await leistungZuMitarbeiter({
        mitarbeiter_Id: positiveGanzzahl(ids.mitarbeiter_Id, "Mitarbeiter"),
        leistung_Id: positiveGanzzahl(ids.leistung_Id, "Leistung")
    })
    return ergebnis
}
export async function mitarbeiterLeistungEntferen(ids) {
    const ergebnis = await leistungVonMitarbeiterEntfernen({
        idMitarbeiter_leistung: positiveGanzzahl(ids.idMitarbeiter_leistung, "Zuordnung")
    })
    return ergebnis
}
export async function freietagen(ids) {
    const ergebnis = await getFreieTage({ idMitarbeiter: positiveGanzzahl(ids.idMitarbeiter, "Mitarbeiter") })
    return ergebnis
}
export async function neuerFreierTag(ids) {
    const ergebnis = await freienTagHinzufuegen({
        mitarbeiter_id: positiveGanzzahl(ids.mitarbeiter_id, "Mitarbeiter"),
        tag_id: positiveGanzzahl(ids.tag_id, "Tag")
    })
    return ergebnis
}
export async function tagEntfernen(ids) {
    const ergebnis = await freienTagEntfernen({
        idFreieTagen: positiveGanzzahl(ids.idFreieTagen, "Freier Tag")
    })
    return ergebnis
}
