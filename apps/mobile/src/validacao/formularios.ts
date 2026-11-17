export type Erros<T> = Partial<Record<keyof T, string>>;

export type FormularioDoacao = {
  tipoItem: string;
  quantidade: string;
  observacao: string;
};

export function validarDoacao(form: FormularioDoacao): Erros<FormularioDoacao> {
  const erros: Erros<FormularioDoacao> = {};
  if (form.tipoItem.trim() === '') {
    erros.tipoItem = 'Informe o que você vai doar.';
  } else if (form.tipoItem.trim().length > 120) {
    erros.tipoItem = 'Use no máximo 120 caracteres.';
  }

  const quantidade = Number(form.quantidade);
  if (form.quantidade.trim() === '' || !Number.isInteger(quantidade) || quantidade < 1) {
    erros.quantidade = 'A quantidade precisa ser um número inteiro maior que zero.';
  } else if (quantidade > 10000) {
    erros.quantidade = 'Para mais de 10.000 itens, fale direto com o ponto.';
  }

  if (form.observacao.length > 300) {
    erros.observacao = 'Use no máximo 300 caracteres.';
  }
  return erros;
}

export type FormularioCadastro = {
  nome: string;
  email: string;
  senha: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarCadastro(form: FormularioCadastro): Erros<FormularioCadastro> {
  const erros: Erros<FormularioCadastro> = {};
  if (form.nome.trim() === '') {
    erros.nome = 'Informe seu nome.';
  }
  if (!EMAIL.test(form.email.trim())) {
    erros.email = 'Informe um e-mail válido.';
  }
  if (form.senha.length < 8) {
    erros.senha = 'A senha precisa ter pelo menos 8 caracteres.';
  }
  return erros;
}

export type FormularioPonto = {
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  diasHorarios: string;
  recebe: string;
  distribui: string;
};

const LIMITES_PONTO: Record<keyof FormularioPonto, number> = {
  nome: 120,
  endereco: 200,
  bairro: 80,
  cidade: 80,
  diasHorarios: 120,
  recebe: 300,
  distribui: 300,
};

const OBRIGATORIOS_PONTO: (keyof FormularioPonto)[] = ['nome', 'endereco', 'bairro', 'cidade', 'diasHorarios'];

export function validarPonto(form: FormularioPonto): Erros<FormularioPonto> {
  const erros: Erros<FormularioPonto> = {};
  for (const campo of OBRIGATORIOS_PONTO) {
    if (form[campo].trim() === '') {
      erros[campo] = 'Campo obrigatório.';
    }
  }
  for (const campo of Object.keys(LIMITES_PONTO) as (keyof FormularioPonto)[]) {
    if (!erros[campo] && form[campo].trim().length > LIMITES_PONTO[campo]) {
      erros[campo] = `Use no máximo ${LIMITES_PONTO[campo]} caracteres.`;
    }
  }
  if (form.recebe.trim() === '' && form.distribui.trim() === '') {
    erros.recebe = 'Informe o que o ponto recebe, distribui ou os dois.';
  }
  return erros;
}

export const temErros = (erros: object) => Object.keys(erros).length > 0;
