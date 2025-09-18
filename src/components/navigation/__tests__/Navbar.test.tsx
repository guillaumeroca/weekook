import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import Navbar from '../Navbar';

// Mock the auth context
vi.mock('../../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: null,
    loading: false,
    logout: vi.fn(),
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Navbar', () => {
  it('renders the navbar', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('displays the logo', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText('WEEKOOK')).toBeInTheDocument();
  });
});