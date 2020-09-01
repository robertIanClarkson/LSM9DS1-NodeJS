const i2c = require('i2c-bus');

i2c.openPromisified(1)
  .then(sensor => {
    sensor.readByte(0x6B, 0x0F)
      .then((data) => {
        console.log(data)
        sensor.close()
      })
  })