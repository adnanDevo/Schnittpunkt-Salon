const leistungListe = document.querySelector("#leistungListe")
const oeffnungsListe = document.querySelector("#oeffnungsListe")

function preisFormat(preis) {
    return Number(preis).toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}

function zeile(links, rechts) {
    const leistung_all = document.createElement("div")
    leistung_all.classList.add("leistung_all")
    const leistung_name = document.createElement("div")
    leistung_name.textContent = links
    const leistung_preis = document.createElement("div")
    leistung_preis.textContent = rechts
    leistung_all.append(leistung_name, leistung_preis)
    return leistung_all
}

try {
    const res = await fetch("http://127.0.0.1:3000/api/leistung")
    if (!res.ok) {
        throw new Error("Leistungen konnten nicht geladen werden")
    }
    const daten = await res.json()
    for (const eintrag of daten) {
        if (!eintrag.aktiv) continue
        leistungListe.append(zeile(eintrag.leistung_name, `${eintrag.dauer_in_minuten} Min · ${preisFormat(eintrag.preis)}`))
    }
} catch (fehler) {
    leistungListe.textContent = "Die Leistungen können gerade nicht angezeigt werden."
    console.log("Das hat nicht geklappt:", fehler.message)
}

try {
    const res = await fetch("http://127.0.0.1:3000/api/oeffnungstag")
    if (!res.ok) {
        throw new Error("Öffnungszeiten konnten nicht geladen werden")
    }
    const tage = await res.json()
    for (const tag of tage) {
        oeffnungsListe.append(zeile(tag.tag_name, `${tag.arbeit_anfang.slice(0, 5)} – ${tag.arbeit_ende.slice(0, 5)} Uhr`))
    }
} catch (fehler) {
    oeffnungsListe.textContent = "Die Öffnungszeiten können gerade nicht angezeigt werden."
    console.log("Das hat nicht geklappt:", fehler.message)
}
