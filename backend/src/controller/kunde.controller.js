import { allKunden, kundeAnlegen, kuneBeiEmailFinden } from "../service/kunde.service.js"

export async function zeigeAlleKunden(req,res) {
    const ergebnis = await allKunden()
    res.status(200).json(ergebnis)
}

export async function neueKundeErstellen(req,res) {
    const kunde = await kundeAnlegen(req.body)
    res.status(201).json(kunde)

}
export async function kundeZeigenBeiEmail(req,res) {
    const email = req.query.mail
    const kunde = await kuneBeiEmailFinden(email)
    if(kunde.length === 0){
       return res.status(404).json({error:"die Kunde konnte nicht gefunden werden"})
    }
    return res.status(200).json(kunde)
}
