const LSM9DS1 = require('./LSM9DS1')
const rpio = require('rpio');

rpio.open(15, rpio.INPUT);
rpio.open(37, rpio.OUTPUT, rpio.LOW);

var bus = 1;
var bufferSize = 32;

var g_xl_address = 0x6B;
var m_address = 0x1E;

var sensor = new LSM9DS1(g_xl_address, m_address);

/************************************************ */
function foo(pin) {
  console.log('FOO: ' + pin);
}
/************************************************ */

function read() {
  sensor.readAll()
    .then((result) => {
      console.log(`Gyro (X: ${result.gyro.x} Y: ${result.gyro.y} Z:${result.gyro.z})`)
      console.log(`Accel(X: ${result.accel.x} Y: ${result.accel.y} Z:${result.accel.z})`)
      console.log(`Mag  (X: ${result.mag.x} Y: ${result.mag.x} Z:${result.mag.x} HEADING:${180 * Math.atan2(result.mag.y, result.mag.x) / Math.PI})\n`)
    })
}

sensor.setBufferSize(bufferSize)
sensor.init(bus)
  .then((message) => {
    console.log(message)
    sensor.useFIFO()
      .then((message) => {
        console.log(message)
        rpio.poll(15, foo, rpio.POLL_BOTH)
        console.log("Polling")
        rpio.sleep(2);
        rpio.write(37, rpio.HIGH);

      })
      .catch(err => { console.log(err) })
  })
  .catch(err => { console.log(err) })
