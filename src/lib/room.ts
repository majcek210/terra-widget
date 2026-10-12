import { Client, Room } from "@colyseus/sdk"

export default class RoomHandler {
    token: string;

    constructor(token: string) {
        this.token = token
    }
}