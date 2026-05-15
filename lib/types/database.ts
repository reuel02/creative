/**
 * lib/types/database.ts
 *
 * Tipos TypeScript espelhando o schema "creative" do Supabase.
 * Atualizar conforme novas tabelas ou colunas forem adicionadas.
 */

// ─── Tabelas ──────────────────────────────────────────────────────────────────

export interface Departamento {
  id: number;
  nome: string;
  descricao: string | null;
  criado_em: string;
  updated_at: string;
}

export interface Culto {
  id: number;
  nome: string;
  data: string; // ISO 8601 com timezone
  criado_em: string;
  updated_at: string;
}

export interface Voluntario {
  id: number;
  nome: string;
  telefone: string | null;
  cargo: string;
  departamento_id: number | null;
  ativo: boolean;
  criado_em: string;
  updated_at: string;
}

export interface Escala {
  id: number;
  data_hora: string;
  culto_id: number | null;
  departamento_id: number;
  observacoes: string | null;
  criado_por: string | null; // UUID do auth.users
  criado_em: string;
  updated_at: string;
}

export interface EscalaVoluntario {
  id: number;
  escala_id: number;
  voluntario_id: number;
  confirmado: boolean;
}

// ─── Joins e Views ────────────────────────────────────────────────────────────

/** Voluntário com nome do departamento (join) */
export interface VoluntarioComDepartamento extends Voluntario {
  departamentos: Pick<Departamento, 'id' | 'nome'> | null;
}

/** Linha da view vw_escalas_mensais */
export interface EscalaMensal {
  escala_id: number;
  data_hora: string;
  dia: string; // YYYY-MM-DD
  dia_formatado: string; // DD/MM/YYYY
  dia_semana: string; // "Segunda", "Terça", etc.
  mes: number;
  ano: number;
  departamento_id: number;
  departamento_nome: string;
  observacoes: string | null;
  total_voluntarios: number;
  status: 'confirmada' | 'alerta' | 'critica';
  voluntarios: Array<{
    id: number;
    nome: string;
    cargo: string;
  }>;
}

// ─── Métricas ─────────────────────────────────────────────────────────────────

export interface DashboardMetricas {
  total_schedules: number;
  total_users: number;
  total_departments: number;
  total_cults: number;
}

// ─── Database (estrutura para createClient<Database>) ─────────────────────────

export type Database = {
  creative: {
    Tables: {
      departamentos: {
        Row: Departamento;
        Insert: Omit<Departamento, 'id' | 'criado_em' | 'updated_at'>;
        Update: Partial<Omit<Departamento, 'id' | 'criado_em' | 'updated_at'>>;
      };
      cultos: {
        Row: Culto;
        Insert: Omit<Culto, 'id' | 'criado_em' | 'updated_at'>;
        Update: Partial<Omit<Culto, 'id' | 'criado_em' | 'updated_at'>>;
      };
      voluntarios: {
        Row: Voluntario;
        Insert: Omit<Voluntario, 'id' | 'criado_em' | 'updated_at'>;
        Update: Partial<Omit<Voluntario, 'id' | 'criado_em' | 'updated_at'>>;
      };
      escalas: {
        Row: Escala;
        Insert: Omit<Escala, 'id' | 'criado_em' | 'updated_at'>;
        Update: Partial<Omit<Escala, 'id' | 'criado_em' | 'updated_at'>>;
      };
      escala_voluntarios: {
        Row: EscalaVoluntario;
        Insert: Omit<EscalaVoluntario, 'id'>;
        Update: Partial<Omit<EscalaVoluntario, 'id'>>;
      };
    };
    Views: {
      vw_escalas_mensais: {
        Row: EscalaMensal;
      };
    };
    Functions: {
      fn_dashboard_metricas: {
        Args: Record<never, never>;
        Returns: DashboardMetricas;
      };
    };
  };
};
