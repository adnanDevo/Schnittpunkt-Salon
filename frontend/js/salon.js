const API = "http://127.0.0.1:3000/api"

const passwort = sessionStorage.getItem("salonPasswort")
if (!passwort) {
    window.location.href = "salon_logging.html"
}

const meldung = document.querySelector("#meldung")
const bereich_tag = document.querySelector("#bereich_tag")
const bereich_leistungen = document.querySelector("#bereich_leistungen")
const reiter_tag = document.querySelector("#reiter_tag")
const reiter_leistungen = document.querySelector("#reiter_leistungen")
const tag_anzeige = document.querySelector("#tag_anzeige")
const tag_zaehler = document.querySelector("#tag_zaehler")
const spalten = document.querySelector("#spalten")
const leistung_tabelle = document.querySelector("#leistung_tabelle")
const neue_leistung_formular = document.querySelector("#neue_leistung_formular")
const neu_personen = document.querySelector("#neu_personen")

const STATUS_TEXT = {
    "offen": "offen",
    "erledigt": "erledigt",
    "nicht erschienen": "nicht erschienen",
    "storniert": "storniert"
}

let aktuellesDatum = new Date()
aktuellesDatum.setHours(0, 0, 0, 0)
let personen = []

function meldungZeigen(text, art) {
    meldung.textContent = text
    meldung.className = art
}

function datumFuerBackend(datum) {
    const jahr = datum.getFullYear()
    const monat = String(datum.getMonth() + 1).padStart(2, "0")
    const tag = String(datum.getDate()).padStart(2, "0")
    return `${jahr}-${monat}-${tag}`
}

function uhrzeit(wert) {
    return new Date(wert).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
}

function preisFormat(preis) {
    return Number(preis).toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}

function element(tag, klasse, text) {
    const el = document.createElement(tag)
    if (klasse) el.className = klasse
    if (text !== undefined) el.textContent = text
    return el
}

async function salonFetch(pfad, optionen = {}) {
    const antwort = await fetch(API + pfad, {
        ...optionen,
        headers: {
            "Content-Type": "application/json",
            "x-salon-passwort": passwort
        }
    })
    if (antwort.status === 401) {
        sessionStorage.removeItem("salonPasswort")
        window.location.href = "salon_logging.html"
        throw new Error("Bitte erneut anmelden")
    }
    if (antwort.status === 204) {
        return null
    }
    const daten = await antwort.json()
    if (!antwort.ok) {
        throw new Error(daten.error ?? "Unbekannter Fehler")
    }
    return daten
}

function reiterZeigen(welcher) {
    const tagAktiv = welcher === "tag"
    bereich_tag.hidden = !tagAktiv
    bereich_leistungen.hidden = tagAktiv
    reiter_tag.classList.toggle("aktiv", tagAktiv)
    reiter_leistungen.classList.toggle("aktiv", !tagAktiv)
    meldungZeigen("", "")
    if (!tagAktiv) {
        leistungenLaden()
    }
}

reiter_tag.addEventListener("click", () => reiterZeigen("tag"))
reiter_leistungen.addEventListener("click", () => reiterZeigen("leistungen"))

document.querySelector("#btn_abmelden").addEventListener("click", () => {
    sessionStorage.removeItem("salonPasswort")
    window.location.href = "salon_logging.html"
})

document.querySelector("#tag_zurueck").addEventListener("click", () => tagWechseln(-1))
document.querySelector("#tag_weiter").addEventListener("click", () => tagWechseln(1))
document.querySelector("#tag_heute").addEventListener("click", () => {
    aktuellesDatum = new Date()
    aktuellesDatum.setHours(0, 0, 0, 0)
    tagLaden()
})

function tagWechseln(tage) {
    aktuellesDatum.setDate(aktuellesDatum.getDate() + tage)
    tagLaden()
}

