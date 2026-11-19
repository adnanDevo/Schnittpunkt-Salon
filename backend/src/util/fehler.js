export class HttpFehler extends Error {
    constructor(status, nachricht) {
        super(nachricht)
        this.status = status
    }
}
