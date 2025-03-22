package com.safetnauts

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class AppPackage() : ReactPackage {
    override fun createNativeModules(p0: ReactApplicationContext): MutableList<NativeModule> {
        val nativeModules = ArrayList<NativeModule>()

        nativeModules.add(BluetoothModule(p0))
        return nativeModules;
    }

    override fun createViewManagers(context: ReactApplicationContext): MutableList<ViewManager<*, *>> {
        return mutableListOf()
    }
}