import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const PANEL_BG = 'rgb(var(--color-sand-50))';
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (isoDate: string) => void;
  onBlur?: () => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  wrapperClassName?: string;
  min?: string;
  max?: string;
}

interface MenuBox {
  top: number;
  left: number;
  width: number;
}

interface Parts {
  year: number;
  month: number;
  day: number;
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

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function parseIsoDate(value?: string): Parts | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function formatDisplay(value: string) {
  const parts = parseIsoDate(value);
  if (!parts) return '';
  return `${pad(parts.day)}/${pad(parts.month + 1)}/${parts.year}`;
}

function startWeekday(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

function defaultMaxIso() {
  const today = new Date();
  return toIsoDate(today.getFullYear() - 13, today.getMonth(), today.getDate());
}

function isoToNumber(iso: string) {
  return Number(iso.replace(/-/g, ''));
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  disabled,
  required,
  id,
  wrapperClassName,
  min = '1900-01-01',
  max = defaultMaxIso(),
}) => {
  const generatedId = useId();
  const inputId =
    id || (label ? `date-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : generatedId);
  const desktop = useIsDesktop();
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selected = parseIsoDate(value);
  const [open, setOpen] = useState(false);
  const [menuBox, setMenuBox] = useState<MenuBox | null>(null);
  const [view, setView] = useState(() => ({
    year: selected?.year ?? 2000,
    month: selected?.month ?? 0,
  }));

  const minParts = parseIsoDate(min) ?? { year: 1900, month: 0, day: 1 };
  const maxParts = parseIsoDate(max) ?? parseIsoDate(defaultMaxIso())!;
  const years = useMemo(() => {
    const list: number[] = [];
    for (let year = maxParts.year; year >= minParts.year; year -= 1) list.push(year);
    return list;
  }, [minParts.year, maxParts.year]);

  const updateMenuBox = () => {
    const trigger = wrapRef.current?.querySelector('[data-date-trigger]');
    if (!(trigger instanceof HTMLElement)) return;
    const rect = trigger.getBoundingClientRect();
    const width = 300;
    const gutter = 8;
    const estimatedHeight = 348;
    const spaceBelow = window.innerHeight - rect.bottom - gutter;
    const spaceAbove = rect.top - gutter;
    const preferBelow = spaceBelow >= estimatedHeight || spaceBelow >= spaceAbove;
    const left = Math.min(Math.max(gutter, rect.left), window.innerWidth - width - gutter);
    setMenuBox({
      top: preferBelow ? rect.bottom + 4 : Math.max(gutter, rect.top - 4 - estimatedHeight),
      left,
      width,
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenuBox(null);
      return;
    }
    setView({
      year: selected?.year ?? maxParts.year,
      month: selected?.month ?? 0,
    });
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onDocDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
      onBlur?.();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onBlur]);

  const close = () => {
    setOpen(false);
    onBlur?.();
  };

  const openMenu = () => {
    if (disabled) return;
    setOpen(true);
  };

  const pick = (year: number, month: number, day: number) => {
    onChange(toIsoDate(year, month, day));
    setOpen(false);
    onBlur?.();
  };

  const shiftMonth = (delta: number) => {
    setView((current) => {
      const date = new Date(current.year, current.month + delta, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      if (year < minParts.year || (year === minParts.year && month < minParts.month)) {
        return { year: minParts.year, month: minParts.month };
      }
      if (year > maxParts.year || (year === maxParts.year && month > maxParts.month)) {
        return { year: maxParts.year, month: maxParts.month };
      }
      return { year, month };
    });
  };

  const cells = useMemo(() => {
    const first = startWeekday(view.year, view.month);
    const gridStart = new Date(view.year, view.month, 1 - first);
    const items: Array<{ year: number; month: number; day: number; inMonth: boolean; iso: string }> =
      [];
    for (let i = 0; i < 42; i += 1) {
      const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
      items.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
        inMonth: date.getMonth() === view.month,
        iso: toIsoDate(date.getFullYear(), date.getMonth(), date.getDate()),
      });
    }
    return items;
  }, [view.year, view.month]);

  const minNum = isoToNumber(min);
  const maxNum = isoToNumber(max);
  const todayIso = (() => {
    const now = new Date();
    return toIsoDate(now.getFullYear(), now.getMonth(), now.getDate());
  })();

  const canPrev =
    view.year > minParts.year || (view.year === minParts.year && view.month > minParts.month);
  const canNext =
    view.year < maxParts.year || (view.year === maxParts.year && view.month < maxParts.month);

  const showPanel = open && (desktop ? menuBox !== null : true);

  const calendar = (
    <div className="p-3 sm:p-3" style={{ backgroundColor: PANEL_BG }}>
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          aria-label="Previous month"
          disabled={!canPrev}
          onClick={() => shiftMonth(-1)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-ink-muted hover:bg-olive-50 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-ink">{MONTHS[view.month]}</span>
          <select
            aria-label="Year"
            value={view.year}
            onChange={(event) => setView((current) => ({ ...current, year: Number(event.target.value) }))}
            className="appearance-none border border-sand-300 rounded-lg text-sm py-1 pl-2 pr-7 text-ink focus:outline-none focus:border-olive-400 focus:ring-2 focus:ring-olive-500/20"
            style={{ backgroundColor: PANEL_BG }}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          aria-label="Next month"
          disabled={!canNext}
          onClick={() => shiftMonth(1)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-ink-muted hover:bg-olive-50 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-[11px] font-medium text-ink-muted">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell) => {
          const isoNum = isoToNumber(cell.iso);
          const disabledDay = isoNum < minNum || isoNum > maxNum;
          const isSelected = cell.iso === value;
          const isToday = cell.iso === todayIso;
          return (
            <button
              key={cell.iso}
              type="button"
              disabled={disabledDay}
              onClick={() => pick(cell.year, cell.month, cell.day)}
              className={cn(
                'h-9 w-full rounded-lg text-sm transition-colors',
                !cell.inMonth && !isSelected && 'text-ink-faint opacity-40',
                cell.inMonth && !isSelected && 'text-ink',
                isSelected && 'text-white font-medium',
                !isSelected && !disabledDay && 'hover:bg-olive-50',
                disabledDay && 'opacity-30 cursor-not-allowed'
              )}
              style={{
                backgroundColor: isSelected ? 'rgb(var(--color-olive-500))' : isToday && !isSelected ? 'rgb(var(--color-olive-50))' : 'transparent',
              }}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
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

      <div data-date-trigger className="relative flex items-center">
        <span className="absolute left-3 pointer-events-none text-ink-muted flex items-center">
          <Calendar className="w-4 h-4" />
        </span>
        <button
          id={inputId}
          type="button"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => (open ? close() : openMenu())}
          className={cn(
            'w-full text-left border border-sand-300 text-ink rounded-lg text-sm py-2 pl-9 pr-9 transition-colors duration-150',
            'focus:outline-none focus:border-olive-400 focus:ring-2 focus:ring-olive-500/20',
            'disabled:bg-sand-100 disabled:border-sand-200 disabled:text-ink-faint disabled:cursor-not-allowed',
            error ? 'border-stamp-500 focus:border-stamp-500 focus:ring-stamp-500/40' : ''
          )}
          style={{ backgroundColor: PANEL_BG }}
        >
          {formatDisplay(value) || 'Select a date'}
        </button>
        <ChevronDown
          className={cn(
            'absolute right-2.5 w-4 h-4 text-ink-muted pointer-events-none transition-transform duration-150',
            open && 'rotate-180'
          )}
        />
      </div>

      {error ? (
        <p className="text-[11px] font-sans text-stamp-600 mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] font-sans text-ink-faint mt-0.5">{helperText}</p>
      ) : null}

      {showPanel &&
        createPortal(
          <div className="contents">
            {!desktop && (
              <div
                className="fixed inset-0"
                style={{ zIndex: 100, backgroundColor: 'rgba(31, 33, 28, 0.55)' }}
                onMouseDown={close}
              />
            )}
          <div
            ref={panelRef}
            role="dialog"
            aria-modal={!desktop}
            aria-label={label || 'Choose date'}
            className={cn(
              'fixed flex flex-col text-ink',
              desktop
                ? 'rounded-lg border border-sand-200 overflow-hidden'
                : 'inset-x-0 bottom-0 rounded-t-2xl border-t border-sand-200'
            )}
            style={{
              zIndex: 100,
              isolation: 'isolate',
              backgroundColor: PANEL_BG,
              boxShadow: desktop
                ? '0 8px 24px rgba(31, 33, 28, 0.16)'
                : '0 -12px 32px rgba(31, 33, 28, 0.18)',
              ...(desktop && menuBox
                ? { top: menuBox.top, left: menuBox.left, width: menuBox.width }
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
              <p className="text-base font-semibold text-ink">{label || 'Date'}</p>
              <button
                type="button"
                onClick={close}
                aria-label="Close date picker"
                className="inline-flex items-center justify-center w-11 h-11 -mr-2 text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto pb-[max(0.75rem,env(safe-area-inset-bottom))]" style={{ backgroundColor: PANEL_BG }}>
              {calendar}
            </div>
          </div>
          </div>,
          document.body
        )}
    </div>
  );
};
