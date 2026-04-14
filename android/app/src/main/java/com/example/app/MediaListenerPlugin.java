package com.example.app; // ¡CAMBIA ESTO POR EL NOMBRE DE TU PAQUETE!

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.media.AudioManager;
import android.view.KeyEvent;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MediaListenerPlugin")
public class MediaListenerPlugin extends Plugin {

    private BroadcastReceiver mediaReceiver;

    @Override
    public void load() {
        mediaReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                JSObject ret = new JSObject();
                ret.put("title", intent.getStringExtra("title"));
                ret.put("artist", intent.getStringExtra("artist"));
                ret.put("albumArt", intent.getStringExtra("albumArt")); // Base64
                ret.put("isPlaying", intent.getBooleanExtra("isPlaying", false));
                notifyListeners("mediaUpdate", ret);
            }
        };
        getContext().registerReceiver(mediaReceiver, new IntentFilter("com.carlauncher.MEDIA_UPDATE"));
    }

    @PluginMethod
    public void controlMedia(PluginCall call) {
        String action = call.getString("action");
        AudioManager audioManager = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
        int keyCode = 0;

        if ("PLAY_PAUSE".equals(action)) keyCode = KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE;
        else if ("NEXT".equals(action)) keyCode = KeyEvent.KEYCODE_MEDIA_NEXT;
        else if ("PREVIOUS".equals(action)) keyCode = KeyEvent.KEYCODE_MEDIA_PREVIOUS;

        if (keyCode != 0) {
            audioManager.dispatchMediaKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, keyCode));
            audioManager.dispatchMediaKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, keyCode));
        }
        call.resolve();
    }
}
