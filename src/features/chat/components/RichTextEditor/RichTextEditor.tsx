import React, { useRef, useEffect, useState } from 'react';
import styles from './RichTextEditor.module.css';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string, text: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onKeyDown,
  placeholder = "Type your message...",
  disabled = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const text = editorRef.current.innerText;
      onChange(html, text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const applyFormat = (command: string) => {
    document.execCommand(command, false, undefined);
    editorRef.current?.focus();
    handleInput();
  };

  const showPlaceholder = !isFocused && (!editorRef.current?.textContent?.trim());

  return (
    <div className={styles.richTextContainer}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={() => applyFormat('bold')}
          disabled={disabled}
          title="Bold (Ctrl+B)"
        >
          <i className="fas fa-bold"></i>
        </button>
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={() => applyFormat('italic')}
          disabled={disabled}
          title="Italic (Ctrl+I)"
        >
          <i className="fas fa-italic"></i>
        </button>
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={() => applyFormat('underline')}
          disabled={disabled}
          title="Underline (Ctrl+U)"
        >
          <i className="fas fa-underline"></i>
        </button>
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={() => applyFormat('strikeThrough')}
          disabled={disabled}
          title="Strikethrough"
        >
          <i className="fas fa-strikethrough"></i>
        </button>
      </div>

      <div className={styles.editorWrapper}>
        <div
          ref={editorRef}
          contentEditable={!disabled}
          className={`${styles.editor} ${disabled ? styles.disabled : ''}`}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          suppressContentEditableWarning
        />
        {showPlaceholder && (
          <div className={styles.placeholder}>{placeholder}</div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;