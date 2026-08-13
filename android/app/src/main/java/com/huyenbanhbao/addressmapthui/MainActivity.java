package com.huyenbanhbao.addressmapthui;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(LocationSharingPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
