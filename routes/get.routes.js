import express from 'express'
import { coreImage } from '../functions/coreImage'

const router = express.Router()

router.get('/images', async (req, res, next) => {
    try {
        const files = await coreImage.readJsonImagesDetails()
        if (files) {
            res.json(files)
        } else {
            res.sendStatus(400)
        }
    } catch (error) {
        next(error)
    }
})

router.get('/pixels', async (req, res, next) => {
    try {
        console.log('test')
    } catch(error) {
        next(error)
    }
})

router.get('/manual-pos', async (req, res, next) => {
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

const getRoutes = router
export default getRoutes