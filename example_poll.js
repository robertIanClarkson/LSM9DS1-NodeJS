const LSM9DS1 = require('./LSM9DS1')
const rpio = require('rpio');

rpio.open(15, rpio.INPUT);
rpio.open(36, rpio.OUTPUT, rpio.LOW);

var bus = 1;
var bufferSize = 32;

var g_xl_address = 0x6B;
var m_address = 0x1E;

var sensor = new LSM9DS1(g_xl_address, m_address);

/************************************************ */
function foo() {
  sensor.checkFIFO().then((result) => {
    console.log(`FIFO Buffer Size: ${result}`)
    sensor.sleep(500).then(() => {
      foo()
    })
  })
}
/************************************************ */
count = 0;
function read() {
  return new Promise((resolve, reject) => {
    sensor.checkFIFO().then((res) => {
      console.log(`FIFO SIZE START: ${res}`)
      sensor.readAll().then((result) => {
        console.log("\nCOUNT: " + count)
        count += 1
        console.log(`Gyro (X: ${result.gyro.x} Y: ${result.gyro.y} Z:${result.gyro.z})`)
        console.log(`Accel(X: ${result.accel.x} Y: ${result.accel.y} Z:${result.accel.z})`)
        console.log(`Mag  (X: ${result.mag.x} Y: ${result.mag.x} Z:${result.mag.x} HEADING:${180 * Math.atan2(result.mag.y, result.mag.x) / Math.PI})\n`)
        sensor.checkFIFO().then((res) => {
          console.log(`FIFO SIZE END: ${res}`)
          resolve('read success')
        }).catch(err => { reject(`example read --> checkFIFO END: ${err}`) })
      }).catch(err => { reject(`example read --> checkFIFO readAll: ${err}`) })
    }).catch(err => { reject(`example read --> checkFIFO START: ${err}`) })
  })
}



sensor.setBufferSize(bufferSize)
sensor.init(bus).then((message) => {
  console.log(message)
  sensor.useFIFO().then((message) => {
    console.log(message)
    foo()
  })
  .catch(err => { console.log(err) })
})
.catch(err => { console.log(err) })
