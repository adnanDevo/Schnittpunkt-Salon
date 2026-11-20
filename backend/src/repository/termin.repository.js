import { pool } from "../util/db.js"

export async function getAlleTermine() {
    const [termine] = await pool.execute(`SELECT * FROM termin`)
    return termine
}

export async function getTermineProMitarbeiter(ids) {
    const [rows] = await pool.execute(`SELECT * FROM termin WHERE mitarbeiter_id = ?`, [ids.mitarbeiter_id])
    return rows
}

export async function terminMitTransaktionSpeichern(daten) {
    const connection = await pool.getConnection()
    try {
        await connection.beginTransaction()

        let gewaehlt = null
        for (const idMitarbeiter of daten.kandidaten) {
            await connection.execute(`SELECT idMitarbeiter FROM mitarbeiter WHERE idMitarbeiter = ? FOR UPDATE`, [idMitarbeiter])
            const [konflikte] = await connection.execute(
                `SELECT idTermin FROM termin
                 WHERE mitarbeiter_id = ? AND termin_status <> 'storniert'
                 AND anfang < ? AND ende > ?`,
                [idMitarbeiter, daten.ende, daten.anfang]
            )
            if (konflikte.length === 0) {
                gewaehlt = idMitarbeiter
                break
            }
        }

        if (gewaehlt === null) {
            await connection.rollback()
            return null
        }

        const [kunden] = await connection.execute(`SELECT idKunde FROM kunde WHERE mail = ?`, [daten.mail])
        let kundeId
        if (kunden.length > 0) {
            kundeId = kunden[0].idKunde
            if (daten.kunde_name) {
                await connection.execute(`UPDATE kunde SET kunde_name = ?, telefonnummer = ? WHERE idKunde = ?`,
                    [daten.kunde_name, daten.telefonnummer, kundeId])
            }
        } else {
            const [neuerKunde] = await connection.execute(`INSERT INTO kunde(kunde_name, telefonnummer, mail) VALUES (?, ?, ?)`,
                [daten.kunde_name, daten.telefonnummer, daten.mail])
            kundeId = neuerKunde.insertId
        }

        const [ergebnis] = await connection.execute(
            `INSERT INTO termin (kunde_id, mitarbeiter_id, leistung_id, anfang, ende, termin_status, stornocode)
             VALUES (?, ?, ?, ?, ?, 'offen', ?)`,
            [kundeId, gewaehlt, daten.leistung_id, daten.anfang, daten.ende, daten.stornocode]
        )

        await connection.commit()
        return { idTermin: ergebnis.insertId, mitarbeiter_id: gewaehlt }
    } catch (err) {
        await connection.rollback()
        throw err
    } finally {
        connection.release()
    }
}

export async function getTerminById(idTermin) {
    const [rows] = await pool.execute(`SELECT * FROM termin WHERE idTermin = ?`, [idTermin])
    return rows[0] ?? null
}

export async function getTerminByStornocode(stornocode) {
    const [rows] = await pool.execute(`SELECT * FROM termin WHERE stornocode = ?`, [stornocode])
    return rows[0] ?? null
}

export async function setTerminStatus(idTermin, status) {
    const [result] = await pool.execute(`UPDATE termin SET termin_status = ? WHERE idTermin = ?`, [status, idTermin])
    return result.affectedRows
}

export async function getTagesuebersicht(datum) {
    const [rows] = await pool.execute(
        `SELECT t.idTermin, t.anfang, t.ende, t.termin_status,
                m.idMitarbeiter, m.mitarbeiter_name,
                l.leistung_name, k.kunde_name, k.telefonnummer
         FROM termin t
         JOIN mitarbeiter m ON m.idMitarbeiter = t.mitarbeiter_id
         JOIN leistung l ON l.idLeistung = t.leistung_id
         JOIN kunde k ON k.idKunde = t.kunde_id
         WHERE DATE(t.anfang) = ?
         ORDER BY t.anfang`,
        [datum]
    )
    return rows
}
