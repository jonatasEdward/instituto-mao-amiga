package com.maoamiga.api.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
class RelogioConfig {

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }
}
