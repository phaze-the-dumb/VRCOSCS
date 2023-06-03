const nosc = require('node-osc');
const n = require('xsnotifier');
const MusicMetaServer = require('./metaserver');
const HONK = require('honk');
const fs = require('fs');
const cp = require('child_process');

let prevSong = '';
let osc = { clientStarted: false, serverStarted: false };
let notifier = new n.XSNotifier();
let values = {};
let oscValues = {};

if(!fs.existsSync(__dirname + '/config.honk'))
    fs.writeFileSync(__dirname + '/config.honk', 'OSC Config\r\n- Client Port: 9000\r\n- Client IP: "127.0.0.1"\r\n- Server Port: 9001');

let config = new HONK(fs.readFileSync(__dirname + '/config.honk', 'utf-8'));
config.parse();

config = config.data;

let libs = fs.readdirSync(__dirname + '/libs');
let pckg = JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf-8'));
let installedModules = Object.keys(pckg.dependencies);
let modulesToInstall = [];
let libraries = [];

let s = new MusicMetaServer();

for(let i = 0; i < libs.length; i++){
    let lib = require('./libs/'+libs[i]);
    libraries.push(lib);

    for(let j = 0; j < lib.modules.length; j++){
        let module = lib.modules[j];

        if(!installedModules.find(x => x === module))
            modulesToInstall.push(module);
    }
}

