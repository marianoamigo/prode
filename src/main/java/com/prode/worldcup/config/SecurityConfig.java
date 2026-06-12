package com.prode.worldcup.config;

import com.prode.worldcup.infrastructure.persistence.repository.UserRepository;
import com.prode.worldcup.services.oauth.CustomOidcUserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOidcUserService customOidcUserService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        log.info("["+ SecurityConfig.class.getSimpleName()+" ] " +" ---> CREANDO SECURITY FILTER CHAIN");

        http
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/",
                                "/error",
                                "/error.html",
                                "/index.html",
                                "/sw.js",
                                "/manifest.json",
                                "/icons/**",
                                "/images/**",
                                "/pages/**",
                                "/css/**",
                                "/js/**",
                                "/api/auth/me",
                                "/api/matches/**",
                                "/api/ranking/**",
                                "/api/profile/**",
                                "/api/group-standings/**",
                                "/api/private/invite/**")
                        .permitAll()

                        .requestMatchers("/api/push/vapid-public-key")
                        .permitAll()

                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        .anyRequest()
                        .authenticated()
                )

                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            if (request.getRequestURI().startsWith("/api/")) {
                                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            } else {
                                response.sendRedirect("/oauth2/authorization/google");
                            }
                        })
                )

                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(userInfoEndpointConfig ->
                                userInfoEndpointConfig
                                        .oidcUserService(customOidcUserService)
                        )
                        .defaultSuccessUrl("/", true)
                )

                .logout(logout -> logout
                        .logoutSuccessUrl("/")
                );

        return http.build();
    }
}
