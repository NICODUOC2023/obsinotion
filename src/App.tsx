// src/App.tsx
import { useState, useEffect } from 'react';
import NoteEditor from './components/NoteEditor';
import FolderSidebar from './components/FolderSidebar';
// import { initPowerSync, powerSync } from './lib/powersync';

// Tipos
interface Note {
  id: string;
  title: string;
  content: string;
  folder_id: string | null;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  noteCount: number;
}

// Datos de ejemplo
const sampleFolders: Folder[] = [
  { id: '1', name: 'Personal', color: 'blue', noteCount: 2 },
  { id: '2', name: 'Trabajo', color: 'green', noteCount: 0 },
  { id: '3', name: 'Ideas', color: 'purple', noteCount: 0 },
];

const sampleNotes: Note[] = [
  { id: '1', title: 'Mi primera nota', content: '<h1>Hola Mundo</h1><p>Este es el contenido.</p>', folder_id: '1' },
  { id: '2', title: 'Ideas de proyecto', content: '<ul><li>Idea 1</li><li>Idea 2</li></ul>', folder_id: '1' }
];

function App() {
  const [folders, setFolders] = useState<Folder[]>(sampleFolders);
  const [notes, setNotes] = useState<Note[]>(sampleNotes);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0]);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  // Inicializar PowerSync al cargar la app
  useEffect(() => {
    // En una app real, llamarías a initPowerSync() después del login del usuario
    // initPowerSync(); 
    console.log('PowerSync se inicializará aquí.');
  }, []);

  // Filtrar notas según la carpeta seleccionada
  const filteredNotes = selectedFolderId === null
    ? notes
    : notes.filter(note => note.folder_id === selectedFolderId);

  const handleContentChange = (content: string) => {
    if (selectedNote) {
      setNotes(notes.map(note => 
        note.id === selectedNote.id ? { ...note, content } : note
      ));
    }
  };

  const handleCreateFolder = (name: string, color: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      color,
      noteCount: 0,
    };
    setFolders([...folders, newFolder]);
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    setFolders(folders.map(folder => 
      folder.id === folderId ? { ...folder, name: newName } : folder
    ));
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders(folders.filter(folder => folder.id !== folderId));
    // Mover las notas de esta carpeta a "sin carpeta"
    setNotes(notes.map(note => 
      note.folder_id === folderId ? { ...note, folder_id: null } : note
    ));
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
  };

  const handleCreateNote = () => {
    if (newNoteTitle.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: newNoteTitle.trim(),
        content: '<p>Escribe aquí...</p>',
        folder_id: selectedFolderId,
      };
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
      setNewNoteTitle('');
      setIsCreatingNote(false);
      
      // Actualizar el contador de notas de la carpeta
      if (selectedFolderId) {
        setFolders(folders.map(folder =>
          folder.id === selectedFolderId
            ? { ...folder, noteCount: folder.noteCount + 1 }
            : folder
        ));
      }
    }
  };

  const handleDeleteNote = (noteId: string) => {
    const noteToDelete = notes.find(n => n.id === noteId);
    setNotes(notes.filter(note => note.id !== noteId));
    
    // Actualizar el contador de notas de la carpeta
    if (noteToDelete?.folder_id) {
      setFolders(folders.map(folder =>
        folder.id === noteToDelete.folder_id
          ? { ...folder, noteCount: Math.max(0, folder.noteCount - 1) }
          : folder
      ));
    }
    
    if (selectedNote?.id === noteId) {
      setSelectedNote(notes[0] || null);
    }
  };

  const handleMoveNote = (noteId: string, targetFolderId: string | null) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    // Actualizar contadores
    if (note.folder_id) {
      setFolders(folders.map(folder =>
        folder.id === note.folder_id
          ? { ...folder, noteCount: Math.max(0, folder.noteCount - 1) }
          : folder
      ));
    }
    if (targetFolderId) {
      setFolders(folders.map(folder =>
        folder.id === targetFolderId
          ? { ...folder, noteCount: folder.noteCount + 1 }
          : folder
      ));
    }

    setNotes(notes.map(n =>
      n.id === noteId ? { ...n, folder_id: targetFolderId } : n
    ));
  };

  // Calcular contadores de notas
  useEffect(() => {
    const counts: Record<string, number> = {};
    notes.forEach(note => {
      if (note.folder_id) {
        counts[note.folder_id] = (counts[note.folder_id] || 0) + 1;
      }
    });
    setFolders(folders.map(folder => ({
      ...folder,
      noteCount: counts[folder.id] || 0,
    })));
  }, [notes]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar de Carpetas */}
      <FolderSidebar
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onCreateFolder={handleCreateFolder}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
      />

      {/* Lista de Notas */}
      <nav className="w-80 flex-shrink-0 flex flex-col border-r border-gray-700 bg-gray-850">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {selectedFolderId
              ? folders.find(f => f.id === selectedFolderId)?.name || 'Notas'
              : 'Todas las notas'}
          </h2>
          <button
            onClick={() => setIsCreatingNote(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            + Nueva
          </button>
        </div>

        {isCreatingNote && (
          <div className="p-4 border-b border-gray-700 bg-gray-800">
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Título de la nota"
              className="w-full bg-gray-700 text-white px-3 py-2 rounded mb-2 text-sm"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleCreateNote()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateNote}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm"
              >
                Crear
              </button>
              <button
                onClick={() => {
                  setIsCreatingNote(false);
                  setNewNoteTitle('');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {filteredNotes.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-8">No hay notas aquí</p>
          ) : (
            <ul className="space-y-2">
              {filteredNotes.map(note => (
                <li
                  key={note.id}
                  className={`group p-3 rounded cursor-pointer ${
                    selectedNote?.id === note.id ? 'bg-gray-700' : 'hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedNote(note)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{note.title}</h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {note.content.replace(/<[^>]*>/g, '')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar "${note.title}"?`)) {
                          handleDeleteNote(note.id);
                        }
                      }}
                      className="hidden group-hover:block text-gray-400 hover:text-red-400 ml-2"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  {/* Selector de carpeta */}
                  <select
                    value={note.folder_id || ''}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleMoveNote(note.id, e.target.value || null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 w-full bg-gray-700 text-white text-xs px-2 py-1 rounded"
                  >
                    <option value="">Sin carpeta</option>
                    {folders.map(folder => (
                      <option key={folder.id} value={folder.id}>
                        📁 {folder.name}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      {/* Editor */}
      <main className="flex-1">
        {selectedNote ? (
          <NoteEditor
            key={selectedNote.id}
            initialContent={selectedNote.content}
            onContentChange={handleContentChange}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Selecciona una nota o crea una nueva
          </div>
        )}
      </main>
    </div>
  );
}

export default App;