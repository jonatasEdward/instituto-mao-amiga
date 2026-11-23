package com.maoamiga.api.shared.seguranca;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

@RestController
class JwksController {

    private final Map<String, Object> jwks;

    JwksController(RSAKey chaveDeAssinatura) {
        // Só a parte pública: toPublicJWK() descarta os componentes privados da chave.
        this.jwks = new JWKSet(chaveDeAssinatura.toPublicJWK()).toJSONObject();
    }

    @GetMapping("/.well-known/jwks.json")
    ResponseEntity<Map<String, Object>> jwks() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePublic())
                .body(jwks);
    }
}
