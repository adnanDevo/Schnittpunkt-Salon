import { pool } from "../util/db.js"

export async function getAlleLeistungen() {
    const [rows] = await pool.execute(`SELECT * FROM leistung `)
    return rows
}
export async function getLeistungById(idLeistung) {
    const [rows] = await pool.execute(`SELECT * FROM leistung WHERE idLeistung = ?`, [idLeistung])
    return rows[0] ?? null
}
export async function neueLeistung(ids) {
    const [results] = await pool.execute(`INSERT INTO leistung(leistung_name, dauer_in_minuten, preis)
        VALUES (?,?,?)`, [ids.leistung_name, ids.dauer_in_minuten, ids.preis])
    return results
}

export async function leistungAendern(ids) {
    const [daten] = await pool.execute(`SELECT * FROM leistung WHERE idLeistung =?`, [ids.idLeistung])
    if (daten.length === 0) return null
    const name = ids.leistung_name ?? daten[0].leistung_name
    const dauer = ids.dauer_in_minuten ?? daten[0].dauer_in_minuten
    const preis = ids.preis ?? daten[0].preis
    const aktiv = ids.aktiv ?? daten[0].aktiv
    const [rows] = await pool.execute(`UPDATE leistung SET leistung_name =?, dauer_in_minuten = ?, preis =?, aktiv = ?
                            WHERE idLeistung =? `, [name, dauer, preis, aktiv, ids.idLeistung])
    return rows
}

export async function leistungStatusAendern(ids) {
    const [rows] = await pool.execute(`UPDATE leistung SET aktiv = NOT aktiv WHERE idLeistung = ?`, [ids.idLeistung])
    return rows
}
