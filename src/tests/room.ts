// had to write this to test my room logic (:
import RoomHandler from "../lib/room";


if (!process.env.TERRA_TOKEN) {
    throw new Error("ENVS ARE NOT GOOD FOR TESTING")
}
const RoomMain = new RoomHandler(process.env.TERRA_TOKEN, {debug: true})

console.log("Created the handler")

await RoomMain.connect()

console.log("Connected to the room, from the test")

RoomMain.onHoursUpdate((data) => {
    console.log("Recived data!")
    console.log(JSON.stringify(data))
})

RoomMain.onClose(() => {
    console.log("Room closed")
})

RoomMain.onCrash((data) => {
    console.log("There was a crash: "+ data)
})