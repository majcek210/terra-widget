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
3. The widget sits in one of the corners of your screen. It has no taskbar icon, so you will need to find it in the tray.
4. If you click the terra widget tray icon directly it will take you to settings, right right clicking it you can also quit and reconnect. In the settings , paste your Terra token (see below) and hit **Save token**. You can move the widget with the margins in the same window.
Your token is saved encrypted on your PC (only your Windows account can read it) and is only sent to Terra.

# Windows installation and updates
Terra Widget supports automatic updates when installed with **NSIS installer**.
Portable builds do not install updates automaticlly. Download the latest version from the GitHub Releases. 
The application is unsigned so a windows SmartScreen may display a warning when you download or run a release.

# Linux installation and guide
**LINUX SUPPORT HAS NOT BEEN OFFICIALLY TESTED**

- **AppImage**: download it, `chmod +x terra-widget-*.AppImage`, run it. Updates install automatically.
  Needs FUSE 2 (`sudo apt install libfuse2` on Ubuntu 22.04+).
- **.deb** (Ubuntu/Debian): `sudo apt install ./terra-widget-*.deb`. Updates: download the new .deb from Releases.
- **GNOME** has no tray by default. Install the "AppIndicator and KStatusNotifierItem Support"
  extension (Ubuntu already has it), or launch Terra Widget again to open Settings.
- Your token is stored in the system keyring (GNOME Keyring / KWallet). Without a keyring it is
  only kept until you quit.
- If the AppImage won't start on Ubuntu 24.04+ with a sandbox error, use the .deb,
  or run it with `--no-sandbox`.

For the tray to work you will need AppIndicator and KStatusNotifierItem Support extensions. If you do not wish to use the tray you can reopen the widget app once more and that will bring you up the settings.


## Getting your token
1. Open [terra.hackclub.com](https://terra.hackclub.com) in your browser and press **F12** to open DevTools.
2. Go to the **Network** tab and type `exchange` in the filter box.
3. Log in to Terra (if you're already logged in, log out and back in, the request only shows up on login).
4. Click the `exchange` request and open **Response**. Copy the value of `"token"`, without the quotes.
5. Close the Terra tab, otherwise the widget will tell you Terra is open somewhere else.

Treat the token like a password and don't share it. When it expires the widget asks you to sign in again, just repeat these steps.

# DOCS

## USAGE GUIDE

You can do folowing stuff from the tray:
> - Quit (close the widget)
> - Reconnect (Reconnect to terra)
> - Settings (Opens the setting menu)

In settings you can configure:
> -  terra token(see the setup step for detailed instructions) | in order to communicate with terra servers.
> -  Margin(X & Y) | is used to space the widget from the corners of your screen a bit.
> -  Corner | is used to put a widget in a preset posiiton in one of the 4 corners of the screen.
> -  Debug logging | something for the devs(even tho that the most of it isnt even implemented)
> -  Widget size | is used to scale the widget if you prefer it bigger(the default is small-1x)
> -  Screen | screen which the widget will use

## HOW IT ALL WORKS

Most important part was the research in the first version of the app. I had to inspect traffic request and stuff. I alayzed them with them of an AI.

So I have figured that terra runs on colyseus, which is a web multiplayer framework. When I looked in to it, I saw that they already have offical SDK. <br>
For the point of this project, I decided to use a programming language typescript, as I have some expirience with it and colyseus SDK has good support on there. 
You might ask why not javascript? Simple, I just prefer some type safety

Then it came the hard part, authenticating with terra servers and joining the right rooms(worlds) while handling all the errors and redirects.
As we figured out in research, we can use the browser dev tools and inspect the network request when you log in to terra. Thats how ge got the token,
for the rooms it was simple just looked for the join word request and we had an ID.

How did I connect it?

Firstly before I even began doing any work on the widget, I built the room Handler that could be tested via cli. The handler handles the connection, redirect, island join, errors and whole data fetch logic. After this was done we acually started building the widget.

At first I didn't know what framework to use in order to make a desktop widget as I haven't made any before, so I asked claude. I was recommended to use electron with vite and so here I am.
It took a lot of time to learn it a bit, but there is still a lot I don't know. 

Assets/designs are bad, as im horible at designing stuff xd.


## Building it yourself
```
npm install
npm run dev    # run it with hot reload
npm run dist   # build both exes into release/
```

# AI usage
AI was used to make the settings page(**ONLY** html and css) cause im pretty bad at designing. It was also used to checkup the security before shiping and a bit of ai code was produced here to keep it secure. Also a bit was used for debugging.

# a small note
Note to the reviewers: Comments are for my better understanding and not from ai code (:
