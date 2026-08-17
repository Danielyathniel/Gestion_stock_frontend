import * as XLSX from 'xlsx';

export function exportToExcel(articles, entreprise = 'STOCKFLOW') {
  // ON ENLÈVE ID, STATUS et ACTIONS
  const data = articles.map((article) => ({
    'Référence': article.reference || '',
    'Article': article.nom || '',
    'Catégorie': article.categorie || '-',
    'Stock Actuel': article.stock || 0,
    'Stock Minimum': article.stockMin || 0,
    'Prix Achat (FCFA)': article.prixAchat || 0,
    'Prix Vente (FCFA)': article.prixVente || 0,
    'Unité': article.unite || 'unité',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // * LARGEUR DES COLONNES
  ws['!cols'] = [
    { wch: 18 }, // Référence
    { wch: 25 }, // Article
    { wch: 20 }, // Catégorie
    { wch: 14 }, // Stock Actuel
    { wch: 16 }, // Stock Minimum
    { wch: 18 }, // Prix Achat
    { wch: 18 }, // Prix Vente
    { wch: 12 }, // Unité
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Articles');

  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const fileName = `RAPPORT_ARTICLES_${dateStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}