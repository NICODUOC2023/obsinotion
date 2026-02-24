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
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteTitle, setEditingNoteTitle] = useState('');
  
  // Vista móvil: 'folders' | 'notes' | 'editor'
  const [mobileView, setMobileView] = useState<'folders' | 'notes' | 'editor'>('folders');

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

  const handleRenameNote = (noteId: string, newTitle: string) => {
    setNotes(notes.map(note => 
      note.id === noteId ? { ...note, title: newTitle } : note
    ));
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, title: newTitle });
    }
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
      setMobileView('editor');
      
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

  const handleSelectFolder = (folderId: string | null) => {
    setSelectedFolderId(folderId);
    setMobileView('notes');
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setMobileView('editor');
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
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar de Carpetas */}
      <div className={`${
        mobileView === 'folders' ? 'block' : 'hidden'
      } md:block md:w-64 w-full flex-shrink-0`}>
        <FolderSidebar
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={handleSelectFolder}
          onCreateFolder={handleCreateFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
        />
      </div>

      {/* Lista de Notas */}
      <nav className={`${
        mobileView === 'notes' ? 'block' : 'hidden'
      } md:block md:w-80 w-full flex-shrink-0 flex flex-col border-r border-gray-700 bg-gray-850`}>
        {/* Header de notas con navegación móvil */}
        <div className="p-4 border-b border-gray-700 flex items-center gap-3">
          <button
            onClick={() => setMobileView('folders')}
            className="md:hidden text-gray-400 hover:text-white text-2xl leading-none active:scale-95 transition-transform"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold truncate flex-1">
            {selectedFolderId
              ? folders.find(f => f.id === selectedFolderId)?.name || 'Notas'
              : 'Todas las notas'}
          </h2>
          <button
            onClick={() => setIsCreatingNote(true)}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
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
              className="w-full bg-gray-700 text-white px-3 py-3 rounded mb-3 text-base"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleCreateNote()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateNote}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded text-sm font-medium"
              >
                Crear
              </button>
              <button
                onClick={() => {
                  setIsCreatingNote(false);
                  setNewNoteTitle('');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3">
          {filteredNotes.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-8">No hay notas aquí</p>
          ) : (
            <ul className="space-y-2">
              {filteredNotes.map(note => (
                <li
                  key={note.id}
                  className={`group p-4 rounded cursor-pointer active:bg-gray-600 transition-colors ${
                    selectedNote?.id === note.id ? 'bg-gray-700' : 'hover:bg-gray-800'
                  }`}
                  onClick={() => handleSelectNote(note)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      {editingNoteId === note.id ? (
                        <input
                          type="text"
                          value={editingNoteTitle}
                          onChange={(e) => setEditingNoteTitle(e.target.value)}
                          onBlur={() => {
                            if (editingNoteTitle.trim()) {
                              handleRenameNote(note.id, editingNoteTitle.trim());
                            }
                            setEditingNoteId(null);
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              if (editingNoteTitle.trim()) {
                                handleRenameNote(note.id, editingNoteTitle.trim());
                              }
                              setEditingNoteId(null);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-gray-600 text-white px-2 py-1 rounded text-base mb-1"
                          autoFocus
                        />
                      ) : (
                        <h3 
                          className="font-medium truncate text-base mb-1 cursor-text"
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setEditingNoteId(note.id);
                            setEditingNoteTitle(note.title);
                          }}
                        >
                          {note.title}
                        </h3>
                      )}
                      <p className="text-sm text-gray-400 line-clamp-2">
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
                      className="hidden md:group-hover:block text-gray-400 hover:text-red-400 ml-3 text-xl p-1"
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
                    className="w-full bg-gray-700 text-white text-sm px-3 py-2 rounded"
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
      <main className={`${
        mobileView === 'editor' ? 'block' : 'hidden'
      } md:block flex-1 w-full`}>
        {selectedNote ? (
          <div className="h-full flex flex-col">
            {/* Header móvil del editor */}
            <div className="md:hidden p-4 border-b border-gray-700 flex items-center gap-3 bg-gray-800">
              <button
                onClick={() => setMobileView('notes')}
                className="text-gray-400 hover:text-white text-2xl leading-none active:scale-95 transition-transform"
              >
                ←
              </button>
              {editingNoteId === selectedNote.id ? (
                <input
                  type="text"
                  value={editingNoteTitle}
                  onChange={(e) => setEditingNoteTitle(e.target.value)}
                  onBlur={() => {
                    if (editingNoteTitle.trim()) {
                      handleRenameNote(selectedNote.id, editingNoteTitle.trim());
                    }
                    setEditingNoteId(null);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      if (editingNoteTitle.trim()) {
                        handleRenameNote(selectedNote.id, editingNoteTitle.trim());
                      }
                      setEditingNoteId(null);
                    }
                  }}
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded"
                  autoFocus
                />
              ) : (
                <h3 
                  className="flex-1 font-medium truncate cursor-text"
                  onDoubleClick={() => {
                    setEditingNoteId(selectedNote.id);
                    setEditingNoteTitle(selectedNote.title);
                  }}
                >
                  {selectedNote.title}
                </h3>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <NoteEditor
                key={selectedNote.id}
                title={selectedNote.title}
                onTitleChange={(newTitle) => { if (newTitle.trim()) handleRenameNote(selectedNote.id, newTitle); }}
                initialContent={selectedNote.content}
                onContentChange={handleContentChange}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 px-4 text-center">
            <p>Selecciona una nota o crea una nueva</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
