const fs = require('fs');

const municoesText = fs.readFileSync('CSV/Bases - Munições.csv', 'utf8');
const municoesLines = municoesText.split('\n').filter(Boolean).slice(1);
const municoes = municoesLines.map(l => {
  const parts = l.split(',');
  return { Codigo_Municao: parts[0], Nome_Item: parts[1], Tipo_Arma: parts[3] };
});

function getMunicoesCompativeis(armaNome, armaCategoria) {
  return municoes.filter(m => {
      const tipoMunicao = (m.Tipo_Arma || '').toLowerCase();
      
      const removeAcentos = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/-/g, ' ').trim();
      const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const tipoLimpo = removeAcentos(tipoMunicao);
      const nomeLimpo = removeAcentos((armaNome || '').toLowerCase());
      const catLimpo = removeAcentos((armaCategoria || '').toLowerCase());

      const allowedTypes = tipoLimpo.split(/[\/,]+/).map(t => t.trim()).filter(Boolean);

      if ((nomeLimpo === 'lanca nitrogenio' || nomeLimpo === 'lanca hidrogenio') && allowedTypes.includes('lanca chamas')) {
        return true;
      }

      for (const allowed of allowedTypes) {
        if (!allowed) continue;
        try {
          const allowedRegex = new RegExp(`\\b${escapeRegExp(allowed)}\\b`, 'i');
          if (allowedRegex.test(nomeLimpo)) return true;
          if (allowedRegex.test(catLimpo)) return true;
        } catch (e) { console.error(e); }
      }

      return false;
  });
}

console.log("Fuzil de caça =>", getMunicoesCompativeis("Fuzil de caça", "Armas Simples"));
console.log("Metralhadora =>", getMunicoesCompativeis("Metralhadora", "Armas Pesadas"));
