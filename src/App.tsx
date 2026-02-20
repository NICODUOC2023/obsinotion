// src/App.tsx
import { useState, useEffect } from 'react';
import NoteEditor from './components/NoteEditor';
import FolderSidebar from './components/FolderSidebar';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';

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

function App() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteTitle, setEditingNoteTitle] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Vista móvil: 'folders' | 'notes' | 'editor'
  const [mobileView, setMobileView] = useState<'folders' | 'notes' | 'editor'>('folders');

  // Inicializar usuario y cargar datos
  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      // Verificar si hay sesión activa
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error al inicializar usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = (id: string) => {
    setUserId(id);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserId(null);
      setIsAuthenticated(false);
      setNotes([]);
      setFolders([]);
      setSelectedNote(null);
      setSelectedFolderId(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Cargar datos cuando el usuario esté listo
  useEffect(() => {
    if (userId) {
      loadFolders();
      loadNotes();
      subscribeToChanges();
    }
  }, [userId]);

  const loadFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const foldersWithCount: Folder[] = (data || []).map(f => ({
        id: f.id,
        name: f.name,
        color: f.color,
        noteCount: 0
      }));
      
      setFolders(foldersWithCount);
    } catch (error) {
      console.error('Error al cargar carpetas:', error);
    }
  };

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      const notesData: Note[] = (data || []).map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        folder_id: n.folder_id
      }));
      
      setNotes(notesData);
      if (notesData.length > 0 && !selectedNote) {
        setSelectedNote(notesData[0]);
      }
    } catch (error) {
      console.error('Error al cargar notas:', error);
    }
  };

  // Suscribirse a cambios en tiempo real
  const subscribeToChanges = () => {
    // Suscripción a cambios en carpetas
    supabase
      .channel('folders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'folders', filter: `user_id=eq.${userId}` },
        () => { loadFolders(); }
      )
      .subscribe();

    // Suscripción a cambios en notas
    supabase
      .channel('notes-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${userId}` },
        () => { loadNotes(); }
      )
      .subscribe();
  };

  // Filtrar notas según la carpeta seleccionada
  const filteredNotes = selectedFolderId === null
    ? notes
    : notes.filter(note => note.folder_id === selectedFolderId);

  const handleContentChange = async (content: string) => {
    if (!selectedNote || !userId) return;

    // Actualizar estado local inmediatamente
    const updatedNotes = notes.map(note => 
      note.id === selectedNote.id ? { ...note, content } : note
    );
    setNotes(updatedNotes);

    // Guardar en Supabase
    try {
      const { error } = await supabase
        .from('notes')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', selectedNote.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error al guardar contenido:', error);
    }
  };

  const handleCreateFolder = async (name: string, color: string) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('folders')
        .insert([{ name, color, user_id: userId }])
        .select()
        .single();

      if (error) throw error;

      const newFolder: Folder = {
        id: data.id,
        name: data.name,
        color: data.color,
        noteCount: 0,
      };
      setFolders([...folders, newFolder]);
    } catch (error) {
      console.error('Error al crear carpeta:', error);
      alert('Error al crear carpeta');
    }
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('folders')
        .update({ name: newName })
        .eq('id', folderId);

      if (error) throw error;

      setFolders(folders.map(folder => 
        folder.id === folderId ? { ...folder, name: newName } : folder
      ));
    } catch (error) {
      console.error('Error al renombrar carpeta:', error);
    }
  };

  const handleRenameNote = async (noteId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq('id', noteId);

      if (error) throw error;

      setNotes(notes.map(note => 
        note.id === noteId ? { ...note, title: newTitle } : note
      ));
      if (selectedNote?.id === noteId) {
        setSelectedNote({ ...selectedNote, title: newTitle });
      }
    } catch (error) {
      console.error('Error al renombrar nota:', error);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      // Primero actualizar las notas que están en esta carpeta
      await supabase
        .from('notes')
        .update({ folder_id: null })
        .eq('folder_id', folderId);

      // Luego eliminar la carpeta
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      setFolders(folders.filter(folder => folder.id !== folderId));
      setNotes(notes.map(note => 
        note.folder_id === folderId ? { ...note, folder_id: null } : note
      ));
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }
    } catch (error) {
      console.error('Error al eliminar carpeta:', error);
      alert('Error al eliminar carpeta');
    }
  };

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim() || !userId) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: newNoteTitle.trim(),
          content: '<p>Escribe aquí...</p>',
          folder_id: selectedFolderId,
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;

      const newNote: Note = {
        id: data.id,
        title: data.title,
        content: data.content,
        folder_id: data.folder_id,
      };
      
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
      setNewNoteTitle('');
      setIsCreatingNote(false);
      setMobileView('editor');
    } catch (error) {
      console.error('Error al crear nota:', error);
      alert('Error al crear nota');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== noteId));
      
      if (selectedNote?.id === noteId) {
        const remainingNotes = notes.filter(note => note.id !== noteId);
        setSelectedNote(remainingNotes[0] || null);
      }
    } catch (error) {
      console.error('Error al eliminar nota:', error);
      alert('Error al eliminar nota');
    }
  };

  const handleMoveNote = async (noteId: string, targetFolderId: string | null) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ folder_id: targetFolderId, updated_at: new Date().toISOString() })
        .eq('id', noteId);

      if (error) throw error;

      setNotes(notes.map(n =>
        n.id === noteId ? { ...n, folder_id: targetFolderId } : n
      ));
    } catch (error) {
      console.error('Error al mover nota:', error);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onAuth={handleAuth} />;
  }

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
          onLogout={handleLogout}
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
