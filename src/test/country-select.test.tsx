import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CountrySelect } from '../components/common/CountrySelect';
import { COUNTRIES, searchCountries, getCountry } from '../utils/countries';
import { countryCodeToFlag } from '../utils/gameMaps';

describe('countries catalog', () => {
  it('includes a full ISO set rather than a short regional slice', () => {
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(240);
    expect(getCountry('BE')?.name).toBe('Belgium');
    expect(getCountry('NO')?.name).toBe('Norway');
    expect(getCountry('IN')?.name).toBe('India');
    expect(getCountry('ZA')?.name).toBe('South Africa');
    expect(getCountry('US')?.name).toBe('United States');
  });

  it('ranks exact codes, aliases, and diacritic-insensitive names', () => {
    expect(searchCountries('BE')[0].code).toBe('BE');
    expect(searchCountries('UK')[0].code).toBe('GB');
    expect(searchCountries('cote')[0].code).toBe('CI');
    expect(searchCountries('belg').some((country) => country.code === 'BE')).toBe(true);
  });
});

describe('CountrySelect', () => {
  it('opens a searchable list with flags before country names', () => {
    const seen: string[] = [];
    render(
      <CountrySelect
        label="Country / Region"
        value="US"
        onChange={(code) => {
          seen.push(code);
        }}
      />
    );

    const input = screen.getByLabelText(/Country \/ Region/i);
    expect(input).toHaveValue('United States');

    fireEvent.focus(input);

    expect(screen.getByRole('option', { name: /Belgium BE/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Norway NO/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /South Africa ZA/i })).toBeInTheDocument();

    const belgium = screen.getByRole('option', { name: /Belgium BE/i });
    expect(belgium.textContent).toContain(countryCodeToFlag('BE'));
    expect(belgium.textContent?.indexOf(countryCodeToFlag('BE'))).toBeLessThan(
      belgium.textContent?.indexOf('Belgium') ?? 0
    );

    fireEvent.change(input, { target: { value: 'belg' } });
    expect(screen.getByRole('option', { name: /Belgium BE/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /United States US/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Norway NO/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: /Belgium BE/i }));
    expect(seen).toEqual(['BE']);
  });
});
