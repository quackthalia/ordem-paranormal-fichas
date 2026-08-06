import React from 'react';

export function formatarTexto(texto: string) {
  if (!texto) return texto;

  // Divide o texto onde encontrar *texto* ou _texto_
  const parts = texto.split(/(\*[^*]+\*|_[^_]+_)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <strong key={index} className="font-bold text-zinc-200">{part.slice(1, -1)}</strong>;
    }
    if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
      return <em key={index} className="italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
