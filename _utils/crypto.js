const crypto = require('crypto')

/**
 * Hash des données à partir d'une string
 * @param {string} data 
 * @returns {string}
 */
function hashData(data) {
    try {
        if (typeof(data) !== 'string') throw new Error(`Error type de la valeur data dans hashData, data: ${typeof(data)}`)

        const hash = crypto.createHash('sha256')
        hash.update(data)
        return hash.digest().toString('base64')

    } catch (error) {
        throw new Error(`Erreur dans la fonction hashdata: ${error}`)
    }
}

module.exports = {
    hashData
}