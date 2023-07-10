let port = null;
let timeout = null;
let hapticsMultiplier = 1;

module.exports = {
  modules: [ 'serialport' ],
  ignoreKeys: [],
  init: () => {},
  OpenHaptics: ({ value }) => {
    const { SerialPort } = require('serialport');

    port = new SerialPort({ path: value, baudRate: 9600 });
    port.write('\r.echo off\r');
  },
  LeftHaptics: ({ value }) => {
    if(!port)
      throw new Error('Need to open serial port before you can send data');

    port.write(Buffer.from('l.setDuty('+(value * hapticsMultiplier).toString()+')\r'));
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      port.write(Buffer.from('l.setDuty(0)\r'));
    }, 1000);
  },
  RightHaptics: ({ value }) => {
    if(!port)
      throw new Error('Need to open serial port before you can send data');

    port.write(Buffer.from('r.setDuty('+(value * hapticsMultiplier).toString()+')\r'));
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      port.write(Buffer.from('l.setDuty(0)\r'));
    }, 1000);
  },
  HapticsStrength: ({ value }) => {
    hapticsMultiplier = value;
  }
}