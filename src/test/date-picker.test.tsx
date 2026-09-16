import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatePicker, parseIsoDate, toIsoDate } from '../components/common/DatePicker';

describe('date helpers', () => {
  it('round-trips ISO dates without timezone shift', () => {
    expect(parseIsoDate('2000-01-01')).toEqual({ year: 2000, month: 0, day: 1 });
    expect(toIsoDate(2000, 0, 1)).toBe('2000-01-01');
    expect(toIsoDate(1999, 11, 31)).toBe('1999-12-31');
  });
});

describe('DatePicker', () => {
  it('opens a themed calendar and selects a day', () => {
    const onChange = vi.fn();
    render(
      <DatePicker
        label="Date of Birth"
        value="2000-01-01"
        onChange={onChange}
      />
    );

    const trigger = screen.getByLabelText(/Date of Birth/i);
    expect(trigger).toHaveTextContent('01/01/2000');

    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: /Date of Birth/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent('January');
    expect(dialog.textContent?.indexOf('Mo') ?? -1).toBeLessThan(dialog.textContent?.indexOf('Su') ?? 0);
    expect(screen.getByLabelText('Year')).toHaveValue('2000');

    fireEvent.click(screen.getByRole('button', { name: '15' }));
    expect(onChange).toHaveBeenCalledWith('2000-01-15');
  });
});
