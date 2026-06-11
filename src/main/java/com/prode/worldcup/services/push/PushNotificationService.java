package com.prode.worldcup.services.push;

import com.prode.worldcup.infrastructure.persistence.repository.PushSubscriptionRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Security;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PushNotificationService {

    private final PushSubscriptionRepository subscriptionRepository;

    @Value("${push.vapid.public-key:}")
    private String vapidPublicKey;

    @Value("${push.vapid.private-key:}")
    private String vapidPrivateKey;

    @Value("${push.vapid.subject}")
    private String vapidSubject;

    private PushService pushService;

    @PostConstruct
    public void init() {
        Security.addProvider(new BouncyCastleProvider());

        if (vapidPublicKey == null || vapidPublicKey.isBlank()
                || vapidPrivateKey == null || vapidPrivateKey.isBlank()) {
            log.warn("VAPID keys not configured — push notifications disabled. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY env vars.");
            return;
        }
        try {
            pushService = new PushService(vapidPublicKey, vapidPrivateKey, vapidSubject);
            log.info("Push notification service initialized.");
        } catch (Exception e) {
            log.error("Failed to initialize PushService: {}", e.getMessage());
        }
    }

    public String getVapidPublicKey() {
        return vapidPublicKey;
    }

    public boolean isEnabled() {
        return pushService != null;
    }

    public void sendToAll(String title, String body) {
        if (!isEnabled()) return;

        var subscriptions = subscriptionRepository.findAll();
        log.info("Sending push '{}' to {} subscribers", title, subscriptions.size());

        List<String> toRemove = new java.util.ArrayList<>();

        for (var sub : subscriptions) {
            try {
                String payload = buildPayload(title, body);
                Subscription webPushSub = new Subscription(
                        sub.getEndpoint(),
                        new Subscription.Keys(sub.getP256dh(), sub.getAuth())
                );
                Notification notification = new Notification(webPushSub, payload);
                var response = pushService.send(notification);
                int status = response.getStatusLine().getStatusCode();
                if (status == 410 || status == 404) {
                    toRemove.add(sub.getEndpoint());
                }
            } catch (Exception e) {
                log.warn("Failed to send push to endpoint {}: {}", sub.getEndpoint(), e.getMessage());
            }
        }

        toRemove.forEach(subscriptionRepository::deleteByEndpoint);
    }

    private String buildPayload(String title, String body) {
        String safeTitle = title.replace("\"", "\\\"");
        String safeBody = body.replace("\"", "\\\"");
        return "{\"title\":\"" + safeTitle + "\",\"body\":\"" + safeBody + "\",\"icon\":\"/icons/ORSAI-192.png\",\"url\":\"/\"}";
    }
}
