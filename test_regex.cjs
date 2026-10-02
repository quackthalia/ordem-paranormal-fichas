const m = { Nome_Item: 'Balas longas', Tipo_Arma: 'Fuzil / Metralhadora' };
const armaNome = 'Fuzil de caça';
const tipoMunicao = m.Tipo_Arma.toLowerCase();

const removeAcentos = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/-/g, ' ').trim();
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const tipoLimpo = removeAcentos(tipoMunicao);
const nomeLimpo = removeAcentos(armaNome.toLowerCase());
const allowedTypes = tipoLimpo.split(/[\/,]+/).map(t => t.trim()).filter(Boolean);

console.log('allowedTypes:', allowedTypes, 'nomeLimpo:', nomeLimpo);
for (const allowed of allowedTypes) {
  const regex = new RegExp(`\\b${escapeRegExp(allowed)}\\b`, 'i');
  console.log('regex:', regex, 'test:', regex.test(nomeLimpo));
}
