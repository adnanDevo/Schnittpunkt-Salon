import { allMeldungen, neueMeldungSchreiben, statusAendern, textAendern } from "../service/meldung.service.js"

export async function getMeldungen(req,res) {
    const meldungen = await allMeldungen()
    res.status(200).json(meldungen)   
}
export async function neueSchrieben(req,res) {
    const ergebnis = await neueMeldungSchreiben(req.body)
    res.status(201).json(ergebnis)
}
export async function neueStatus(req,res) {
    const ids ={
        m_id: Number(req.params.id),
        m_status: req.body.meldung_status

    }
    if(!Number.isInteger(ids.m_id)|| ids.m_id <= 0){
        return res.status(400).json({error:"Ungültige Meldung id"})
    }
    const result = await statusAendern(ids)
    return res.status(200).json(result)
}
export async function neueText(req,res) {
    const ids ={
        m_id: Number(req.params.id),
        m_text: req.body.text

    }
    if(!Number.isInteger(ids.m_id)|| ids.m_id <= 0){
        return res.status(400).json({error:"Ungültige Meldung id"})
    }
    const result = await textAendern(ids)
    return res.status(200).json(result)
}