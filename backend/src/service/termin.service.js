import crypto from "crypto"
import { getAlleTermine, getTermineProMitarbeiter, terminMitTransaktionSpeichern, getTerminById, getTerminByStornocode, setTerminStatus, getTagesuebersicht } from "../repository/termin.repository.js"
import { getAlleTagen } from "../repository/oeffnungstag.repository.js"
import { getLeistungById } from "../repository/leistung.repository.js"
import { getFreieTage, getMitarbeiterProLeistung, istLeistungBeiMitarbeiter } from "../repository/mitarbeiter.repository.js"
import { HttpFehler } from "../util/fehler.js"
import { pflichtText, positiveGanzzahl, istEmail, istTelefon, istDatum, istUhrzeit } from "../util/validierung.js"
import { addMinuten, ueberschneidet, parseLokal, toDbDatetime, pruefeBuchungszeit, liegtInOeffnungszeit, wochentagVon } from "../util/zeit.js"
import { getKundeBeiEmail } from "../repository/kunde.repository.js"

const STORNO_FRIST_MS = 24 * 60 * 60 * 1000
const STATUS_ERLAUBT = ["offen", "erledigt", "nicht erschienen", "storniert"]

export async function alleTermine() {
    const ergebnisse = await getAlleTermine()
    return ergebnisse
}

export async function mitarbeiterTermineZeigen(ids) {
    const termin = await getTermineProMitarbeiter(ids)
    return termin
}

function generiereSalonTermine(oeffnungszeiten, vorlaufStunden = 2) {
    const verfuegbareTermine = []
    const fruehesterStart = new Date()
    fruehesterStart.setHours(fruehesterStart.getHours() + vorlaufStunden)
    const endDatum = new Date()
    endDatum.setMonth(endDatum.getMonth() + 3)
    const aktuellerTag = new Date()
    aktuellerTag.setHours(0, 0, 0, 0)
    const formatUhrzeit = (date) =>
        date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })

    while (aktuellerTag <= endDatum) {
        const wochentag = wochentagVon(aktuellerTag)
        const tagesPlan = oeffnungszeiten.find(tag => tag.tag_name === wochentag)
        if (tagesPlan) {
            const [startStd, startMin] = tagesPlan.arbeit_anfang.split(':').map(Number)
            const [endeStd, endeMin] = tagesPlan.arbeit_ende.split(':').map(Number)
            const slotStart = new Date(aktuellerTag)
            slotStart.setHours(startStd, startMin, 0, 0)
            const feierabend = new Date(aktuellerTag)
            feierabend.setHours(endeStd, endeMin, 0, 0)
            while (slotStart < feierabend) {
                const slotEnde = new Date(slotStart)
                slotEnde.setMinutes(slotEnde.getMinutes() + 15)
                if (slotStart >= fruehesterStart && slotStart <= endDatum && slotEnde <= feierabend) {
                    const datumDeutsch = aktuellerTag.toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    })

                    verfuegbareTermine.push({
                        wochentag: wochentag,
                        datum: datumDeutsch,
                        uhrzeitStart: formatUhrzeit(slotStart),
                        uhrzeitEnde: formatUhrzeit(slotEnde),
                        start: new Date(slotStart),
                        verfuegbar: true
                    })
                }
                slotStart.setMinutes(slotStart.getMinutes() + 15)
            }
        }
        aktuellerTag.setDate(aktuellerTag.getDate() + 1)
    }
    return verfuegbareTermine
}

export async function welcherMitarbeiterVerfuegbar(ids) {
    const mitarbeitern = await getMitarbeiterProLeistung(ids)
    return mitarbeitern
}

export async function pruefeTerminObVerfuegbar(ids) {
    const idMitarbeiter = Number(ids.mitarbeiter_id ?? ids.idMitarbeiter)
    const leistung = await getLeistungById(Number(ids.idLeistung))
    if (!leistung || !leistung.aktiv) return []
    if (!(await istLeistungBeiMitarbeiter(idMitarbeiter, leistung.idLeistung))) return []

    const oeffnungszeiten = await getAlleTagen()
    const salonTermine = generiereSalonTermine(oeffnungszeiten)
    const freieTage = (await getFreieTage({ idMitarbeiter })).map(t => t.tag_name).filter(Boolean)
    const termine = (await getTermineProMitarbeiter({ mitarbeiter_id: idMitarbeiter }))
        .filter(t => t.termin_status !== "storniert")

    for (const zeit of salonTermine) {
        const ende = addMinuten(zeit.start, leistung.dauer_in_minuten)
        const hatFrei = freieTage.includes(zeit.wochentag)
        const hatKollision = termine.some(t =>
            ueberschneidet(zeit.start, ende, new Date(t.anfang), new Date(t.ende))
        )
        const passt = liegtInOeffnungszeit(oeffnungszeiten, zeit.start, ende)
        zeit.verfuegbar = !hatFrei && !hatKollision && passt
        zeit.ende = ende
    }
    return salonTermine
}

