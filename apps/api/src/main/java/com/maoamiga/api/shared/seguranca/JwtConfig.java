package com.maoamiga.api.shared.seguranca;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
class JwtConfig {

    @Bean
    JwtEncoder jwtEncoder(JwtProperties propriedades) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(chave(propriedades)));
    }

    @Bean
    JwtDecoder jwtDecoder(JwtProperties propriedades) {
        return NimbusJwtDecoder.withSecretKey(chave(propriedades))
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    private static SecretKey chave(JwtProperties propriedades) {
        return new SecretKeySpec(propriedades.secret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }
}
