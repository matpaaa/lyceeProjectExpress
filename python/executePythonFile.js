const { newInfo } = require('../_utils/logs.js')
const path = require('path');
const { PythonShell } = require('python-shell')

const file = path.join(__dirname, './Pythagore.py')

function executePythonFile(params) {
    try {
        if (file && Array.isArray(params)) {
            PythonShell.run(file, { args: params }, (err, results) => {
                if (err) throw err
                newInfo('Success execute python file')
            })
        }
    } catch (error) {
        throw new Error(`Error execute pyhton file: ${error}`)
    }
}

module.exports = {
    executePythonFile
}