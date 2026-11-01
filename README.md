![time](https://hackatime.hackclub.com/api/v1/badge/U0C7Q1X50RX/majcek210/terra-widget)

Aditional information and direct downloads are available on the website: https://terra-widget.majcek210.dev

# terra-widget
The project's goal is to make a widget for your desktop that would show off your water goals and working hours, so you wont need to have terra open everytime.
The project will for now be written in typescript.
App will require you to provide your own session token(see the setup part for the tutorial) that will be used to run the widget, I might implement some other automatic options, when i test them and check the ToS of terra.
Thanks!

# Notice
You computer will probably block the exe from running. To unblock it: Right-click Terra.Widget.x.x.x.exe, choose Properties, tick Unblock at the bottom, click OK, then double-click it.

# Setup
1. Grab the latest exe from [Releases](https://github.com/majcek210/terra-widget/releases) or https://terra-widget.majcek210.dev/install. `Terra.Widget.Setup.x.x.x.exe` installs it, `Terra.Widget.x.x.x.exe` is portable and just runs. There are also expirimental linux and mac options.
3. Windows will probably say "Windows protected your PC" because the exe isn't signed. Click **More info** and then **Run anyway**.
4. The widget sits in one of the corners of your screen. It has no taskbar icon, so you will need to find it in the tray.
5. If you click the terra widget tray icon directly it will take you to settings, right right clicking it you can also quit and reconnect. In the settings , paste your Terra token (see below) and hit **Save token**. You can move the widget with the margins in the same window.
Your token is saved encrypted on your PC (only your Windows account can read it) and is only sent to Terra.

# Windows installation and updates
Terra Widget supports automatic updates when installed with **NSIS installer**.
Portable builds do not install updates automaticlly. Download the latest version from the GitHub Releases. 
The application is unsigned so a windows SmartScreen may display a warning when you download or run a release.

# Linux installation and guide
**LINUX SUPPORT HAS NOT BEEN OFFICIALLY TESTED**
Expect bugs/crashes/errors on linux

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

## WIDGET SETUP

Please see the https://tera-widget.majcek210.dev/install

Treat the token like a password and don't share it.

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
Its on the website now (:
## Building it yourself
```
npm install
npm run dev    # run it with hot reload
npm run dist   # build both exes into release/
```

# AI usage
AI was used to make the settings page(**ONLY** html and css) cause im pretty bad at designing lol(as you can see on the widget docs website I made myself). AI was used for debuging and security checos before release. But most of the bug fixes were producted by me.
# a small note
Note to the reviewers: Comments are for my better understanding and not from ai code (:
