package com.safetnauts

import android.Manifest
import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.IOException
import java.util.UUID

class BluetoothModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val bluetoothAdapter: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
    private var bluetoothSocket: BluetoothSocket? = null
    private var connectedDevice: BluetoothDevice? = null
    private var discoveryPromise: Promise? = null
    private var pairingPromise: Promise? = null

    override fun getName(): String {
        return "BluetoothModule"
    }

    private val bluetoothReceiver = object : BroadcastReceiver() {
        @SuppressLint("MissingPermission")
        override fun onReceive(context: Context, intent: Intent) {
            when (intent.action) {
                BluetoothDevice.ACTION_FOUND -> {
                    val device: BluetoothDevice? = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
                    device?.let {
                        val deviceMap = Arguments.createMap()
                        deviceMap.putString("name", it.name ?: "Unknown Device")
                        deviceMap.putString("address", it.address)
                        discoveredDevices.pushMap(deviceMap)
                    }
                }
                BluetoothAdapter.ACTION_DISCOVERY_FINISHED -> {
                    reactApplicationContext.unregisterReceiver(this)
                    discoveryPromise?.resolve(discoveredDevices)
                    discoveryPromise = null
                }
            }
        }
    }

    private var discoveredDevices = Arguments.createArray()

    // Start scanning for available Bluetooth devices
    @SuppressLint("MissingPermission")
    @ReactMethod
    fun getAvailableDevices(promise: Promise) {
        if (bluetoothAdapter == null) {
            promise.reject("BLUETOOTH_NOT_SUPPORTED", "Bluetooth is not supported on this device")
            return
        }

        if (!bluetoothAdapter.isEnabled) {
            promise.reject("BLUETOOTH_DISABLED", "Bluetooth is turned off")
            return
        }

        if (!hasBluetoothPermissions()) {
            promise.reject("PERMISSION_DENIED", "Bluetooth permissions are required")
            return
        }

        discoveryPromise = promise
        discoveredDevices = Arguments.createArray()  // Reinitialize the array

        val filter = IntentFilter(BluetoothDevice.ACTION_FOUND)
        filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED)
        reactApplicationContext.registerReceiver(bluetoothReceiver, filter)

        bluetoothAdapter.startDiscovery()
    }

    // Check if Bluetooth permissions are granted
    private fun hasBluetoothPermissions(): Boolean {
        val context = reactApplicationContext
        return ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED &&
                ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED
    }

    @ReactMethod
    fun checkPermissions(promise: Promise) {
        promise.resolve(hasBluetoothPermissions())
    }

    @ReactMethod
    fun isBluetoothEnabled(promise: Promise) {
        promise.resolve(bluetoothAdapter?.isEnabled ?: false)
    }

    @SuppressLint("MissingPermission")
    @ReactMethod
    fun enableBluetooth(promise: Promise) {
        if (bluetoothAdapter == null) {
            promise.reject("BLUETOOTH_NOT_SUPPORTED", "Bluetooth is not supported on this device")
            return
        }

        if (bluetoothAdapter.isEnabled) {
            promise.resolve("Bluetooth is already enabled")
            return
        }

        val enableBtIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
        enableBtIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        reactApplicationContext.startActivity(enableBtIntent)

        promise.resolve("Bluetooth enable request sent")
    }

    @SuppressLint("MissingPermission")
    @ReactMethod
    fun connectToDevice(address: String, promise: Promise) {
        if (bluetoothAdapter == null) {
            promise.reject("BLUETOOTH_NOT_SUPPORTED", "Bluetooth is not supported on this device")
            return
        }

        if (!bluetoothAdapter.isEnabled) {
            promise.reject("BLUETOOTH_DISABLED", "Bluetooth is turned off")
            return
        }

        if (!hasBluetoothPermissions()) {
            promise.reject("PERMISSION_DENIED", "Bluetooth permissions are required")
            return
        }

        val device = bluetoothAdapter.getRemoteDevice(address)

        try {
            val uuid = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB") // Standard UUID for SPP
            bluetoothSocket = device.createRfcommSocketToServiceRecord(uuid)
            bluetoothSocket?.connect()
            connectedDevice = device

            promise.resolve("Connected to ${device.name}")
        } catch (e: IOException) {
            Log.e("BluetoothModule", "Error connecting: ${e.message}")
            promise.reject("CONNECTION_FAILED", "Failed to connect to $address")
        }
    }

    // Pair with a Bluetooth device
    @SuppressLint("MissingPermission")
    @ReactMethod
    fun pairDevice(deviceAddress: String, promise: Promise) {
        if (bluetoothAdapter == null) {
            promise.reject("BLUETOOTH_NOT_SUPPORTED", "Bluetooth is not supported on this device")
            return
        }

        if (!bluetoothAdapter.isEnabled) {
            promise.reject("BLUETOOTH_DISABLED", "Bluetooth is turned off")
            return
        }

        if (!hasBluetoothPermissions()) {
            promise.reject("PERMISSION_DENIED", "Bluetooth permissions are required")
            return
        }

        val device: BluetoothDevice? = bluetoothAdapter.getRemoteDevice(deviceAddress)
        if (device == null) {
            promise.reject("DEVICE_NOT_FOUND", "Device not found")
            return
        }

        pairingPromise = promise

        val filter = IntentFilter(BluetoothDevice.ACTION_BOND_STATE_CHANGED)
        reactApplicationContext.registerReceiver(pairingReceiver, filter)

        device.createBond()
    }

    private val pairingReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val device: BluetoothDevice? = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
            val bondState = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, BluetoothDevice.BOND_NONE)

            if (bondState == BluetoothDevice.BOND_BONDED) {
                pairingPromise?.resolve("Paired with ${device?.name}")
            } else if (bondState == BluetoothDevice.BOND_NONE) {
                pairingPromise?.reject("PAIRING_FAILED", "Pairing failed")
            }
        }
    }

    @ReactMethod
    fun disconnect() {
        try {
            bluetoothSocket?.close()
            connectedDevice = null
        } catch (e: IOException) {
            Log.e("BluetoothModule", "Error disconnecting: ${e.message}")
        }
    }

    @SuppressLint("MissingPermission")
    @ReactMethod
    fun connectToOBD(valueToRead: String) {
        Log.d("OBD Response", "connectToOBD")
        val obdConnector = OBDConnector()
        val connected = obdConnector.connectToOBDDevice("OBDII") // replace with your device name
        Log.d("OBD Response", "connected ${connected}")
        if (connected) {
            val response = obdConnector.sendOBDCommand(valueToRead) // Reset command
            Log.d("OBD Response", response ?: "No response")
        }
    }
}
