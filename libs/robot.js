let robot;

module.exports = {
    modules: [ 'robotjs' ],
    ignoreKeys: [],
    init: ({}) => {
        robot = require('robotjs');
    },
    robot: ({ value }) => {
        robot.keyTap(value);
    }
}