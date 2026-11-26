import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Pengganti `<select>` yang bisa dicari. Dipakai persis seperti `<select>`:
 * `value`, `onChange={(e) => e.target.value}`, `className`, `disabled`, `required`,
 * dan anak `<option>` / `<optgroup>`. Daftar pilihan dibuka di portal (tidak
 * terpotong modal) dengan kolom pencarian di atasnya.
 */

type NativeSelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value' | 'multiple'>;

export interface SearchableSelectProps extends NativeSelectProps {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Placeholder kolom pencarian (bawaan: "Cari..." / "Search..."). */
  searchPlaceholder?: string;
}

interface ParsedOption {
  value: string;
  label: string;
  disabled: boolean;
  group?: string;
}

function nodeText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (React.isValidElement(node)) return nodeText((node.props as { children?: React.ReactNode }).children);
  return '';
}

function parseOptions(children: React.ReactNode, group?: string, out: ParsedOption[] = []): ParsedOption[] {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const props = child.props as { value?: unknown; disabled?: boolean; label?: string; children?: React.ReactNode };
    if (child.type === React.Fragment) {
      parseOptions(props.children, group, out);
    } else if (child.type === 'optgroup') {
      parseOptions(props.children, props.label || group, out);
    } else if (child.type === 'option') {
      const label = nodeText(props.children).replace(/\s+/g, ' ').trim();
      out.push({
        value: props.value === undefined || props.value === null ? label : String(props.value),
        label,
        disabled: Boolean(props.disabled),
        group,
      });
    }
  });
  return out;
}

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const LIST_MAX_HEIGHT = 260;
const LIST_MIN_HEIGHT = 120;
/** Tinggi kolom pencarian + bingkai popover + jarak ke tepi layar. */
const POPOVER_CHROME = 64;

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  children,
  className = '',
  disabled,
  required,
  name,
  id,
  style,
  searchPlaceholder,
  title,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => {
  const { isEn } = useLanguage();
  const listboxId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [position, setPosition] = useState<React.CSSProperties>({});
  const [listHeight, setListHeight] = useState(LIST_MAX_HEIGHT);

  const options = useMemo(() => parseOptions(children), [children]);
  const current = value === undefined || value === null ? '' : String(value);
  // Seperti <select> asli: bila nilai tidak cocok, yang tampil opsi pertama.
  const selected = options.find((o) => o.value === current) ?? options[0];

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return options;
    return options.filter((o) => normalize(o.label).includes(q) || normalize(o.group || '').includes(q));
  }, [options, query]);

  // Panah bawaan <select> hanya tampil bila tidak memakai appearance-none (ikon sendiri).
  const showChevron = !/\bappearance-none\b/.test(className);

  const updatePosition = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const width = Math.max(rect.width, 220);
    const left = Math.min(rect.left, window.innerWidth - width - 8);
    const viewportH = window.visualViewport?.height || window.innerHeight;
    const spaceBelow = viewportH - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < LIST_MAX_HEIGHT + POPOVER_CHROME && spaceAbove > spaceBelow;
    // Daftar dipendekkan agar popover (termasuk kolom cari) selalu utuh di dalam layar.
    const room = (openUp ? spaceAbove : spaceBelow) - POPOVER_CHROME;
    setListHeight(Math.max(LIST_MIN_HEIGHT, Math.min(LIST_MAX_HEIGHT, room)));
    setPosition({
      position: 'fixed',
      left: Math.max(8, left),
      width,
      ...(openUp
        ? { bottom: Math.max(8, window.innerHeight - rect.top + 4) }
        : { top: rect.bottom + 4 }),
      maxHeight: viewportH - 16,
      zIndex: 2147483000,
      fontFamily: window.getComputedStyle(btn).fontFamily,
    });
  }, []);

  const openList = () => {
    if (disabled) return;
    setQuery('');
    const idx = options.findIndex((o) => o.value === selected?.value);
    setActiveIndex(idx);
    updatePosition();
    setOpen(true);
  };

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  const choose = (opt: ParsedOption) => {
    if (opt.disabled) return;
    close();
    if (opt.value === current) return;
    const target = { value: opt.value, name: name || '', id: id || '' };
    onChange?.({ target, currentTarget: target } as unknown as React.ChangeEvent<HTMLSelectElement>);
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    searchRef.current?.focus();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (buttonRef.current?.contains(t) || popoverRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onScroll = (e: Event) => {
      if (popoverRef.current?.contains(e.target as Node)) return;
      updatePosition();
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, updatePosition]);

  // Hasil pencarian berubah → sorot hasil pertama yang bisa dipilih.
  useEffect(() => {
    if (!open || !query) return;
    setActiveIndex(filtered.findIndex((o) => !o.disabled));
  }, [query, filtered, open]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const move = (dir: 1 | -1) => {
    if (filtered.length === 0) return;
    let i = activeIndex;
    for (let step = 0; step < filtered.length; step++) {
      i = (i + dir + filtered.length) % filtered.length;
      if (!filtered[i].disabled) break;
    }
    setActiveIndex(i);
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[activeIndex];
      if (opt) choose(opt);
    } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === 'Tab') close(false);
  };

  const onButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      openList();
    }
  };

  let lastGroup: string | undefined;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        title={title}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onButtonKeyDown}
        className={`${className} relative text-left`}
        style={showChevron ? { ...style, paddingRight: '2rem' } : style}
      >
        <span className="block truncate">{selected?.label ?? ' '}</span>
        {showChevron && (
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
        )}
      </button>

      {/* Select asli tersembunyi: validasi `required` & pengiriman form tetap jalan. */}
      {(required || name) && (
        <select
          aria-hidden="true"
          tabIndex={-1}
          name={name}
          required={required}
          value={current}
          onChange={() => undefined}
          onFocus={() => buttonRef.current?.focus()}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
        >
          {options.map((o, i) => (
            <option key={`${o.value}-${i}`} value={o.value} disabled={o.disabled}>{o.label}</option>
          ))}
        </select>
      )}

      {open && createPortal(
        <div
          ref={popoverRef}
          style={position}
          className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left text-[13px] text-gray-900 shadow-xl"
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder={searchPlaceholder || (isEn ? 'Search...' : 'Cari...')}
              aria-label={isEn ? 'Search options' : 'Cari pilihan'}
              aria-controls={listboxId}
              className="w-full bg-transparent text-[13px] text-gray-900 placeholder:text-gray-400 outline-none"
            />
          </div>
          <div ref={listRef} id={listboxId} role="listbox" className="min-h-0 overflow-y-auto py-1" style={{ maxHeight: listHeight }}>
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-gray-500">{isEn ? 'No results found' : 'Tidak ada hasil'}</p>
            )}
            {filtered.map((o, i) => {
              const header = o.group && o.group !== lastGroup ? o.group : null;
              lastGroup = o.group;
              const isSelected = o.value === selected?.value;
              return (
                <React.Fragment key={`${o.value}-${i}`}>
                  {header && (
                    <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">{header}</p>
                  )}
                  <div
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={o.disabled || undefined}
                    data-index={i}
                    onMouseEnter={() => !o.disabled && setActiveIndex(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(o)}
                    className={`flex items-center gap-2 px-3 py-2 ${
                      o.disabled
                        ? 'cursor-not-allowed text-gray-400'
                        : `cursor-pointer ${i === activeIndex ? 'bg-gray-100' : ''}`
                    } ${isSelected ? 'font-semibold' : ''}`}
                  >
                    <span className="min-w-0 flex-1 break-words">{o.label || ' '}</span>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-gray-700" />}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default SearchableSelect;
