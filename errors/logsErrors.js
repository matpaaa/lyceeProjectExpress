const { Logs } = require('goupil-logs')
globalThis.Log = new Logs()

Log.setup({
    pathfile: 'volume/logsServerFunctions',
    formatfilename: 'Log %j-%M-%a.log',
    prefixlog: '[%h:%m %j/%M/%a][%type]'
})

/**
 * 
 * @param {string} errorName 
 */
async function newError(errorName) {
    try {
        Log.error(errorName)
    } catch(e) {
        console.error(`Erreur dans la fonction newError pour la gestion des logs : ${e}`)
    }
}

/**
 * 
 * @param {string} errorName 
 */
async function newErrorCritical(errorName) {
    try {
        Log.critical(errorName)
    } catch(e) {
        console.error(`Erreur dans la fonction newErrorCritical pour la gestion des logs : ${e}`)
    }
}

module.exports = {
    newError,
    newErrorCritical
}