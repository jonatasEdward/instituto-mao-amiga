import { temErros, validarCadastro, validarDoacao, validarPonto } from '../formularios';

describe('validarDoacao', () => {
  const valido = { tipoItem: 'Arroz 5kg', quantidade: '3', observacao: '' };

  it('aceita um formulário completo', () => {
    expect(temErros(validarDoacao(valido))).toBe(false);
  });

  it.each(['', '0', '-2', '1.5', 'abc'])('recusa a quantidade "%s"', (quantidade) => {
    expect(validarDoacao({ ...valido, quantidade }).quantidade).toBeDefined();
  });

  it('pede para falar com o ponto acima de 10.000 itens', () => {
    expect(validarDoacao({ ...valido, quantidade: '10001' }).quantidade).toMatch(/fale direto com o ponto/);
  });

  it('exige o tipo do item', () => {
    expect(validarDoacao({ ...valido, tipoItem: '   ' }).tipoItem).toBe('Informe o que você vai doar.');
  });
});

describe('validarPonto', () => {
  const valido = {
    nome: 'Ponto Central',
    endereco: 'Rua T-30',
    bairro: 'Setor Bueno',
    cidade: 'Goiânia',
    diasHorarios: 'Segunda a sexta, 8h às 12h',
    recebe: 'Alimentos',
    distribui: '',
  };

  it('aceita um ponto que só recebe', () => {
    expect(temErros(validarPonto(valido))).toBe(false);
  });

  it('exige que o ponto receba ou distribua alguma coisa', () => {
    expect(validarPonto({ ...valido, recebe: '  ' }).recebe).toMatch(/recebe, distribui ou os dois/);
  });

  it('respeita os limites de tamanho da API', () => {
    expect(validarPonto({ ...valido, bairro: 'x'.repeat(81) }).bairro).toBe('Use no máximo 80 caracteres.');
  });
});

describe('validarCadastro', () => {
  it('aponta todos os campos inválidos de uma vez', () => {
    const erros = validarCadastro({ nome: '', email: 'sem-arroba', senha: '123' });
    expect(Object.keys(erros).sort()).toEqual(['email', 'nome', 'senha']);
  });

  it('aceita dados válidos', () => {
    expect(temErros(validarCadastro({ nome: 'Ana', email: 'ana@exemplo.com', senha: 'senha-forte' }))).toBe(false);
  });
});
