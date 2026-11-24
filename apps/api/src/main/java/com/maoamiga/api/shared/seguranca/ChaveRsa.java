package com.maoamiga.api.shared.seguranca;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;

import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateCrtKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;

final class ChaveRsa {

    private ChaveRsa() {
    }

    /**
     * Lê a chave privada em PEM e deriva a pública dela, então produção precisa de uma única variável.
     * Aceita quebras de linha reais ou "\n" literais, porque painéis de variáveis de ambiente variam nisso.
     */
    static RSAKey dePem(String pem, String idDaChave) {
        String base64 = pem.replace("\\n", "\n")
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");
        try {
            KeyFactory fabrica = KeyFactory.getInstance("RSA");
            RSAPrivateCrtKey privada = (RSAPrivateCrtKey) fabrica.generatePrivate(
                    new PKCS8EncodedKeySpec(Base64.getDecoder().decode(base64)));
            RSAPublicKey publica = (RSAPublicKey) fabrica.generatePublic(
                    new RSAPublicKeySpec(privada.getModulus(), privada.getPublicExponent()));
            return montar(publica, privada, idDaChave);
        } catch (GeneralSecurityException | IllegalArgumentException | ClassCastException ex) {
            throw new IllegalStateException("JWT_PRIVATE_KEY não é uma chave RSA PKCS#8 válida", ex);
        }
    }

    static RSAKey temporaria(String idDaChave) {
        try {
            KeyPairGenerator gerador = KeyPairGenerator.getInstance("RSA");
            gerador.initialize(2048);
            KeyPair par = gerador.generateKeyPair();
            return montar((RSAPublicKey) par.getPublic(), (RSAPrivateCrtKey) par.getPrivate(), idDaChave);
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("não foi possível gerar a chave RSA temporária", ex);
        }
    }

    private static RSAKey montar(RSAPublicKey publica, RSAPrivateCrtKey privada, String idDaChave) {
        return new RSAKey.Builder(publica)
                .privateKey(privada)
                .keyID(idDaChave)
                .keyUse(KeyUse.SIGNATURE)
                .algorithm(JWSAlgorithm.RS256)
                .build();
    }
}
