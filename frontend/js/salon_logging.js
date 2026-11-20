const login_formular = document.querySelector("#login_formular")
const passwortFeld = document.querySelector("#passwort")
const btn_anmelden = document.querySelector("#btn_anmelden")
const meldung = document.querySelector("#meldung")

if (sessionStorage.getItem("salonPasswort")) {
    window.location.href = "salon.html"
}

function meldungZeigen(text, art) {
    meldung.textContent = text
    meldung.className = art
}

function heuteFuerBackend() {
    const heute = new Date()
    const monat = String(heute.getMonth() + 1).padStart(2, "0")
    const tag = String(heute.getDate()).padStart(2, "0")
    return `${heute.getFullYear()}-${monat}-${tag}`
}

login_formular.addEventListener("submit", async (event) => {
    event.preventDefault()
    meldungZeigen("", "")
    const passwort = passwortFeld.value
    btn_anmelden.disabled = true
    try {
        const antwort = await fetch(`http://127.0.0.1:3000/api/termin/tag?datum=${heuteFuerBackend()}`, {
            headers: { "x-salon-passwort": passwort }
        })
        if (antwort.status === 401) {
            meldungZeigen("Das Passwort ist falsch.", "fehler")
            passwortFeld.select()
            return
        }
        if (!antwort.ok) {
            meldungZeigen("Anmeldung gerade nicht möglich. Bitte später erneut versuchen.", "fehler")
            return
        }
        sessionStorage.setItem("salonPasswort", passwort)
        window.location.href = "salon.html"
    } catch (fehler) {
        meldungZeigen("Der Server ist nicht erreichbar. Bitte versuchen Sie es später noch einmal.", "fehler")
    } finally {
        btn_anmelden.disabled = false
    }
})
