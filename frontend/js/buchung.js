const terminLeistung_kontainer = document.querySelector("#terminLeistung_kontainer")
const terminPerson_kontainer = document.querySelector("#terminPerson_kontainer")
const terminDatumzeit_kontainer = document.querySelector("#terminDatumzeit_kontainer")
const zeiten_kontainer = document.querySelector("#zeiten_kontainer")
const anzeige_datum = document.querySelector("#anzeige_datum")
const btn_zurueck = document.querySelector("#btn-zurueck")
const btn_weiter = document.querySelector("#btn-weiter")
const z_leistung = document.querySelector("#z_leistung")
const z_person = document.querySelector("#z_person")
const z_termin = document.querySelector("#z_termin")
const z_dauer = document.querySelector("#z_dauer")
const z_preis = document.querySelector("#z_preis")
const frage_kontainer = document.querySelector("#frage_kontainer")
const buchung_formular = document.querySelector("#buchung_formular")
const feld_name = document.querySelector("#feld_name")
const feld_telefon = document.querySelector("#feld_telefon")
const kunde_name = document.querySelector("#kunde_name")
const telefonnummer = document.querySelector("#telefonnummer")
const mail = document.querySelector("#mail")
const meldung = document.querySelector("#meldung")

const lesitung_url = "http://127.0.0.1:3000/api/leistung"
const mitarbeiter_url = "http://127.0.0.1:3000/api/mitarbeiter_leistung/leistung/"

let letzteZeitenUrl = null
let oeffnungszeiten = []
let aktuellesDatum = null
let ersterTag = null

const ids = {
    idLeistung: null,
    idMitarbeiter: null,
    datum: null,
    uhrzeit: null,
    leistung_name: null,
    dauer: null,
    preis: null,
    mitarbeiter_name: null
}