async function tagLaden() {
    tag_anzeige.textContent = aktuellesDatum.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })
    spalten.textContent = ""
    try {
        const termine = await salonFetch(`/termin/tag?datum=${datumFuerBackend(aktuellesDatum)}`)
        const offen = termine.filter(t => t.termin_status === "offen").length
        tag_zaehler.textContent = termine.length === 0
            ? "Keine Termine an diesem Tag."
            : `${termine.length} Termine, davon ${offen} offen`

        const spaltenListe = personen.map(p => ({ id: p.idMitarbeiter, name: p.mitarbeiter_name }))
        for (const t of termine) {
            if (!spaltenListe.some(s => s.id === t.idMitarbeiter)) {
                spaltenListe.push({ id: t.idMitarbeiter, name: t.mitarbeiter_name })
            }
        }

        for (const person of spaltenListe) {
            const spalte = element("div", "spalte")
            spalte.append(element("h2", "spalte-kopf", person.name))
            const eigene = termine.filter(t => t.idMitarbeiter === person.id)
            if (eigene.length === 0) {
                spalte.append(element("p", "leer", "Keine Termine"))
            }
            for (const termin of eigene) {
                spalte.append(terminKarte(termin))
            }
            spalten.append(spalte)
        }
    } catch (fehler) {
        meldungZeigen(fehler.message, "fehler")
    }
}

function terminKarte(termin) {
    const statusKlasse = "status-" + termin.termin_status.replace(" ", "-")
    const karte = element("article", "termin-karte " + statusKlasse)
    karte.append(element("div", "termin-zeit", `${uhrzeit(termin.anfang)} – ${uhrzeit(termin.ende)}`))
    karte.append(element("div", "termin-kunde", termin.kunde_name))
    const telefon = element("a", "termin-telefon", termin.telefonnummer)
    telefon.href = "tel:" + termin.telefonnummer.replace(/[^0-9+]/g, "")
    karte.append(telefon)
    karte.append(element("div", "termin-leistung", termin.leistung_name))
    karte.append(element("span", "status-schild " + statusKlasse, STATUS_TEXT[termin.termin_status] ?? termin.termin_status))

    if (termin.termin_status === "offen") {
        const knoepfe = element("div", "termin-knoepfe")
        const erledigt = element("button", "mini-knopf", "Erledigt")
        erledigt.type = "button"
        erledigt.addEventListener("click", () => statusSetzen(termin, "erledigt"))
        const nichtDa = element("button", "mini-knopf", "Nicht erschienen")
        nichtDa.type = "button"
        nichtDa.addEventListener("click", () => statusSetzen(termin, "nicht erschienen"))
        const storno = element("button", "mini-knopf gefahr", "Stornieren")
        storno.type = "button"
        storno.addEventListener("click", () => {
            if (confirm(`Termin von ${termin.kunde_name} um ${uhrzeit(termin.anfang)} wirklich stornieren?`)) {
                statusSetzen(termin, "storniert")
            }
        })
        knoepfe.append(erledigt, nichtDa, storno)
        karte.append(knoepfe)
    }
    return karte
}

async function statusSetzen(termin, status) {
    try {
        await salonFetch(`/termin/${termin.idTermin}/status`, {
            method: "PATCH",
            body: JSON.stringify({ termin_status: status })
        })
        meldungZeigen(`Termin von ${termin.kunde_name} ist jetzt „${STATUS_TEXT[status]}“.`, "erfolg")
        await tagLaden()
    } catch (fehler) {
        meldungZeigen(fehler.message, "fehler")
    }
}

async function leistungenLaden() {
    leistung_tabelle.textContent = ""
    try {
        const antwort = await fetch(API + "/leistung")
        if (!antwort.ok) {
            throw new Error("Leistungen konnten nicht geladen werden")
        }
        const leistungen = await antwort.json()
        const kopf = element("div", "leistung-zeile kopfzeile")
        kopf.append(element("span", "", "Name"), element("span", "", "Dauer (Min)"), element("span", "", "Preis (€)"), element("span", "", "Aktiv"), element("span", "", ""))
        leistung_tabelle.append(kopf)
        for (const leistung of leistungen) {
            leistung_tabelle.append(leistungZeile(leistung))
        }
    } catch (fehler) {
        meldungZeigen(fehler.message, "fehler")
    }
}

function miniFeld(text, eingabe) {
    const label = element("label", "mini-feld")
    label.append(element("span", "", text), eingabe)
    return label
}

