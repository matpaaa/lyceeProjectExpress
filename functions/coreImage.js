const fs = require('fs/promises')
require('dotenv').config('../')

const { ErrorTypeIncorrect } = require('./errors/ErrorTypeIncorrect.js')

const DEFAULT_PATH = {
    imagesStorage: './volume/images/',
    imagesDetails: './volume/imagesDetails.json'
}

class CoreImage {
    constructor(pathDirectoryImages=null, pathJsonImagesDetails=null) {
        this._pathDirectoryImages   = process.env.DIRECTORY_IMAGES  || pathDirectoryImages
        this._pathJsonImagesDetails = process.env.IMAGES_DETAILS    || pathJsonImagesDetails
    }

    /**
     * Renvoie le JSON.parse() du fichier "imagesDetails.json"
     * @returns {Promise<object>}
     */
    async readJsonImagesDetails() {
        try {
            const files = await fs.readFile('./volume/imagesDetails.json', 'utf8')
            return JSON.parse(files)
        } catch (error) {
            throw new Error(`Erreur dans la fonction readJsonImagesDetails: ${error}`)
        }
    }

    /**
     * Ajoute une image à partir d'un Buffer
     * @param {buffer} buffer 
     * @param {string} name 
     * @returns {Promise<boolean>}
     */
    async addImage(buffer, name) {
        try {
            if (Buffer.isBuffer(buffer) && typeof(name) === 'string') {
                const filePath = `${this._pathDirectoryImages}${name}`;
                await fs.writeFile(filePath, buffer); // Écrit le Buffer dans le fichier
                return true;
            } else {
                throw new ErrorTypeIncorrect(['Buffer', 'string']);
            }
        } catch (error) {
            throw new Error(`Erreur dans la fonction addImage: ${error}`);
        }
    }

    /**
     * Supprimer une image à partir de son nom
     * @param {string} name 
     * @returns {Promise<boolean>}
     */
    async removeImage(name) {
        try {
            if (typeof(name) === 'string') {
                await fs.unlink(`${this._pathDirectoryImages}${name}`)
                return true
            } else {
                throw new ErrorTypeIncorrect(['string'])
            }
        } catch (error) {
            throw new Error(`Erreur dans la fonction removeImage: ${error}`)
        }
    }

    /**
     * Permet de lire toutes les images dans le dossier images
     * @returns {Promise<object>}
     */
    async readImages() {
        try {
            const images = await fs.readdir(this._pathDirectoryImages)
            return images
        } catch (error) {
            throw new Error(`Erreur dans la fonction readImages: ${error}`)
        }
    }

    /**
     * Permet de changer le nom d'une image
     * @param {string} actualName 
     * @param {string} newName 
     * @returns {Promise<boolean>}
     */
    async renameImage(actualName, newName) {
        try {
            if (typeof(actualName) === 'string' && typeof(newName) === 'string') {
                await fs.rename(`${this._pathDirectoryImages}${actualName}`, `${this._pathDirectoryImages}${newName}`)
                return true
            } else {
                throw new ErrorTypeIncorrect(['string'])
            }
        } catch (error) {
            throw new Error(`Erreur dans la fonction renameImage: ${error}`)
        }
    }

    /**
     * Permet de mettre à jour le fichier imagesDetails.json
     * @param {object} newData 
     * @returns {Promise<boolean>}
     */
    async updateJsonImagesDetails(newData) {
        try {
            if (typeof(newData) === 'object') {
                await fs.writeFile(this._pathJsonImagesDetails, JSON.stringify(newData, null, 2))
                return true
            } else {
                throw new ErrorTypeIncorrect(['object'])
            }
        } catch (error) {
            throw new Error(`Erreur dans la fonction updateJsonImagesDetails: ${error}`)
        }
    }
}

const coreImage = new CoreImage(DEFAULT_PATH.imagesStorage, DEFAULT_PATH.imagesDetails)

module.exports = {
    coreImage
}