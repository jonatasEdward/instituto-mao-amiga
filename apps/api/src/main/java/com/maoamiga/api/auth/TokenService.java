package com.maoamiga.api.auth;

import com.maoamiga.api.shared.seguranca.ClaimsJwt;
import com.maoamiga.api.shared.seguranca.JwtProperties;
import com.maoamiga.api.usuarios.Usuario;
import com.maoamiga.api.usuarios.UsuarioResponse;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;

@Service
class TokenService {

    private final JwtEncoder encoder;
    private final JwtProperties propriedades;
    private final Clock clock;

    TokenService(JwtEncoder encoder, JwtProperties propriedades, Clock clock) {
        this.encoder = encoder;
        this.propriedades = propriedades;
        this.clock = clock;
    }

    TokenResponse emitir(Usuario usuario) {
        Instant agora = clock.instant();
        Instant expiraEm = agora.plus(propriedades.expiracao());

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ClaimsJwt.EMISSOR)
                .subject(usuario.getId().toString())
                .issuedAt(agora)
                .expiresAt(expiraEm)
                .claim(ClaimsJwt.PAPEL, usuario.getPapel().name())
                .claim(ClaimsJwt.NOME, usuario.getNome())
                .build();

        JwsHeader cabecalho = JwsHeader.with(SignatureAlgorithm.RS256).keyId(propriedades.idDaChave()).build();
        String token = encoder.encode(JwtEncoderParameters.from(cabecalho, claims)).getTokenValue();
        return new TokenResponse(token, expiraEm, UsuarioResponse.de(usuario));
    }
}
