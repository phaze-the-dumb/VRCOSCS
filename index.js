const nosc = require('node-osc');
const HONK = require('honk');
const fs = require('fs');
const cp = require('child_process');
const util = require('util');
const path = require('path');

let osc = { clientStarted: false, serverStarted: false };
let values = {};
let oscValues = {};

if(!process.argv[2])process.argv[2] = 'config.honk';
let file = path.join(__dirname, process.argv[2]);

if(!fs.existsSync(file))
    fs.writeFileSync(file, 'OSC Config\r\n- Client Port: 9000\r\n- Client IP: "127.0.0.1"\r\n- Server Port: 9001');

let config = new HONK(fs.readFileSync(file, 'utf-8'));
// config.debug = true;
config.parse();

config = config.data;

console.log(util.inspect(config, true, 1000000, true));

let libs = fs.readdirSync(__dirname + '/libs');
let pckg = JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf-8'));
let installedModules = Object.keys(pckg.dependencies);
let modulesToInstall = [];
let libraries = [];
let libsToLoad = [];

if(config['Libraries'])
    libsToLoad = Object.values(config['Libraries']);


for(let i = 0; i < libs.length; i++){
    if(!libsToLoad.find(x => x + '.js' === libs[i])){
        console.log('Skipping library ' + libs[i].replace('.js', '') + ' because it is not included');
        continue;
    }

    let lib = require('./libs/'+libs[i]);
    libraries.push(lib);

    for(let j = 0; j < lib.modules.length; j++){
        let module = lib.modules[j];

        if(!installedModules.find(x => x === module))
            modulesToInstall.push(module);
    }
}

