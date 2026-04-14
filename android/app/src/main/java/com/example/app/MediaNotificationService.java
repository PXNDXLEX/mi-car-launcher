package com.example.app; // ¡CAMBIA ESTO POR EL NOMBRE DE TU PAQUETE!

import android.app.Notification;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.drawable.Icon;
import android.media.MediaMetadata;
import android.media.session.MediaController;
import android.media.session.MediaSessionManager;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Base64;
import java.io.ByteArrayOutputStream;
import java.util.List;

public class MediaNotificationService extends NotificationListenerService {

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        updateMediaState();
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        updateMediaState();
    }

    private void updateMediaState() {
        MediaSessionManager mediaSessionManager = (MediaSessionManager) getSystemService(MEDIA_SESSION_SERVICE);
        try {
            List<MediaController> controllers = mediaSessionManager.getActiveSessions(null);
            if (controllers != null && !controllers.isEmpty()) {
                MediaController controller = controllers.get(0); // Toma el reproductor activo
                MediaMetadata metadata = controller.getMetadata();
                
                Intent intent = new Intent("com.carlauncher.MEDIA_UPDATE");
                
                if (metadata != null) {
                    intent.putExtra("title", metadata.getString(MediaMetadata.METADATA_KEY_TITLE));
                    intent.putExtra("artist", metadata.getString(MediaMetadata.METADATA_KEY_ARTIST));
                    
                    Bitmap art = metadata.getBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART);
                    if (art != null) {
                        ByteArrayOutputStream stream = new ByteArrayOutputStream();
                        art.compress(Bitmap.CompressFormat.JPEG, 70, stream);
                        byte[] byteArray = stream.toByteArray();
                        intent.putExtra("albumArt", Base64.encodeToString(byteArray, Base64.DEFAULT));
                    }
                }
                
                boolean isPlaying = controller.getPlaybackState() != null && 
                                  controller.getPlaybackState().getState() == android.media.session.PlaybackState.STATE_PLAYING;
                intent.putExtra("isPlaying", isPlaying);
                
                sendBroadcast(intent);
            }
        } catch (SecurityException e) {
            // Faltan permisos de usuario
        }
    }
}
