const storno_formular = document.querySelector("#storno_formular")
const stornocode = document.querySelector("#stornocode")
const btn_stornieren = document.querySelector("#btn_stornieren")
const meldung = document.querySelector("#meldung")

const codeAusLink = new URLSearchParams(window.location.search).get("code")
if (codeAusLink) {
    stornocode.value = codeAusLink
}

function meldungZeigen(text, art) {
    meldung.textContent = text
    meldung.className = art
}

storno_formular.addEventListener("submit", async (event) => {
    event.preventDefault()
    meldungZeigen("", "")
    const code = stornocode.value.trim()
    if (code === "") {
        meldungZeigen("Bitte geben Sie Ihren Stornocode ein.", "fehler")
        return
    }
    btn_stornieren.disabled = true
    try {
        const antwort = await fetch("http://127.0.0.1:3000/api/termin/storno", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stornocode: code })
        })
        const ergebnis = await antwort.json()
        if (!antwort.ok) {
            meldungZeigen(ergebnis.error, "fehler")
            return
        }
        storno_formular.reset()
        meldungZeigen("Ihr Termin wurde storniert. Schade, dass es nicht klappt. Wir freuen uns auf Ihren nächsten Besuch.", "erfolg")
    } catch (fehler) {
        meldungZeigen("Der Server ist nicht erreichbar. Bitte versuchen Sie es später noch einmal.", "fehler")
    } finally {
        btn_stornieren.disabled = false
    }
})
