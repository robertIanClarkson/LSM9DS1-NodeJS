const i2c = require('i2c-bus');

i2c.openPromisified(1)
  .then(sensor => {
    Promise.all([
      sensor.readByte(0x6B, 0x0F),
      sensor.readByte(0x1E, 0x0F)
    ])
    .then(([x, y]) => {
      console.log(x)
      console.log(y)
      sensor.close()
    })
  })