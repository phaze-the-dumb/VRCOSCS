# Documentation

Oh boy this could be fun to write, if you've got any updates or suggestions `@phaze_dev` on twitter or `Phaze#6193` on discord.

### Understanding the format.

Honk is the base format for VRCOSC Scripting, it isn't very complicated.

```yml
# Anything not starting with - is a comment (I usually start them with // of # to show its a comment anyways).

- My Key: My Value
- My Array 1:
    - Element 1
    - Element 2
    - Element 3

- My Object 1:
    - My Key 1: My Value 1
    - My Key 2: My Value 2
    - My Key 3: My Value 3
```

As you can see the structure is similar to JSON. The two main parts of honk's structure are the keys and values. Each key has a corresponding value, as you can see on the first line `- My Key: My Value`.

Values can be anything from strings to numbers, to objects or arrays. The next part of the code shows how to make an array.

```yml
- My Array 1:
    - Element 1
    - Element 2
    - Element 3
```

This is like the first example but the key has multiple values.

The last part is an object. These are slightly more complicated but still pretty easy to understand.

```yml
- My Object 1:
    - My Key 1: My Value 1
    - My Key 2: My Value 2
    - My Key 3: My Value 3
```

This is a key that has multiple other keys inside it. Again the value of these keys can be anything, you could have nested objects inside each other.

### Basic Usage

**Note: VRCOSCS Does NOT run the code in the order it is written, due to how js treats objects.**

(it runs it in alphabetical order)

Theres are 3 main keys that you need to know about in VRCOSCS. They are `Default Values`, `OSC Actions` and `Events`

The first one of these is pretty self explanatory, `Default Values` these are a list of global values or variables that you can read and write to during the scripts execution. You do not need to set values here, but it is recommended that you do as values will be undefined if you don't set them first.

The next one is `OSC Actions` these are a list of "actions" that occur when a OSC event is fired.

```yml
- OSC Actions:
    - VelocityX:
        - OSC: /avatar/parameters/VelocityX
```

This event is fired when the X Velocity of the player changes [More Endpoints Here](https://docs.vrchat.com/docs/osc-avatar-parameters)

The line `- VelocityX:` could actually be anything, its just a label for the action. It could be `- fuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuk:` and it would still work.

`- OSC: /avatar/parameters/VelocityX` is specifing which OSC event it is listening out for.

We can edit this to store the value in a variable

```yml
- Default Values:
    - velX: 0

- OSC Actions:
    - VelocityX:
        - OSC: /avatar/parameters/VelocityX
        - velX: VALUE
```

This is setting the variable `velX` to `0` as the script starts. Then when the OSC event VelocityX is fired, it sets the variable `velX` to the the number the osc event contains.

The keyword `VALUE` represents the value the osc event contains.

### Slightly More Advanced Usage

Conditional Statements!

Oh boy, my favourite part of this. We can add conditional statements or if statements if you like to our code.

```yml
- OSC Actions:
    - VelocityX:
        - OSC: /avatar/parameters/VelocityX
        - VALUE > 1.5: OSCOut: /input/Jump
```

This checks if the players velocity in the X direction is greater than `1.5` if it is it outputs `/input/Jump` to osc causing the player to jump (dumb example but you get the point)

`And` and `Or` can be done cruedly like this:

**AND**
```yml
- OSC Actions:
    - VelocityX:
        - OSC: /avatar/parameters/VelocityX
        - VALUE < 1.5: VALUE > -1.5: OSCOut: /input/Jump
```

**OR**
```yml
- Default Values:
    - hhhhh: 0
    - ggggg: 1

- OSC Actions:
    - VelocityX:
        - OSC: /avatar/parameters/VelocityX
        - hhhhh = 1: OSCOut: /input/Jump
        - ggggg = 1: OSCOut: /input/Jump
```

The following boolean operators can be used: 
`=`, `>`, `<`, `>=`, `<=`

**ELSE**

VRCOSCS Supports else statements, but they are a little bit more complicated. Due to VRCOSCS not running the lines of code in the order they are written, there can only be one if statement per action or event if else is used.

To enable the use of else statements put `- _EnableElse: 1` at the top of the action (or anywhere else! VRCOSCS does not care about the order you write stuff it)

You can then use the `- else: ` keyword.

```yml
- Events:
    - Change clothes depending on velocity:
        - _EnableElse: 1
        - Hook: OSCEventFired
        - velX > -1.5: velX < 1.5: velY > -1.5: velY < 1.5: velZ > -1.5: velZ < 1.5: DO SOMETHING
        - else: DO SOMETHING ELSE
```

This code "does something" when the player is moving at a velocity higher than 1.5 and then "does something else" when the play isn't.

Don't worry about the "event" bits i'll explain those in a minute.

### Events!

There is the event key that allows code to be executed even when none of the osc actions are fired. There are currently three events:
- `OSCEventFired` - When an osc event is fired
- `ChatboxUpdate` - Runs every 10 seconds, to be used when 

### Extra APIs

You can interface with vrchats osc api through this by using the `OSCOut` keyword as I have shown above, but there are other keywords too.

The keyword `robot` can be used to virtually press keys on your keyboard, this is useful for having a music controller or similar, as shown below.

```yml
- OSC Actions:
    - MusicAction:
        - OSC: /avatar/parameters/MusicAction
        - VALUE = 1: Robot: audio_prev
        - VALUE = 2: Robot: audio_play
        - VALUE = 3: Robot: audio_next
```

This can be paired with an avatar with these options on its menu and it changing the value "MusicAction" to 1, 2 or 3 accordingly

The keywords `VoiceMeeterStrip`, `VoiceMeeterValue` and `VoiceMeeterProperty` can be used to manipulate voicemeeters input strips, as shown below.

```yml
- OSC Actions:
    - VMVol:
        - OSC: /avatar/parameters/VMVol
        - VoiceMeeterValue: VALUE
        - VoiceMeeterStrip: 1
        - VoiceMeeterProperty: Gain
```

This code reads the `VMVol` property from a vrchat avatar and sets the gain of strip 1 in voicemeeter to the value of `VMVol`

The voicemeeter API supports these properties:
- Gain: 0 - 1
- Mute: true / false
- A1 - A5: true / false
- B1 - B3: true / false