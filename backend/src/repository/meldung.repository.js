import { pool } from "../util/db.js"

export async function getAllMeldungen() {
        const [rows] = await pool.execute(`SELECT * FROM meldung`)
        return rows

}
export async function neueMeldung(meldung) {
        const [result] = await pool.execute(`INSERT INTO meldung(text,meldung_status) VALUES(?,?)`, [meldung.text,meldung.meldung_status])
        return result
}


export async function meldungStatusAendern(ids) {
    const [result] = await pool.execute(`UPDATE meldung SET meldung_status = ? WHERE idMeldung = ?`,[ids.m_status,ids.m_id])
    return result
}
export async function meldungTextAendern(ids) {
  const [result] = await pool.execute(`UPDATE meldung SET text = ? WHERE idMeldung = ?`,[ids.m_text,ids.m_id])  
  return result
}