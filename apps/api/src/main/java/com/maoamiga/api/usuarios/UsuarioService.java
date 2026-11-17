package com.maoamiga.api.usuarios;

import com.maoamiga.api.shared.erro.ConflitoException;
import com.maoamiga.api.shared.erro.NaoAutenticadoException;
import com.maoamiga.api.shared.erro.RecursoNaoEncontradoException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.UUID;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder, Clock clock) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
    }

    @Transactional
    public Usuario cadastrar(String nome, String email, String senha, Papel papel) {
        if (repository.existsByEmail(Usuario.normalizarEmail(email))) {
            throw new ConflitoException("já existe uma conta com este e-mail");
        }
        Usuario usuario = new Usuario(nome, email, passwordEncoder.encode(senha), papel, clock.instant());
        return repository.save(usuario);
    }

    @Transactional(readOnly = true)
    public Usuario autenticar(String email, String senha) {
        return repository.findByEmail(Usuario.normalizarEmail(email))
                .filter(usuario -> passwordEncoder.matches(senha, usuario.getSenhaHash()))
                .orElseThrow(() -> new NaoAutenticadoException("e-mail ou senha inválidos"));
    }

    @Transactional(readOnly = true)
    public Usuario buscar(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("usuário não encontrado"));
    }
}
