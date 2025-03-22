package com.safetnauts

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import android.util.Log
import androidx.annotation.RequiresPermission
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream
import java.util.UUID

class OBDConnector {

    private val bluetoothAdapter: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
    private var socket: BluetoothSocket? = null
    private var outputStream: OutputStream? = null
    private var inputStream: InputStream? = null

    private val OBD_UUID: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB") // SPP UUID

    @RequiresPermission(Manifest.permission.BLUETOOTH_CONNECT)
    fun connectToOBDDevice(deviceName: String): Boolean {
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled) {
            Log.e("OBD", "Bluetooth not available or not enabled.")
            return false
        }

        val pairedDevices = bluetoothAdapter.bondedDevices
        val device: BluetoothDevice? = pairedDevices.find { it.name == deviceName }

        if (device == null) {
            Log.e("OBD", "OBD device not found.")
            return false
        }

        return try {
            socket = device.createRfcommSocketToServiceRecord(OBD_UUID)
            socket?.connect()
            outputStream = socket?.outputStream
            inputStream = socket?.inputStream
            Log.i("OBD", "Connected to OBD device.")
            true
        } catch (e: IOException) {
            Log.e("OBD", "Connection failed: ${e.message}")
            false
        }
    }

    fun sendOBDCommand(command: String): String? {
        try {
            // Send command
            outputStream?.write((command + "\r").toByteArray())
            Thread.sleep(300)

            // Read response
            val buffer = ByteArray(1024)
            val bytes = inputStream?.read(buffer) ?: return null
            val raw = String(buffer, 0, bytes)
                .replace("\r", "")
                .replace("\n", "")
                .replace(">", "")
                .trim()

            // Log raw for debug
            Log.d("OBD", "Raw: $raw")

            // Split into 2-char hex tokens
            val hexParts = raw.chunked(2).map { it.trim() }.filter { it.isNotEmpty() }

            // Find "41" (response to 01 mode), and decode based on PID
            val indexOf41 = hexParts.indexOf("41")
            if (indexOf41 == -1 || indexOf41 + 2 >= hexParts.size) {
                return "Invalid or unexpected response"
            }

            val pid = hexParts[indexOf41 + 1]
            return when (pid.uppercase()) {
                "0D" -> {
                    // Speed: 41 0D XX
                    val speedHex = hexParts[indexOf41 + 2]
                    val speed = speedHex.toInt(16)
                    "$speed km/h"
                }

                "0C" -> {
                    // RPM: 41 0C XX YY
                    if (indexOf41 + 3 >= hexParts.size) return "Invalid RPM response"
                    val A = hexParts[indexOf41 + 2].toInt(16)
                    val B = hexParts[indexOf41 + 3].toInt(16)
                    val rpm = (256 * A + B) / 4
                    "$rpm RPM"
                }

                "05" -> {
                    // Coolant Temp: 41 05 XX
                    val temp = hexParts[indexOf41 + 2].toInt(16) - 40
                    "$temp °C"
                }

                else -> "Unknown PID: $pid (raw: $raw)"
            }

        } catch (e: Exception) {
            return "Error: ${e.message}"
        }
    }




    fun disconnect() {
        try {
            socket?.close()
            Log.i("OBD", "Disconnected.")
        } catch (e: IOException) {
            Log.e("OBD", "Error disconnecting: ${e.message}")
        }
    }
}