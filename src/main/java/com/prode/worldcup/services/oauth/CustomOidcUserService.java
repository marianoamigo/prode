package com.prode.worldcup.services.oauth;

import com.prode.worldcup.infrastructure.persistence.entity.UserEntity;
import com.prode.worldcup.infrastructure.persistence.repository.UserRepository;
import com.prode.worldcup.shared.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOidcUserService extends OidcUserService {

    private final UserRepository userRepository;
    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {

        log.info("[" + CustomOidcUserService.class.getSimpleName()+ "]" + " ---> Entrando a CustomOidcUserService");
        OidcUser oidcUser = super.loadUser(userRequest);
        log.info("[" + CustomOidcUserService.class.getSimpleName()+ "]" +"Email: {}", oidcUser.getEmail());
        log.info("[" + CustomOidcUserService.class.getSimpleName()+ "]" +"Name: {}", oidcUser.getFullName());
        log.info("[" + CustomOidcUserService.class.getSimpleName()+ "]" +"Sub: {}", oidcUser.getSubject());
        String googleId = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();
        log.info("[" + CustomOidcUserService.class.getSimpleName()+ "]" + " Usuario autenticado: {}", email);

        UserEntity user = userRepository
                .findByGoogleId(googleId)
                .orElseGet(() -> {

                    log.warn("[" + CustomOidcUserService.class.getSimpleName()+ "]" +"Usuario {} no existe. Creando registro.", email);

                    UserEntity newUser =
                            UserEntity.builder()
                                    .googleId(googleId)
                                    .email(email)
                                    .name(name)
                                    .role(email.equals("marianoamigo93@gmail.com")
                                            ? Role.ADMIN
                                            : Role.USER)
                                    .createdAt(LocalDateTime.now())
                                    .totalPoints(0)
                                    .build();

                    return userRepository.save(newUser);
                });
        log.info("[" + CustomOidcUserService.class.getSimpleName()+ "]" + " Usuario persistido correctamente. ID: {}", user.getId());

        Collection<GrantedAuthority> authorities =
                new ArrayList<>(
                        oidcUser.getAuthorities()
                );

        authorities.add(
                new SimpleGrantedAuthority(
                        "ROLE_" + user.getRole().name()
                )
        );

        log.info(
                "Authorities: {}",
                authorities
        );

        return new DefaultOidcUser(
                authorities,
                oidcUser.getIdToken(),
                oidcUser.getUserInfo(),
                "sub");
    }
}