seiteZeigen()
async function seiteZeigen() {
    try {

        const res = await fetch(lesitung_url)
        if (!res.ok) {
            throw new Error("Leistungen konnten nicht geladen werden")
        }
        const daten = await res.json()
        for (const element of daten) {
            if (!element.aktiv) continue
            const leistung_taste = document.createElement("button")
            leistung_taste.type = "button"
            leistung_taste.classList.add("leistung_taste")
            const leistung_name = document.createElement("div")
            leistung_name.classList.add("leistung_titel")
            leistung_name.textContent = element.leistung_name
            const leistung_preisZeit = document.createElement("div")
            leistung_preisZeit.classList.add("lesitung_preisZeit")
            const leistung_dauer = document.createElement("span")
            leistung_dauer.textContent = element.dauer_in_minuten + " Min"
            const leistung_preis = document.createElement("span")
            leistung_preis.textContent = preisFormat(element.preis)
            leistung_preisZeit.append(leistung_dauer, leistung_preis)
            leistung_taste.append(leistung_name, leistung_preisZeit)
            terminLeistung_kontainer.append(leistung_taste)
            leistung_taste.addEventListener("click", async () => {
                const alleLeistungen = terminLeistung_kontainer.querySelectorAll(".leistung_taste")
                for (const taste of alleLeistungen) {
                    taste.classList.remove("gewaehlt")
                }
                leistung_taste.classList.add("gewaehlt")
                ids.idLeistung = element.idLeistung
                ids.leistung_name = element.leistung_name
                ids.dauer = element.dauer_in_minuten
                ids.preis = element.preis
                ids.idMitarbeiter = null
                ids.mitarbeiter_name = null
                letzteZeitenUrl = null
                zeitenZuruecksetzen()
                zusammenfassungZeigen()

                const res = await fetch(mitarbeiter_url + element.idLeistung)
                if (!res.ok) {
                    meldungZeigen("Mitarbeiter konnten nicht geladen werden", "fehler")
                    return
                }
                const daten = await res.json()
                const angebotIds = daten.map(person => String(person.idMitarbeiter))
                const alleTasten = terminPerson_kontainer.querySelectorAll(".mitarbeiter_taste")
                for (const taste of alleTasten) {
                    const passt = angebotIds.includes(taste.dataset.id) || (taste.dataset.id === "egal" && angebotIds.length > 0)
                    taste.classList.remove("gewaehlt")
                    if (passt) {
                        taste.classList.add("frei")
                        taste.disabled = false
                        taste.title = ""
                    } else {
                        taste.classList.remove("frei")
                        taste.disabled = true
                        taste.title = `${taste.textContent} bietet ${element.leistung_name} nicht an`
                    }
                }
            })
        }

        const response = await fetch("http://127.0.0.1:3000/api/mitarbeiter/aktiv")
        if (!response.ok) {
            throw new Error("Mitarbeiter konnten nicht geladen werden")
        }
        const personen = await response.json()
        const egal_taste = document.createElement("button")
        egal_taste.type = "button"
        egal_taste.classList.add("mitarbeiter_taste")
        terminPerson_kontainer.append(egal_taste)
        egal_taste.textContent = "Egal"
        egal_taste.dataset.id = "egal"
        egal_taste.disabled = true
        egal_taste.addEventListener("click", async () => {
            personMarkieren(egal_taste)
            ids.idMitarbeiter = "egal"
            ids.mitarbeiter_name = "egal (erste freie Person)"
            zeitenZuruecksetzen()
            zusammenfassungZeigen()
            await freieZeitenLaden(`http://127.0.0.1:3000/api/termin/egal/${ids.idLeistung}`)
        })
        for (const person of personen) {
            const mitarbeiter_taste = document.createElement("button")
            mitarbeiter_taste.type = "button"
            mitarbeiter_taste.classList.add("mitarbeiter_taste")
            const mitarbeiter = person.mitarbeiter_name
            mitarbeiter_taste.textContent = mitarbeiter
            mitarbeiter_taste.dataset.id = person.idMitarbeiter
            terminPerson_kontainer.append(mitarbeiter_taste)
            mitarbeiter_taste.disabled = true
            mitarbeiter_taste.addEventListener("click", async () => {
                personMarkieren(mitarbeiter_taste)
                ids.idMitarbeiter = person.idMitarbeiter
                ids.mitarbeiter_name = person.mitarbeiter_name
                zeitenZuruecksetzen()
                zusammenfassungZeigen()
                await freieZeitenLaden(`http://127.0.0.1:3000/api/termin/${ids.idLeistung}/${ids.idMitarbeiter}`)
            })
        }

        const ergebnisse = await fetch("http://127.0.0.1:3000/api/oeffnungstag")
        if (!ergebnisse.ok) {
            throw new Error("Öffnungszeiten konnten nicht geladen werden")
        }
        oeffnungszeiten = await ergebnisse.json()
        ersterTag = ersterBuchbarerTag()
        aktuellesDatum = new Date(ersterTag)
        rasterBauen()
        zusammenfassungZeigen()

    } catch (fehler) {
        meldungZeigen(fehler.message, "fehler")
        console.log("Das hat nicht geklappt:", fehler.message)
    }
}

function preisFormat(preis) {
    return Number(preis).toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}

function tagesPlan(datum) {
    const tagName = datum.toLocaleDateString("de-DE", { weekday: "long" })
    return oeffnungszeiten.find(eintrag => eintrag.tag_name === tagName)
}

function inMinuten(uhrzeit) {
    const [stunden, minuten] = uhrzeit.split(":")
    return Number(stunden) * 60 + Number(minuten)
}

function ersterBuchbarerTag() {
    const tag = new Date()
    tag.setHours(0, 0, 0, 0)
    const fruehesterStart = new Date(Date.now() + 2 * 60 * 60 * 1000)
    for (let i = 0; i < 14; i++) {
        const plan = tagesPlan(tag)
        if (plan) {
            const letzterStart = new Date(tag)
            letzterStart.setMinutes(inMinuten(plan.arbeit_ende) - 15)
            if (letzterStart >= fruehesterStart) {
                return tag
            }
        }
        tag.setDate(tag.getDate() + 1)
    }
    return tag
}

function letzterBuchbarerTag() {
    const grenze = new Date()
    grenze.setHours(0, 0, 0, 0)
    grenze.setMonth(grenze.getMonth() + 3)
    return grenze
}

