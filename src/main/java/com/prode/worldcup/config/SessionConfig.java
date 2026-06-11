package com.prode.worldcup.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class SessionConfig {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void clearSessionsOnStartup() {
        try {
            int deleted = jdbcTemplate.update("DELETE FROM SPRING_SESSION");
            log.info("SessionConfig: cleared {} stale sessions on startup", deleted);
        } catch (Exception e) {
            log.warn("SessionConfig: could not clear sessions: {}", e.getMessage());
        }
    }

    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieMaxAge(30 * 24 * 60 * 60);
        serializer.setSameSite("Lax");
        serializer.setUseHttpOnlyCookie(true);
        return serializer;
    }
}
