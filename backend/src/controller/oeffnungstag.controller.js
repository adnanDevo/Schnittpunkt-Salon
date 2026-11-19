import { alleTagen, aendereTagen } from "../service/oeffnungstag.service.js"

export async function gesamteTagen(req,res) {
    const results = await alleTagen()
    return res.status(200).json(results)
}

export async function tageUpdaten(req,res) {
    const ids={
        idOeffnungstag: Number(req.params.id),
        arbeit_anfang: req.body.arbeit_anfang,
        arbeit_ende: req.body.arbeit_ende
    }
    const ergebnis = await aendereTagen(ids)
    return res.status(200).json(ergebnis)
}
