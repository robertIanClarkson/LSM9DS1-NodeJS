import smbus
import time

class LSM9DS1:
    """HARDWARE REGISTERS"""
    
    """Gyro(G) & Accel(X) & Temp(T)"""
    _ACT_THS          = 0x04
    _ACT_DUR          = 0x05
    _INT_GEN_CFG_XL   = 0x06 
    _INT_GEN_THS_X_XL = 0x07
    _INT_GEN_THS_Y_XL = 0x08
    _INT_GEN_THS_Z_XL = 0x09
    _INT_GEN_DUR_XL   = 0x0A
    _REFERENCE_G      = 0x0B
    _INT1_CTRL        = 0x0C
    _INT2_CTRL        = 0x0D
    _WHO_AM_I         = 0x0F # GX - r  - ( 0x68 )
    _CTRL_REG1_G      = 0x10 # G  - rw - ( rate | dps | bandwidth )
    _CTRL_REG2_G      = 0x11 # G  - rw - ( INT selection configuration | Out selection configuration )
    _CTRL_REG3_G      = 0x12 # G  - rw - ( Low-power mode | High-pass filter | filter cutoff frequency )
    _ORIENT_CFG_G     = 0x13 # G  - rw - ( Pitch +/- | Roll +/- | Yaw +/- | [All in 3 bits] )
    _INT_GEN_SRC_G    = 0x14 
    _OUT_TEMP_L       = 0x15 # T - r  - ( low )
    _OUT_TEMP_H       = 0x16 # T - r  - ( high )
    _STATUS_REG       = 0x17 
    _OUT_X_L_G        = 0x18 # G - r  - ( x-low  )
    _OUT_X_H_G        = 0x19 # G - r  - ( x-high )
    _OUT_Y_L_G        = 0x1A # G - r  - ( y-low  )
    _OUT_Y_H_G        = 0x1B # G - r  - ( y-high )
    _OUT_Z_L_G        = 0x1C # G - r  - ( z-low  )
    _OUT_Z_H_G        = 0x1D # G - r  - ( z-high )
    _CTRL_REG4        = 0x1E # G_  - rw - ( enable-z | enable-y | enable-x | Latched Interrupt | 4D option enabled on Interrupt )
    _CTRL_REG5_XL     = 0x1F # X   - rw - ( Decimation of acceleration data on OUT REG and FIFO | z-enable | y-enable | x-enable )
    _CTRL_REG6_XL     = 0x20 # X   - rw - ( rate | g-scale | Bandwidth | Bandwidth selection | Anti-aliasing filter bandwidth )
    _CTRL_REG7_XL     = 0x21 # X   - rw - ( High resolution mode |  cutoff frequency | Filtered data | High-pass filter enabled for acceleration sensor interrupt function on Interrupt )
    _CTRL_REG8        = 0x22 # X   - rw - ( Reboot memory content | Block data update | _ | _ | _ | _ | _ | _ )
    _CTRL_REG9        = 0x23 # GT_ - rw - ( Gyroscope sleep mode enable | Temperature data storage in FIFO enable |  Data available enable bit |  Disable I2C interface | FIFO memory enable | Enable FIFO threshold level use )
    _CTRL_REG10       = 0x24 # GX  - rw - ( Angular rate sensor self-test enable |  Linear acceleration sensor self-test enable )
    _INT_GEN_SRC_XL   = 0x26
    _STATUS_REG    = 0x27 # I believe this is a duplicate register
    _OUT_X_L_XL       = 0x28 # X - r  - ( x-low  )
    _OUT_X_H_XL       = 0x29 # X - r  - ( x-high )
    _OUT_Y_L_XL       = 0x2A # X - r  - ( y-low  )
    _OUT_Y_H_XL       = 0x2B # X - r  - ( y-high )
    _OUT_Z_L_XL       = 0x2C # X - r  - ( z-low  )
    _OUT_Z_H_XL       = 0x2D # X - r  - ( z-high )
    _FIFO_CTRL        = 0x2E # FIFO - rw - ( mode | threshold )
    _FIFO_SRC         = 0x2F # FIFO - r  - ( threshold status | overrun status | Number of unread samples stored into FIFO )
    _INT_GEN_CFG_G    = 0x30
    _INT_GEN_THS_XH_G = 0x31
    _INT_GEN_THS_XL_G = 0x32
    _INT_GEN_THS_YH_G = 0x33
    _INT_GEN_THS_YL_G = 0x34
    _INT_GEN_THS_ZH_G = 0x35
    _INT_GEN_THS_ZL_G = 0x36
    _INT_GEN_DUR_G    = 0x37
    
    """MAG(M)"""
    _OFFSET_X_REG_L_M = 0x05
    _OFFSET_X_REG_H_M = 0x06
    _OFFSET_Y_REG_L_M = 0x07
    _OFFSET_Y_REG_H_M = 0x08
    _OFFSET_Z_REG_L_M = 0x09
    _OFFSET_Z_REG_H_M = 0x0A
    _WHO_AM_I_M       = 0x0F # M - r  - ( 0x3D )
    _CTRL_REG1_M      = 0x20 # M - rw - ( Temperature compensation enable | X and Y performance mode | rate | FAST_ODR | Self-test )
    _CTRL_REG2_M      = 0x21 # M - rw - ( sensitivity | Reboot memory content | Configuration registers and user register reset function )
    _CTRL_REG3_M      = 0x22 # M - rw - ( Disable I2C interface | Low-power mode | SPI Serial Interface mode | Operating mode selection )
    _CTRL_REG4_M      = 0x23 # M - rw - ( Z-axis performance | _ )
    _CTRL_REG5_M      = 0x24 # M - rw - ( FAST_READ | Block data update for magnetic data )
    _STATUS_REG_M     = 0x27 # M - r  - (  )
    _OUT_X_L_M        = 0x28 # M - r  - ( x-low  )
    _OUT_X_H_M        = 0x29 # M - r  - ( x-high )
    _OUT_Y_L_M        = 0x2A # M - r  - ( y-low  )
    _OUT_Y_H_M        = 0x2B # M - r  - ( y-high )
    _OUT_Z_L_M        = 0x2C # M - r  - ( z-low  )
    _OUT_Z_H_M        = 0x2D # M - r  - ( z-high )
    _INT_CFG_M        = 0x30
    _INT_SRC_M        = 0x31
    _INT_THS_L_M      = 0x32
    _INT_THS_H_M      = 0x33
  
    """WHO_AM_I keys"""
    _whoami_g_xl_key = 0x68
    _whoami_m_key    = 0x3D
  
    """INSTANCE VARIABLES"""
    _bus             = None
    _buffer_size     = 1
    _G_XL_ADDRESS    = None
    _M_ADDRESS       = None
  
    def __init__(self, g_xl_address, m_address, bus):
        """
        g_XL_address -- Gyro & Accelerometer address of sensor from host machine
        m_address -- Magnetometer address of sensor from host machine
        """
        self._G_XL_ADDRESS = g_xl_address
        self._M_ADDRESS    = m_address
        self._bus          = smbus.SMBus(bus)

        """
        check who am i
        """
        who_am_i_g_xl_result = self._bus.read_byte_data(self._G_XL_ADDRESS, self._WHO_AM_I)
        who_am_i_m_result    = self._bus.read_byte_data(self._M_ADDRESS,    self._WHO_AM_I_M)
        if(who_am_i_g_xl_result != self._whoami_g_xl_key or who_am_i_m_result != self._whoami_m_key):
            raise Exception("Who am i check failed")

    def set_G_XL_address(self, g_xl_address):
        """
        g_xl_address -- Gyro & Accelerometer address of sensor from host machine
        """
        self._G_XL_ADDRESS = g_xl_address

    def set_M_address(self, m_address):
        """
        m_address -- Magnetometer address of sensor from host machine
        """
        self._M_ADDRESS = m_address

    def get_G_XL_address(self):
        return self._G_XL_ADDRESS

    def get_M_address(self):
        return self._M_ADDRESS

    def set_buffer_size(self, size):
        if(size <= 32 and size >= 1):
            self._buffer_size = size
        else:
            raise Exception("Invalid buffer size")

    def get_buffer_size(self):
        return self._buffer_size

    def use_fifo(self):
        """Initialize Gyro & Accelerometer registers"""
        self._bus.write_byte_data(self._G_XL_ADDRESS, self._CTRL_REG1_G,  0x78)
        self._bus.write_byte_data(self._G_XL_ADDRESS, self._CTRL_REG2_G,  0x00)
        self._bus.write_byte_data(self._G_XL_ADDRESS, self._CTRL_REG3_G,  0x00)
        self._bus.write_byte_data(self._G_XL_ADDRESS, self._CTRL_REG4,    0x38)
        self._bus.write_byte_data(self._G_XL_ADDRESS, self._CTRL_REG5_XL, 0x38)
        self._bus.write_byte_data(self._G_XL_ADDRESS, self._CTRL_REG6_XL, 0x70)
        self._bus.write_byte_data(self._G_XL_ADDRESS, self._CTRL_REG7_XL, 0x00)
        self._bus.write_byte_data(self._G_XL_ADDRESS, self._CTRL_REG8,    0x04)
        self._bus.write_byte_data(self._G_XL_ADDRESS, self._CTRL_REG9,    0x00)
        self._bus.write_byte_data(self._G_XL_ADDRESS, self._CTRL_REG10,   0x00)

        """Initialize Magnetometer registers"""
        self._bus.write_byte_data(self._M_ADDRESS, self._CTRL_REG1_M, 0x38)
        self._bus.write_byte_data(self._M_ADDRESS, self._CTRL_REG2_M, 0x00)
        self._bus.write_byte_data(self._M_ADDRESS, self._CTRL_REG3_M, 0x00)
        self._bus.write_byte_data(self._M_ADDRESS, self._CTRL_REG4_M, 0x38)
        self._bus.write_byte_data(self._M_ADDRESS, self._CTRL_REG5_M, 0x38)

        """Initialize FIFO registers"""
        self._bus.write_byte_data(self._G_XL_ADDRESS, self._INT1_CTRL, 0x08)
        self._bus.write_byte_data(self._G_XL_ADDRESS, self._CTRL_REG9, 0x03)
        self._bus.write_byte_data(self._G_XL_ADDRESS, self._FIFO_CTRL, 0x00)
        self._bus.write_byte_data(self._G_XL_ADDRESS, self._FIFO_CTRL, 0x3F)
    
    def _convert(self, low, high):
        pass
    
    def read_gyro(self):
        x_sum = 0
        y_sum = 0
        z_sum = 0

        x_l_block = self._bus.read_block_data(self._G_XL_ADDRESS, self._OUT_X_L_G, self._buffer_size)
        x_h_block = self._bus.read_block_data(self._G_XL_ADDRESS, self._OUT_X_H_G, self._buffer_size)
        y_l_block = self._bus.read_block_data(self._G_XL_ADDRESS, self._OUT_Y_L_G, self._buffer_size)
        y_h_block = self._bus.read_block_data(self._G_XL_ADDRESS, self._OUT_Y_H_G, self._buffer_size)
        z_l_block = self._bus.read_block_data(self._G_XL_ADDRESS, self._OUT_Z_L_G, self._buffer_size)
        z_h_block = self._bus.read_block_data(self._G_XL_ADDRESS, self._OUT_Z_H_G, self._buffer_size)
        
        for i in range(self._buffer_size):
            x_sum += self._convert(x_l_block[i], x_h_block[i]) 
            y_sum += self._convert(y_l_block[i], y_h_block[i]) 
            z_sum += self._convert(z_l_block[i], z_h_block[i])

        x = x_sum / self._buffer_size
        y = y_sum / self._buffer_size
        z = z_sum / self._buffer_size

        return [x, y, z]


    def read_accel(self):
        x_sum = 0
        y_sum = 0
        z_sum = 0

        x_l_block = self._bus.read_block_data(self._G_XL_ADDRESS, self._OUT_X_L_XL, self._buffer_size)
        x_h_block = self._bus.read_block_data(self._G_XL_ADDRESS, self._OUT_X_H_XL, self._buffer_size)
        y_l_block = self._bus.read_block_data(self._G_XL_ADDRESS, self._OUT_Y_L_XL, self._buffer_size)
        y_h_block = self._bus.read_block_data(self._G_XL_ADDRESS, self._OUT_Y_H_XL, self._buffer_size)
        z_l_block = self._bus.read_block_data(self._G_XL_ADDRESS, self._OUT_Z_L_XL, self._buffer_size)
        z_h_block = self._bus.read_block_data(self._G_XL_ADDRESS, self._OUT_Z_H_XL, self._buffer_size)
        
        for i in range(self._buffer_size):
            x_sum += self._convert(x_l_block[i], x_h_block[i]) 
            y_sum += self._convert(y_l_block[i], y_h_block[i]) 
            z_sum += self._convert(z_l_block[i], z_h_block[i])

        x = x_sum / self._buffer_size
        y = y_sum / self._buffer_size
        z = z_sum / self._buffer_size

        return [x, y, z]

    def read_mag(self):
        x_sum = 0
        y_sum = 0
        z_sum = 0

        x_l_block = self._bus.read_block_data(self._M_ADDRESS, self._OUT_X_L_M, self._buffer_size)
        x_h_block = self._bus.read_block_data(self._M_ADDRESS, self._OUT_X_H_M, self._buffer_size)
        y_l_block = self._bus.read_block_data(self._M_ADDRESS, self._OUT_Y_L_M, self._buffer_size)
        y_h_block = self._bus.read_block_data(self._M_ADDRESS, self._OUT_Y_H_M, self._buffer_size)
        z_l_block = self._bus.read_block_data(self._M_ADDRESS, self._OUT_Z_L_M, self._buffer_size)
        z_h_block = self._bus.read_block_data(self._M_ADDRESS, self._OUT_Z_H_M, self._buffer_size)
        
        for i in range(self._buffer_size):
            x_sum += self._convert(x_l_block[i], x_h_block[i]) 
            y_sum += self._convert(y_l_block[i], y_h_block[i]) 
            z_sum += self._convert(z_l_block[i], z_h_block[i])

        x = x_sum / self._buffer_size
        y = y_sum / self._buffer_size
        z = z_sum / self._buffer_size

        return [x, y, z]

"""MAIN"""
sensor = LSM9DS1(0x6B, 0x1E, 1)
sensor.set_buffer_size(32)
sensor.use_fifo()

while(True):
    gyro  = sensor.read_gyro()
    accel = sensor.read_accel()
    mag   = sensor.read_mag()
    print("GYRO")
    print("\tX: {0:8} Y:{0:8} Z:{0:8}".format(gyro))
    print("ACCEL")
    print("\tX: {0:8} Y:{0:8} Z:{0:8}".format(accel))
    print("MAG")
    print("\tX: {0:8} Y:{0:8} Z:{0:8}".format(mag))
    print("******************************************")
    time.sleep(1)


