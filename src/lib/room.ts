import { Client, Room } from "@colyseus/sdk"
import { error } from "console";


//configs
const client = new Client("https://game.terra.hackclub.com")
const MAX_HOPS = 3;


export interface  roomOptions {
    debug: boolean
}
interface RedirectMessage { levelId: string; farmOwnerId?: string }

export default class RoomHandler {
    token: string;
    current: Room |null;
    leaving: boolean
    options: roomOptions = { debug: false}
    hops: number
    hopping: boolean

    started: number
    
    constructor(token: string, options: roomOptions) {
        if (!token) {
           throw error("Somehow token wasn't set.")
        }

        this.token = token;
        this.current = null;
        this.leaving = false;
        this.hopping = false;
        this.options = options;

        this.hops = 0;

        this.started = Date.now();

    }

    log(message: string) {
        console.log(`${((Date.now() - this.started) / 1000).toFixed(1).padStart(7)}s | ${message}`)
    }

    debug (message: string) {
        if (!this.options.debug) return
        console.log(`${((Date.now() - this.started) / 1000).toFixed(1).padStart(7)}s | ${message}`)
    }

    async errorCrash(msg:string) {
        // ui logic wilkl be implementedd here later when i work on it
        console.log("Oh no! an error has occured! " + msg)
    }

    async connect() {
        this.hops = 0
        this.leaving = false
        await this.join("town-square")
    }

    async join(levelId: string, ...extra : any) {
        const instance = await client.joinOrCreate(
            "world", { 
                token: this.token,
                levelId: levelId,
                protocol: 1,
                ...extra
            },
        )
        this.current = instance
        this.attach(instance)
    }

    async disconnect() {
        this.leaving = true
        const room = this.current
        this.current = null
        if (room) {
            room.reconnection.maxRetries = 0
            await room.leave(true)
        }
    }

    private async hop(room: Room, msg: RedirectMessage) {
        if (this.hopping || this.leaving) return

        if(this.hops >= MAX_HOPS) {
            void this.errorCrash("To many redirects!")
            return
        }

        this.hops += 1
        this.hopping = true
        try {
            const fromSessionId = room.sessionId
            room.reconnection.maxRetries = 0
            await room.leave(true)
            this.debug(`hop ${this.hops}: joining ${msg.levelId}`)
            await this.join(msg.levelId, { farmOwnerId: msg.farmOwnerId, fromSessionId})
        } catch (err) {
            this.current = null
            void this.errorCrash(`Something went wrong(hop failed)! with error: ${err}`)
        } finally {
            this.hopping = false
        }
    }
    private attach(room: Room) {
        this.debug(`JOINED room ${room.roomId} session ${room.sessionId}`)

        //i was recommened to void these 2 bc they produce too much uneceserry output
        room.onMessage("chat.message", () => {})
        room.onMessage("pingCheck", () => {})

        room.onMessage("*", (type,msg) => {
          this.debug(`unhandled ${String(type)} bytes=${JSON.stringify(msg)?.length ?? 0}`)
        })


        room.onMessage("sessionConflict", () => {
            this.leaving = true
            room.reconnection.maxRetries = 0
            this.current = null
            void room.leave(true)
            void this.errorCrash("This account is already active somewhere, please close the tab in order to use the widget!")
        })

        room.onMessage("redirectToLevel", (rm: RedirectMessage) => {
            void this.hop(room, rm)
        })

        room.onLeave((code) => {
            if (room !== this.current) return
            if (this.hopping ||this.leaving) return
            this.log(`unexpected leave, code ${code}`)
        })

        room.onError((code, message) => this.log(`ROOM ERROR ${code} ${message}`))
    }
}