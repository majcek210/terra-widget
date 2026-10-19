![time](https://hackatime.hackclub.com/api/v1/badge/U0C7Q1X50RX/majcek210/terra-widget)

# terra-widget
The project's goal is to make a widget for your desktop that would show off your water goals and working hours, so you wont need to have terra open everytime.
The project will for now be written in typescript.
App will require you to provide your own session token(see the setup part for the tutorial) that will be used to run the widget, I might implement some other automatic options, when i test them and check the ToS of terra.
Thanks!

# Notice
You computer will probably block the exe from running. To unblock it: Right-click Terra.Widget.x.x.x.exe, choose Properties, tick Unblock at the bottom, click OK, then double-click it.

# Setup
1. Grab the latest exe from [Releases](https://github.com/majcek210/terra-widget/releases). `Terra.Widget.Setup.x.x.x.exe` installs it, `Terra.Widget.x.x.x.exe` is portable and just runs.
2. Windows will probably say "Windows protected your PC" because the exe isn't signed. Click **More info** and then **Run anyway**.
3. The widget sits in the bottom left corner of your screen. It has no taskbar icon, so look for it there.
4. Click **More**, paste your Terra token (see below) and hit **Save token**. You can move the widget with the margins in the same window.

Your token is saved encrypted on your PC (only your Windows account can read it) and is only sent to Terra.

## Getting your token
1. Open [terra.hackclub.com](https://terra.hackclub.com) in your browser and press **F12** to open DevTools.
2. Go to the **Network** tab and type `exchange` in the filter box.
3. Log in to Terra (if you're already logged in, log out and back in, the request only shows up on login).
4. Click the `exchange` request and open **Response**. Copy the value of `"token"`, without the quotes.
5. Close the Terra tab, otherwise the widget will tell you Terra is open somewhere else.

Treat the token like a password and don't share it. When it expires the widget asks you to sign in again, just repeat these steps.

## Building it yourself
```
npm install
npm run dev    # run it with hot reload
npm run dist   # build both exes into release/
```

# AI usage
AI was used to make the settings page(**ONLY** html and css) cause im pretty bad at designing. It was also used to checkup the security before shiping and a bit of ai code was produced here to keep it secure.

# a small note
Note to the reviewers: Comments are for my better understanding and not from ai code (:
