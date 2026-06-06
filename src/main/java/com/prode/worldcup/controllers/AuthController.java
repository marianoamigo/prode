package com.prode.worldcup.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal OAuth2User user) {

        if (user == null) {
            return ResponseEntity.ok(null);
        }
        return ResponseEntity.ok(
                Map.of(
                        "name", user.getAttribute("name"),
                        "email", user.getAttribute("email"),
                        "pictureUrl", user.getAttribute("picture"),
                        "role",
                        user.getAuthorities()
                                .stream()
                                .anyMatch(a ->
                                        a.getAuthority()
                                                .equals("ROLE_ADMIN")
                                )
                                ? "ADMIN"
                                : "USER"
                )
        );
    }
}
