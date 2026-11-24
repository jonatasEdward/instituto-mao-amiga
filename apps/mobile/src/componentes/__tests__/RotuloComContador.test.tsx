import { render, screen } from '@testing-library/react-native';
import { RotuloComContador } from '../RotuloComContador';

describe('RotuloComContador', () => {
  it('mostra o número de não lidos ao lado do texto', () => {
    render(<RotuloComContador texto="Avisos" contador={3} focado={false} />);

    expect(screen.getByText('Avisos')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('esconde o contador quando não há nada novo', () => {
    render(<RotuloComContador texto="Avisos" contador={0} focado />);

    expect(screen.queryByTestId('contador-nao-lidos')).toBeNull();
  });

  it('limita a 99+', () => {
    render(<RotuloComContador texto="Avisos" contador={150} focado={false} />);

    expect(screen.getByText('99+')).toBeTruthy();
  });
});
