const LSM9DS1 = require('./LSM9DS1')

var g_xl_address = 0x00;
var m_address    = 0x00;

var sensor = new LSM9DS1(g_xl_address, m_address);

sensor.setBufferSize(32)
sensor.init(1)
.then(() => {
  sensor.useFIFO()
  .then(() => {
    sensor.readAll()
    .then((result) => {
      console.log(`Gyro (X: ${result.gyro.x} Y: ${result.gyro.y} Z:${result.gyro.z})`)
      console.log(`Accel(X: ${result.accel.x} Y: ${result.accel.y} Z:${result.accel.z})`)
      console.log(`Mag  (X: ${result.mag.x} Y: ${result.mag.x} Z:${result.mag.x} HEADING:${180 * Math.atan2(result.mag.y, result.mag.x) / Math.PI})\n`)
      sensor.close()
      .then((message) => {
        console.log(message)
      })
    })
  })
})
