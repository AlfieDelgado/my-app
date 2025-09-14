import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/Button.jsx';

// Minimal test for Button component following testing guidelines
// Testing only critical user interactions - button clicks and disabled state

describe('Button Component', () => {
  test('1. Button renders and handles click events', () => {
    const handleClick = jest.fn();
    
    render(
      <Button onClick={handleClick}>
        Test Button
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('2. Button respects disabled state', () => {
    const handleClick = jest.fn();
    
    render(
      <Button onClick={handleClick} disabled={true}>
        Disabled Button
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Disabled Button' });
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('3. Button applies different variants', () => {
    const { rerender } = render(
      <Button variant="primary">Primary</Button>
    );
    
    let button = screen.getByRole('button', { name: 'Primary' });
    expect(button).toHaveClass('bg-indigo-600');
    
    rerender(<Button variant="danger">Danger</Button>);
    button = screen.getByRole('button', { name: 'Danger' });
    expect(button).toHaveClass('bg-red-100');
  });
});