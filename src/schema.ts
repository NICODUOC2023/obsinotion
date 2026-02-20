// Schema para PowerSync - Configurar cuando tengas las credenciales de Supabase
// import { Schema, Table } from '@powersync/react';

// Por ahora, exportamos un schema placeholder
export const AppSchema = {
  tables: [
    {
      name: 'notes',
      columns: [
        { name: 'user_id', type: 'TEXT' },
        { name: 'title', type: 'TEXT' },
        { name: 'content', type: 'TEXT' },
        { name: 'folder', type: 'TEXT' },
        { name: 'is_favorite', type: 'INTEGER' },
        { name: 'created_at', type: 'TEXT' },
        { name: 'updated_at', type: 'TEXT' }
      ]
    }
  ]
};
