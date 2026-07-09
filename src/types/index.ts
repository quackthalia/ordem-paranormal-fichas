// ============================================================
// TIPOS GLOBAIS — TUDO TIPADO
// ============================================================

export type Tela = 'atributos' | 'origens' | 'classe' | 'ficha';

export type ClasseRPG = 'Combatente' | 'Especialista' | 'Ocultista' | null;

export type AtributoKey = 'FOR' | 'AGI' | 'INT' | 'PRE' | 'VIG';

export type AbaDireita = 'combate' | 'habilidades' | 'rituais' | 'inventario' | 'descricao';

export type AbaModalPoderes = 'classe' | 'gerais' | 'combate';

export interface Atributos {
  FOR: number;
  AGI: number;
  INT: number;
  PRE: number;
  VIG: number;
}

export interface Pericia {
  id: number;
  atributo: AtributoKey;
  treino: number;   // 0 | 5 | 10 | 15
  outros: number;
}

export type PericiasMap = Record<string, Pericia>;

export interface Poder {
  codigo_poder: number;
  Nome: string;
  Descricao: string;
  Classe: string;
  Tipo: string;
  PreRequisitos: string;
}

export interface Origem {
  Codigo_Origem: number;
  Nome: string;
  Descricao: string;
  Pericia_Treinada_1: number;
  Pericia_Treinada_2: number;
  Pericia_Treinada_Especial: number | null;
  Nome_Poder: string;
  Descricao_Poder: string;
  Fonte: string;
}

export interface OrigemSelecionada extends Origem {
  nome_p1: string;
  nome_p2: string;
  nome_pesp: string | null;
}

export interface PoderSlot {
  nome: string;
  descricao: string;
  preRequisitos?: string;
}

export interface PoderesEscolhidos {
  [nex: number]: PoderSlot;
}

export interface HabilidadeItem {
  id: string;
  nome: string;
  descricao: string;
  tipo: string;
  extra?: string | null;
  subPoder?: { nome: string; descricao: string; extra?: string } | null;
  preRequisitos?: string;
  isSlotVazio?: boolean;
  nexDoSlot?: number;
  limiteCirculos?: LimiteCirculos;
}

export interface LimiteCirculos {
  c1: number;
  c2: number;
  c3: number;
  c4: number;
}