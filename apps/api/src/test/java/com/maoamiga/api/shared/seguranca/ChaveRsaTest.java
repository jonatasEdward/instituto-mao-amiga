package com.maoamiga.api.shared.seguranca;

import com.nimbusds.jose.jwk.RSAKey;
import org.junit.jupiter.api.Test;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ChaveRsaTest {

    @Test
    void derivaAChavePublicaAPartirDaPrivada() throws Exception {
        KeyPair par = novoPar();

        RSAKey chave = ChaveRsa.dePem(pem(par, "\n"), "chave-teste");

        assertThat(chave.toRSAPublicKey().getModulus()).isEqualTo(((RSAPublicKey) par.getPublic()).getModulus());
        assertThat(chave.getKeyID()).isEqualTo("chave-teste");
        assertThat(chave.isPrivate()).isTrue();
    }

    @Test
    void aceitaQuebrasDeLinhaEscritasComoBarraN() throws Exception {
        KeyPair par = novoPar();

        RSAKey chave = ChaveRsa.dePem(pem(par, "\\n"), "chave-teste");

        assertThat(chave.toRSAPublicKey().getModulus()).isEqualTo(((RSAPublicKey) par.getPublic()).getModulus());
    }

    @Test
    void explicaOErroQuandoAChaveEInvalida() {
        assertThatThrownBy(() -> ChaveRsa.dePem("isto não é uma chave", "chave-teste"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT_PRIVATE_KEY");
    }

    @Test
    void producaoSemChaveNaoSobe() {
        assertThatThrownBy(() -> new JwtProperties("", "chave", false, java.time.Duration.ofHours(8)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT_PRIVATE_KEY");
    }

    private static KeyPair novoPar() throws Exception {
        KeyPairGenerator gerador = KeyPairGenerator.getInstance("RSA");
        gerador.initialize(2048);
        return gerador.generateKeyPair();
    }

    private static String pem(KeyPair par, String quebra) {
        String base64 = Base64.getMimeEncoder(64, "\n".getBytes()).encodeToString(par.getPrivate().getEncoded());
        String pem = "-----BEGIN PRIVATE KEY-----\n" + base64 + "\n-----END PRIVATE KEY-----\n";
        return pem.replace("\n", quebra);
    }
}
