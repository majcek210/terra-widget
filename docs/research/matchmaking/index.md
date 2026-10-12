Nothing much here we just found the match making request that was needed for the system.
The following Colyseus matchmaking request findings:
Server	https://game.terra.hackclub.com
Method	POST
Endpoint	/matchmake/joinOrCreate/world
Room name	world
Response status	200 OK
Authentication	JWT in the request body
WebSocket message	hours.update

Found that payload has this structure:
{
  "token": "<JWT_ACCESS_TOKEN>",
  "levelId": "town-square",
  "fromSessionId": "<SESSION_ID>",
  "protocol": 1
}