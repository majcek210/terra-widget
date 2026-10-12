### LOGIN FLOW

1. Start of the login
https://api.terra.hackclub.com/auth/login
Terra starts the login process,
2. Authorize through Hack Club
https://auth.hackclub.com/oauth/authorize
The request includes response_type=code, code_challenge, and code_challenge_method=S256. These identify an OAuth authorization-code flow with PKCE.
3. OAuth callback
https://api.terra.hackclub.com/auth/callback
hack Club redirects back with am auth code and the state
4. Return to terra
https://terra.hackclub.com/?code=...
browser recives the seperate code to exchange
5. Exchange the code
https://api.terra.hackclub.com/auth/exchange?code=...
This is the most important request to investigate next. It likely establishes the session or provides the credentials used to authenticate with Terra's game server.

The current structure(as time of this research) follows:
Hack Club login > Terra authentication > Colyseus matchmaking > WebSocket > hours.update