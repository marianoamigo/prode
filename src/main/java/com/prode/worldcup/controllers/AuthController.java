package com.prode.worldcup.controllers;

import com.prode.worldcup.infrastructure.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal OAuth2User user) {

        if (user == null) {
            return ResponseEntity.ok(null);
        }

        String googleId = user.getAttribute("sub");
        String userId = userRepository.findByGoogleId(googleId)
                .map(u -> u.getId().toString())
                .orElse("");

        Map<String, Object> result = new HashMap<>();
        result.put("id", userId);
        result.put("name", user.getAttribute("name"));
        result.put("email", user.getAttribute("email"));
        result.put("pictureUrl", user.getAttribute("picture"));
        result.put("role", user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")) ? "ADMIN" : "USER");

        return ResponseEntity.ok(result);
    }
}
