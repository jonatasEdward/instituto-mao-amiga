package com.maoamiga.api.shared.seguranca;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties("app.cors")
public record CorsProperties(List<String> origensPermitidas) {

    public CorsProperties {
        origensPermitidas = origensPermitidas == null ? List.of() : List.copyOf(origensPermitidas);
    }
}
