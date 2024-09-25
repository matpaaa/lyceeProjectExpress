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
function newError(errorName) {
    try {
        Log.error(errorName)
    } catch(e) {
        console.error(`Erreur dans la fonction newError: ${e}`)
    }
}

/**
 * 
 * @param {string} errorName 
 */
function newErrorCritical(errorName) {
    try {
        Log.critical(errorName)
    } catch(e) {
        console.error(`Erreur dans la fonction newErrorCritical: ${e}`)
    }
}

function newInfo(info) {
    try {
        Log.info(info)
    } catch (error) {
        console.error(`Erreur dans la fontion newInfo`)
    }
}

module.exports = {
    newError,
    newErrorCritical,
    newInfo
}