export async function egalWirdAusgewaehlt(ids) {
    const mitarbeitern = await welcherMitarbeiterVerfuegbar(ids)
    if (mitarbeitern.length === 0) return []

    const ergebnisse = new Map()
    for (const person of mitarbeitern) {
        const slots = await pruefeTerminObVerfuegbar({
            idLeistung: ids.idLeistung,
            idMitarbeiter: person.idMitarbeiter
        })
        for (const slot of slots) {
            const schluessel = slot.start.getTime()
            if (!ergebnisse.has(schluessel)) {
                ergebnisse.set(schluessel, { ...slot, verfuegbar: false, idMitarbeiter: null, mitarbeiter_name: null })
            }
            const eintrag = ergebnisse.get(schluessel)
            if (slot.verfuegbar && !eintrag.verfuegbar) {
                eintrag.verfuegbar = true
                eintrag.idMitarbeiter = person.idMitarbeiter
                eintrag.mitarbeiter_name = person.mitarbeiter_name
            }
        }
    }
    return [...ergebnisse.values()].sort((a, b) => a.start - b.start)
}

export async function terminBuchen(daten) {
    const mail = istEmail(daten.mail)
    const neuerKunde = daten.kunde_name !== undefined || daten.telefonnummer !== undefined
    const kunde_name = neuerKunde ? pflichtText(daten.kunde_name, "Name") : null
    const telefonnummer = neuerKunde ? istTelefon(daten.telefonnummer) : null
    if (!neuerKunde) {
        const vorhanden = await getKundeBeiEmail(mail)
        if (vorhanden.length === 0) {
            throw new HttpFehler(404, "Diese E-Mail ist uns nicht bekannt. Bitte geben Sie Name und Telefonnummer an.")
        }
    }
    const idLeistung = positiveGanzzahl(daten.idLeistung, "Leistung")
    const datum = istDatum(daten.datum)
    const uhrzeit = istUhrzeit(daten.uhrzeit)
    const wunsch = daten.idMitarbeiter === "egal"
        ? "egal"
        : positiveGanzzahl(daten.idMitarbeiter, "Mitarbeiter")
    const start = parseLokal(datum, uhrzeit)

    const leistung = await getLeistungById(idLeistung)
    if (!leistung || !leistung.aktiv) {
        throw new HttpFehler(404, "Leistung nicht gefunden oder nicht buchbar")
    }
    const ende = addMinuten(start, leistung.dauer_in_minuten)

    const oeffnungszeiten = await getAlleTagen()
    const fehler = pruefeBuchungszeit(start, ende, oeffnungszeiten)
    if (fehler) throw new HttpFehler(400, fehler)

    let alleKandidaten
    if (wunsch === "egal") {
        alleKandidaten = (await getMitarbeiterProLeistung({ idLeistung })).map(m => m.idMitarbeiter)
    } else {
        const bietetAn = await istLeistungBeiMitarbeiter(wunsch, idLeistung)
        if (!bietetAn) throw new HttpFehler(400, "Diese Person bietet die Leistung nicht an")
        alleKandidaten = [wunsch]
    }

    const wochentag = wochentagVon(start)
    const kandidaten = []
    for (const idMitarbeiter of alleKandidaten) {
        const freieTage = (await getFreieTage({ idMitarbeiter })).map(t => t.tag_name)
        if (!freieTage.includes(wochentag)) kandidaten.push(idMitarbeiter)
    }

    const stornocode = crypto.randomUUID()
    const ergebnis = await terminMitTransaktionSpeichern({
        kandidaten,
        kunde_name,
        telefonnummer,
        mail,
        leistung_id: idLeistung,
        anfang: toDbDatetime(start),
        ende: toDbDatetime(ende),
        stornocode
    })
    if (!ergebnis) {
        throw new HttpFehler(409, "Zu dieser Zeit ist keine passende Person frei")
    }

    return {
        idTermin: ergebnis.idTermin,
        stornocode,
        mitarbeiter_id: ergebnis.mitarbeiter_id,
        anfang: toDbDatetime(start),
        ende: toDbDatetime(ende)
    }
}

export async function stornierenPerCode(stornocode) {
    const code = pflichtText(stornocode, "Stornocode", 36)
    const termin = await getTerminByStornocode(code)
    if (!termin) throw new HttpFehler(404, "Termin nicht gefunden")
    if (termin.termin_status === "storniert") {
        throw new HttpFehler(409, "Termin ist bereits storniert")
    }
    if (termin.termin_status === "erledigt" || termin.termin_status === "nicht erschienen") {
        throw new HttpFehler(400, "Abgeschlossene Termine können nicht storniert werden")
    }
    if (new Date(termin.anfang).getTime() - Date.now() < STORNO_FRIST_MS) {
        throw new HttpFehler(400, "Stornierung nur bis 24 Stunden vorher möglich, bitte telefonisch melden")
    }
    await setTerminStatus(termin.idTermin, "storniert")
    return { idTermin: termin.idTermin, termin_status: "storniert" }
}

export async function terminStatusSetzen(idTermin, status) {
    const id = positiveGanzzahl(idTermin, "Termin")
    if (!STATUS_ERLAUBT.includes(status)) {
        throw new HttpFehler(400, `Status muss einer von diesen sein: ${STATUS_ERLAUBT.join(", ")}`)
    }
    const termin = await getTerminById(id)
    if (!termin) throw new HttpFehler(404, "Termin nicht gefunden")
    await setTerminStatus(id, status)
    return { idTermin: id, termin_status: status }
}

export async function tagesuebersicht(datum) {
    const tag = istDatum(datum, "Datum")
    return getTagesuebersicht(tag)
}
