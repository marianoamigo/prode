package com.prode.worldcup.services.security;

import com.prode.worldcup.infrastructure.persistence.entity.UserEntity;
import com.prode.worldcup.infrastructure.persistence.repository.UserRepository;
import com.prode.worldcup.shared.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        OAuth2User oauthUser = super.loadUser(userRequest);

        String googleId = oauthUser.getAttribute("sub");

        String email = oauthUser.getAttribute("email");
        System.out.println("EMAIL: " + email);
        String name = oauthUser.getAttribute("name");

        Role role = email.equals("marianoamigo93@gmail.com") ? Role.ADMIN : Role.USER;

        System.out.println("ENTRO A CUSTOM OAUTH SERVICE");
        UserEntity user = userRepository
                .findByGoogleId(googleId)
                .orElseGet(() -> {

                    UserEntity newUser =
                            UserEntity.builder()
                                    .googleId(googleId)
                                    .email(email)
                                    .name(name)
                                    .role(role)
                                    .createdAt(LocalDateTime.now())
                                    .build();

                    return userRepository.save(newUser);
                });
        System.out.println("USUARIO GUARDADO");
        return oauthUser;
    }
}
