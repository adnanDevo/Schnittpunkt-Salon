import { HttpFehler } from "./fehler.js"

export function pflichtText(wert, feldname, maxLaenge = 45) {
    if (typeof wert !== "string" || wert.trim() === "") {
        throw new HttpFehler(400, `${feldname} fehlt`)
    }
    const text = wert.trim()
    if (text.length > maxLaenge) {
        throw new HttpFehler(400, `${feldname} ist zu lang (max. ${maxLaenge} Zeichen)`)
    }
    return text
}

export function positiveGanzzahl(wert, feldname) {
    if (wert === null || wert === undefined || wert === "" || typeof wert === "boolean") {
        throw new HttpFehler(400, `${feldname} fehlt`)
    }
    const zahl = Number(wert)
    if (!Number.isInteger(zahl) || zahl <= 0) {
        throw new HttpFehler(400, `${feldname} muss eine positive ganze Zahl sein`)
    }
    return zahl
}

export function preis(wert) {
    if (wert === null || wert === undefined || wert === "" || typeof wert === "boolean") {
        throw new HttpFehler(400, "Preis fehlt")
    }
    const zahl = Number(wert)
    if (!Number.isFinite(zahl) || zahl < 0 || Number(zahl.toFixed(2)) !== zahl) {
        throw new HttpFehler(400, "Preis muss eine Zahl ≥ 0 mit höchstens 2 Nachkommastellen sein")
    }
    return zahl
}

export function istEmail(wert) {
    const text = pflichtText(wert, "E-Mail", 45).toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
        throw new HttpFehler(400, "E-Mail ist ungültig")
    }
    return text
}

export function istTelefon(wert) {
    const text = pflichtText(wert, "Telefonnummer", 20)
    if (!/^[+0-9 /()-]{6,20}$/.test(text)) {
        throw new HttpFehler(400, "Telefonnummer ist ungültig")
    }
    return text
}

export function istDatum(wert, feldname = "Datum") {
    const text = pflichtText(wert, feldname, 10)
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
    if (!m) throw new HttpFehler(400, `${feldname} muss im Format JJJJ-MM-TT sein`)
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
    const pruef = new Date(y, mo - 1, d)
    if (pruef.getFullYear() !== y || pruef.getMonth() !== mo - 1 || pruef.getDate() !== d) {
        throw new HttpFehler(400, `${feldname} ist kein gültiges Datum`)
    }
    return text
}

export function istUhrzeit(wert, feldname = "Uhrzeit") {
    const text = pflichtText(wert, feldname, 8)
    const m = /^([01]\d|2[0-3]):([0-5]\d)(:00)?$/.exec(text)
    if (!m) throw new HttpFehler(400, `${feldname} muss im Format HH:MM sein`)
    return `${m[1]}:${m[2]}:00`
}