let main = () => {
    let events = [];
    let actions = [];

    if(config['Events'])
        events = Object.values(config['Events']);

    if(config['OSC Actions'])
        actions = Object.values(config['OSC Actions']);

    if(config['Default Values']){
        Object.keys(config['Default Values']).forEach(key => {
            if(key === 'parent')return;

            if(config['Default Values'][key] === '""')
                values[key] = '';
            else
                values[key] = config['Default Values'][key];
        });
    }

    let oscServer = new nosc.Server(config['Server Port'], '0.0.0.0');
    let oscClient = new nosc.Client(config['Client IP'], config['Client Port']);

    let processKey = ( key, value, msg, actionDataCache ) => {
        if(typeof value === 'string' && value.includes('[[') && value.includes(']]')){
            value = value.split('[[').join(']]');
            value = value.split(']]');

            let key = value[1];
            value.splice(1, 1);

            if(key === 'VALUE')
                value = value.join(msg[1]);
            else if(values[key] !== undefined)
                value = value.join(values[key]);
        }

        if(value === '""')value = '';

        if(key.includes('=') || key.includes('>') || key.includes('<') || key.includes('>=') || key.includes('<=') || key.includes('!=')){
            let dataSwitch = null;
            let mode = null;

            if(key.includes('AND')){
                dataSwitch = key.split('AND');
                mode = 'AND';
            } else {
                dataSwitch = key.split('OR');
                mode = 'OR';
            }

            let results = [];

            dataSwitch.forEach(dswitch => {
                if(dswitch.includes('=')){
                    let variableName = dswitch.split('=')[0].trim();
                    let variableValue = dswitch.split('=')[1].trim();
    
                    let val = variableName;
                    if(typeof variableName === 'string' && values[variableName] !== undefined)val = values[variableName];
                    if(variableName === 'VALUE')val = msg[1];
    
                    let valVal = variableValue;
                    if(typeof variableValue === 'string' && values[variableValue] !== undefined)valVal = values[variableValue];
                    if(variableValue === 'VALUE')valVal = msg[1];
                
                    results.push(val == valVal);
                } else if(dswitch.includes('!=')){
                    let variableName = dswitch.split('!=')[0].trim();
                    let variableValue = dswitch.split('!=')[1].trim();
    
                    let val = variableName;
                    if(typeof variableName === 'string' && values[variableName] !== undefined)val = values[variableName];
                    if(variableName === 'VALUE')val = msg[1];
    
                    let valVal = variableValue;
                    if(typeof variableValue === 'string' && values[variableValue] !== undefined)valVal = values[variableValue];
                    if(variableValue === 'VALUE')valVal = msg[1];
                
                    results.push(val != valVal);
                } else if(dswitch.includes('>')){
                    let variableName = dswitch.split('>')[0].trim();
                    let variableValue = dswitch.split('>')[1].trim();
    
                    let val = variableName;
                    if(typeof variableName === 'string' && values[variableName] !== undefined)val = values[variableName];
                    if(variableName === 'VALUE')val = msg[1];
    
                    let valVal = variableValue;
                    if(typeof variableValue === 'string' && values[variableValue] !== undefined)valVal = values[variableValue];
                    if(variableValue === 'VALUE')valVal = msg[1];
                
                    results.push(val > valVal);
                } else if(dswitch.includes('<')){
                    let variableName = dswitch.split('<')[0].trim();
                    let variableValue = dswitch.split('<')[1].trim();
    
                    let val = variableName;
                    if(typeof variableName === 'string' && values[variableName] !== undefined)val = values[variableName];
                    if(variableName === 'VALUE')val = msg[1];
    
                    let valVal = variableValue;
                    if(typeof variableValue === 'string' && values[variableValue] !== undefined)valVal = values[variableValue];
                    if(variableValue === 'VALUE')valVal = msg[1];
                
                    results.push(val < valVal);
                } else if(dswitch.includes('>=')){
                    let variableName = dswitch.split('>=')[0].trim();
                    let variableValue = dswitch.split('>=')[1].trim();
    
                    let val = variableName;
                    if(typeof variableName === 'string' && values[variableName] !== undefined)val = values[variableName];
                    if(variableName === 'VALUE')val = msg[1];
    
                    let valVal = variableValue;
                    if(typeof variableValue === 'string' && values[variableValue] !== undefined)valVal = values[variableValue];
                    if(variableValue === 'VALUE')valVal = msg[1];
                
                    results.push(val >= valVal);
                } else if(dswitch.includes('<=')){
                    let variableName = dswitch.split('<=')[0].trim();
                    let variableValue = dswitch.split('<=')[1].trim();
    
                    let val = variableName;
                    if(typeof variableName === 'string' && values[variableName] !== undefined)val = values[variableName];
                    if(variableName === 'VALUE')val = msg[1];
    
                    let valVal = variableValue;
                    if(typeof variableValue === 'string' && values[variableValue] !== undefined)valVal = values[variableValue];
                    if(variableValue === 'VALUE')valVal = msg[1];
                
                    results.push(val <= valVal);
                }
            })

            let result = mode === 'AND' ? true : false;
            
            results.forEach(r => {
                if(r && mode === 'OR')
                    result = true;

                if(!r && mode === 'AND')
                    result = false;
            })

            if(result){
                Object.keys(value).forEach(kkey => {
                    if(kkey === 'parent' || kkey === 'else')return;
                    let kvalue = value[kkey];

                    processKey(kkey, kvalue, msg, actionDataCache);
                })
            } else if(value['Else']){
                let elseValue = value['Else'];
                
                Object.keys(elseValue).forEach(kkey => {
                    if(kkey === 'parent')return;
                    let kvalue = elseValue[kkey];

                    processKey(kkey, kvalue, msg, actionDataCache);
                })
            }
        } else if(libraryKeys[key]){
            libraryKeys[key]({ key, value, msg, actionDataCache, oscClient, values });
        } else if(key === 'Chatbox'){
            let val = value === 'VALUE' ? msg[1] : value;

            if(config['Debug'])
                console.log('Chatbox: ' + val);

            oscClient.send('/chatbox/input', [ val, true, false ]);
        }  else if(key === 'Log'){
            let val = value === 'VALUE' ? msg[1] : value;
            console.log(val);
        } else if(key === 'OSCOut'){
            let valueParts = value.split(' ');
            let uri = valueParts[0];

            valueParts.shift();
            if(valueParts[0] !== ''){
                if(typeof valueParts[0] === 'string' && values[valueParts[0]] !== undefined)
                    valueParts[0] = values[valueParts[0]];

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
        } else{
            values[key] = value === 'VALUE' ? msg[1] : value;
        }
    }

    let libraryKeys = {};

    libraries.forEach(lib => {
        lib.init({ config, oscServer, events, processKey, debug: config['Debug'] });

        Object.keys(lib).forEach(key => {
            if(key === 'init' || key === 'modules' || key === 'ignoreKeys' || lib.ignoreKeys.find(x => x === key))return;
            libraryKeys[key] = lib[key];
        });
    });

    console.log('OSC Client started. On port: ' + config['Client Port']);
    osc.clientStarted = true;

    oscServer.on('listening', () => {
        console.log('OSC Server is listening. On port ' + config['Server Port']);
        osc.serverStarted = true;
    })

    oscServer.on('message', msg => {
        oscValues[msg[0]] = msg[1];
        // console.log(msg);

        events.forEach(event => {
            if(event.Hook !== 'OSCEventFired')return;
    
            let eventDataCache = {};
            Object.keys(event).forEach(key => {
                if(key === 'parent' || key === 'Hook')return;
                let value = event[key];
    
                processKey(key, value, msg, eventDataCache);
            })
        })

        actions.forEach(action => {
            if(action.OSC !== msg[0])return;
            // console.log(util.inspect(action, true, 1000000, true));

            let actionDataCache = {};
            Object.keys(action).forEach(key => {
                if(key === 'parent' || key === 'OSC')return;
                let value = action[key];
    
                processKey(key, value, msg, actionDataCache);
            })
        })
    })

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

    setInterval(() => {
        events.forEach(event => {
            if(event.Hook !== 'ChatboxUpdate')return;
    
            let eventDataCache = {};
            Object.keys(event).forEach(key => {
                if(key === 'parent' || key === 'Hook')return;
                let value = event[key];
    
                processKey(key, value, [ null, null ], eventDataCache);
            })
        })
    }, 10000);

    events.forEach(event => {
        if(event.Hook !== 'Start')return;

        let eventDataCache = {};
        Object.keys(event).forEach(key => {
            if(key === 'parent' || key === 'Hook')return;
            let value = event[key];

            processKey(key, value, [ null, null ], eventDataCache);
        })
    })
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