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
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

public class LocationSharingService extends Service implements LocationListener {
    private static final String CHANNEL_ID = "location_sharing";
    private static final long UPDATE_INTERVAL_MS = 10_000L;
    private LocationManager locationManager;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final AtomicBoolean uploadInFlight = new AtomicBoolean(false);
    private final Handler heartbeatHandler = new Handler(Looper.getMainLooper());
    private Location latestLocation;
    private String supabaseUrl, supabaseKey, accessToken, refreshToken, userId, displayName;

    private final Runnable uploadHeartbeat = new Runnable() {
        @Override public void run() {
            if (latestLocation == null) latestLocation = getBestLastKnownLocation();
            if (latestLocation != null) upload(latestLocation);
            heartbeatHandler.postDelayed(this, UPDATE_INTERVAL_MS);
        }
    };

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) {
            stopSelf();
            return START_NOT_STICKY;
        }
        supabaseUrl = intent.getStringExtra("supabaseUrl"); supabaseKey = intent.getStringExtra("supabaseKey");
        accessToken = intent.getStringExtra("accessToken"); refreshToken = intent.getStringExtra("refreshToken"); userId = intent.getStringExtra("userId"); displayName = intent.getStringExtra("displayName");
        createChannel(); startForeground(1001, notification());
        boolean hasFineLocation = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean hasCoarseLocation = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        if (hasFineLocation || hasCoarseLocation) {
            locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
            if (hasFineLocation) {
                try { locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, UPDATE_INTERVAL_MS, 0, this); } catch (IllegalArgumentException | SecurityException ignored) {}
            }
            try { locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, UPDATE_INTERVAL_MS, 0, this); } catch (IllegalArgumentException | SecurityException ignored) {}
            latestLocation = getBestLastKnownLocation();
        }
        heartbeatHandler.removeCallbacks(uploadHeartbeat);
        heartbeatHandler.post(uploadHeartbeat);
        return START_REDELIVER_INTENT;
    }

    private Location getBestLastKnownLocation() {
        if (locationManager == null) return null;
        Location bestLocation = null;
        try {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED)
                bestLocation = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                Location networkLocation = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                if (networkLocation != null && (bestLocation == null || networkLocation.getTime() > bestLocation.getTime()))
                    bestLocation = networkLocation;
            }
        } catch (IllegalArgumentException | SecurityException ignored) {}
        return bestLocation;
    }

    @Override public void onLocationChanged(Location location) { latestLocation = location; }
    private void upload(Location location) {
        if (!uploadInFlight.compareAndSet(false, true)) return;
        executor.execute(() -> { try {
        JSONObject body = new JSONObject(); body.put("user_id", userId); body.put("display_name", displayName); body.put("latitude", location.getLatitude()); body.put("longitude", location.getLongitude()); body.put("accuracy", location.getAccuracy()); body.put("updated_at", java.time.Instant.now().toString());
        HttpURLConnection connection = (HttpURLConnection) new URL(supabaseUrl + "/rest/v1/shared_locations?on_conflict=user_id").openConnection();
        connection.setConnectTimeout(8_000); connection.setReadTimeout(8_000); connection.setRequestMethod("POST"); connection.setDoOutput(true); connection.setRequestProperty("apikey", supabaseKey); connection.setRequestProperty("Authorization", "Bearer " + accessToken); connection.setRequestProperty("Content-Type", "application/json"); connection.setRequestProperty("Prefer", "resolution=merge-duplicates");
        try (OutputStream output = connection.getOutputStream()) { output.write(body.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8)); }
        int response = connection.getResponseCode(); connection.disconnect(); if (response == 401) refreshAccessToken();
    } catch (Exception ignored) {} finally { uploadInFlight.set(false); } }); }
    private void refreshAccessToken() { try {
        HttpURLConnection connection = (HttpURLConnection) new URL(supabaseUrl + "/auth/v1/token?grant_type=refresh_token").openConnection(); connection.setConnectTimeout(8_000); connection.setReadTimeout(8_000); connection.setRequestMethod("POST"); connection.setDoOutput(true); connection.setRequestProperty("apikey", supabaseKey); connection.setRequestProperty("Content-Type", "application/json");
        JSONObject body = new JSONObject(); body.put("refresh_token", refreshToken); try (OutputStream output = connection.getOutputStream()) { output.write(body.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8)); }
        java.io.InputStream input = connection.getInputStream(); String text = new String(input.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8); JSONObject result = new JSONObject(text); accessToken = result.getString("access_token"); refreshToken = result.getString("refresh_token"); connection.disconnect();
    } catch (Exception ignored) {} }
    private void createChannel() { if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) { NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Chia sẻ vị trí", NotificationManager.IMPORTANCE_LOW); getSystemService(NotificationManager.class).createNotificationChannel(channel); } }
    private Notification notification() { return new NotificationCompat.Builder(this, CHANNEL_ID).setContentTitle("Đang chia sẻ vị trí").setContentText("Vị trí được cập nhật mỗi 10 giây").setSmallIcon(R.mipmap.ic_launcher).setOngoing(true).build(); }
    @Override public void onDestroy() { heartbeatHandler.removeCallbacks(uploadHeartbeat); if (locationManager != null) locationManager.removeUpdates(this); executor.shutdown(); super.onDestroy(); }
    @Nullable @Override public IBinder onBind(Intent intent) { return null; }
}
