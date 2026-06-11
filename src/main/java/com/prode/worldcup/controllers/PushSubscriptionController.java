package com.prode.worldcup.controllers;

import com.prode.worldcup.domain.dtos.request.PushSubscriptionRequestDTO;
import com.prode.worldcup.services.push.PushNotificationService;
import com.prode.worldcup.services.push.PushSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/push")
public class PushSubscriptionController {

    private final PushSubscriptionService subscriptionService;
    private final PushNotificationService notificationService;

    @GetMapping("/vapid-public-key")
    public ResponseEntity<Map<String, String>> getVapidPublicKey() {
        return ResponseEntity.ok(Map.of("publicKey", notificationService.getVapidPublicKey()));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<Void> subscribe(
            @AuthenticationPrincipal OidcUser user,
            @RequestBody PushSubscriptionRequestDTO dto
    ) {
        subscriptionService.subscribe(user.getSubject(), dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/unsubscribe")
    public ResponseEntity<Void> unsubscribe(@RequestBody Map<String, String> body) {
        subscriptionService.unsubscribe(body.get("endpoint"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/test")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> test(@RequestBody(required = false) Map<String, String> body) {
        String title = body != null && body.containsKey("title") ? body.get("title") : "Test 🔔";
        String message = body != null && body.containsKey("body") ? body.get("body") : "Las notificaciones push funcionan!";
        notificationService.sendToAll(title, message);
        return ResponseEntity.ok("Enviado");
    }
}
