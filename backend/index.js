import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { fileURLToPath } from "url"
import {router as meldungRouter} from "./src/router/meldung.router.js"
import {router as kundeRouter} from "./src/router/kunde.router.js"
import {router as mitarbeiterRouter} from "./src/router/mitarbeiter.router.js"
import {router as leistungRouter} from "./src/router/leistung.router.js"
import {router as oeffnungstagRouter} from "./src/router/oeffnungstag.router.js"
import {router as terminRouter} from "./src/router/termin.router.js"

const PORT = process.env.PORT || 8080
const app = express()
app.use(express.json())
app.use(cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500", "http://127.0.0.1:3000", "http://localhost:3000"],
    credentials: true
}))
app.use(cookieParser())

app.use("/api", meldungRouter)
app.use("/api", kundeRouter)
app.use("/api", mitarbeiterRouter)
app.use("/api", leistungRouter)
app.use("/api", oeffnungstagRouter)
app.use("/api", terminRouter)

app.use(express.static(fileURLToPath(new URL("../frontend", import.meta.url))))

app.use((req, res) => {
    res.status(404).json({ error: "Nicht gefunden" })
})

app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "Ungültiges JSON" })
    }
    if (err.status && err.status < 500) {
        return res.status(err.status).json({ error: err.message })
    }
    if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Datensatz existiert bereits" })
    }
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({ error: "Verweis auf einen nicht vorhandenen Datensatz" })
    }
    console.error("Fehler:", err)
    res.status(500).json({ error: "Interner Serverfehler" })
})


app.listen(PORT,()=>{console.log(`der Server läuft auf Port:${PORT}`)})
