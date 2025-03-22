package com.safetnauts

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import kotlin.math.sqrt

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "safetnauts"

    var isCollide = false
  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        startDetectCollision()
    }

    fun startDetectCollision() {
        val sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val sensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)

        val threshold = 15f  // Adjust based on test
        val listener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent) {
                val gForce = sqrt(event.values[0]*event.values[0] +
                        event.values[1]*event.values[1] +
                        event.values[2]*event.values[2])
                if (gForce > threshold) {
                    // Collision detected!
                    if(!isCollide) {
                        isCollide = true
                        startBLEAdvertising()
                        startReceiving()
                        sensorManager.unregisterListener(this)
                    }

                }
            }
            override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
        }
        sensorManager.registerListener(listener, sensor, SensorManager.SENSOR_DELAY_NORMAL)
    }


    @SuppressLint("MissingPermission")
    fun startBLEAdvertising() {
        val advertiser = BluetoothAdapter.getDefaultAdapter().bluetoothLeAdvertiser
        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .setConnectable(false)
            .build()

        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(true)
            .addManufacturerData(0x1234, "VIN:Bharat".toByteArray())
            .build()

        val advertiseCallback = object : AdvertiseCallback() {
            override fun onStartSuccess(settingsInEffect: AdvertiseSettings) {
                super.onStartSuccess(settingsInEffect)
                Toast.makeText(this@MainActivity, "Advertising started successfully!", Toast.LENGTH_SHORT).show()
                Log.d("BLE", "Advertising started successfully!")
            }

            override fun onStartFailure(errorCode: Int) {
                super.onStartFailure(errorCode)
                Toast.makeText(this@MainActivity, "Advertising failed with error code: $errorCode", Toast.LENGTH_SHORT).show()

                Log.e("BLE", "Advertising failed with error code: $errorCode")
            }
        }

        advertiser.startAdvertising(settings, data, advertiseCallback)
    }

    @SuppressLint("MissingPermission")
    fun startReceiving() {
        val scanner = BluetoothAdapter.getDefaultAdapter().bluetoothLeScanner
        val scanFilter = ScanFilter.Builder().build()
        val scanSettings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()

        val scanCallback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult) {
                val data = result.scanRecord?.getManufacturerSpecificData(0x1234)
                data?.let {
                    val info = String(it)
                    Toast.makeText(this@MainActivity, "Received info: $info", Toast.LENGTH_SHORT).show()
                    Log.d("BLE", "Received info: $info")
                }
            }
        }

        scanner.startScan(listOf(scanFilter), scanSettings, scanCallback)
    }
}
