// src/components/NoteEditor.tsx
import React, { useEffect } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import ResizableImageNode from './ResizableImageNode';

// Extensión personalizada para imágenes con redimensionamiento
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: attributes => {
          return {
            width: attributes.width,
          }
        },
      },
      height: {
        default: null,
        renderHTML: attributes => {
          return {
            height: attributes.height,
          }
        },
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNode);
  },
});

interface NoteEditorProps {
  initialContent: string;
  onContentChange: (content: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ initialContent, onContentChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ResizableImage.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none p-6 min-h-full',
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            
            const file = item.getAsFile();
            if (!file) continue;

            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              editor?.chain().focus().setImage({ src: base64 }).run();
            };
            
            reader.readAsDataURL(file);
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

  // Actualizar contenido cuando cambie la nota seleccionada
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Barra de herramientas */}
      <div className="flex items-center gap-1 p-2 md:p-3 border-b border-gray-700 bg-gray-800 flex-wrap overflow-x-auto">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2.5 md:px-3 py-1.5 md:py-2 rounded text-sm font-medium touch-manipulation ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-600'
          }`}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2.5 md:px-3 py-1.5 md:py-2 rounded text-sm font-medium touch-manipulation ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-600'
          }`}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2.5 md:px-3 py-1.5 md:py-2 rounded text-sm font-medium touch-manipulation ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-600'
          }`}
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-2.5 md:px-3 py-1.5 md:py-2 rounded text-sm font-medium touch-manipulation ${
            editor.isActive('paragraph')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-600'
          }`}
        >
          Párrafo
        </button>
        
        <div className="w-px h-6 bg-gray-600 mx-1" />
        
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2.5 md:px-3 py-1.5 md:py-2 rounded text-sm font-bold touch-manipulation ${
            editor.isActive('bold')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-600'
          }`}
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2.5 md:px-3 py-1.5 md:py-2 rounded text-sm italic touch-manipulation ${
            editor.isActive('italic')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-600'
          }`}
        >
          I
        </button>
        
        <div className="w-px h-6 bg-gray-600 mx-1" />
        
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2.5 md:px-3 py-1.5 md:py-2 rounded text-sm touch-manipulation ${
            editor.isActive('bulletList')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-600'
          }`}
        >
          • Lista
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2.5 md:px-3 py-1.5 md:py-2 rounded text-sm touch-manipulation ${
            editor.isActive('orderedList')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-600'
          }`}
        >
          1. Lista
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Estilos personalizados para el editor */}
      <style>{`
        .ProseMirror {
          color: #e5e7eb;
          min-height: 100%;
          -webkit-user-select: text;
          user-select: text;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        @media (max-width: 768px) {
          .ProseMirror {
            padding: 1.25rem !important;
            font-size: 16px !important;
            line-height: 1.6 !important;
          }
        }
        @media (min-width: 769px) {
          .ProseMirror {
            padding: 1.5rem !important;
          }
        }
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: white;
        }
        @media (max-width: 768px) {
          .ProseMirror h1 {
            font-size: 1.75em;
          }
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.8em;
          margin-bottom: 0.4em;
          color: white;
        }
        @media (max-width: 768px) {
          .ProseMirror h2 {
            font-size: 1.4em;
          }
        }
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-top: 0.6em;
          margin-bottom: 0.3em;
          color: white;
        }
        @media (max-width: 768px) {
          .ProseMirror h3 {
            font-size: 1.2em;
          }
        }
        .ProseMirror p {
          margin-bottom: 1em;
          line-height: 1.6;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        .ProseMirror li {
          margin-bottom: 0.25em;
        }
        .ProseMirror .resizable-image-wrapper {
          margin: 1.5em 0 2.5em 0;
          user-select: none;
          -webkit-user-select: none;
        }
        @media (max-width: 768px) {
          .ProseMirror .resizable-image-wrapper {
            margin: 1em 0 2em 0;
          }
        }
        .ProseMirror .resizable-image-wrapper img {
          max-width: 100%;
          height: auto;
          cursor: pointer;
          touch-action: manipulation;
        }
        .ProseMirror strong {
          font-weight: bold;
          color: white;
        }
        .ProseMirror em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default NoteEditor;