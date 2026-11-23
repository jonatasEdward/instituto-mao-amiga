package com.maoamiga.api.eventos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

interface EventoPendenteRepository extends JpaRepository<EventoPendente, UUID> {

    /**
     * FOR UPDATE SKIP LOCKED deixa várias instâncias da API publicarem em paralelo sem pegar o mesmo
     * evento: cada uma trava as linhas que leu e pula as que outra já travou.
     */
    @Query(value = """
            select * from outbox_eventos
            where publicado_em is null
            order by criado_em
            limit :limite
            for update skip locked
            """, nativeQuery = true)
    List<EventoPendente> travarPendentes(@Param("limite") int limite);

    @Modifying
    @Query("delete from EventoPendente e where e.publicadoEm is not null and e.publicadoEm < :limite")
    int apagarPublicadosAntesDe(@Param("limite") Instant limite);
}
