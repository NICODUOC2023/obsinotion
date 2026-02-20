// src/lib/SupabaseConnector.ts
// Connector para PowerSync - Descomentar cuando tengas las credenciales configuradas
// import { AbstractPowerSyncDatabase, PowerSyncBackendConnector } from '@powersync/react';
import { SupabaseClient } from '@supabase/supabase-js';

// Placeholder - configurar después con las credenciales reales
export class SupabaseConnector {
  supabase: SupabaseClient | null = null;

  constructor(_supabaseUrl: string, _supabaseAnonKey: string) {
    // Descomentar cuando tengas las credenciales
    // this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('SupabaseConnector creado - configurar con credenciales reales');
  }

  async fetchCredentials() {
    console.log('fetchCredentials - pendiente de configuración');
    return null;
  }

  async uploadData(_database: any): Promise<void> {
    console.log('uploadData - pendiente de configuración');
  }
}