const fs = require('fs/promises')
const { ErrorTypeIncorrect } = require('./errors/ErrorTypeIncorrect.js')


class ManageProfile {
    constructor(defaultProfileFile) {
        this._defaultProfileFile = process.env.USER_PROFILE || defaultProfileFile
    }

    /**
     * 
     * @param {object} newData 
     * @returns {Promise<boolean>}
     */
    async updateProfileFile(newData) {
        try {
            if (typeof(newData) === 'object') {
                await fs.writeFile(this._defaultProfileFile, JSON.stringify(newData, 0, 2))
                return true
            } else {
                throw new ErrorTypeIncorrect(['object'])
            }
        } catch (error) {
            throw new Error(error)
        }
    }

    /**
     * 
     * @returns {Promise<object>}
     */
    async readProfileFile() {
        try {
            const profileFileStringify = await fs.writeFile(this._defaultProfileFile)
            return JSON.parse(profileFileStringify)
        } catch (error) {
            throw new Error(error)
        }
    }
}

const manageProfile = new ManageProfile()

module.exports = {
    manageProfile
}