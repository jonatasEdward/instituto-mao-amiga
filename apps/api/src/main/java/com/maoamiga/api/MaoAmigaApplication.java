package com.maoamiga.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class MaoAmigaApplication {

    public static void main(String[] args) {
        SpringApplication.run(MaoAmigaApplication.class, args);
    }
}
