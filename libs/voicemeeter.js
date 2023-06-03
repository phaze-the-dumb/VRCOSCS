let voicem = null;
let voiceMeeterProperties = [
    'Gain', 'Mute', 'A1', 'A2', 'A3',
    'A4', 'A5', 'B1', 'B2', 'B3'
]

let output = {
    modules: [ 'voicemeeter-connector' ],
    ignoreKeys: [ 'updateVM' ],
    init: ({}) => {
        const { Voicemeeter } = require('voicemeeter-connector');

        Voicemeeter.init().then(async vm => {
            await vm.connect();
            console.log('Voicemeeter connected');

            voicem = vm;
        }).catch(err => {
            console.log('Failed to connect to Voicemeeter');
        });
    },
    VoiceMeeterStrip: ({ value, msg, actionDataCache }) => {
        if(!voicem)return;

        actionDataCache.VoiceMeeterStrip = value === 'VALUE' ? msg[1] : value;
        output.updateVM(actionDataCache);
    },
    VoiceMeeterValue: ({ value, msg, actionDataCache }) => {
        if(!voicem)return;
        
        actionDataCache.VoiceMeeterValue = value === 'VALUE' ? msg[1] : value;
        output.updateVM(actionDataCache);
    },
    VoiceMeeterProperty: ({ value, msg, actionDataCache }) => {
        if(!voicem)return;

        actionDataCache.VoiceMeeterProperty = value === 'VALUE' ? msg[1] : value;
        output.updateVM(actionDataCache);
    },
    updateVM: ( actionDataCache ) => {
        const { StripProperties } = require('voicemeeter-connector');

        if(
            actionDataCache.VoiceMeeterStrip && 
            actionDataCache.VoiceMeeterProperty && 
            (
                actionDataCache.VoiceMeeterValue ||
                actionDataCache.VoiceMeeterValue === false ||
                actionDataCache.VoiceMeeterValue === 0
            )
        ){
            if(!voiceMeeterProperties.find(x => x === actionDataCache.VoiceMeeterProperty))
                throw new Error('Invaild VoiceMeeterStrip property: '+actionDataCache.VoiceMeeterProperty);
    
            console.log('Set VoiceMeeter: '+actionDataCache.VoiceMeeterStrip+' '+actionDataCache.VoiceMeeterProperty+' to '+actionDataCache.VoiceMeeterValue);
    
            if(actionDataCache.VoiceMeeterProperty === 'Gain')
                return voicem.setStripParameter(actionDataCache.VoiceMeeterStrip, StripProperties.Gain, actionDataCache.VoiceMeeterValue * 72 - 60);
            
            if(actionDataCache.VoiceMeeterProperty === 'Mute')
                return voicem.setStripParameter(actionDataCache.VoiceMeeterStrip, StripProperties.Mute, actionDataCache.VoiceMeeterValue ? 1 : 0);
    
            if(actionDataCache.VoiceMeeterProperty === 'A1')
                return voicem.setStripParameter(actionDataCache.VoiceMeeterStrip, StripProperties.A1, actionDataCache.VoiceMeeterValue ? 1 : 0);
    
            if(actionDataCache.VoiceMeeterProperty === 'A2')
                return voicem.setStripParameter(actionDataCache.VoiceMeeterStrip, StripProperties.A2, actionDataCache.VoiceMeeterValue ? 1 : 0);
    
            if(actionDataCache.VoiceMeeterProperty === 'A3')
                return voicem.setStripParameter(actionDataCache.VoiceMeeterStrip, StripProperties.A3, actionDataCache.VoiceMeeterValue ? 1 : 0);
    
            if(actionDataCache.VoiceMeeterProperty === 'A4')
                return voicem.setStripParameter(actionDataCache.VoiceMeeterStrip, StripProperties.A4, actionDataCache.VoiceMeeterValue ? 1 : 0);
    
            if(actionDataCache.VoiceMeeterProperty === 'A5')
                return voicem.setStripParameter(actionDataCache.VoiceMeeterStrip, StripProperties.A5, actionDataCache.VoiceMeeterValue ? 1 : 0);
    
            if(actionDataCache.VoiceMeeterProperty === 'B1')
                return voicem.setStripParameter(actionDataCache.VoiceMeeterStrip, StripProperties.B1, actionDataCache.VoiceMeeterValue ? 1 : 0);
    
            if(actionDataCache.VoiceMeeterProperty === 'B2')
                return voicem.setStripParameter(actionDataCache.VoiceMeeterStrip, StripProperties.B2, actionDataCache.VoiceMeeterValue ? 1 : 0);
    
            if(actionDataCache.VoiceMeeterProperty === 'B3')
                return voicem.setStripParameter(actionDataCache.VoiceMeeterStrip, StripProperties.B3, actionDataCache.VoiceMeeterValue ? 1 : 0);
        }
    }
}

module.exports = output;