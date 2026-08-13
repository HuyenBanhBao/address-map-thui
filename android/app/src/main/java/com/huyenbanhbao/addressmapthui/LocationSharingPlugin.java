package com.huyenbanhbao.addressmapthui;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import androidx.core.content.ContextCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "LocationSharing")
public class LocationSharingPlugin extends Plugin {
    @PluginMethod
    public void start(PluginCall call) {
        if (ContextCompat.checkSelfPermission(getContext(), android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            call.reject("LOCATION_PERMISSION_REQUIRED"); return;
        }
        Intent intent = new Intent(getContext(), LocationSharingService.class);
        intent.putExtra("supabaseUrl", call.getString("supabaseUrl"));
        intent.putExtra("supabaseKey", call.getString("supabaseKey"));
        intent.putExtra("accessToken", call.getString("accessToken"));
        intent.putExtra("refreshToken", call.getString("refreshToken"));
        intent.putExtra("userId", call.getString("userId"));
        intent.putExtra("displayName", call.getString("displayName"));
        ContextCompat.startForegroundService(getContext(), intent);
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getContext().stopService(new Intent(getContext(), LocationSharingService.class));
        call.resolve();
    }
}
