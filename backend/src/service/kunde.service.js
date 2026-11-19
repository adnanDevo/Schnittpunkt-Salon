import { getAllKunden, neueKunde, getKundeBeiEmail } from "../repository/kunde.repository.js"
import { HttpFehler } from "../util/fehler.js"
import { pflichtText, istEmail, istTelefon } from "../util/validierung.js"

export async function allKunden() {
    const kunden = await getAllKunden()
    return kunden
}

export async function kundeAnlegen(person) {
    const daten = {
        kunde_name: pflichtText(person.kunde_name, "Name"),
        telefonnummer: istTelefon(person.telefonnummer),
        mail: istEmail(person.mail)
    }
    const vorhanden = await getKundeBeiEmail(daten.mail)
    if (vorhanden.length > 0) {
        throw new HttpFehler(409, "Diese E-Mail ist bereits als Kunde gespeichert")
    }
    const ergebnis = await neueKunde(daten)
    return ergebnis
}
export async function kuneBeiEmailFinden(mail) {
    const ergebnisse = await getKundeBeiEmail(istEmail(mail))
    return ergebnisse
}
