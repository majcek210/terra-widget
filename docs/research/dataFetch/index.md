The main mission was to find the source of the data how the terra gets the water goal.
First step was done by inspecting the html elements then looking in to the js code itself via sources > GameCanvas-Con0BJJl.js
Then i searched for hours.update and found the ki(e) then used a local overwrite with a snipet:
t.onMessage("hours.update", e => {
    console.log("HOURS UPDATE:", e);
    debugger;
    ki(e);
}),

After that i refreshed the screen and got the data and inspected it using JSON.stringify

See other files in this folder for findings.

the short summary:

WebSocket server:  game.terra.hackclub.com
Framework: Colyseus
Progress message	hours.update
Progress data structure	was Captured
Weekly goal calculation	was Verified