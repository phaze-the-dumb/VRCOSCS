let robot;
let debug = false;

module.exports = {
    modules: [ 'robotjs' ],
    ignoreKeys: [],
    init: ({ debug: d }) => {
        robot = require('robotjs');
        debug = d;
    },
    Robot: ({ value }) => {
        robot.keyTap(value);

        if(debug)
            console.log('Robot: keyTap(' + value + ')');
    }
}