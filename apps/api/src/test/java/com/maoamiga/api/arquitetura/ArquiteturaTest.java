package com.maoamiga.api.arquitetura;

import com.tngtech.archunit.core.domain.JavaAccess;
import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchCondition;
import com.tngtech.archunit.lang.ArchRule;
import com.tngtech.archunit.lang.ConditionEvents;
import com.tngtech.archunit.lang.SimpleConditionEvent;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;

@AnalyzeClasses(packages = "com.maoamiga.api", importOptions = ImportOption.DoNotIncludeTests.class)
class ArquiteturaTest {

    @ArchTest
    static final ArchRule featuresNaoTemCiclos = slices()
            .matching("com.maoamiga.api.(*)..")
            .should().beFreeOfCycles();

    @ArchTest
    static final ArchRule sharedNaoConheceFeatures = noClasses()
            .that().resideInAPackage("..shared..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "..auth..", "..usuarios..", "..pontos..", "..doacoes..");

    @ArchTest
    static final ArchRule repositoriosSoSaoUsadosNaPropriaFeature = classes()
            .that().haveSimpleNameEndingWith("Repository")
            .should(serAcessadoSomentePeloProprioPacote());

    @ArchTest
    static final ArchRule controllersNaoAcessamRepositorios = noClasses()
            .that().haveSimpleNameEndingWith("Controller")
            .should().dependOnClassesThat().haveSimpleNameEndingWith("Repository");

    private static ArchCondition<JavaClass> serAcessadoSomentePeloProprioPacote() {
        return new ArchCondition<>("ser acessado somente por classes do próprio pacote") {
            @Override
            public void check(JavaClass repositorio, ConditionEvents eventos) {
                for (JavaAccess<?> acesso : repositorio.getAccessesToSelf()) {
                    String origem = acesso.getOriginOwner().getPackageName();
                    if (!origem.equals(repositorio.getPackageName())) {
                        eventos.add(SimpleConditionEvent.violated(acesso, acesso.getDescription()));
                    }
                }
            }
        };
    }
}
