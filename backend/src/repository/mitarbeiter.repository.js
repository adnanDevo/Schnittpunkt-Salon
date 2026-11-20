import { pool } from "../util/db.js"

export async function getAlleMitarbeiter() {
    const [rows] = await pool.execute(`SELECT * FROM mitarbeiter `)
    return rows
}
export async function getAktiveMitarbeiter() {
    const [rows] = await pool.execute(`SELECT idMitarbeiter, mitarbeiter_name FROM mitarbeiter
        WHERE mitarbeiter_status = 'aktiv' ORDER BY idMitarbeiter`)
    return rows
}
export async function neuerMitarbeiteranlegen(person) {
    const [result] = await pool.execute(`INSERT INTO mitarbeiter(mitarbeiter_name,mitarbeiter_status)
        VALUES (?,?)`,[person.mitarbeiter_name,person.mitarbeiter_status ?? 'aktiv'])
    return result
}
export async function mitarbeiterEntfernen(person) {
    const [daten] = await pool.execute(`UPDATE mitarbeiter SET mitarbeiter_status = 'inaktiv'
                        WHERE idMitarbeiter = ?`,[person.idMitarbeiter])
    return daten
}
export async function getLeistungBeiMitarbeiter(ids) {
    const [leistungen] = await pool.execute(`SELECT m.mitarbeiter_name, l.leistung_name FROM leistung l
        LEFT JOIN mitarbeiter_leistung ml ON ml.leistung_Id = l.idLeistung
        LEFT JOIN mitarbeiter m ON m.idMitarbeiter = ml.mitarbeiter_Id
         WHERE m.idMitarbeiter =?`,[ids.idMitarbeiter])
    return leistungen
}
export async function getMitarbeiterProLeistung(ids) {
    const [mitarbeitern] = await pool.execute(`SELECT m.idMitarbeiter, m.mitarbeiter_name, l.leistung_name FROM leistung l
        LEFT JOIN mitarbeiter_leistung ml ON ml.leistung_Id = l.idLeistung
        LEFT JOIN mitarbeiter m ON m.idMitarbeiter = ml.mitarbeiter_Id
         WHERE l.idLeistung = ? AND l.aktiv = 1 AND m.mitarbeiter_status = 'aktiv'
         ORDER BY m.idMitarbeiter`,[ids.idLeistung])
    return mitarbeitern
}
export async function istLeistungBeiMitarbeiter(mitarbeiterId, leistungId) {
    const [rows] = await pool.execute(`SELECT m.idMitarbeiter FROM mitarbeiter m
        JOIN mitarbeiter_leistung ml ON ml.mitarbeiter_Id = m.idMitarbeiter
        JOIN leistung l ON l.idLeistung = ml.leistung_Id
        WHERE m.idMitarbeiter = ? AND l.idLeistung = ? AND m.mitarbeiter_status = 'aktiv' AND l.aktiv = 1`,
        [mitarbeiterId, leistungId])
    return rows.length > 0
}
export async function leistungZuMitarbeiter(ids) {
    const [leistung] = await pool.execute(`INSERT INTO mitarbeiter_leistung(mitarbeiter_Id, leistung_Id)
         VALUES (?,?) `,[ids.mitarbeiter_Id,ids.leistung_Id])
    return leistung
}
export async function leistungVonMitarbeiterEntfernen(ids) {
    const [leistungen] = await pool.execute(`DELETE FROM mitarbeiter_leistung WHERE
         idMitarbeiter_leistung =? `,[ids.idMitarbeiter_leistung])
    return leistungen
}
export async function getFreieTage(ids) {
    const [ergebnis] = await pool.execute(`SELECT m.mitarbeiter_name, o.tag_name FROM mitarbeiter m
         LEFT JOIN freietagen f ON f.mitarbeiter_id = m.idMitarbeiter
         LEFT JOIN oeffnungstag o ON o.idOeffnungstag = f.tag_id
         WHERE m.idMitarbeiter = ? `,[ids.idMitarbeiter])
    return ergebnis
}
export async function freienTagHinzufuegen(ids) {
    const [rows] = await pool.execute(`INSERT INTO freietagen (mitarbeiter_id, tag_id) VALUES
                        (?,?) `,[ids.mitarbeiter_id,ids.tag_id])
    return rows
}
export async function freienTagEntfernen(ids) {
    const [ergebnis] = await pool.execute(`DELETE FROM freietagen WHERE
        idFreieTagen =? `,[ids.idFreieTagen])
    return ergebnis
}
