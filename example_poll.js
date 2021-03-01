const LSM9DS1 = require('./LSM9DS1')
const rpio = require('rpio');

rpio.open(15, rpio.INPUT);
rpio.open(36, rpio.OUTPUT, rpio.LOW);

var bus = 1;
var bufferSize = 32;

var g_xl_address = 0x6B;
var m_address = 0x1E;

var sensor = new LSM9DS1(g_xl_address, m_address);

count = 1;
function foo() {
  sensor.checkFIFO().then((result) => {
    console.log(`\tFIFO Buffer Size: ${result}`)
    if(result == 160) {
      console.log("\nCOUNT: " + count)
      count += 1
      console.log(`Gyro (X: ${result.gyro.x} Y: ${result.gyro.y} Z:${result.gyro.z})`)
      console.log(`Accel(X: ${result.accel.x} Y: ${result.accel.y} Z:${result.accel.z})`)
    }
    sensor.sleep(10).then(() => {
      foo()
    })
  })
}

function read() {
  return new Promise((resolve, reject) => {
    sensor.readAll()
      .then((result) => {
        console.log("\nCOUNT: " + count)
        count += 1
        console.log(`Gyro (X: ${result.gyro.x} Y: ${result.gyro.y} Z:${result.gyro.z})`)
        console.log(`Accel(X: ${result.accel.x} Y: ${result.accel.y} Z:${result.accel.z})`)
        // console.log(`Mag  (X: ${result.mag.x} Y: ${result.mag.x} Z:${result.mag.x} HEADING:${180 * Math.atan2(result.mag.y, result.mag.x) / Math.PI})\n`)
        resolve()
      })
      .catch(err => { reject(`example read --> readAll: ${err}`) })
  })
}

function fifoFull(pin) {
  console.log('*** FIFO FULL ***')
}



sensor.setBufferSize(bufferSize)
sensor.init(bus).then((message) => {
  console.log(message)
  sensor.useFIFO().then((message) => {
    console.log(message)

    foo()

    // console.log("Starting Polling")
    // try{
    //   rpio.poll(36, read, rpio.POLL_HIGH)
    // } catch(err) {
    //   console.log(`***ERROR: ${err}`)
    // }  
  })
  .catch(err => { console.log(err) })
})
.catch(err => { console.log(err) })
