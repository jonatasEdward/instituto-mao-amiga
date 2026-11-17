package com.maoamiga.api.pontos;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

interface PontoRepository extends JpaRepository<Ponto, UUID> {

    @Query("""
            select p from Ponto p
            where p.ativo = true
              and (:busca is null
                   or lower(p.nome) like lower(concat('%', :busca, '%'))
                   or lower(p.bairro) like lower(concat('%', :busca, '%')))
            """)
    Page<Ponto> buscarAtivos(@Param("busca") String busca, Pageable pageable);

    List<Ponto> findByResponsavelIdOrderByNome(UUID responsavelId);

    List<Ponto> findByIdIn(Collection<UUID> ids);
}
