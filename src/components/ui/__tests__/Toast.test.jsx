import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Toast, { ToastContainer } from '../Toast.jsx';

describe('Toast', () => {
  test('renderiza título e mensagem e fecha ao clicar', async () => {
    const onClose = vi.fn();
    render(
      <Toast
        id={1}
        type="info"
        title="Título"
        message="Mensagem"
        duration={0}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Mensagem')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith(1));
  });

  test('ToastContainer exibe múltiplos toasts', () => {
    const toasts = [
      { id: 1, type: 'success', title: 'Ok', message: 'Sucesso' },
      { id: 2, type: 'error', title: 'Ops', message: 'Erro' }
    ];
    render(<ToastContainer toasts={toasts} onClose={() => {}} />);
    expect(screen.getByText('Ok')).toBeInTheDocument();
    expect(screen.getByText('Ops')).toBeInTheDocument();
  });
});

