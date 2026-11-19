
export const SCHRITT_MINUTEN = 15
export const VORLAUF_STUNDEN = 2
export const MAX_MONATE_VORAUS = 3

export function addMinuten(date, minuten) {
    return new Date(date.getTime() + minuten * 60000)
}

export function ueberschneidet(startA, endeA, startB, endeB) {
    return startA < endeB && endeA > startB
}

export function parseLokal(datum, uhrzeit) {
    const [y, mo, d] = datum.split("-").map(Number)
    const [h, mi] = uhrzeit.split(":").map(Number)
    return new Date(y, mo - 1, d, h, mi, 0, 0)
}

export function toDbDatetime(date) {
    const p = (n) => String(n).padStart(2, "0")
    return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ` +
        `${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`
}

export function toDbDatum(date) {
    return toDbDatetime(date).slice(0, 10)
}

export function wochentagVon(date) {
    return date.toLocaleDateString("de-DE", { weekday: "long" })
}

function minutenVonUhrzeit(uhrzeit) {
    const [h, mi] = uhrzeit.split(":").map(Number)
    return h * 60 + mi
}

export function liegtInOeffnungszeit(oeffnungszeiten, start, ende) {
    if (start.toDateString() !== ende.toDateString()) return false
    const tag = oeffnungszeiten.find(t => t.tag_name === wochentagVon(start))
    if (!tag) return false
    const startMin = start.getHours() * 60 + start.getMinutes()
    const endeMin = ende.getHours() * 60 + ende.getMinutes() + (ende.getSeconds() > 0 ? 1 : 0)
    return startMin >= minutenVonUhrzeit(tag.arbeit_anfang) && endeMin <= minutenVonUhrzeit(tag.arbeit_ende)
}

export function istImRaster(date) {
    return date.getMinutes() % SCHRITT_MINUTEN === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0
}

export function pruefeBuchungszeit(start, ende, oeffnungszeiten, jetzt = new Date()) {
    const fruehesterStart = addMinuten(jetzt, VORLAUF_STUNDEN * 60)
    const spaetesterStart = new Date(jetzt)
    spaetesterStart.setMonth(spaetesterStart.getMonth() + MAX_MONATE_VORAUS)

    if (start < fruehesterStart) {
        return `Termine müssen mindestens ${VORLAUF_STUNDEN} Stunden im Voraus gebucht werden`
    }
    if (start > spaetesterStart) {
        return `Termine können höchstens ${MAX_MONATE_VORAUS} Monate im Voraus gebucht werden`
    }
    if (!istImRaster(start)) {
        return `Termine beginnen im ${SCHRITT_MINUTEN}-Minuten-Raster`
    }
    if (!liegtInOeffnungszeit(oeffnungszeiten, start, ende)) {
        return "Der Termin liegt nicht komplett in den Öffnungszeiten"
    }
    return null
}