let main = () => {
    if(config['Default Values']){
        Object.keys(config['Default Values']).forEach(key => {
            if(key === 'parent')return;
            values[key] = config['Default Values'][key];
        });
    }

    let oscServer = new nosc.Server(config['Server Port'], '0.0.0.0');
    let oscClient = new nosc.Client(config['Client IP'].replaceAll('"', ''), config['Client Port']);

    let libraryKeys = {};

    libraries.forEach(lib => {
        lib.init({ config, oscServer });

        Object.keys(lib).forEach(key => {
            if(key === 'init' || key === 'modules' || key === 'ignoreKeys' || lib.ignoreKeys.find(x => x === key))return;
            libraryKeys[key] = lib[key];
        });
    });

    console.log('OSC Client started.');
    osc.clientStarted = true;

    oscServer.on('listening', () => {
        console.log('OSC Server is listening.');
        osc.serverStarted = true;
    })

    oscServer.on('message', msg => {
        oscValues[msg[0]] = msg[1];
        let events = config['Events'].filter(x => x.Hook === 'OSCEventFired');
        
        for(let i = 0; i < events.length; i++){
            let event = events[i];

            let eventDataCache = {};
            Object.keys(event).forEach(key => {
                if(key === 'parent' || key === 'Hook')return;
                let value = event[key];
        
                processKey(key, value, msg, eventDataCache);
            })
        }

        let action = config['OSC Actions'].find(x => x.OSC === msg[0]);
        if(!action)return;

        let actionDataCache = {};
        Object.keys(action).forEach(key => {
            if(key === 'parent' || key === 'OSC')return;
            let value = action[key];

            processKey(key, value, msg, actionDataCache);
        })
    })

    let processKey = ( key, value, msg, actionDataCache ) => {
        if(key.includes('=') || key.includes('>') || key.includes('<') || key.includes('>=') || key.includes('<=')){
            let dataSwitch = key;
            let toExecute = value.split(': ');

            if(key.includes('=')){
                let variableName = dataSwitch.split('=')[0].trim();
                let variableValue = dataSwitch.split('=')[1].trim();

                let val = values[variableName];
                if(variableName === 'VALUE')val = msg[1];

                if(val == variableValue){
                    let execCommand = toExecute[0].trim();

                    toExecute.shift();
                    let execValue = toExecute.join(': ').trim();

                    processKey(execCommand, execValue, msg, actionDataCache);
                } else if(actionDataCache['elseEnabled']){
                    if(actionDataCache['else']){
                        toExecute = actionDataCache['else'].split(': ');
                        let execCommand = toExecute.trim();

                        toExecute.shift();
                        let execValue = toExecute.join(': ').trim();

                        processKey(execCommand, execValue, msg, actionDataCache);
                        return;
                    }

                    actionDataCache['else'] = true;
                }
            } else if(key.includes('>')){
                let variableName = dataSwitch.split('>')[0].trim();
                let variableValue = dataSwitch.split('>')[1].trim();
        
                let val = values[variableName];
                if(variableName === 'VALUE')val = msg[1];

                if(val > variableValue){
                    let execCommand = toExecute[0].trim();

                    toExecute.shift();
                    let execValue = toExecute.join(': ').trim();

                    processKey(execCommand, execValue, msg, actionDataCache);
                } else if(actionDataCache['elseEnabled']){
                    if(actionDataCache['else']){
                        toExecute = actionDataCache['else'].split(': ');
                        let execCommand = actionDataCache['else'].trim();

                        toExecute.shift();
                        let execValue = toExecute.join(': ').trim();

                        processKey(execCommand, execValue, msg, actionDataCache);
                        return;
                    }

                    actionDataCache['else'] = true;
                }
            } else if(key.includes('<')){
                let variableName = dataSwitch.split('<')[0].trim();
                let variableValue = dataSwitch.split('<')[1].trim();
        
                let val = values[variableName];
                if(variableName === 'VALUE')val = msg[1];

                if(val < variableValue){
                    let execCommand = toExecute[0].trim();

                    toExecute.shift();
                    let execValue = toExecute.join(': ').trim();

                    processKey(execCommand, execValue, msg, actionDataCache);
                } else if(actionDataCache['elseEnabled']){
                    if(actionDataCache['else']){
                        toExecute = actionDataCache['else'].split(': ');
                        let execCommand = actionDataCache['else'].trim();

                        toExecute.shift();
                        let execValue = toExecute.join(': ').trim();

                        processKey(execCommand, execValue, msg, actionDataCache);
                        return;
                    }

                    actionDataCache['else'] = true;
                }
            } else if(key.includes('>=')){
                let variableName = dataSwitch.split('>=')[0].trim();
                let variableValue = dataSwitch.split('>=')[1].trim();
        
                let val = values[variableName];
                if(variableName === 'VALUE')val = msg[1];

                if(val >= variableValue){
                    let execCommand = toExecute[0].trim();

                    toExecute.shift();
                    let execValue = toExecute.join(': ').trim();

                    processKey(execCommand, execValue, msg, actionDataCache);
                } else if(actionDataCache['elseEnabled']){
                    if(actionDataCache['else']){
                        toExecute = actionDataCache['else'].split(': ');
                        let execCommand = actionDataCache['else'].trim();

                        toExecute.shift();
                        let execValue = toExecute.join(': ').t
                        processKey(execCommand, execValue, msg, actionDataCache);
                        return;
                    }

                    actionDataCache['else'] = true;
                }
            } else if(key.includes('<=')){
                let variableName = dataSwitch.split('<=')[0].trim();
                let variableValue = dataSwitch.split('<=')[1].trim();
        
                let val = values[variableName];
                if(variableName === 'VALUE')val = msg[1];

                if(val <= variableValue){
                    let execCommand = toExecute[0].trim();

                    toExecute.shift();
                    let execValue = toExecute.join(': ').trim();

                    processKey(execCommand, execValue, msg, actionDataCache);
                } else if(actionDataCache['elseEnabled']){
                    if(actionDataCache['else']){
                        toExecute = actionDataCache['else'].split(': ');
                        let execCommand = actionDataCache['else'].trim();

                        toExecute.shift();
                        let execValue = toExecute.join(': ').trim();

                        processKey(execCommand, execValue, msg, actionDataCache);
                        return;
                    }

                    actionDataCache['else'] = true;
                }
            }
        } else if(key === 'else'){
            if(actionDataCache['else']){
                let toExecute = value.split(': ');
                let execCommand = toExecute[0].trim();

                toExecute.shift();
                let execValue = toExecute.join(': ').trim();

                processKey(execCommand, execValue, msg, actionDataCache);
                return;
            }

            actionDataCache['else'] = value;
        } else if(key === '_EnableElse')
            actionDataCache['elseEnabled'] = value === '1' ? true : false;
        else if(libraryKeys[key]){
            libraryKeys[key]({ key, value, msg, actionDataCache, oscClient });
        } else if(key === 'chatbox'){
            let val = value === 'VALUE' ? msg[1] : value;
            val = val.split('%song%').join(prevSong);

            oscClient.send('/chatbox/input', [ val, true ]);
        } else if(key === 'OSCOut'){
            let valueParts = value.split(' ');
            let uri = valueParts[0];

            valueParts.shift();
            if(valueParts[0] !== ''){
                valueParts[0] = convertString(valueParts[0]);

                if(!oscValues[uri] || oscValues[uri] !== valueParts[0]){
                    oscValues[uri] = valueParts[0];

                    oscClient.send(uri, valueParts);
                }
            } else{
                if(!oscValues[uri] || oscValues[uri] !== true){
                    oscValues[uri] = true;

                    oscClient.send(uri, valueParts);
                    setTimeout(() => oscValues[uri] = false, 200);
                }
            }
        } else
            values[key] = value === 'VALUE' ? msg[1] : value;
    }

    let convertString = ( str ) => {
        if(!isNaN(parseInt(str)))
            return parseInt(str);
        else if(!isNaN(parseFloat(str)))
            return parseFloat(str);
        else if(str === 'true')
            return true;
        else if(str === 'false')
            return false;
        else
            return str;
    }

    s.on('ActivityUpdated', a => {
        if(prevSong !== a.media.artist + ' - ' + a.media.title){
            prevSong = a.media.artist + ' - ' + a.media.title;
            console.log('Song changed to: '+prevSong);

            notifier.SendNotification(new n.XSNotification({
                MessageType: 2,
                SourceApp: 'VRCOSCS',
                Title: prevSong
            }))

            let events = config['Events'].filter(x => x.Hook === 'SongChange');
        
            for(let i = 0; i < events.length; i++){
                let event = events[i];

                let eventDataCache = {};
                Object.keys(event).forEach(key => {
                    if(key === 'parent' || key === 'Hook')return;
                    let value = event[key];
            
                    processKey(key, value, [ null, null ], eventDataCache);
                })
            }
        }
    });

    setInterval(() => {
        let events = config['Events'].filter(x => x.Hook === 'ChatboxUpdate');
        
        for(let i = 0; i < events.length; i++){
            let event = events[i];

            let eventDataCache = {};
            Object.keys(event).forEach(key => {
                if(key === 'parent' || key === 'Hook')return;
                let value = event[key];

                processKey(key, value, [ null, null ], eventDataCache);
            })
        }
    }, 10000);
}

if(modulesToInstall.length === 0){
    console.log('No modules to install');
    main();
} else{
    console.log('Installing Modules...');

    let npm = cp.spawn('powershell', [ 'npm', 'i', ...modulesToInstall ], { stdio: 'inherit' });
    npm.on('close', () => {
        console.log('Finished Installing Modules.');
        main();
    });
}