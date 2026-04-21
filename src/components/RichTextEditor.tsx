import { useRef, useEffect, useCallback, useState } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link, Unlink, Heading1, Heading2,
  Type, ChevronDown, Minus, Quote
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

const FONTS = [
  { label: 'По умолчанию', value: '' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
];

const FONT_SIZES = ['10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48'];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Введите текст...',
  minHeight = 160,
  className = '',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [activeFontLabel, setActiveFontLabel] = useState('По умолчанию');
  const [activeFontSize, setActiveFontSize] = useState('16');
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const isInternalUpdate = useRef(false);

  // Initialize editor with value
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (isInternalUpdate.current) return;
    if (editor.innerHTML !== value) {
      editor.innerHTML = value || '';
    }
  }, [value]);

  const emitChange = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    isInternalUpdate.current = true;
    onChange(editor.innerHTML);
    requestAnimationFrame(() => { isInternalUpdate.current = false; });
  }, [onChange]);

  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('strikeThrough')) formats.add('strikeThrough');
    const justification = document.queryCommandValue('justifyLeft') === 'true' ? 'justifyLeft'
      : document.queryCommandValue('justifyCenter') === 'true' ? 'justifyCenter'
      : document.queryCommandValue('justifyRight') === 'true' ? 'justifyRight'
      : document.queryCommandValue('justifyFull') === 'true' ? 'justifyFull'
      : 'justifyLeft';
    formats.add(justification);
    setActiveFormats(formats);

    const fontName = document.queryCommandValue('fontName');
    const matched = FONTS.find(f => f.value && fontName.includes(f.value.split(',')[0].replace(/"/g, '')));
    setActiveFontLabel(matched?.label || 'По умолчанию');

    const fontSize = document.queryCommandValue('fontSize');
    const sizeMap: Record<string, string> = { '1': '10', '2': '13', '3': '16', '4': '18', '5': '24', '6': '32', '7': '48' };
    setActiveFontSize(sizeMap[fontSize] || '16');
  }, []);

  const exec = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    emitChange();
    updateActiveFormats();
  }, [emitChange, updateActiveFormats]);

  const applyFont = useCallback((font: { label: string; value: string }) => {
    setShowFontDropdown(false);
    editorRef.current?.focus();
    if (font.value) {
      document.execCommand('fontName', false, font.value);
    } else {
      document.execCommand('removeFormat', false, undefined);
    }
    setActiveFontLabel(font.label);
    emitChange();
  }, [emitChange]);

  const applySize = useCallback((size: string) => {
    setShowSizeDropdown(false);
    editorRef.current?.focus();
    // Map px size to legacy execCommand fontSize (1-7)
    const n = parseInt(size);
    const legacy = n <= 10 ? '1' : n <= 13 ? '2' : n <= 16 ? '3' : n <= 18 ? '4' : n <= 24 ? '5' : n <= 32 ? '6' : '7';
    document.execCommand('fontSize', false, legacy);
    // Replace font size with actual px via span replacement
    const editor = editorRef.current;
    if (editor) {
      editor.querySelectorAll('font[size]').forEach(el => {
        const span = document.createElement('span');
        span.style.fontSize = `${size}px`;
        span.innerHTML = (el as HTMLElement).innerHTML;
        el.replaceWith(span);
      });
    }
    setActiveFontSize(size);
    emitChange();
  }, [emitChange]);

  const handleInsertLink = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      alert('Выделите текст, к которому хотите добавить ссылку');
      return;
    }
    const url = prompt('Введите URL ссылки:', 'https://');
    if (url) exec('createLink', url);
  }, [exec]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      exec('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  }, [exec]);

  const isActive = (format: string) => activeFormats.has(format);

  const ToolBtn = ({ cmd, title, children, onClick }: {
    cmd?: string; title: string; children: React.ReactNode; onClick?: () => void;
  }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        if (onClick) onClick();
        else if (cmd) exec(cmd);
      }}
      className={`p-1.5 rounded transition-colors ${
        cmd && isActive(cmd)
          ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />;

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 select-none">

        {/* Font family */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setShowFontDropdown(v => !v); setShowSizeDropdown(false); }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors min-w-[110px] justify-between"
          >
            <span className="truncate">{activeFontLabel}</span>
            <ChevronDown className="w-3 h-3 flex-shrink-0" />
          </button>
          {showFontDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 py-1 min-w-[160px]">
              {FONTS.map(font => (
                <button
                  key={font.value}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); applyFont(font); }}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
                  style={font.value ? { fontFamily: font.value } : {}}
                >
                  {font.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font size */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setShowSizeDropdown(v => !v); setShowFontDropdown(false); }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-16 justify-between"
          >
            <span>{activeFontSize}px</span>
            <ChevronDown className="w-3 h-3 flex-shrink-0" />
          </button>
          {showSizeDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 py-1 w-20">
              {FONT_SIZES.map(size => (
                <button
                  key={size}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); applySize(size); }}
                  className={`w-full text-left px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${activeFontSize === size ? 'text-teal-600 dark:text-teal-400 font-medium' : 'text-gray-800 dark:text-gray-200'}`}
                >
                  {size}px
                </button>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* Headings */}
        <ToolBtn cmd="formatBlock" title="Заголовок 1" onClick={() => exec('formatBlock', '<h1>')}>
          <Heading1 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn cmd="formatBlock" title="Заголовок 2" onClick={() => exec('formatBlock', '<h2>')}>
          <Heading2 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn title="Обычный текст" onClick={() => exec('formatBlock', '<p>')}>
          <Type className="w-4 h-4" />
        </ToolBtn>

        <Divider />

        {/* Text formatting */}
        <ToolBtn cmd="bold" title="Жирный (Ctrl+B)">
          <Bold className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn cmd="italic" title="Курсив (Ctrl+I)">
          <Italic className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn cmd="underline" title="Подчеркнутый (Ctrl+U)">
          <Underline className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn cmd="strikeThrough" title="Зачеркнутый">
          <Strikethrough className="w-4 h-4" />
        </ToolBtn>

        <Divider />

        {/* Alignment */}
        <ToolBtn cmd="justifyLeft" title="По левому краю">
          <AlignLeft className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn cmd="justifyCenter" title="По центру">
          <AlignCenter className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn cmd="justifyRight" title="По правому краю">
          <AlignRight className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn cmd="justifyFull" title="По ширине">
          <AlignJustify className="w-4 h-4" />
        </ToolBtn>

        <Divider />

        {/* Lists */}
        <ToolBtn cmd="insertUnorderedList" title="Маркированный список">
          <List className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn cmd="insertOrderedList" title="Нумерованный список">
          <ListOrdered className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn title="Цитата" onClick={() => exec('formatBlock', '<blockquote>')}>
          <Quote className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn title="Горизонтальная линия" onClick={() => exec('insertHorizontalRule')}>
          <Minus className="w-4 h-4" />
        </ToolBtn>

        <Divider />

        {/* Link */}
        <ToolBtn title="Добавить ссылку" onClick={handleInsertLink}>
          <Link className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn cmd="unlink" title="Убрать ссылку">
          <Unlink className="w-4 h-4" />
        </ToolBtn>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onKeyDown={handleKeyDown}
        onClick={() => { setShowFontDropdown(false); setShowSizeDropdown(false); }}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="rich-editor px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none overflow-y-auto resize-y"
      />
    </div>
  );
}

/** Convert stored HTML to safe renderable JSX */
export function RichTextDisplay({ html, className = '' }: { html: string; className?: string }) {
  return (
    <div
      className={`rich-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Check if a string is HTML (contains tags) */
export function isHtmlContent(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}