function rasterBauen() {
    zeiten_kontainer.textContent = ""
    const tagName = aktuellesDatum.toLocaleDateString("de-DE", { weekday: "long" })
    anzeige_datum.textContent = tagName + ", " + aktuellesDatum.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
    ids.datum = datumFuerBackend(aktuellesDatum)
    btn_zurueck.disabled = aktuellesDatum <= ersterTag
    btn_weiter.disabled = aktuellesDatum >= letzterBuchbarerTag()
    const eintrag = tagesPlan(aktuellesDatum)
    if (!eintrag) {
        const hinweis = document.createElement("p")
        hinweis.classList.add("geschlossen")
        hinweis.textContent = "An diesem Tag ist der Salon geschlossen."
        zeiten_kontainer.append(hinweis)
        return
    }
    const anfang_inMinuten = inMinuten(eintrag.arbeit_anfang)
    const ende_inMinuten = inMinuten(eintrag.arbeit_ende)
    for (let i = anfang_inMinuten; i < ende_inMinuten; i += 15) {
        const Stunde = String(Math.floor(i / 60)).padStart(2, "0")
        const Minute = String(i % 60).padStart(2, "0")
        const zeitTaste = document.createElement("button")
        zeitTaste.classList.add("zeitTaste")
        zeitTaste.textContent = Stunde + ":" + Minute
        zeiten_kontainer.append(zeitTaste)
        zeitTaste.disabled = true
        zeitTaste.type = "button"
        zeitTaste.addEventListener("click", () => {
            zeitMarkieren(zeitTaste)
            ids.uhrzeit = zeitTaste.textContent
            zusammenfassungZeigen()
            frage_kontainer.hidden = false
        })
    }
}

async function datumWechseln(tage) {
    const neu = new Date(aktuellesDatum)
    neu.setDate(neu.getDate() + tage)
    if (neu < ersterTag || neu > letzterBuchbarerTag()) return
    aktuellesDatum = neu
    rasterBauen()
    zeitenZuruecksetzen()
    zusammenfassungZeigen()
    if (letzteZeitenUrl) {
        await freieZeitenLaden(letzteZeitenUrl)
    }
}

btn_zurueck.addEventListener("click", () => datumWechseln(-1))
btn_weiter.addEventListener("click", () => datumWechseln(1))

function datumFuerBackend(datum) {
    const jahr = datum.getFullYear()
    const monat = String(datum.getMonth() + 1).padStart(2, "0")
    const tag = String(datum.getDate()).padStart(2, "0")
    return `${jahr}-${monat}-${tag}`
}

function personMarkieren(gewaehlt) {
    const allePersonen = terminPerson_kontainer.querySelectorAll(".mitarbeiter_taste")
    for (const taste of allePersonen) {
        taste.classList.remove("gewaehlt")
    }
    gewaehlt.classList.add("gewaehlt")
}

function zeitMarkieren(gewaehlt) {
    const alleZeiten = zeiten_kontainer.querySelectorAll(".zeitTaste")
    for (const taste of alleZeiten) {
        taste.classList.remove("gewaehlt")
    }
    gewaehlt.classList.add("gewaehlt")
}

function zeitenZuruecksetzen() {
    const alleZeiten = zeiten_kontainer.querySelectorAll(".zeitTaste")
    for (const taste of alleZeiten) {
        taste.classList.remove("frei", "gewaehlt")
        taste.disabled = true
    }
    ids.uhrzeit = null
    frage_kontainer.hidden = true
    buchung_formular.hidden = true
}

async function freieZeitenLaden(url) {
    try {
        letzteZeitenUrl = url
        const resp = await fetch(url)
        if (!resp.ok) {
            throw new Error("Freie Zeiten konnten nicht geladen werden")
        }
        const elemente = await resp.json()
        const [jahr, monat, tag] = ids.datum.split("-")
        const tagText = `${tag}.${monat}.${jahr}`
        const freieZeiten = elemente.filter(x => x.datum === tagText).map(x => x.uhrzeitStart)
        const alleTasten = zeiten_kontainer.querySelectorAll(".zeitTaste")
        for (const taste of alleTasten) {
            const passt = freieZeiten.includes(taste.textContent)
            taste.classList.remove("gewaehlt")
            if (passt) {
                taste.classList.add("frei")
                taste.disabled = false
            } else {
                taste.classList.remove("frei")
                taste.disabled = true
            }
        }
        if (alleTasten.length > 0 && freieZeiten.length === 0) {
            meldungZeigen("An diesem Tag ist leider nichts mehr frei. Blättern Sie zum nächsten Tag.", "hinweis-box")
        } else if (meldung.className === "hinweis-box" || meldung.className === "fehler") {
            meldungZeigen("", "")
        }
    } catch (fehler) {
        meldungZeigen(fehler.message, "fehler")
    }
}

