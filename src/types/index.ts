// ============================================================
// TIPOS GLOBAIS — TUDO TIPADO
// ============================================================

export type Tela = 'atributos' | 'origens' | 'classe' | 'ficha';

export type ClasseRPG = 'Combatente' | 'Especialista' | 'Ocultista' | null;

export type AtributoKey = 'FOR' | 'AGI' | 'INT' | 'PRE' | 'VIG';

export type AbaDireita = 'combate' | 'habilidades' | 'rituais' | 'inventario' | 'descricao' | 'regras';

// 🔥 ADICIONADO: 'paranormais'
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
  Fonte: string;
}

// 🔥 NOVO TIPO: Poder Paranormal
export interface PoderParanormal {
  codigo_poder: number;
  Nome: string;
  Descricao: string;
  PreRequisitos: string;
  Afinidade: string;
  Elemento: string;   // Sangue | Morte | Energia | Conhecimento | Medo
  Fonte: string;
  PreRequisitosAfinidade?: string; // 🔥 ADICIONAR AQUI (coluna Pre_Requisitos_Afinidade)
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
  fonte?: string;
  afinidade?: string;
  tipo?: string;
}

export interface PoderesEscolhidos {
  [nex: number]: PoderSlot;
}

// 🔥 ADICIONADO: 'paranormais'
export type CategoriaHabilidade = 'origem' | 'classe' | 'utilidade' | 'combate' | 'paranormais' | 'gerais';

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
  // 🔥 CAMPOS NOVOS para poderes paranormais
  elemento?: string;
  afinidade?: string;
  categoria: CategoriaHabilidade;
}

export interface LimiteCirculos {
  c1: number;
  c2: number;
  c3: number;
  c4: number;
}

// ============================================================
// RITUAL — Tabela "Rituais" do Supabase
// ============================================================
export type VersaoRitual = 'normal' | 'discente' | 'verdadeiro';

export interface Ritual {
  Codigo_Ritual: number;
  Nome_Ritual: string;
  Descricao_Ritual: string;
  Elemento_Ritual: string;
  Circulo_Ritual: number;
  PE_Ritual: string;
  Execucao_Ritual: string;
  Alcance_Ritual: string;
  Area_Ritual: string;
  Alvo_Ritual: string;
  Duracao_Ritual: string;
  Efeito_Ritual: string;
  Resistencia_Ritual: string;
  Dados_Ritual: string;
  Tem_Discente: boolean;
  Tem_Verdadeiro: boolean;
  Imagem: string;
  Requisito_Discente: string;
  Requisito_Verdadeiro: string;
}