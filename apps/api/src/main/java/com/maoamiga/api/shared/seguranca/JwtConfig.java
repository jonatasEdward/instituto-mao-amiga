package com.maoamiga.api.shared.seguranca;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

/**
 * Tokens assinados com RS256. A chave pública sai em /.well-known/jwks.json, e outros serviços
 * (como o notification-service) validam tokens sem conhecer nenhum segredo desta API.
 */
@Configuration
class JwtConfig {

    private static final Logger log = LoggerFactory.getLogger(JwtConfig.class);

    @Bean
    RSAKey chaveDeAssinatura(JwtProperties propriedades) {
        if (propriedades.temChaveConfigurada()) {
            return ChaveRsa.dePem(propriedades.chavePrivada(), propriedades.idDaChave());
        }
        log.warn("JWT_PRIVATE_KEY não definida: usando chave RSA temporária. Tokens deixam de valer a cada reinício.");
        return ChaveRsa.temporaria(propriedades.idDaChave());
    }

    @Bean
    JwtEncoder jwtEncoder(RSAKey chaveDeAssinatura) {
        return new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(chaveDeAssinatura)));
    }

    @Bean
    JwtDecoder jwtDecoder(RSAKey chaveDeAssinatura) throws JOSEException {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withPublicKey(chaveDeAssinatura.toRSAPublicKey())
                .signatureAlgorithm(SignatureAlgorithm.RS256)
                .build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(ClaimsJwt.EMISSOR));
        return decoder;
    }
}
