import makeWASocket, { 
    DisconnectReason,  
    useMultiFileAuthState,
    makeInMemoryStore,
    WAMessage,
} from '@adiwajshing/baileys'

import { Boom } from '@hapi/boom'

import { sticker } from './modules/sticker'

async function connectToWhatsApp () {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
    const store = makeInMemoryStore({ })

    // Handle store data
    store.readFromFile('./baileys_store.json')
    // saves the state to a file every 10s
    setInterval(() => {
        store.writeToFile('./baileys_store.json')
    }, 10_000)

    const sock = makeWASocket({
        // can provide additional config here
        printQRInTerminal: true,
        auth: state
    })

    // bind the store to the socket
    store.bind(sock.ev)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    })

    sock.ev.on('messages.upsert', async ({messages}) => {
        console.log('replying to', messages[0].key.remoteJid)

        const m = messages[0]
        const messageTypes = Object.keys(m.message) as Array<keyof WAMessage['message']>

        if(messageTypes.length === 0) {
            console.log('no message type')
            return
        }

        if(m.key.fromMe) {
            console.log('from me')
            return
        }

        const messageType = messageTypes[0]

        if(messageType === 'imageMessage') {
            console.log(m.message.imageMessage)

            sticker(sock, m)
        }
    })

    sock.ev.on('creds.update', saveCreds)
}
// run in main file
connectToWhatsApp()