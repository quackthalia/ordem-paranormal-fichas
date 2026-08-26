import React from 'react';
import { useState, useMemo } from 'react';
import { useRPG } from '../../context/RPGContext';
import type { Arma } from '../../types';

import { formatarTexto } from '../../utils/formatters';
import { CustomSelect } from '../../components/CustomSelect';
import { Collapse } from '../../components/Collapse';

export function formatarCritico(critico: number, multiplicador: number): string {
  if (critico === 20 && multiplicador === 2) return 'x2';
  if (critico !== 20 && multiplicador === 2) return `${critico}`;
  if (critico === 20 && multiplicador !== 2) return `x${multiplicador}`;
  return `${critico}/x${multiplicador}`;
}

interface ModalArmasProps {
  aberto: boolean;
  onFechar: () => void;
}

export function ModalArmas({ aberto, onFechar }: ModalArmasProps) {
  React.useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    setExpandidos([]);
    setBusca('');
    setFiltro('Todas');
    setFiltroTipo('Todos');
    setFiltroEmpunhadura('Todas');
    setFiltroAlcance('Todos');
    setMostrarFiltrosAvançados(false);
    return () => { document.body.style.overflow = 'unset'; };
  }, [aberto]);

  const { armasHook, proficienciasTotais, status, atributosFinais, regrasAutomaticasAtivas } = useRPG();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<string>('Todas'); // Proficiência
  const [mostrarFiltrosAvançados, setMostrarFiltrosAvançados] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>('Todos');
  const [filtroEmpunhadura, setFiltroEmpunhadura] = useState<string>('Todas');
  const [filtroAlcance, setFiltroAlcance] = useState<string>('Todos');
  
  const [expandidos, setExpandidos] = useState<number[]>([]);

  const calcularDT = (dtItem: string | null, isExplosivo: boolean = false): string | null => {
    if (!dtItem) return null;
    
    if (dtItem.includes('/')) {
      return dtItem.split('/').map(part => calcularDT(part.trim(), isExplosivo)).join(' / ');
    }

    let pericia = '';
    let val = dtItem.trim();
    
    if (val.includes(',')) {
      const parts = val.split(',');
      val = parts.pop()!.trim();
      pericia = parts.join(',').trim();
    }

    let calculado: string | number = 0;
    const isAtributo = ['FOR', 'AGI', 'INT', 'PRE', 'VIG'].includes(val.toUpperCase());
    
    if (isAtributo) {
      calculado = 10 + status.peTurno + (atributosFinais[val.toUpperCase() as keyof typeof atributosFinais] || 0);
    } else {
      const numVal = Number(val);
      calculado = isNaN(numVal) ? val : numVal;
    }
    
    if (isExplosivo && regrasAutomaticasAtivas.has(29) && typeof calculado === 'number') {
      calculado += atributosFinais.INT;
    }
    
    if (pericia) {
      return `${pericia} ${calculado}`;
    }
    return `${calculado}`;
  };

  const toggleExpandir = (id: number) => {
    setExpandidos(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  if (!aberto) return null;

  const filtros = [
    { label: 'Todas', valor: 'Todas' },
    { label: 'Simples', valor: 'Armas Simples' },
    { label: 'Táticas', valor: 'Armas Táticas' },
    { label: 'Pesadas', valor: 'Armas Pesadas' },
  ];

  const armasFiltradas = armasHook.armas.filter((arma: Arma) => {
    // 1. Filtro Proficiência (Simples, Táticas, Pesadas)
    if (filtro !== 'Todas' && arma.Proficiencia !== filtro) return false;
    
    // 2. Filtro Busca por nome
    if (busca && !arma.Nome_Item.toLowerCase().includes(busca.toLowerCase())) return false;
    
    // 3. Filtros Avançados
    if (filtroTipo !== 'Todos' && arma.Tipo_Arma !== filtroTipo) return false;
    if (filtroEmpunhadura !== 'Todas' && arma.Empunhadura_Arma !== filtroEmpunhadura) return false;
    
    if (filtroAlcance !== 'Todos') {
      const alcance = arma.Alcance_Item?.trim().toLowerCase() || '';
      if (filtroAlcance === 'Corpo a Corpo' && alcance !== '-' && alcance !== '') return false;
      if (filtroAlcance !== 'Corpo a Corpo' && !alcance.includes(filtroAlcance.toLowerCase())) return false;
    }
    
    return true;
  }).sort((a: Arma, b: Arma) => a.Nome_Item.localeCompare(b.Nome_Item));

  const uniqueTipos = Array.from(new Set(armasHook.armas.map(a => a.Tipo_Arma))).filter(Boolean).sort();
  const uniqueEmpunhaduras = Array.from(new Set(armasHook.armas.map(a => a.Empunhadura_Arma))).filter(Boolean).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={onFechar}>
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg uppercase tracking-wide text-zinc-100">
                ADICIONAR ARMA
              </h3>
              <p className="mt-1 text-xs text-zinc-400">Selecione uma arma para adicionar ao inventário.</p>
            </div>
            <button onClick={onFechar} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>
          <div className="flex items-stretch gap-2">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar arma pelo nome..."
              className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-green-700"
            />
            <button 
              onClick={() => setMostrarFiltrosAvançados(!mostrarFiltrosAvançados)}
              className={`rounded border px-3 py-1.5 text-sm font-bold uppercase tracking-wider transition ${
                mostrarFiltrosAvançados || filtroTipo !== 'Todos' || filtroEmpunhadura !== 'Todas' || filtroAlcance !== 'Todos'
                  ? 'border-green-800 bg-green-900/40 text-green-300'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              Filtros
            </button>
          </div>
        </div>

        {/* Filtros Avançados */}
        <Collapse isOpen={mostrarFiltrosAvançados} className="z-50">

          <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800 bg-zinc-900/90 px-4 py-3">
            <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[120px] ">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Proficiência</label>
              <CustomSelect
                value={filtro}
                onChange={setFiltro}
                options={filtros.map(f => ({ value: f.valor, label: f.label }))}
                wrapperClassName="w-full"
              />
            </div>
            <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[120px] ">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Tipo de Arma</label>
              <CustomSelect
                value={filtroTipo}
                onChange={setFiltroTipo}
                options={[{ value: 'Todos', label: 'Todos os Tipos' }, ...uniqueTipos.map(t => ({ value: t, label: t }))]}
                wrapperClassName="w-full"
              />
            </div>
            
            <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[120px] ">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Empunhadura</label>
              <CustomSelect
                value={filtroEmpunhadura}
                onChange={setFiltroEmpunhadura}
                options={[{ value: 'Todas', label: 'Todas as Empunhaduras' }, ...uniqueEmpunhaduras.map(t => ({ value: t, label: t }))]}
                wrapperClassName="w-full"
              />
            </div>
            
            <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[120px] ">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Alcance</label>
              <CustomSelect
                value={filtroAlcance}
                onChange={setFiltroAlcance}
                options={[
                  { value: 'Todos', label: 'Todos os Alcances' },
                  { value: 'Corpo a Corpo', label: 'Corpo a Corpo' },
                  { value: 'Curto', label: 'Curto' },
                  { value: 'Médio', label: 'Médio' },
                  { value: 'Longo', label: 'Longo' },
                  { value: 'Extremo', label: 'Extremo' }
                ]}
                wrapperClassName="w-full"
              />
            </div>
          </div>
        
        </Collapse>

        {/* Lista de armas */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-3 items-start">
            <div className="flex flex-col gap-3 w-full md:w-1/2 flex-1 min-w-0">
              {armasFiltradas.filter((_, i) => i % 2 === 0).map((arma: Arma) => {
                const isExpanded = expandidos.includes(arma.Codigo_Arma);
                const critico = formatarCritico(arma.Critico_Arma, arma.Multiplicador_Arma);
                const hasProficiencia = proficienciasTotais.includes(arma.Proficiencia);
                return (
                  <div 
                    key={arma.Codigo_Arma} 
                    className={`bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col `}
                  >
                    {/* Bloco fechado */}
                    <div
                      className="flex items-start justify-between gap-2 mb-2 cursor-pointer "
                      onClick={() => toggleExpandir(arma.Codigo_Arma)}
                    >
                      <h3 className="font-bold text-zinc-200 group-hover:text-green-400 transition select-none flex-1 mt-0.5 truncate">
                        {arma.Nome_Item}
                      </h3>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {arma['Agil?'] && (
                          <span className="relative group/agil cursor-help">
                            <span className="text-sm text-yellow-400">⚡</span>
                            <span className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover/agil:opacity-100 group-hover/agil:visible transition-all duration-300 group-hover/agil:delay-500 delay-0 w-48 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                              Permite que você aplique sua Agilidade em vez de sua Força em testes de ataque e rolagens de dano.
                            </span>
                          </span>
                        )}
                        {arma['Automatica?'] && (
                          <span className="relative group/auto cursor-help">
                            <span className="text-sm text-blue-400">🔄</span>
                            <span className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover/auto:opacity-100 group-hover/auto:visible transition-all duration-300 group-hover/auto:delay-500 delay-0 w-48 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                              Pode disparar tiros únicos ou rajadas (-1d20 no ataque, +1 dado de dano).
                            </span>
                          </span>
                        )}
                        {!hasProficiencia && (
                          <span className="relative group/prof cursor-help">
                            <span className="text-sm text-red-500">⚠️</span>
                            <span className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover/prof:opacity-100 group-hover/prof:visible transition-all duration-300 group-hover/prof:delay-500 delay-0 w-48 p-2 bg-zinc-800 border border-green-700/50 text-xs text-green-200 rounded z-50 text-center shadow-lg pointer-events-none">
                              Se você atacar com uma arma com a qual não seja proficiente, sofre -2d20 nos testes de ataque.
                            </span>
                          </span>
                        )}
                        <span className="w-5 text-center text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 cursor-pointer flex flex-col" onClick={() => toggleExpandir(arma.Codigo_Arma)}>
                      <div className="flex items-center flex-nowrap gap-3 text-xs overflow-hidden text-zinc-300 mb-2">
                        <span>
                          <span className="font-bold text-green-400">Dado:</span> {arma.Dano_Arma}
                        </span>
                        {critico && (
                          <span>
                            <span className="font-bold text-zinc-400">Crítico:</span> {critico}
                          </span>
                        )}
                        {arma.dt_item && <span><span className="font-bold text-green-400">DT:</span> {calcularDT(arma.dt_item, arma.Categoria_Item?.toLowerCase().includes('explosivos') || arma.Nome_Item?.toLowerCase().includes('explosivo'))}</span>}
                      </div>
                      
                      <div className="text-[11px] mb-3 block text-zinc-400 truncate">
                        <span className="font-bold text-zinc-200">{arma.Proficiencia}</span>
                        <span className="text-zinc-600"> — </span>
                        <span className="italic">{arma.Tipo_Arma}</span>
                        <span className="text-zinc-600"> — </span>
                        <span className="italic">{arma.Empunhadura_Arma}</span>
                        <span className="text-zinc-600"> — </span>
                        <span className="italic">{arma.Tipo_Dano_Arma}</span>
                        
                      </div>

                      <div className="flex flex-col gap-1 mt-1 mb-3">
                            <Collapse isOpen={isExpanded} previewHeight="3.2em">
                              <p className="text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap select-none min-h-[3.2em]">{arma.Descricao_Item ? formatarTexto(arma.Descricao_Item) : 'Nenhuma descrição adicional.'}</p>
                            </Collapse>
                          </div>
                        <Collapse isOpen={isExpanded}>
                          {arma.Fonte_Arma && (
                            <div className="flex justify-between items-center mb-2 pt-2 border-t border-zinc-800/50">
                              <span className="text-[10px] uppercase tracking-wider text-zinc-600">Fonte: {arma.Fonte_Arma}</span>
                            </div>
                          )}
                        </Collapse>
                    </div>

                    <div className="flex flex-nowrap items-center gap-x-3 mt-auto overflow-hidden text-[11px] border-t border-zinc-800/50 pt-2">
                      <span className="truncate"><span className="text-zinc-500 font-semibold">Espaços:</span> {(regrasAutomaticasAtivas.has(43) && (arma['Espaços_Item'] === 0.5 || String(arma['Espaços_Item']) === '0,5' || String(arma['Espaços_Item']) === '0.5')) ? 0.25 : arma['Espaços_Item']}</span>
                      <span className="truncate"><span className="text-zinc-500 font-semibold">Categoria:</span> {arma.Categoria_Item}</span>
                      {arma.Alcance_Item && <span className="truncate"><span className="text-zinc-500 font-semibold">Alcance:</span> {arma.Alcance_Item}</span>}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          armasHook.adicionarArma(arma);
                          onFechar();
                        }}
                        className="ml-auto shrink-0 px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col gap-3 w-full md:w-1/2 flex-1 min-w-0">
              {armasFiltradas.filter((_, i) => i % 2 !== 0).map((arma: Arma) => {
                const isExpanded = expandidos.includes(arma.Codigo_Arma);
                const critico = formatarCritico(arma.Critico_Arma, arma.Multiplicador_Arma);
                const hasProficiencia = proficienciasTotais.includes(arma.Proficiencia);
                return (
                  <div 
                    key={arma.Codigo_Arma} 
                    className={`bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col `}
                  >
                    {/* Bloco fechado */}
                    <div
                      className="flex items-start justify-between gap-2 mb-2 cursor-pointer "
                      onClick={() => toggleExpandir(arma.Codigo_Arma)}
                    >
                      <h3 className="font-bold text-zinc-200 group-hover:text-green-400 transition select-none flex-1 mt-0.5 truncate">
                        {arma.Nome_Item}
                      </h3>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {arma['Agil?'] && (
                          <span className="relative group/agil cursor-help">
                            <span className="text-sm text-yellow-400">⚡</span>
                            <span className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover/agil:opacity-100 group-hover/agil:visible transition-all duration-300 group-hover/agil:delay-500 delay-0 w-48 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                              Permite que você aplique sua Agilidade em vez de sua Força em testes de ataque e rolagens de dano.
                            </span>
                          </span>
                        )}
                        {arma['Automatica?'] && (
                          <span className="relative group/auto cursor-help">
                            <span className="text-sm text-blue-400">🔄</span>
                            <span className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover/auto:opacity-100 group-hover/auto:visible transition-all duration-300 group-hover/auto:delay-500 delay-0 w-48 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                              Pode disparar tiros únicos ou rajadas (-1d20 no ataque, +1 dado de dano).
                            </span>
                          </span>
                        )}
                        {!hasProficiencia && (
                          <span className="relative group/prof cursor-help">
                            <span className="text-sm text-red-500">⚠️</span>
                            <span className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover/prof:opacity-100 group-hover/prof:visible transition-all duration-300 group-hover/prof:delay-500 delay-0 w-48 p-2 bg-zinc-800 border border-green-700/50 text-xs text-green-200 rounded z-50 text-center shadow-lg pointer-events-none">
                              Se você atacar com uma arma com a qual não seja proficiente, sofre -2d20 nos testes de ataque.
                            </span>
                          </span>
                        )}
                        <span className="w-5 text-center text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 cursor-pointer flex flex-col" onClick={() => toggleExpandir(arma.Codigo_Arma)}>
                      <div className="flex items-center flex-nowrap gap-3 text-xs overflow-hidden text-zinc-300 mb-2">
                        <span>
                          <span className="font-bold text-green-400">Dado:</span> {arma.Dano_Arma}
                        </span>
                        {critico && (
                          <span>
                            <span className="font-bold text-zinc-400">Crítico:</span> {critico}
                          </span>
                        )}
                        {arma.dt_item && <span><span className="font-bold text-green-400">DT:</span> {calcularDT(arma.dt_item, arma.Categoria_Item?.toLowerCase().includes('explosivos') || arma.Nome_Item?.toLowerCase().includes('explosivo'))}</span>}
                      </div>
                      
                      <div className="text-[11px] mb-3 block text-zinc-400 truncate">
                        <span className="font-bold text-zinc-200">{arma.Proficiencia}</span>
                        <span className="text-zinc-600"> — </span>
                        <span className="italic">{arma.Tipo_Arma}</span>
                        <span className="text-zinc-600"> — </span>
                        <span className="italic">{arma.Empunhadura_Arma}</span>
                        <span className="text-zinc-600"> — </span>
                        <span className="italic">{arma.Tipo_Dano_Arma}</span>
                        
                      </div>

                      <div className="flex flex-col gap-1 mt-1 mb-3">
                            <Collapse isOpen={isExpanded} previewHeight="3.2em">
                              <p className="text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap select-none min-h-[3.2em]">{arma.Descricao_Item ? formatarTexto(arma.Descricao_Item) : 'Nenhuma descrição adicional.'}</p>
                            </Collapse>
                          </div>
                        <Collapse isOpen={isExpanded}>
                          {arma.Fonte_Arma && (
                            <div className="flex justify-between items-center mb-2 pt-2 border-t border-zinc-800/50">
                              <span className="text-[10px] uppercase tracking-wider text-zinc-600">Fonte: {arma.Fonte_Arma}</span>
                            </div>
                          )}
                        </Collapse>
                    </div>

                    <div className="flex flex-nowrap items-center gap-x-3 mt-auto overflow-hidden text-[11px] border-t border-zinc-800/50 pt-2">
                      <span className="truncate"><span className="text-zinc-500 font-semibold">Espaços:</span> {(regrasAutomaticasAtivas.has(43) && (arma['Espaços_Item'] === 0.5 || String(arma['Espaços_Item']) === '0,5' || String(arma['Espaços_Item']) === '0.5')) ? 0.25 : arma['Espaços_Item']}</span>
                      <span className="truncate"><span className="text-zinc-500 font-semibold">Categoria:</span> {arma.Categoria_Item}</span>
                      {arma.Alcance_Item && <span className="truncate"><span className="text-zinc-500 font-semibold">Alcance:</span> {arma.Alcance_Item}</span>}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          armasHook.adicionarArma(arma);
                          onFechar();
                        }}
                        className="ml-auto shrink-0 px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {armasFiltradas.length === 0 && (
            <p className="text-center text-zinc-600 text-sm py-8 mt-4 border border-dashed border-zinc-800 rounded">
              Nenhuma arma encontrada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
