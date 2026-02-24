// src/components/NoteEditor.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { Bold, Italic, Strikethrough, Link2, Check, X, Heading2, Table2, BetweenVerticalStart, BetweenVerticalEnd, BetweenHorizontalStart, BetweenHorizontalEnd, Merge, Split, Rows2, Trash2 } from 'lucide-react';
import ResizableImageNode from './ResizableImageNode';

// ─── Extensión de imagen con redimensionamiento ──────────────────────────────
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attrs) => ({ width: attrs.width }),
      },
      height: {
        default: null,
        renderHTML: (attrs) => ({ height: attrs.height }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNode);
  },
});

// ─── Contenido semilla ────────────────────────────────────────────────────────
const SEED_CONTENT = `
<h1>La Hauntología del Tiempo Perdido</h1>
<p>
  Mark Fisher acuñó el término <strong>hauntología</strong> para describir la
  condición de una cultura que ya no puede imaginar el futuro y sólo produce
  pastiche de un pasado que nunca existió del todo. Lo que nos persigue no son
  los fantasmas de lo que fue, sino los <em>espectros de lo que nunca llegó a
  ser</em>: el porvenir abolido. Como los cielos perpetuamente nublados en las
  instalaciones de
  <a href="https://olafureliasson.net" target="_blank" rel="noopener noreferrer">Olafur Eliasson</a>,
  la luz artificial de <em>The Weather Project</em> no ilumina un sol real, sino
  la memoria de una promesa de calor que la modernidad tardía nunca cumplió.
</p>
<img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&fit=crop" alt="Instalación de luz y niebla" />
<h2>Tareas del jardín esta semana</h2>
<ul>
  <li>Abonar las Zinnias y Portulacas con compost maduro</li>
  <li>Trasplantar los esquejes de Lavanda al cantero oeste</li>
  <li>Regar las Begonias cada dos días hasta el jueves</li>
  <li>Podar las ramas secas del Jazmín trepador</li>
  <li>Sembrar Caléndulas en los bordes para repeler pulgones</li>
</ul>
`;

