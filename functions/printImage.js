const { newError } = require('./../errors/logsErrors.js')
const { addImage } = require('./addImage.js')
//import pythagore from './Pythagore.js'
const fs = require('fs')

/*

Regarde si le nom existe, si il existe pas cela return false sinon true
Récupere les coordonnées de l'image
return les coordonnées

*/

class PrintImage {
    constructor(imageDirectory=null, imageDataDirectory=null) {
        this.imageDirectory = imageDirectory ? imageDirectory : undefined
        this.imageDataDirectory = imageDataDirectory ? imageDataDirectory : undefined
        this.coordinate = null
        this.allDataCoordinate = null
    }

    coordinateCreate(name='default') {
        try {
            addImage.putImageName()
            if (addImage.compareStringWithList(name)) {
                // coordonnées des pixels de l'image
                const imageSelect = addImage.getPathImage(name)
                console.log(imageSelect)
                this.coordinate = getDataImage(imageSelect)

                fs.readFile(this.imageDataDirectory, (e, data) => {
                    if (e) {
                        throw e
                    }

                    const dataParseImage = JSON.parse(data)
                    dataParseImage[name] = this.coordinate
                    this.allDataCoordinate = dataParseImage

                    if (this.allDataCoordinate) {
                        console.log(this.coordinate)
                        fs.writeFile(this.imageDataDirectory, JSON.stringify(this.allDataCoordinate), (e) => {
                            if (e) {
                                throw e
                            }

                            console.log('Donnée écrite')
                        })
                    } else {
                        throw new Error(`Erreur 'allDataCoordinate' ne contient aucune valeur`)
                    }
                })

            } else {
                return false
            }
        } catch (e) {
            newError(`Erreur lors de la récupération des coordonnées : ${e}`)
        }
    }

    get getCoordinate() {
        return this.coordinate
    }
}

const printImage = new PrintImage('./images/', './storage/data.json')

module.exports = {
    printImage
}