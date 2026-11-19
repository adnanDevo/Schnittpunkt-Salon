import { pool } from "../util/db.js"

export async function getAlleTagen() {
    const [tage] = await pool.execute(`SELECT * FROM oeffnungstag`)
    return tage
}

export async function tageAendern(ids) {
    const [ergebnis] = await pool.execute(`UPDATE oeffnungstag SET arbeit_anfang =? , arbeit_ende=?
                WHERE idOeffnungstag =?`,[ids.arbeit_anfang, ids.arbeit_ende, ids.idOeffnungstag])
    return ergebnis
}

