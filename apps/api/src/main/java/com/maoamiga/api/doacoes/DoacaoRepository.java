package com.maoamiga.api.doacoes;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

interface DoacaoRepository extends JpaRepository<Doacao, UUID> {

    Page<Doacao> findByDoadorId(UUID doadorId, Pageable pageable);

    Page<Doacao> findByPontoId(UUID pontoId, Pageable pageable);
}
