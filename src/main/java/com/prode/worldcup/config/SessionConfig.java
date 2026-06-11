package com.prode.worldcup.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

@Configuration
public class SessionConfig {

    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieMaxAge(30 * 24 * 60 * 60); // 30 días en segundos
        serializer.setSameSite("Lax");
        serializer.setUseHttpOnlyCookie(true);
        return serializer;
    }
}
