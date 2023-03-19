import { Sticker, StickerTypes } from 'wa-sticker-formatter'
import { downloadMediaMessage } from "@adiwajshing/baileys"
import { nanoid } from 'nanoid'

import { logger } from "../utils/logger"

export const sticker = async (sock, message) => {
    const imageBuffer = await downloadMediaMessage(message, 'buffer', {}, {
        logger, reuploadRequest: sock.updateMediaMessage
    })
    
    // reply to the message
    if (Buffer.isBuffer(imageBuffer)) {
        const sticker = new Sticker(imageBuffer, {
            pack: 'My Pack', // The pack name
            type: StickerTypes.FULL, // The sticker type
            categories: [`🔥`, '🎉'], // The sticker category
            id: nanoid(), // The sticker id
            quality: 50, // The quality of the output file
            background: 'transparent' // The sticker background color (only for full stickers)
        })
        
        await sock.sendMessage(message.key.remoteJid, await sticker.toMessage())
    }
}