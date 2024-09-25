const fs = require('fs')
const { newError } = require('./../errors/logsErrors.js')

/*

Lire tous les nom d'image dans le dossier ./images
Ajouter l'image au format JPG
Si le nom existe déja alors retourné une erreur

*/

class AddImage {
    constructor(imageDirectory=null, jsonMoreDetailsFile=null) {
        this.imageDirectory = imageDirectory ? imageDirectory : undefined
        this._jsonMoreDetailsFile = jsonMoreDetailsFile
        this.allName = []
    }

    putImageName() {
        try {
            fs.readdir(this.imageDirectory, (err, files) => {
                if (err) {
                    throw err
                }

                files.forEach(file => {
                    this.allName.push(file.split('.')[0])
                })
            })
        } catch(e) {
            newError(`Erreur lors de la lecture du dossier des images : ${e}`)
            return false
        }
    }

    get getImageName() {
        return this.allName
    }

    getPathImage(name) {
        return `${this.imageDirectory}${name}.jpg`
    }

    compareStringWithList(string, list=this.allName) {
        try {
            if (list.some(element => element == string)) {
                return true
            } else {
                return false
            }
        } catch(e) {
            newError(`Erreur dans la comparaison de données : ${e}`)
            return false
        }
    }

    addMoreDetailsImage(imageDetails) {
        try {
            const { size, mimetype, originalname } = imageDetails

            const file = fs.readFileSync(this._jsonMoreDetailsFile)
            const dataJSON = JSON.parse(file)
            dataJSON.push({
                name: originalname,
                size,
                type: mimetype
            })
            fs.writeFileSync(this._jsonMoreDetailsFile, JSON.stringify(dataJSON, undefined, 2))
        } catch (error) {
            throw new Error(`Erreur lors de l'ajout des détails supplémentaire dans le fichier JSON: ${error}`)
        }
    }imageDetails

    addImage(image, name, path=`${this.imageDirectory}/default.jpg`, imageDetails) {
        try {
            if (this.compareStringWithList(name)) return {
                status: false,
                message: 'Image name already use'
            }
            // console.log(this.compareStringWithList(name))

            fs.rename(image, path, (err) => {
                if (err) {
                    throw err
                }
            })
            
            this.addMoreDetailsImage(imageDetails)
            return {
                status: true,
                message: 'Image added'
            }
        } catch(e) {
            newError(`Erreur dans l'ajout d'une nouvelle image : ${e}`)
            return {
                status: false,
                message: 'Error adding image'
            }
        }
    }

    readImagesDetails() {
        try {
            const file = fs.readFileSync(this._jsonMoreDetailsFile, 'utf8')
            if (file) {
                const dataJSON = JSON.parse(file)
                return dataJSON
            }
            return []
        } catch (error) {
            throw new Error(error)
        }
    }
}

const addImage = new AddImage('./volume/images/', './volume/imagesDetails.json')
addImage.putImageName()

module.exports = {
    addImage,
}