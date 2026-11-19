import { pool } from "../util/db.js"

export async function getAllKunden() {
        const [rows] = await pool.execute(`SELECT * FROM kunde`)
        return rows

}
export async function neueKunde(person) {
        const [result] = await pool.execute(`INSERT INTO kunde(kunde_name,telefonnummer,mail) VALUES(?,?,?)`, [person.kunde_name,person.telefonnummer,person.mail])
        return result
}

export async function getKundeBeiEmail(mail) {
    const [result] = await pool.execute(`SELECT * FROM kunde WHERE mail = ?`,[mail])
    return result
}
