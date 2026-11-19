import { getAllMeldungen, neueMeldung, meldungStatusAendern, meldungTextAendern } from "../repository/meldung.repository.js"
import { pflichtText, positiveGanzzahl } from "../util/validierung.js"

export async function allMeldungen() {
    const nachrichten = await getAllMeldungen()
    return nachrichten
}
export async function neueMeldungSchreiben(meldung) {
    const ergebnis = await neueMeldung({
        text: pflichtText(meldung.text, "Text", 255),
        meldung_status: "aktiv"
    })
    return ergebnis
}
export async function statusAendern(ids) {
    const ergebnis = await meldungStatusAendern({
        m_id: positiveGanzzahl(ids.m_id, "Meldung"),
        m_status: pflichtText(ids.m_status, "Status", 45)
    })
    return ergebnis
}
export async function textAendern(ids) {
    const ergebnis = await meldungTextAendern({
        m_id: positiveGanzzahl(ids.m_id, "Meldung"),
        m_text: pflichtText(ids.m_text, "Text", 255)
    })
    return ergebnis
}
