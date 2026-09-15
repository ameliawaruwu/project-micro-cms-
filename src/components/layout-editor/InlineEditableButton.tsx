import React, { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';

interface InlineEditableButtonProps {
  label: string;
  onSaveLabel: (newLabel: string) => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
  isSelected?: boolean;
  readonly?: boolean;
}

export const InlineEditableButton: React.FC<InlineEditableButtonProps> = ({
  label,
  onSaveLabel,
  icon,
  iconPosition = 'right',
  className = '',
  style,
  isSelected = false,
  readonly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(label);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraftLabel(label);
  }, [label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCommit = () => {
    setIsEditing(false);
    if (draftLabel.trim() && draftLabel.trim() !== label) {
      onSaveLabel(draftLabel.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'Escape') {
      setDraftLabel(label);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div
        className="inline-flex items-center gap-1 bg-white p-0.5 rounded-xl ring-2 ring-[#2271B1] shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="text"
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          className="px-2.5 py-1 text-xs text-slate-900 font-bold bg-transparent outline-none min-w-[120px] text-center"
          placeholder="Teks tombol..."
        />
      </div>
    );
  }

  if (readonly) {
    return (
      <button
        type="button"
        className={className}
        style={style}
      >
        {iconPosition === 'left' && icon}
        <span className="truncate">{draftLabel || 'Tombol'}</span>
        {iconPosition === 'right' && icon}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleStartEdit}
      className={`relative group/btn-edit cursor-pointer transition-all duration-150 ${className}`}
      style={style}
      title="Klik untuk mengubah label tombol"
    >
      {iconPosition === 'left' && icon}
      <span className="truncate">{draftLabel || 'Tombol'}</span>
      {iconPosition === 'right' && icon}

      {/* Subtle hover edit pen */}
      <span className="opacity-0 group-hover/btn-edit:opacity-100 transition-opacity absolute -top-2 -right-1.5 bg-[#2271B1] text-white p-0.5 rounded-full shadow-xs pointer-events-none z-20">
        <Pencil className="w-2.5 h-2.5" />
      </span>
    </button>
  );
};
