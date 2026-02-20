// src/components/FolderSidebar.tsx
import React, { useState } from 'react';

interface Folder {
  id: string;
  name: string;
  color: string;
  noteCount: number;
}

interface FolderSidebarProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, color: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

const FolderSidebar: React.FC<FolderSidebarProps> = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray'];
  const [selectedColor, setSelectedColor] = useState('blue');

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), selectedColor);
      setNewFolderName('');
      setIsCreating(false);
      setSelectedColor('blue');
    }
  };

  const handleRenameFolder = (folderId: string) => {
    if (editingName.trim()) {
      onRenameFolder(folderId, editingName.trim());
      setEditingFolderId(null);
      setEditingName('');
    }
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      red: 'text-red-400',
      orange: 'text-orange-400',
      yellow: 'text-yellow-400',
      green: 'text-green-400',
      blue: 'text-blue-400',
      purple: 'text-purple-400',
      pink: 'text-pink-400',
      gray: 'text-gray-400',
    };
    return colorMap[color] || 'text-gray-400';
  };

  return (
    <aside className="w-64 flex-shrink-0 p-4 border-r border-gray-700 bg-gray-900 flex flex-col">
      <h1 className="text-xl font-bold mb-6 text-white">Obsinotion</h1>

      {/* Todas las notas */}
      <div
        onClick={() => onSelectFolder(null)}
        className={`flex items-center justify-between p-2 rounded cursor-pointer mb-2 ${
          selectedFolderId === null ? 'bg-gray-700' : 'hover:bg-gray-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-400">📝</span>
          <span className="text-sm">Todas las notas</span>
        </div>
      </div>

      <div className="border-t border-gray-700 my-3"></div>

      {/* Carpetas */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase">Carpetas</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="text-gray-400 hover:text-white text-xl leading-none"
          title="Nueva carpeta"
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`group flex items-center justify-between p-2 rounded cursor-pointer ${
              selectedFolderId === folder.id ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`}
          >
            {editingFolderId === folder.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleRenameFolder(folder.id)}
                onKeyPress={(e) => e.key === 'Enter' && handleRenameFolder(folder.id)}
                className="bg-gray-600 text-white px-2 py-1 rounded text-sm flex-1"
                autoFocus
              />
            ) : (
              <>
                <div
                  onClick={() => onSelectFolder(folder.id)}
                  className="flex items-center gap-2 flex-1"
                >
                  <span className={getColorClass(folder.color)}>📁</span>
                  <span className="text-sm truncate">{folder.name}</span>
                  <span className="text-xs text-gray-500">({folder.noteCount})</span>
                </div>
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingFolderId(folder.id);
                      setEditingName(folder.name);
                    }}
                    className="text-gray-400 hover:text-white text-xs p-1"
                    title="Renombrar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`¿Eliminar la carpeta "${folder.name}"?`)) {
                        onDeleteFolder(folder.id);
                      }
                    }}
                    className="text-gray-400 hover:text-red-400 text-xs p-1"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Formulario de nueva carpeta */}
      {isCreating && (
        <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nombre de la carpeta"
            className="w-full bg-gray-700 text-white px-3 py-2 rounded mb-2 text-sm"
            autoFocus
          />
          <div className="flex gap-1 mb-3 flex-wrap">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full ${
                  selectedColor === color ? 'ring-2 ring-white' : ''
                }`}
                style={{
                  backgroundColor: color === 'gray' ? '#6b7280' : color,
                }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateFolder}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm"
            >
              Crear
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewFolderName('');
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default FolderSidebar;
