package com.huyenbanhbao.addressmapthui;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.IBinder;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class LocationSharingService extends Service implements LocationListener {
    private static final String CHANNEL_ID = "location_sharing";
    private LocationManager locationManager;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private String supabaseUrl, supabaseKey, accessToken, refreshToken, userId, displayName;

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        supabaseUrl = intent.getStringExtra("supabaseUrl"); supabaseKey = intent.getStringExtra("supabaseKey");
        accessToken = intent.getStringExtra("accessToken"); refreshToken = intent.getStringExtra("refreshToken"); userId = intent.getStringExtra("userId"); displayName = intent.getStringExtra("displayName");
        createChannel(); startForeground(1001, notification());
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
            try { locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 10000, 0, this); } catch (IllegalArgumentException ignored) {}
            try { locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 10000, 0, this); } catch (IllegalArgumentException ignored) {}
        }
        return START_STICKY;
    }

    @Override public void onLocationChanged(Location location) { upload(location); }
    private void upload(Location location) { executor.execute(() -> { try {
        JSONObject body = new JSONObject(); body.put("user_id", userId); body.put("display_name", displayName); body.put("latitude", location.getLatitude()); body.put("longitude", location.getLongitude()); body.put("accuracy", location.getAccuracy()); body.put("updated_at", java.time.Instant.now().toString());
        HttpURLConnection connection = (HttpURLConnection) new URL(supabaseUrl + "/rest/v1/shared_locations?on_conflict=user_id").openConnection();
        connection.setRequestMethod("POST"); connection.setDoOutput(true); connection.setRequestProperty("apikey", supabaseKey); connection.setRequestProperty("Authorization", "Bearer " + accessToken); connection.setRequestProperty("Content-Type", "application/json"); connection.setRequestProperty("Prefer", "resolution=merge-duplicates");
        try (OutputStream output = connection.getOutputStream()) { output.write(body.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8)); }
        int response = connection.getResponseCode(); connection.disconnect(); if (response == 401) refreshAccessToken();
    } catch (Exception ignored) {} }); }
    private void refreshAccessToken() { try {
        HttpURLConnection connection = (HttpURLConnection) new URL(supabaseUrl + "/auth/v1/token?grant_type=refresh_token").openConnection(); connection.setRequestMethod("POST"); connection.setDoOutput(true); connection.setRequestProperty("apikey", supabaseKey); connection.setRequestProperty("Content-Type", "application/json");
        JSONObject body = new JSONObject(); body.put("refresh_token", refreshToken); try (OutputStream output = connection.getOutputStream()) { output.write(body.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8)); }
        java.io.InputStream input = connection.getInputStream(); String text = new String(input.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8); JSONObject result = new JSONObject(text); accessToken = result.getString("access_token"); refreshToken = result.getString("refresh_token"); connection.disconnect();
    } catch (Exception ignored) {} }
    private void createChannel() { if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) { NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Chia sẻ vị trí", NotificationManager.IMPORTANCE_LOW); getSystemService(NotificationManager.class).createNotificationChannel(channel); } }
    private Notification notification() { return new NotificationCompat.Builder(this, CHANNEL_ID).setContentTitle("Đang chia sẻ vị trí").setContentText("Vị trí được cập nhật mỗi 10 giây").setSmallIcon(R.mipmap.ic_launcher).setOngoing(true).build(); }
    @Override public void onDestroy() { if (locationManager != null) locationManager.removeUpdates(this); executor.shutdown(); super.onDestroy(); }
    @Nullable @Override public IBinder onBind(Intent intent) { return null; }
}
