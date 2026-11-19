import crypto from "crypto"
import { HttpFehler } from "./fehler.js"

export function salonAuth(req, res, next) {
    const erwartet = process.env.SALON_PASSWORT
    if (!erwartet) {
        return next(new HttpFehler(500, "SALON_PASSWORT ist nicht gesetzt"))
    }
    const angegeben = req.get("x-salon-passwort") ?? ""
    const a = Buffer.from(angegeben)
    const b = Buffer.from(erwartet)
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return next(new HttpFehler(401, "Zugang verweigert"))
    }
    next()
}
