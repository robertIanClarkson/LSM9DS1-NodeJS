const i2c = require('i2c-bus');

class LSM9DS0 {
  constructor(g_xl_address, m_address) {
    this.sensor = undefined;
    this.bufferSize = 1;
    this.G_XL_ADDRESS  = g_xl_address;
    this.M_ADDRESS = m_address;
    /* Gyro(G) & Accel(X) & Temp(T) */
    this.ACT_THS          = 0x04;
    this.ACT_DUR          = 0x05;
    this.INT_GEN_CFG_XL   = 0x06; 
    this.INT_GEN_THS_X_XL = 0x07;
    this.INT_GEN_THS_Y_XL = 0x08;
    this.INT_GEN_THS_Z_XL = 0x09;
    this.INT_GEN_DUR_XL   = 0x0A;
    this.REFERENCE_G      = 0x0B;
    this.INT1_CTRL        = 0x0C;
    this.INT2_CTRL        = 0x0D;
    this.WHO_AM_I         = 0x0F; // GX - r  - ( 0x68 )
    this.CTRL_REG1_G      = 0x10; // G  - rw - ( rate | dps | bandwidth )
    this.CTRL_REG2_G      = 0x11; // G  - rw - ( INT selection configuration | Out selection configuration )
    this.CTRL_REG3_G      = 0x12; // G  - rw - ( Low-power mode | High-pass filter | filter cutoff frequency )
    this.ORIENT_CFG_G     = 0x13; // G  - rw - ( Pitch +/- | Roll +/- | Yaw +/- | [All in 3 bits] )
    this.INT_GEN_SRC_G    = 0x14; 
    this.OUT_TEMP_L       = 0x15; // T - r  - ( low )
    this.OUT_TEMP_H       = 0x16; // T - r  - ( high )
    this.STATUS_REG       = 0x17; 
    this.OUT_X_L_G        = 0x18; // G - r  - ( x-low  )
    this.OUT_X_H_G        = 0x19; // G - r  - ( x-high )
    this.OUT_Y_L_G        = 0x1A; // G - r  - ( y-low  )
    this.OUT_Y_H_G        = 0x1B; // G - r  - ( y-high )
    this.OUT_Z_L_G        = 0x1C; // G - r  - ( z-low  )
    this.OUT_Z_H_G        = 0x1D; // G - r  - ( z-high )
    this.CTRL_REG4        = 0x1E; // G_  - rw - ( enable-z | enable-y | enable-x | Latched Interrupt | 4D option enabled on Interrupt )
    this.CTRL_REG5_XL     = 0x1F; // X   - rw - ( Decimation of acceleration data on OUT REG and FIFO | z-enable | y-enable | x-enable )
    this.CTRL_REG6_XL     = 0x20; // X   - rw - ( rate | g-scale | Bandwidth | Bandwidth selection | Anti-aliasing filter bandwidth )
    this.CTRL_REG7_XL     = 0x21; // X   - rw - ( High resolution mode |  cutoff frequency | Filtered data | High-pass filter enabled for acceleration sensor interrupt function on Interrupt )
    this.CTRL_REG8        = 0x22; // X   - rw - ( Reboot memory content | Block data update | _ | _ | _ | _ | _ | _ )
    this.CTRL_REG9        = 0x23; // GT_ - rw - ( Gyroscope sleep mode enable | Temperature data storage in FIFO enable |  Data available enable bit |  Disable I2C interface | FIFO memory enable | Enable FIFO threshold level use )
    this.CTRL_REG10       = 0x24; // GX  - rw - ( Angular rate sensor self-test enable |  Linear acceleration sensor self-test enable )
    this.INT_GEN_SRC_XL   = 0x26;
    // this.STATUS_REG    = 0x27; /* I believe this is a duplicate register */
    this.OUT_X_L_XL       = 0x28; // X - r  - ( x-low  )
    this.OUT_X_H_XL       = 0x29; // X - r  - ( x-high )
    this.OUT_Y_L_XL       = 0x2A; // X - r  - ( y-low  )
    this.OUT_Y_H_XL       = 0x2B; // X - r  - ( y-high )
    this.OUT_Z_L_XL       = 0x2C; // X - r  - ( z-low  )
    this.OUT_Z_H_XL       = 0x2D; // X - r  - ( z-high )
    this.FIFO_CTRL        = 0x2E; // FIFO - rw - ( mode | threshold )
    this.FIFO_SRC         = 0x2F; // FIFO - r  - ( threshold status | overrun status | Number of unread samples stored into FIFO )
    this.INT_GEN_CFG_G    = 0x30;
    this.INT_GEN_THS_XH_G = 0x31;
    this.INT_GEN_THS_XL_G = 0x32;
    this.INT_GEN_THS_YH_G = 0x33;
    this.INT_GEN_THS_YL_G = 0x34;
    this.INT_GEN_THS_ZH_G = 0x35;
    this.INT_GEN_THS_ZL_G = 0x36;
    this.INT_GEN_DUR_G    = 0x37;
    /* MAG(M) */
    this.OFFSET_X_REG_L_M = 0x05;
    this.OFFSET_X_REG_H_M = 0x06;
    this.OFFSET_Y_REG_L_M = 0x07;
    this.OFFSET_Y_REG_H_M = 0x08;
    this.OFFSET_Z_REG_L_M = 0x09;
    this.OFFSET_Z_REG_H_M = 0x0A;
    this.WHO_AM_I_M       = 0x0F; // M - r  - ( 0x3D )
    this.CTRL_REG1_M      = 0x20; // M - rw - ( Temperature compensation enable | X and Y performance mode | rate | FAST_ODR | Self-test )
    this.CTRL_REG2_M      = 0x21; // M - rw - ( sensitivity | Reboot memory content | Configuration registers and user register reset function )
    this.CTRL_REG3_M      = 0x22; // M - rw - ( Disable I2C interface | Low-power mode | SPI Serial Interface mode | Operating mode selection )
    this.CTRL_REG4_M      = 0x23; // M - rw - ( Z-axis performance | _ )
    this.CTRL_REG5_M      = 0x24; // M - rw - ( FAST_READ | Block data update for magnetic data )
    this.STATUS_REG_M     = 0x27; // M - r  - (  )
    this.OUT_X_L_M        = 0x28; // M - r  - ( x-low  )
    this.OUT_X_H_M        = 0x29; // M - r  - ( x-high )
    this.OUT_Y_L_M        = 0x2A; // M - r  - ( y-low  )
    this.OUT_Y_H_M        = 0x2B; // M - r  - ( y-high )
    this.OUT_Z_L_M        = 0x2C; // M - r  - ( z-low  )
    this.OUT_Z_H_M        = 0x2D; // M - r  - ( z-high )
    this.INT_CFG_M        = 0x30;
    this.INT_SRC_M        = 0x31;
    this.INT_THS_L_M      = 0x32;
    this.INT_THS_H_M      = 0x33;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  init(bus) {
    return new Promise((resolve, reject) => {
      i2c.openPromisified(bus)
      .then(sensor => {
        this.sensor = sensor;
        resolve('*** init: Success ***')
      })
      .catch(err => {
        reject('init: FAILED open i2c bus')
      })
    })
  }

  setBufferSize(bufferSize) {
    this.bufferSize = bufferSize;
  }

  useFIFO() {
    let set_a = 0x00;
    let set_b = 0x00;
    let set_c = 0x00;
    let set_d = 0x00;
    let set_e = 0x00;
    let set_f = 0x00;
    let set_g = 0x00;
    let set_h = 0x00;
    let set_i = 0x00;
    return new Promise((resolve, reject) => {
      /* check if sensor initiated */
      if(sensor == undefined) reject('useFIFO: FAILED i2c bus is close')
      /* Make the write */ 
      Promise.all([
        this.sensor.writeByte(this.G_XL_ADDRESS, this.CTRL_REG1_G,  set_a),
        this.sensor.writeByte(this.G_XL_ADDRESS, this.CTRL_REG1_G,  set_b), 
        this.sensor.writeByte(this.G_XL_ADDRESS, this.CTRL_REG1_G,  set_c),
        this.sensor.writeByte(this.G_XL_ADDRESS, this.CTRL_REG4,    set_d),
        this.sensor.writeByte(this.G_XL_ADDRESS, this.CTRL_REG5_XL, set_e),
        this.sensor.writeByte(this.G_XL_ADDRESS, this.CTRL_REG6_XL, set_f),
        this.sensor.writeByte(this.G_XL_ADDRESS, this.CTRL_REG7_XL, set_g),
        this.sensor.writeByte(this.G_XL_ADDRESS, this.CTRL_REG8,    set_h),
        this.sensor.writeByte(this.G_XL_ADDRESS, this.CTRL_REG9,    set_i)
      ])
      .then(() => {
        /* Read the bytes we just wrote */
        Promise.all([
          this.sensor.readByte(this.G_XL_ADDRESS, this.CTRL_REG1_G ),
          this.sensor.readByte(this.G_XL_ADDRESS, this.CTRL_REG1_G ), 
          this.sensor.readByte(this.G_XL_ADDRESS, this.CTRL_REG1_G ),
          this.sensor.readByte(this.G_XL_ADDRESS, this.CTRL_REG4   ),
          this.sensor.readByte(this.G_XL_ADDRESS, this.CTRL_REG5_XL),
          this.sensor.readByte(this.G_XL_ADDRESS, this.CTRL_REG6_XL),
          this.sensor.readByte(this.G_XL_ADDRESS, this.CTRL_REG7_XL),
          this.sensor.readByte(this.G_XL_ADDRESS, this.CTRL_REG8   ),
          this.sensor.readByte(this.G_XL_ADDRESS, this.CTRL_REG9   )
        ])
        .then(([a, b, c, d, e, f, g, h, i]) => {
          /* Check to make sure the write was successful */
          if(
            a == set_a &&
            b == set_b &&
            c == set_c &&
            d == set_d &&
            e == set_e &&
            f == set_f &&
            g == set_g &&
            h == set_h &&
            i == set_i
          ){
            resolve('*** useFIFO: Success ***')
          } else {
            reject('useFIFO: FAILED check')
          }
        })
        .catch(err => {
          reject(`useFIFO: FAILED to read : ${err}`)
        })
      })
      .catch(err => {
        reject(`useFIFO: FAILED to write: ${err}`)
      })
    }) 
  }

  readGyroBuffer() {
    return
  }

  readAccelBuffer() {
    return
  }

  readMagBuffer() {
    return
  }

  read() {
    return
  }

  close() {
    this.sensor.close()
    this.sensor = undefined
  }
}


