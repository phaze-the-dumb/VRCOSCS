# VRCOSC Scripting

***what the fuck have i created?***

### What is it?

VRCOSC Scripting is a simple scripting "language" to make is easy and simple to control osc inputs and outputs. These can also link into other applications such as [VoiceMeeter](https://vb-audio.com/Voicemeeter/index.htm).

### How do I use it?

VRCOSC Scripting is based on [HONK.JS](https://github.com/phaze-the-dumb/honk.js), but instead of being used as a config file its used as a scripting language.

For more information please see [the documentation](docs.md).

### Why?

I have a lot (and I mean *a lot*) of osc inputs on my avatar to control various applications on my computer while I'm in vrchat. For a long time I have used an annoying nodejs script to control everything, recently i've been wanting to change the way that script is controlling everything. I also thought that other people may want a simple way to control applications via OSC.

### How to use the music features?

This app also supports a "currently listening to" feature you can use this by installing a user-script plugin (Tamper Monkey, Violent Monkey, Grease Monkey) on your web browser and creating a script on the website with this code.

It uses [THIS](https://github.com/phaze-the-dumb/fknmusicproto/) protocol to recive song metadata information.

Here are several useful ones:
- [Youtube](https://github.com/phaze-the-dumb/fknmusicproto/blob/master/youtube-client.user.js?raw=true)
- [Spotify](https://github.com/phaze-the-dumb/fknmusicproto/blob/master/spotify-client.user.js?raw=true)
- [Jellyfin](https://github.com/phaze-the-dumb/fknmusicproto/blob/master/jellyfin-client.user.js?raw=true) - Note: You need to edit the address of this one to your jellyfin server ip

### Credits.

- [HONK](https://github.com/phaze-the-dumb/honk.js): The main interpreter.
- [node-osc](https://github.com/MylesBorins/node-osc): OSC Communicator.
- [XSNotifier](https://github.com/phaze-the-dumb/XSNotifier): Used to show current song in XS Overlay.
- [Voicemeeter Connector](https://github.com/ChewbaccaCookie/voicemeeter-connector): Used by the voicemeeter library to control voicemeeter.
- [RobotJS](https://robotjs.io/): Used by the robot library to virtually press keys.