"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiSearch, FiX } from "react-icons/fi";
import styles from "./MultiSelect.module.css";

export interface MultiSelectOption {
    id: string;
    title: string;
}

interface MultiSelectProps {
    label?: React.ReactNode;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    clearAllLabel?: string;
    options: MultiSelectOption[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    required?: boolean;
}

export default function MultiSelect({
    label,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    emptyText = "No options found",
    clearAllLabel = "Clear all",
    options,
    selectedIds,
    onChange,
    required,
}: MultiSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        };
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [open]);

    const selectedOptions = useMemo(
        () => options.filter((opt) => selectedIds.includes(opt.id)),
        [options, selectedIds]
    );

    const filteredOptions = useMemo(() => {
        if (!query.trim()) return options;
        const q = query.trim().toLowerCase();
        return options.filter((opt) => opt.title.toLowerCase().includes(q));
    }, [options, query]);

    const toggleOption = (id: string) => {
        if (selectedIds.includes(id)) onChange(selectedIds.filter((s) => s !== id));
        else onChange([...selectedIds, id]);
    };

    const removeOption = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selectedIds.filter((s) => s !== id));
    };

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            {label && (
                <label className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}

            <button
                type="button"
                className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
            >
                {selectedOptions.length === 0 ? (
                    <span className={styles.placeholder}>{placeholder}</span>
                ) : (
                    <span className={styles.chipRow}>
                        {selectedOptions.map((opt) => (
                            <span key={opt.id} className={styles.chip}>
                                {opt.title}
                                <span
                                    className={styles.chipRemove}
                                    onClick={(e) => removeOption(opt.id, e)}
                                    role="button"
                                    aria-label={`Remove ${opt.title}`}
                                >
                                    <FiX size={11} />
                                </span>
                            </span>
                        ))}
                    </span>
                )}
                <FiChevronDown className={styles.chevron} size={16} />
            </button>

            {open && (
                <div className={styles.dropdown}>
                    <div className={styles.searchWrapper}>
                        <FiSearch className={styles.searchIcon} size={14} />
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder={searchPlaceholder}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {selectedOptions.length > 0 && (
                        <button type="button" className={styles.clearAllBtn} onClick={() => onChange([])}>
                            {clearAllLabel} ({selectedOptions.length})
                        </button>
                    )}

                    <div className={styles.optionsList}>
                        {filteredOptions.length === 0 ? (
                            <div className={styles.emptyText}>{emptyText}</div>
                        ) : (
                            filteredOptions.map((opt) => {
                                const checked = selectedIds.includes(opt.id);
                                return (
                                    <label key={opt.id} className={styles.optionRow}>
                                        <input
                                            type="checkbox"
                                            className={styles.optionCheckbox}
                                            checked={checked}
                                            onChange={() => toggleOption(opt.id)}
                                        />
                                        <span>{opt.title}</span>
                                    </label>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
