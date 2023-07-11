let port = null;
let timeout = null;
let hapticsMultiplier = 1;

let h = {
  modules: [ 'serialport' ],
  ignoreKeys: [ 'tryConnect' ],
  init: () => {},
  tryConnect: ( p ) => {
    const { SerialPort } = require('serialport');

    port = new SerialPort({ path: p, baudRate: 9600 });
    port.write('\r.echo off\r');

    port.on('error', ( err ) => {
      console.error('Error connecting to SerialPort: ', err);
      setTimeout(() => {
        h.tryConnect(p);
      }, 5000);
    })
  },
  OpenHaptics: ({ value }) => {
    h.tryConnect(value);
  },
  LeftHaptics: ({ value }) => {
    if(!port)
      return console.error('Cannot send data port not connected');

    port.write(Buffer.from('l.setDuty('+(value * hapticsMultiplier).toString()+')\r'));
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      port.write(Buffer.from('l.setDuty(0)\r'));
    }, 1000);
  },
  RightHaptics: ({ value }) => {
    if(!port)
      return console.error('Cannot send data port not connected');

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

module.exports = h;