const fs = require('fs');
const pixels = require('image-pixels');
const { newError } = require('../errors/logsErrors.js');

class Pythagore {
    constructor(dataFile = null, nameImage = null) {
        this.dataFile = dataFile;
        this.nameImage = nameImage;
    }

    set newName(name) {
        this.nameImage = name;
    }

    async createCoordinate(saveFile=false) {
        const {data, width, height} = await pixels(this.nameImage)

        this.objectColor = {};
        let cursor = 0;
        let oldValue = null, heightreturn = false;

        var x, y;

        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                if (heightreturn) {
                    this.objectColor[`${x}-${y}`] = 0;

                    heightreturn = false;
                }

                let blackOrWhite = (((data[cursor] + data[cursor + 1] + data[cursor + 2]) / 2) >= 382.5 ? 1 : 0);

                if (blackOrWhite == 0 && oldValue != 0) {
                    this.objectColor[`${x}-${y}`] = blackOrWhite;

                    oldValue = blackOrWhite;
                } else if (blackOrWhite == 1 && oldValue != 1 && oldValue != null) {
                    this.objectColor[`${x - 1}-${y}`] = 0;

                    oldValue = blackOrWhite;
                }
                cursor += 4;
            }
            if (oldValue == 0) {
                this.objectColor[`${x}-${y}`] = 0;

                heightreturn = true;
            }
        }

        this.allImageDataFile = {
            height: height,
            width:  width,
            data: Object.keys(this.objectColor)
        }
        saveFile ? this.saveCoodinate() : null
    }

    get allCoordinate() {
        try {
            return fs.readFileSync(this.dataFile)
        } catch (e) {
            newError(`Erreur lors de la lecture des coordonnées : ${e}`)
        }
    }

    saveCoodinate() {
        fs.writeFileSync(this.dataFile, JSON.stringify(this.allImageDataFile, null, 4));
    }
}

// const pythagore = new Pythagore('./storage/data.json', './images/default.jpg')
// pythagore.createCoordinate(true)
// pythagore.saveCoodinate()

module.exports = {
    Pythagore
}