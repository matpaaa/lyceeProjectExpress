
// Import des modules pour le serveur Web
// const http              = require('http')
// const app               = require('express')()
const WebSocket         = require('ws')
import http from 'http'
import express from 'express'
const app = express()
import WebSocket from 'ws'

// Import pour la création des erreurs
// const { newError, newErrorCritical } = require('./errors/logsErrors.js')
// const { executePythonFile } = require('./python/executePythonFile.js')
// Import des fonctions nécessaire pour le traitement de l'image
// Ancienne version: 
// const { addImage }      = require('./functions/addImage.js')
// const { printImage }    = require('./functions/printImage.js')


const { Pythagore }     = require('./functions/Pythagore.js')
const { coreImage }     = require('./functions/coreImage.js')

// Import middleware
const multer            = require('multer')
const cors              = require('cors')
var bodyParser          = require('body-parser')

// Import Config middlware
const {
    CONFIG_CORS
} = require('./middleware/configMiddleware.js')

// Autre import
const fs                = require('fs/promises')
const path              = require('path')
const { manageProfile } = require('./functions/manageProfile.js')
const { hashData }      = require('./_utils/crypto.js')
const { getRoutes } = require('./routes/get.routes.js')

require('dotenv').config()

// Import et config de multer pour l'upload des images
const storage           = multer.memoryStorage(); // Stockage en mémoire
const upload            = multer({ storage: storage });
const server            = http.createServer(app)
const wss               = new WebSocket.Server({ server })

// Utilisation des middlware
app.use(cors(CONFIG_CORS))
app.use(bodyParser.json({ type: 'application/json' }))

// Endpoint params
app.use('/api/get', getRoutes)


let manualMove = []

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

app.get('/pixels', async (req, res, next) => {
    try {
        console.log('test')
    } catch(error) {
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
        // const pythagore = new Pythagore(dataFilePythagore, `${directoryImages}${name}`)
        // pythagore.createCoordinate(true)

        const params = [`--file:${directoryImages}${name}`, `--output:${name.split('.')[0]}`]
        executePythonFile(params)

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

// app.post('/login', async (req, res , next) => {
//     try {
//         const { password } = req.body
//         const passwordHashed = hashData(password)
//         const data = JSON.parse(await fs.readFile('./volume/password.json', 'utf8'))
//         if (passwordHashed === data.password) {
//             res.sendStatus(200)
//         } else {
//             res.sendStatus(403)
//         }

//     } catch (error) {
//         next(error)
//     }
// })

// app.post('/createPassword', async (req, res, next) => {
//     try {
//         const { password } = req.body
//         const newPasswordHashed = hashData(password)
//         const data = {
//             password: newPasswordHashed
//         }
//         await fs.writeFile('./volume/password.json', JSON.stringify(data, null, 2))
//         res.sendStatus(200)
//     } catch (error) {
//         next(error)
//     }
// })

app.post('/mouve', async (req, res, next) => {
    try {
        console.log(req.body)
        const { move, draw, direction } = req.body

        if (move, draw, direction) {
            manualMove.push({
                move,
                draw,
                direction
            })
        }
    } catch (error) {
        next(error)
    }
})

app.get('/manual-pos', async (req, res, next) => {
    try {
        const pos = manualMove[0]

        if (pos) {
            manualMove.shift()
            res.status(200).json(pos)
        }
    } catch (error) {
        next(error)
    }
})

app.use((error, req, res, next) => {
    newErrorCritical(error)
    res.sendStatus(500)
})

wss.on('connection', async (ws, req) => {
    ws.on('message', async (message) => {
        if (Buffer.isBuffer(message)) {
            console.log('test')
        }
    })
  
    ws.on('close', () => {})
})


server.listen(5000, '0.0.0.0', () => {
    try {
        console.log('Starting server')
    } catch(e) {
        newErrorCritical('Staring server error')
    }
})