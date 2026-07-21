// ============================================================
// TIPOS GLOBAIS — TUDO TIPADO
// ============================================================

export type Tela = 'atributos' | 'origens' | 'classe' | 'ficha';

export type ClasseRPG = 'Combatente' | 'Especialista' | 'Ocultista' | null;

export type AtributoKey = 'FOR' | 'AGI' | 'INT' | 'PRE' | 'VIG';

export type AbaDireita = 'combate' | 'habilidades' | 'rituais' | 'inventario' | 'descricao';

export type AbaModalPoderes = 'classe' | 'gerais' | 'combate' | 'paranormais';

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
  treino: number;
  outros: number;
  kit?: boolean;
  descricao?: string;
}

export type PericiasMap = Record<string, Pericia>;

export interface Poder {
  codigo_poder: number;
  Nome: string;
  Descricao: string;
  Classe: string;
  Tipo: string;
  PreRequisitos: string;
  Fonte: string;
  Pre_Codigo?: number | null;
}

export interface PoderParanormal {
  codigo_poder: number;
  Nome: string;
  Descricao: string;
  PreRequisitos: string;
  Afinidade: string;
  Elemento: string;
  Fonte: string;
  Pre_Codigo?: number | null;
  PreRequisitosAfinidade?: string;
  Pre_Codigo_Afinidade?: number | null;
}

export interface GrupoOrigem {
  Codigo_Grupo: number;
  Nome_Grupo: string;
  Descricao_Grupo: string;
}

export interface Origem {
  Codigo_Origem: number;
  Codigo_Grupo?: number | null;
  Codigo_Regra?: number | null;
  Codigo_Per_Regra?: number | null;
  Nome: string;
  Descricao: string;
  Pericia_Treinada_1: number;
  Pericia_Treinada_2: number;
  Pericia_Treinada_Especial: string | number | null;
  Nome_Poder: string;
  Descricao_Poder: string;
  Fonte: string;
}

export interface OrigemSelecionada extends Origem {
  nome_p1: string;
  nome_p2: string;
  nome_pesp: string | null;
  escolhaRegra6?: 'p2' | 'pesp' | null;
}

export interface PoderSlot {
  nome: string;
  descricao: string;
  preRequisitos?: string;
  fonte?: string;
  afinidade?: string;
  elemento?: string;
  categoria?: 'utilidade' | 'combate' | 'gerais' | 'paranormais' | 'trilha';
}

export interface PoderesEscolhidos {
  [id: string]: PoderSlot;
}

export type CategoriaHabilidade = 'origem' | 'classe' | 'utilidade' | 'gerais' | 'combate' | 'paranormais';

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
  fonte?: string;
  elemento?: string;
  afinidade?: string;
  afinidadeAtiva?: boolean;
  afinidadeAdquiridaKey?: string | number;
  categoria: CategoriaHabilidade | 'trilha';
}

export interface LimiteCirculos {
  c1: number;
  c2: number;
  c3: number;
  c4: number;
}

export interface Trilha {
  Codigo_Trilha: number;
  Classe_Trilha: string;
  Nome_Trilha: string;
  Descricao_Trilha: string;
  Especial_Trilha?: string;
  Perícia_Trilha: number;
  Codigo_Regra_10?: number;
  Nome_Habilidade_10: string;
  Descricao_Habilidade_10: string;
  Codigo_Regra_40?: number;
  Nome_Habilidade_40: string;
  Descricao_Habilidade_40: string;
  Codigo_Regra_65?: number;
  Nome_Habilidade_65: string;
  Descricao_Habilidade_65: string;
  Codigo_Regra_99?: number;
  Nome_Habilidade_99: string;
  Descricao_Habilidade_99: string;
  Fonte_Trilha: string;
}

export interface TrilhaSelecionada extends Trilha {
  nome_pericia: string | null;
}