// ─── Table Toolbar ───────────────────────────────────────────────────────────
const TableToolbar: React.FC<{ editor: ReturnType<typeof useEditor> }> = ({ editor }) => {
  const state = useEditorState({
    editor,
    selector: (ctx) => ({
      inTable: ctx.editor?.isActive('table') ?? false,
      canMerge: ctx.editor?.can().mergeCells() ?? false,
      canSplit: ctx.editor?.can().splitCell() ?? false,
    }),
  });

  if (!state?.inTable || !editor) return null;

  const btn = (
    onClick: () => void,
    title: string,
    icon: React.ReactNode,
    danger = false,
  ) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        danger
          ? 'text-red-400/80 hover:text-red-300 hover:bg-red-900/30'
          : 'text-gray-400 hover:text-white hover:bg-gray-700'
      }`}
    >
      {icon}
    </button>
  );

  const sep = () => <div className="w-px h-4 bg-gray-700 mx-0.5 self-center" />;
  const lbl = (text: string) => (
    <span className="text-[10px] text-gray-600 uppercase tracking-wide mx-1">{text}</span>
  );

  return (
    <div className="flex items-center gap-0.5 px-8 md:px-16 py-1 border-b border-gray-700/60 bg-gray-900 flex-wrap">
      <span className="flex items-center gap-1 text-[11px] text-gray-500 font-medium mr-1">
        <Table2 size={12} strokeWidth={1.75} /> Tabla
      </span>
      {sep()}
      {lbl('Col')}
      {btn(
        () => editor.chain().focus().addColumnBefore().run(),
        'Insertar columna a la izquierda',
        <BetweenVerticalStart size={14} strokeWidth={1.75} />,
      )}
      {btn(
        () => editor.chain().focus().addColumnAfter().run(),
        'Insertar columna a la derecha',
        <BetweenVerticalEnd size={14} strokeWidth={1.75} />,
      )}
      {btn(
        () => editor.chain().focus().deleteColumn().run(),
        'Eliminar columna',
        <Trash2 size={13} strokeWidth={1.75} />,
        true,
      )}
      {sep()}
      {lbl('Fila')}
      {btn(
        () => editor.chain().focus().addRowBefore().run(),
        'Insertar fila arriba',
        <BetweenHorizontalStart size={14} strokeWidth={1.75} />,
      )}
      {btn(
        () => editor.chain().focus().addRowAfter().run(),
        'Insertar fila abajo',
        <BetweenHorizontalEnd size={14} strokeWidth={1.75} />,
      )}
      {btn(
        () => editor.chain().focus().deleteRow().run(),
        'Eliminar fila',
        <Trash2 size={13} strokeWidth={1.75} />,
        true,
      )}
      {(state.canMerge || state.canSplit) && sep()}
      {state.canMerge && btn(
        () => editor.chain().focus().mergeCells().run(),
        'Fusionar celdas seleccionadas',
        <Merge size={14} strokeWidth={1.75} />,
      )}
      {state.canSplit && btn(
        () => editor.chain().focus().splitCell().run(),
        'Dividir celda',
        <Split size={14} strokeWidth={1.75} />,
      )}
      {sep()}
      {btn(
        () => editor.chain().focus().toggleHeaderRow().run(),
        'Alternar fila de encabezado',
        <Rows2 size={14} strokeWidth={1.75} />,
      )}
      {sep()}
      {btn(
        () => { if (confirm('¿Eliminar toda la tabla?')) editor.chain().focus().deleteTable().run(); },
        'Eliminar tabla',
        <Trash2 size={13} strokeWidth={1.75} />,
        true,
      )}
    </div>
  );
};

// ─── Bubble Menu component ───────────────────────────────────────────────────
interface BubbleMenuProps {
  editor: ReturnType<typeof useEditor>;
  linkInputVisible: boolean;
  linkUrl: string;
  linkInputRef: React.RefObject<HTMLInputElement | null>;
  setLinkUrl: (v: string) => void;
  setLinkInputVisible: (v: boolean) => void;
  applyLink: () => void;
  removeLink: () => void;
  tableMode: boolean;
  tableRows: number;
  tableCols: number;
  setTableRows: (v: number) => void;
  setTableCols: (v: number) => void;
  setTableMode: (v: boolean) => void;
  applyTable: () => void;
  bubbleBtn: (active: boolean) => string;
}

const InlineBubbleMenu: React.FC<BubbleMenuProps> = ({
  editor,
  linkInputVisible,
  linkUrl,
  linkInputRef,
  setLinkUrl,
  setLinkInputVisible,
  applyLink,
  removeLink,
  tableMode,
  tableRows,
  tableCols,
  setTableRows,
  setTableCols,
  setTableMode,
  applyTable,
  bubbleBtn,
}) => {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      from: ctx.editor?.state.selection.from,
      to: ctx.editor?.state.selection.to,
      empty: ctx.editor?.state.selection.empty,
    }),
  });

  useEffect(() => {
    if (!editor || editorState?.empty) {
      setPos(null);
      return;
    }
    const { from, to } = editor.state.selection;
    const start = editor.view.coordsAtPos(from);
    const end = editor.view.coordsAtPos(to);
    const midX = (start.left + end.right) / 2;
    setPos({ top: start.top + window.scrollY - 48, left: midX });
  }, [editor, editorState]);

  if (!pos || editorState?.empty) return null;

  const numInput = (val: number, onChange: (n: number) => void, label: string) => (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-gray-400 text-[10px] leading-none">{label}</span>
      <input
        type="number"
        min={1}
        max={20}
        value={val}
        onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-10 bg-gray-700 text-white text-sm text-center px-1 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <div
      style={{ top: pos.top, left: pos.left, transform: 'translateX(-50%)' }}
      className="fixed z-50 flex items-center gap-0.5 bg-gray-800 border border-gray-700 rounded-lg shadow-xl px-1.5 py-1"
      onMouseDown={(e) => e.preventDefault()}
    >
      {linkInputVisible ? (
        <div className="flex items-center gap-1 px-1">
          <input
            ref={linkInputRef}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyLink();
              if (e.key === 'Escape') { setLinkInputVisible(false); setLinkUrl(''); }
            }}
            placeholder="https://..."
            className="bg-gray-700 text-white text-sm px-2 py-1 rounded w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button onClick={applyLink} className={bubbleBtn(false)} title="Confirmar">
            <Check size={14} strokeWidth={2} />
          </button>
          <button onClick={() => { setLinkInputVisible(false); setLinkUrl(''); }} className={bubbleBtn(false)} title="Cancelar">
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      ) : tableMode ? (
        <div className="flex items-center gap-2 px-1">
          {numInput(tableRows, setTableRows, 'filas')}
          <span className="text-gray-500 text-sm">×</span>
          {numInput(tableCols, setTableCols, 'cols')}
          <button onClick={applyTable} className={bubbleBtn(false)} title="Insertar tabla">
            <Check size={14} strokeWidth={2} />
          </button>
          <button onClick={() => setTableMode(false)} className={bubbleBtn(false)} title="Cancelar">
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      ) : (
        <>
          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={bubbleBtn(!!editor?.isActive('heading', { level: 1 }))} title="Encabezado H2">
            <Heading2 size={14} strokeWidth={2} />
          </button>
          <div className="w-px h-4 bg-gray-600 mx-0.5" />
          <button onClick={() => editor?.chain().focus().toggleBold().run()} className={bubbleBtn(!!editor?.isActive('bold'))} title="Negrita">
            <Bold size={14} strokeWidth={2} />
          </button>
          <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={bubbleBtn(!!editor?.isActive('italic'))} title="Cursiva">
            <Italic size={14} strokeWidth={2} />
          </button>
          <button onClick={() => editor?.chain().focus().toggleStrike().run()} className={bubbleBtn(!!editor?.isActive('strike'))} title="Tachado">
            <Strikethrough size={14} strokeWidth={2} />
          </button>
          <div className="w-px h-4 bg-gray-600 mx-0.5" />
          <button
            onClick={() => {
              const existing = editor?.getAttributes('link').href ?? '';
              setLinkUrl(existing);
              setLinkInputVisible(true);
            }}
            className={bubbleBtn(!!editor?.isActive('link'))}
            title="Añadir link"
          >
            <Link2 size={14} strokeWidth={2} />
          </button>
          {editor?.isActive('link') && (
            <button onClick={removeLink} className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors" title="Quitar link">
              <X size={14} strokeWidth={2} />
            </button>
          )}
          <div className="w-px h-4 bg-gray-600 mx-0.5" />
          <button onClick={() => setTableMode(true)} className={bubbleBtn(false)} title="Insertar tabla">
            <Table2 size={14} strokeWidth={2} />
          </button>
        </>
      )}
    </div>
  );
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface NoteEditorProps {
  title: string;
  onTitleChange: (title: string) => void;
  initialContent: string;
  onContentChange: (content: string) => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────
const NoteEditor: React.FC<NoteEditorProps> = ({ title, onTitleChange, initialContent, onContentChange }) => {
  const [linkInputVisible, setLinkInputVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);
  const [tableMode, setTableMode] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const isNew = !initialContent || initialContent === '<p></p>' || initialContent.trim() === '';

  const handleImageInsert = useCallback(
    (src: string) => {
      if (!src) return;
      editor?.chain().focus().setImage({ src }).run();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      ResizableImage.configure({ inline: false, allowBase64: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline underline-offset-2 hover:text-blue-300 cursor-pointer',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Placeholder.configure({
        placeholder: 'Escribe algo… usa # para un título, * para una lista.',
      }),
    ],
    content: isNew ? SEED_CONTENT : initialContent,
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-headings:font-bold prose-h1:text-3xl prose-h2:text-xl prose-h3:text-lg prose-img:rounded-xl prose-img:shadow-lg max-w-none focus:outline-none px-8 py-10 md:px-16 md:py-12 min-h-full',
      },
      
      handlePaste(_view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith('image/')) {
            event.preventDefault();
            const file = items[i].getAsFile();
            if (!file) continue;
            const reader = new FileReader();
            reader.onload = (e) => handleImageInsert(e.target?.result as string);
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
      handleDrop(_view, event) {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        for (let i = 0; i < files.length; i++) {
          if (files[i].type.startsWith('image/')) {
            event.preventDefault();
            const reader = new FileReader();
            reader.onload = (e) => handleImageInsert(e.target?.result as string);
            reader.readAsDataURL(files[i]);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
  });

  // Sincronizar cuando cambie la nota seleccionada
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (initialContent !== current) {
      editor.commands.setContent(
        !initialContent || initialContent === '<p></p>' ? SEED_CONTENT : initialContent,
      );
    }
  }, [initialContent, editor]);

  // Foco en el input de link al mostrarse
  useEffect(() => {
    if (linkInputVisible) {
      setTimeout(() => linkInputRef.current?.focus(), 50);
    }
  }, [linkInputVisible]);

  const applyLink = () => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setLinkInputVisible(false);
    setLinkUrl('');
  };

  const applyTable = () => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true }).run();
    setTableMode(false);
  };

  const removeLink = () => {
    editor?.chain().focus().unsetLink().run();
    setLinkInputVisible(false);
    setLinkUrl('');
  };

  if (!editor) return null;

  

  const bubbleBtn = (active: boolean) =>
    `p-1.5 rounded transition-colors ${
      active ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
    }`;

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* ── Título ──────────────────────────────────────────────────────── */}
      <div className="px-8 pt-10 pb-2 md:px-16">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Sin título"
          className="w-full bg-transparent text-3xl md:text-4xl font-bold text-white placeholder-gray-600 focus:outline-none"
        />
      </div>

      {/* ── Bubble Menu ─────────────────────────────────────────────────── */}
      <InlineBubbleMenu
        editor={editor}
        linkInputVisible={linkInputVisible}
        linkUrl={linkUrl}
        linkInputRef={linkInputRef}
        setLinkUrl={setLinkUrl}
        setLinkInputVisible={setLinkInputVisible}
        applyLink={applyLink}
        removeLink={removeLink}
        tableMode={tableMode}
        tableRows={tableRows}
        tableCols={tableCols}
        setTableRows={setTableRows}
        setTableCols={setTableCols}
        setTableMode={setTableMode}
        applyTable={applyTable}
        bubbleBtn={bubbleBtn}
      />

      {/* ── Table Toolbar ──────────────────────────────────────────────── */}
      <TableToolbar editor={editor} />

      {/* ── Editor ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
      

      <style>{`
        .ProseMirror {
          color: #e5e7eb;
          min-height: 100%;
          caret-color: #60a5fa;
          -webkit-user-select: text;
          user-select: text;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #4b5563;
          pointer-events: none;
          float: left;
          height: 0;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          cursor: default;
        }
        .ProseMirror a {
          color: #60a5fa;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .ProseMirror a:hover {
          color: #93c5fd;
        }
        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.5em 0;
          font-size: 0.95em;
        }
        .ProseMirror th,
        .ProseMirror td {
          border: 1px solid #374151;
          padding: 0.5em 0.75em;
          text-align: left;
          vertical-align: top;
        }
        .ProseMirror th {
          background: #1f2937;
          font-weight: 600;
          color: #f3f4f6;
        }
        .ProseMirror tr:nth-child(even) td {
          background: #111827;
        }
        .selectedCell:after {
          background: rgba(96,165,250,0.15);
          content: '';
          left: 0; right: 0; top: 0; bottom: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }
      `}</style>
    </div>
  );
};

export default NoteEditor;