function leistungZeile(leistung) {
    const zeile = element("form", "leistung-zeile")
    const name = element("input")
    name.type = "text"
    name.maxLength = 45
    name.required = true
    name.value = leistung.leistung_name
    name.setAttribute("aria-label", "Name")
    const dauer = element("input")
    dauer.type = "number"
    dauer.min = 5
    dauer.step = 5
    dauer.required = true
    dauer.value = leistung.dauer_in_minuten
    dauer.setAttribute("aria-label", "Dauer in Minuten")
    const preis = element("input")
    preis.type = "number"
    preis.min = 0
    preis.step = 0.01
    preis.required = true
    preis.value = Number(leistung.preis).toFixed(2)
    preis.setAttribute("aria-label", "Preis in Euro")
    const aktivLabel = element("label", "schalter")
    const aktiv = element("input")
    aktiv.type = "checkbox"
    aktiv.checked = Boolean(leistung.aktiv)
    aktivLabel.append(aktiv, element("span", "", aktiv.checked ? "aktiv" : "inaktiv"))
    aktiv.addEventListener("change", () => {
        aktivLabel.querySelector("span").textContent = aktiv.checked ? "aktiv" : "inaktiv"
    })
    const speichern = element("button", "mini-knopf", "Speichern")
    speichern.type = "submit"
    zeile.append(miniFeld("Name", name), miniFeld("Dauer (Min)", dauer), miniFeld("Preis (€)", preis), aktivLabel, speichern)
    if (!leistung.aktiv) {
        zeile.classList.add("inaktiv")
    }

    zeile.addEventListener("submit", async (event) => {
        event.preventDefault()
        try {
            await salonFetch(`/leistung/update/${leistung.idLeistung}`, {
                method: "PATCH",
                body: JSON.stringify({
                    leistung_name: name.value.trim(),
                    dauer_in_minuten: Number(dauer.value),
                    preis: Number(preis.value),
                    aktiv: aktiv.checked
                })
            })
            meldungZeigen(`„${name.value.trim()}“ wurde gespeichert.`, "erfolg")
            await leistungenLaden()
        } catch (fehler) {
            meldungZeigen(fehler.message, "fehler")
        }
    })
    return zeile
}

function personenAuswahlBauen() {
    neu_personen.textContent = ""
    for (const person of personen) {
        const label = element("label", "auswahl")
        const box = element("input")
        box.type = "checkbox"
        box.value = person.idMitarbeiter
        box.checked = true
        label.append(box, element("span", "", person.mitarbeiter_name))
        neu_personen.append(label)
    }
}

neue_leistung_formular.addEventListener("submit", async (event) => {
    event.preventDefault()
    const name = document.querySelector("#neu_name").value.trim()
    const dauer = Number(document.querySelector("#neu_dauer").value)
    const preis = Number(document.querySelector("#neu_preis").value)
    const gewaehlt = [...neu_personen.querySelectorAll("input:checked")].map(box => Number(box.value))
    if (gewaehlt.length === 0) {
        meldungZeigen("Bitte mindestens eine Person auswählen, sonst ist die Leistung nicht buchbar.", "fehler")
        return
    }
    try {
        const ergebnis = await salonFetch("/leistung/neu", {
            method: "POST",
            body: JSON.stringify({ leistung_name: name, dauer_in_minuten: dauer, preis: preis })
        })
        for (const idMitarbeiter of gewaehlt) {
            await salonFetch("/mitarbeiter_leistung/neu", {
                method: "POST",
                body: JSON.stringify({ mitarbeiter_Id: idMitarbeiter, leistung_Id: ergebnis.insertId })
            })
        }
        neue_leistung_formular.reset()
        personenAuswahlBauen()
        meldungZeigen(`„${name}“ (${dauer} Min, ${preisFormat(preis)}) wurde angelegt.`, "erfolg")
        await leistungenLaden()
    } catch (fehler) {
        meldungZeigen(fehler.message, "fehler")
    }
})

async function start() {
    try {
        const antwort = await fetch(API + "/mitarbeiter/aktiv")
        if (!antwort.ok) {
            throw new Error("Mitarbeiter konnten nicht geladen werden")
        }
        personen = await antwort.json()
        personenAuswahlBauen()
    } catch (fehler) {
        meldungZeigen(fehler.message, "fehler")
    }
    await tagLaden()
}

if (passwort) {
    start()
}
