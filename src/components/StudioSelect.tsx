"use client";

// Adapted from the public landing page's CountrySelect.tsx. Keep its visual
// styles in StudioSelect.module.css aligned with CountrySelect.module.css.
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import styles from "./StudioSelect.module.css";

type Option = { value: string; label: string };
type Props = { id: string; name: string; label: string; defaultValue: string; options: Option[] };

export function StudioSelect({ id, name, label, defaultValue, options }: Props) {
  const inputRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState({ left: 0, top: 0, width: 0, maxHeight: 276, above: false });
  const typeahead = useRef({ text: "", time: 0 });
  const listId = `${id}-options`;

  function showOptions() {
    setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)));
    setOpen(true);
  }

  function choose(index: number) {
    setValue(options[index].value);
    setOpen(false);
    inputRef.current?.focus();
  }

  useLayoutEffect(() => {
    if (!open) return;
    const positionMenu = () => {
      const rect = inputRef.current?.getBoundingClientRect();
      if (!rect) return;
      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportLeft = viewport?.offsetLeft ?? 0;
      const bottom = viewportTop + (viewport?.height ?? window.innerHeight);
      const right = viewportLeft + (viewport?.width ?? window.innerWidth);
      const availableBelow = Math.max(0, bottom - rect.bottom - 16);
      const availableAbove = Math.max(0, rect.top - viewportTop - 16);
      const above = availableBelow < Math.min(276, options.length * 46 + 14) && availableAbove > availableBelow;
      const width = Math.min(rect.width, right - viewportLeft - 16);
      setPosition({ left: Math.max(viewportLeft + 8, Math.min(rect.left, right - width - 8)), top: above ? rect.top - 8 : rect.bottom + 8, width, maxHeight: Math.min(276, above ? availableAbove : availableBelow), above });
    };
    positionMenu();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    window.visualViewport?.addEventListener("resize", positionMenu);
    window.visualViewport?.addEventListener("scroll", positionMenu);
    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
      window.visualViewport?.removeEventListener("resize", positionMenu);
      window.visualViewport?.removeEventListener("scroll", positionMenu);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent | FocusEvent) => {
      const target = event.target as Node;
      if (!inputRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("focusin", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("focusin", dismiss);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const option = document.getElementById(`${id}-option-${activeIndex}`);
    if (!list || !option) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight)
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
  }, [activeIndex, id, open]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) showOptions();
      else setActiveIndex((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(activeIndex);
      else showOptions();
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === "Tab") setOpen(false);
    else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      const text = (now - typeahead.current.time < 700 ? typeahead.current.text : "") + event.key.toLowerCase();
      typeahead.current = { text, time: now };
      const match = options.findIndex((option) => option.label.toLowerCase().startsWith(text));
      if (match >= 0) { setActiveIndex(match); setOpen(true); }
    }
  }

  return <div className={`${styles.countrySelect} ${styles.dashboard}`}>
    <input type="hidden" name={name} value={value} />
    <button ref={inputRef} id={id} type="button" role="combobox" aria-label={label}
      aria-expanded={open} aria-controls={open ? listId : undefined} aria-haspopup="listbox"
      aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
      className={`${styles.control} ${styles.trigger}`} onKeyDown={onKeyDown}
      onClick={() => open ? setOpen(false) : showOptions()}>
      <span className={styles.value}>{options.find((option) => option.value === value)?.label}</span>
      <span className={styles.toggle} aria-hidden="true"><span className={styles.chevron} data-open={open} /></span>
    </button>
    {open && createPortal(<div ref={menuRef} className={`${styles.menu} ${styles.dashboardMenu}`}
      style={{ left: position.left, top: position.top, width: position.width, maxHeight: position.maxHeight, transform: position.above ? "translateY(-100%)" : undefined }}>
      <ul ref={listRef} id={listId} role="listbox" aria-label={label} className={styles.options}>
        {options.map((option, index) => <li id={`${id}-option-${index}`} key={option.value} role="option"
          aria-selected={value === option.value} data-active={activeIndex === index} className={styles.option}
          onPointerDown={(event) => { if (event.pointerType === "mouse") event.preventDefault(); }}
          onClick={() => choose(index)}>
          <span>{option.label}</span>{value === option.value && <span aria-hidden="true">✓</span>}
        </li>)}
      </ul>
    </div>, document.body)}
  </div>;
}
