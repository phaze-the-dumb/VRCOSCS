let debug = false;
let processKey;

let output = {
    modules: [],
    ignoreKeys: [],
    init: ({ debug: d, processKey: aProcessKey }) => {
        debug = d;
        processKey = aProcessKey;
    },
    Wait: ({ value, msg, actionDataCache }) => {
        setTimeout(() => {
            Object.keys(value.Callback).forEach(kkey => {
                if(kkey === 'parent')return;
                let kvalue = value.Callback[kkey];

                processKey(kkey, kvalue, msg, actionDataCache);
            })
        }, value.Time);
    }
}

module.exports = output;