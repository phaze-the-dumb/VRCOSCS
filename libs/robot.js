let robot;

module.exports = {
    modules: [ 'robotjs' ],
    ignoreKeys: [],
    init: ({}) => {
        robot = require('robotjs');
    },
    Robot: ({ value }) => {
        robot.keyTap(value);
    }
}