function schritteZeigen() {
    const erledigt = {
        leistung: ids.idLeistung !== null,
        person: ids.idMitarbeiter !== null,
        zeit: ids.uhrzeit !== null,
        daten: false
    }
    for (const schritt of document.querySelectorAll(".schritte li")) {
        schritt.classList.toggle("erledigt", erledigt[schritt.dataset.schritt])
    }
}

function zusammenfassungZeigen() {
    z_leistung.textContent = ids.leistung_name ?? "-"
    z_person.textContent = ids.mitarbeiter_name ?? "-"
    z_termin.textContent = ids.uhrzeit ? `${anzeige_datum.textContent}, ${ids.uhrzeit} Uhr` : "-"
    z_dauer.textContent = ids.dauer ? `${ids.dauer} Min` : "-"
    z_preis.textContent = ids.preis ? preisFormat(ids.preis) : "-"
    schritteZeigen()
}

function meldungZeigen(text, art) {
    meldung.textContent = text
    meldung.className = art
}

function erfolgZeigen(stornocode) {
    meldung.textContent = ""
    meldung.className = "erfolg"
    const titel = document.createElement("p")
    titel.textContent = "Ihr Termin ist gebucht. Bitte notieren Sie Ihren Stornocode:"
    const code = document.createElement("code")
    code.textContent = stornocode
    const hinweis = document.createElement("p")
    hinweis.textContent = "Mit diesem Code können Sie bis 24 Stunden vor dem Termin online stornieren."
    const link = document.createElement("a")
    link.href = `stornieren.html?code=${encodeURIComponent(stornocode)}`
    link.textContent = "Zur Stornierung"
    meldung.append(titel, code, hinweis, link)
}

function formularZeigen(mitNameUndTelefon) {
    buchung_formular.hidden = false
    feld_name.hidden = !mitNameUndTelefon
    feld_telefon.hidden = !mitNameUndTelefon
    kunde_name.required = mitNameUndTelefon
    telefonnummer.required = mitNameUndTelefon
    if (mitNameUndTelefon) {
        kunde_name.focus()
    } else {
        mail.focus()
    }
}

document.querySelector("#btn_ja").addEventListener("click", () => {
    formularZeigen(false)
})

document.querySelector("#btn_nein").addEventListener("click", () => {
    formularZeigen(true)
})

buchung_formular.addEventListener("submit", async (event) => {
    event.preventDefault()
    meldungZeigen("", "")
    if (!ids.idLeistung || !ids.idMitarbeiter || !ids.uhrzeit) {
        meldungZeigen("Bitte wählen Sie Leistung, Person und Uhrzeit.", "fehler")
        return
    }
    const daten = {
        idLeistung: ids.idLeistung,
        idMitarbeiter: ids.idMitarbeiter,
        datum: ids.datum,
        uhrzeit: ids.uhrzeit,
        mail: mail.value.trim()
    }
    if (!feld_name.hidden) {
        daten.kunde_name = kunde_name.value.trim()
        daten.telefonnummer = telefonnummer.value.trim()
    }
    const btn_buchen = document.querySelector("#btn_buchen")
    btn_buchen.disabled = true
    try {
        const antwort = await fetch("http://127.0.0.1:3000/api/termin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(daten)
        })
        const ergebnis = await antwort.json()
        if (!antwort.ok) {
            if (antwort.status === 404 && feld_name.hidden) {
                formularZeigen(true)
            }
            if (antwort.status === 409) {
                await freieZeitenLaden(letzteZeitenUrl)
            }
            meldungZeigen(ergebnis.error, "fehler")
            return
        }
        buchung_formular.reset()
        await freieZeitenLaden(letzteZeitenUrl)
        ids.uhrzeit = null
        frage_kontainer.hidden = true
        buchung_formular.hidden = true
        zusammenfassungZeigen()
        erfolgZeigen(ergebnis.stornocode)
    } catch (fehler) {
        meldungZeigen("Der Server ist nicht erreichbar. Bitte versuchen Sie es später noch einmal.", "fehler")
    } finally {
        btn_buchen.disabled = false
    }
})
