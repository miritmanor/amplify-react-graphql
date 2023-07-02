import { render, screen } from '@testing-library/react';
import App from './App';

window.URL.createObjectURL = jest.fn();

test('renders learn react link', () => {
  window.URL.createObjectURL = jest.fn(() => 'details');
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
