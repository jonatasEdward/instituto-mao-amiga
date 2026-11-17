export type AuthParams = {
  Entrar: undefined;
  Cadastro: undefined;
};

export type PontosParams = {
  ListaPontos: undefined;
  DetalhePonto: { pontoId: string; nome: string };
  NovaDoacao: { pontoId: string; pontoNome: string };
};

export type MeusPontosParams = {
  MeusPontos: undefined;
  NovoPonto: undefined;
  DoacoesDoPonto: { pontoId: string; pontoNome: string };
};

export type AbasParams = {
  Pontos: undefined;
  MinhasDoacoes: undefined;
  MeusPontosAba: undefined;
  Perfil: undefined;
};
