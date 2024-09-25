class ErrorTypeIncorrect extends Error {
    /**
     * 
     * @param {array} types 
     */
    constructor(types=[]) {
        if (!Array.isArray(types)) throw new TypeError(`Erreur 'types' doit etre un tableau: ${types}`)
        super(`Erreur la varialble reçu n'est pas de un de ces types: ${types}`)
        this.name = 'Erreur du type'
    }
}

module.exports = {
    ErrorTypeIncorrect
}