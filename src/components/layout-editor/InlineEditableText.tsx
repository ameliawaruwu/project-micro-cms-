import React, { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';

interface InlineEditableTextProps {
  value: string;
  placeholder?: string;
  onSave: (newValue: string) => void;
  className?: string;
  multiline?: boolean;
  style?: React.CSSProperties;
  tagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  isSelected?: boolean;
  showEditHint?: boolean;
  readonly?: boolean;
}

export const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  value,
  placeholder = 'Klik untuk mengedit...',
  onSave,
  className = '',
  multiline = false,
  style,
  tagName: Tag = 'span',
  isSelected = false,
  showEditHint = true,
  readonly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if ('select' in inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCommit = () => {
    setIsEditing(false);
    if (draftValue.trim() !== value) {
      onSave(draftValue.trim() || placeholder);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'Escape') {
      setDraftValue(value);
      setIsEditing(false);
    }
  };

  if (readonly) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={draftValue}
          onChange={(e) => setDraftValue(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className={`w-full bg-white/95 text-slate-900 ring-2 ring-[#2271B1] rounded-lg p-1.5 shadow-lg outline-none font-inherit text-inherit leading-inherit resize-y transition-all ${className}`}
          style={style}
          rows={3}
          placeholder={placeholder}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={draftValue}
        onChange={(e) => setDraftValue(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className={`w-full bg-white/95 text-slate-900 ring-2 ring-[#2271B1] rounded-md px-1.5 py-0.5 shadow-lg outline-none font-inherit text-inherit leading-inherit transition-all ${className}`}
        style={style}
        placeholder={placeholder}
      />
    );
  }

  return (
    <Tag
      onClick={handleStartEdit}
      className={`relative group/editable cursor-text rounded-md transition-all duration-150 inline-block max-w-full ${
        isSelected
          ? 'hover:bg-black/10 hover:ring-1 hover:ring-[#2271B1]/40'
          : 'hover:bg-black/5 hover:ring-1 hover:ring-[#2271B1]/30'
      } ${className}`}
      style={style}
      title="Klik untuk mengedit teks langsung"
    >
      <span className={!draftValue ? 'opacity-50 italic' : ''}>
        {draftValue || placeholder}
      </span>
      {showEditHint && (
        <span className="opacity-0 group-hover/editable:opacity-100 transition-opacity absolute -top-3 -right-2 bg-[#2271B1] text-white p-0.5 rounded shadow-xs pointer-events-none z-30">
          <Pencil className="w-2.5 h-2.5" />
        </span>
      )}
    </Tag>
  );
};
