import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { countryCodeToFlag } from '../../utils/gameMaps';
import { COUNTRIES, getCountry, searchCountries } from '../../utils/countries';

const PANEL_BG = '#fbfaf6';

export interface CountrySelectProps {
  label?: string;
  value: string;
  onChange: (code: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  wrapperClassName?: string;
}

interface MenuBox {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

function CountryFlag({ code }: { code: string }) {
  return (
    <span
      className="inline-flex w-6 shrink-0 items-center justify-center text-base leading-none"
      aria-hidden
    >
      {countryCodeToFlag(code)}
    </span>
  );
}

function useIsDesktop() {
  const [desktop, setDesktop] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
    return window.matchMedia('(min-width: 640px)').matches;
  });

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(min-width: 640px)');
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return desktop;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  disabled,
  required,
  id,
  wrapperClassName,
}) => {
  const generatedId = useId();
  const inputId =
    id || (label ? `country-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : generatedId);
  const listboxId = `${inputId}-listbox`;
  const sheetSearchId = `${inputId}-sheet-search`;
  const desktop = useIsDesktop();

  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sheetSearchRef = useRef<HTMLInputElement>(null);

  const selected = getCountry(value);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(selected?.name ?? '');
  const [highlight, setHighlight] = useState(0);
  const [menuBox, setMenuBox] = useState<MenuBox | null>(null);

  const selectedName = selected?.name ?? '';
  const isUnedited = query === selectedName;
  const results = useMemo(
    () => (open && !isUnedited ? searchCountries(query) : COUNTRIES),
    [open, query, isUnedited]
  );

  useEffect(() => {
    if (!open) {
      setQuery(selected?.name ?? value ?? '');
    }
  }, [open, selected?.name, value]);

  const updateMenuBox = () => {
    const trigger = wrapRef.current?.querySelector('[data-country-trigger]');
    if (!(trigger instanceof HTMLElement)) return;
    const rect = trigger.getBoundingClientRect();
    const gutter = 8;
    const spaceBelow = window.innerHeight - rect.bottom - gutter;
    const spaceAbove = rect.top - gutter;
    const preferBelow = spaceBelow >= 160 || spaceBelow >= spaceAbove;
    const maxHeight = Math.max(120, Math.min(280, preferBelow ? spaceBelow : spaceAbove));
    setMenuBox({
      top: preferBelow ? rect.bottom + 4 : rect.top - 4 - maxHeight,
      left: rect.left,
      width: rect.width,
      maxHeight,
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenuBox(null);
      return;
    }
    updateMenuBox();
    const onReposition = () => updateMenuBox();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const selectedIndex = results.findIndex((country) => country.code === value);
    if (isUnedited) {
      setHighlight(selectedIndex >= 0 ? selectedIndex : 0);
    } else {
      setHighlight(0);
    }
  }, [open, isUnedited, results, value]);

  useLayoutEffect(() => {
    if (!open) return;
    const active = listRef.current?.querySelector('[data-active="true"]');
    if (active instanceof HTMLElement) {
      active.scrollIntoView?.({ block: 'nearest' });
    }
  }, [open, highlight, results]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onDocDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('mousedown', onDocDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || desktop) return;
    const id = window.requestAnimationFrame(() => {
      sheetSearchRef.current?.focus();
      sheetSearchRef.current?.select();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open, desktop]);

  const pick = (code: string) => {
    onChange(code);
    const country = getCountry(code);
    setQuery(country?.name ?? code);
    setOpen(false);
    inputRef.current?.blur();
  };

  const openMenu = () => {
    if (disabled) return;
    setOpen(true);
    if (desktop) {
      window.requestAnimationFrame(() => {
        inputRef.current?.select();
      });
    } else {
      inputRef.current?.blur();
    }
  };

  const closeMenu = () => {
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      setHighlight((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      setHighlight((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === 'Home' && open) {
      event.preventDefault();
      setHighlight(0);
      return;
    }

    if (event.key === 'End' && open) {
      event.preventDefault();
      setHighlight(Math.max(results.length - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      if (open && results[highlight]) {
        event.preventDefault();
        pick(results[highlight].code);
      }
      return;
    }

    if (event.key === 'Escape') {
      if (open) {
        event.preventDefault();
        closeMenu();
      }
      return;
    }

    if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  const activeId = open && results[highlight] ? `${listboxId}-${results[highlight].code}` : undefined;
  const flagCode = open && results[highlight] ? results[highlight].code : value;
  const showMenu = open && (desktop ? menuBox !== null : true);

  const optionList = (
    <>
      {results.length === 0 ? (
        <div className="px-3 py-3 text-sm text-ink-muted">
          No countries match “{query.trim()}”.
        </div>
      ) : (
        results.map((country, index) => {
          const isSelected = country.code === value;
          const isActive = index === highlight;
          return (
            <div
              key={country.code}
              id={`${listboxId}-${country.code}`}
              role="option"
              aria-selected={isSelected}
              data-active={isActive ? 'true' : 'false'}
              onMouseEnter={() => setHighlight(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(country.code)}
              className={cn(
                'flex items-center gap-2 px-3 sm:px-2.5 cursor-pointer text-sm min-h-11 sm:min-h-0 py-2.5 sm:py-1.5',
                isActive ? 'bg-olive-100 text-ink' : isSelected ? 'bg-olive-50 text-ink' : 'text-ink'
              )}
              style={{ backgroundColor: isActive ? '#dce3cc' : isSelected ? '#eef1e6' : PANEL_BG }}
            >
              <CountryFlag code={country.code} />
              <span className="flex-1 truncate">{country.name}</span>
              <span className="text-[10px] font-mono text-ink-faint shrink-0">{country.code}</span>
            </div>
          );
        })
      )}
    </>
  );

  return (
    <div ref={wrapRef} className={cn('w-full flex flex-col space-y-1.5', wrapperClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-ink flex items-center justify-between"
        >
          <span>{label}</span>
          {required && <span className="text-ink-faint text-[10px]">Required</span>}
        </label>
      )}

      <div data-country-trigger className="relative flex items-center">
        <span className="absolute left-2.5 pointer-events-none flex items-center">
          <CountryFlag code={open && desktop ? flagCode : value} />
        </span>
        <input
          id={inputId}
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={desktop ? activeId : undefined}
          aria-haspopup="listbox"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode={desktop ? 'text' : 'none'}
          readOnly={!desktop}
          disabled={disabled}
          value={open && desktop ? query : selected?.name ?? value}
          placeholder="Search countries"
          onFocus={openMenu}
          onClick={openMenu}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className={cn(
            'w-full border border-sand-300 text-ink placeholder-ink-faint rounded-lg text-sm py-2 pl-9 pr-9 transition-colors duration-150',
            'focus:outline-none focus:border-olive-400 focus:ring-2 focus:ring-olive-500/20',
            'disabled:bg-sand-100 disabled:border-sand-200 disabled:text-ink-faint disabled:cursor-not-allowed',
            error ? 'border-stamp-500 focus:border-stamp-500 focus:ring-stamp-500/40' : ''
          )}
          style={{ backgroundColor: PANEL_BG }}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label={open ? 'Close country list' : 'Open country list'}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (open) {
              closeMenu();
            } else {
              inputRef.current?.focus();
            }
          }}
          className="absolute right-2 text-ink-muted hover:text-ink disabled:cursor-not-allowed"
        >
          <ChevronDown className={cn('w-4 h-4 transition-transform duration-150', open && 'rotate-180')} />
        </button>
      </div>

      {error ? (
        <p className="text-[11px] font-sans text-stamp-600 mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] font-sans text-ink-faint mt-0.5">{helperText}</p>
      ) : null}

      {showMenu &&
        createPortal(
          <div
            ref={listRef}
            role={desktop ? undefined : 'dialog'}
            aria-modal={desktop ? undefined : true}
            aria-label={desktop ? undefined : 'Country / Region'}
            className={cn(
              'fixed flex flex-col text-ink',
              desktop
                ? 'rounded-lg border border-sand-200 overflow-hidden'
                : 'inset-0'
            )}
            style={{
              zIndex: 100,
              isolation: 'isolate',
              backgroundColor: PANEL_BG,
              boxShadow: desktop ? '0 8px 24px rgba(31, 33, 28, 0.16)' : undefined,
              ...(desktop && menuBox
                ? {
                    top: menuBox.top,
                    left: menuBox.left,
                    width: menuBox.width,
                    maxHeight: menuBox.maxHeight,
                  }
                : null),
            }}
          >
            <div
              className="sm:hidden shrink-0 flex items-center justify-between gap-3 px-4 border-b border-sand-200"
              style={{
                backgroundColor: PANEL_BG,
                paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
                paddingBottom: '0.75rem',
              }}
            >
              <p className="text-base font-semibold text-ink">Country / Region</p>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close country list"
                className="inline-flex items-center justify-center w-11 h-11 -mr-2 text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className="sm:hidden shrink-0 px-4 py-3 border-b border-sand-200"
              style={{ backgroundColor: PANEL_BG }}
            >
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-ink-muted pointer-events-none" />
                <input
                  id={sheetSearchId}
                  ref={sheetSearchRef}
                  type="search"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Search countries"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={onKeyDown}
                  className="w-full border border-sand-300 rounded-lg text-sm py-2.5 pl-9 pr-3 text-ink placeholder-ink-faint focus:outline-none focus:border-olive-400 focus:ring-2 focus:ring-olive-500/20"
                  style={{ backgroundColor: '#ffffff' }}
                />
              </div>
            </div>

            <div
              id={listboxId}
              role="listbox"
              aria-label="Countries"
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-1"
              style={{ backgroundColor: PANEL_BG }}
            >
              {optionList}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
