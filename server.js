
// Import des modules pour le serveur Web
const express           = require('express')
const app               = require('express')()

// Import pour la création des erreurs
const { newError, newErrorCritical } = require('./errors/logsErrors.js')

// Import des fonctions nécessaire pour le traitement de l'image
const { addImage }      = require('./functions/addImage.js')
const { printImage }    = require('./functions/printImage.js')
const { Pythagore }     = require('./functions/Pythagore.js')
const { coreImage }     = require('./functions/coreImage.js')

// Import middleware
const multer            = require('multer')
const cors              = require('cors')
var bodyParser          = require('body-parser')

// Import Config middlware
const {
    CONFIG_CORS
}                       = require('./middleware/configMiddleware.js')

// Autre import
const path              = require('path')
const { manageProfile } = require('./functions/manageProfile.js')
require('dotenv').config()

// Import et config de multer pour l'upload des images
const storage           = multer.memoryStorage(); // Stockage en mémoire
const upload            = multer({ storage: storage });

// Utilisation des middlware
app.use(cors(CONFIG_CORS))
app.use(bodyParser.json({ type: 'application/json' }))

// Ajoute d'une image
app.post('/post/images', upload.single('image'), async (req, res, next) => {
    try {
        const compareNameAlreadyExist = async (name) => {
            const images = await coreImage.readImages();
            return images.some(imageName => imageName === name);
        };

        const buffer = req.file.buffer; // L'image est maintenant dans un Buffer
        const originalName = req.file.originalname || 'default';
        const extension = originalName.split('.').pop();
        const name = originalName

        // Vérifier si une image avec ce nom existe déjà
        if (await compareNameAlreadyExist(name)) {
            next('Image name already exists');
        } else {
            const files = await coreImage.readJsonImagesDetails()
            const { size, mimetype } = req.file

            // Ajouter les détails du fichier dans le fichier JSON
            files.push({
                size,
                type: mimetype,
                name: originalName
            });

            // Ajouter l'image à partir du Buffer
            await coreImage.addImage(buffer, name)
            await coreImage.updateJsonImagesDetails(files)

            const imagesDetails = await coreImage.readJsonImagesDetails()
            res.json(imagesDetails)
        }

    } catch (error) {
        next(error);
    }
})

app.get('/get/images', async (req, res, next) => {
    try {
        const files = await coreImage.readJsonImagesDetails()
        res.json(files)
    } catch (error) {
        next(error)
    }
})

app.delete('/delete/image/:name', async (req, res, next) => {
    try {
        const imageDeletedName = req.params.name
        let files = await coreImage.readJsonImagesDetails()
        const removeImage = files.filter((image) => image.name !== imageDeletedName)

        await coreImage.updateJsonImagesDetails(removeImage)
        await coreImage.removeImage(imageDeletedName)

        files = await coreImage.readJsonImagesDetails()
        
        res.json(files)
    } catch (error) {
        next(error)
    }
})

app.put('/put/new-name', async (req, res, next) => {
    try {
        const extension = path.extname(req.body.actualName)
        const actualName = req.body.actualName
        const newName = `${req.body.newName}${extension}`

        let imagesDetails = await coreImage.readJsonImagesDetails()
        const newImagesDetails = imagesDetails.map((image) => {
            if (image.name === actualName) {
                return {
                    size: image.size,
                    type: image.type,
                    name: newName
                }
            } else {
                return image
            }
        })
        
        await coreImage.updateJsonImagesDetails(newImagesDetails)
        await coreImage.renameImage(actualName, newName)

        imagesDetails = await coreImage.readJsonImagesDetails()
        res.json(imagesDetails)
    } catch (error) {
        next(error)
    }
})

app.put('/put/print', async (req, res, next) => {
    try {
        const name = req.body.name
        const dataFilePythagore = process.env.COORDINATES_PYTHAGORE
        const directoryImages = process.env.DIRECTORY_IMAGES
        const pythagore = new Pythagore(dataFilePythagore, `${directoryImages}${name}`)
        pythagore.createCoordinate(true)

        res.sendStatus(200)
    } catch (error) {
        next(error)
    }
})

app.put('/put/profile', async (req, res, next) => {
    try {
        const dataUpdate = req.body

        const newProfile = {}

        const responseUpdate = await manageProfile.updateProfileFile(newProfile)
        if (responseUpdate) {
            res.sendStatus(200)
        } else {
            res.sendStatus(500)
        }
    } catch (error) {
        next(error)
    }
})

app.use((error, req, res, next) => {
    newErrorCritical(error)
    res.sendStatus(500)
})

// Démarrage du serveur Web
app.listen(5000, '0.0.0.0', () => {
    try {
        console.log('Le serveur est allumé')
    } catch(e) {
        newErrorCritical('Erreur lors du lancement du serveur')
    }
})