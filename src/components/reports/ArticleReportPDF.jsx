import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// 🔴 STYLES SIMPLES SANS POLICES EXTERNES
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
  },
  header: {
    borderBottom: '1px solid #1e293b',
    paddingBottom: 10,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
  headerDate: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 6,
    marginTop: 10,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottom: '1px solid #f1f5f9',
  },
  tableRowText: {
    fontSize: 8,
    color: '#0f172a',
    flex: 1,
  },
  footer: {
    marginTop: 20,
    borderTop: '1px solid #e2e8f0',
    paddingTop: 10,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
});

export default function ArticleReportPDF({ articles, entreprise = 'STOCKFLOW' }) {
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // 🔴 SI PAS D'ARTICLES, RETOURNER UN PDF VIDE
  if (!articles || articles.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Aucun article à exporter.</Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{entreprise}</Text>
          <Text style={styles.headerSub}>RAPPORT DES ARTICLES</Text>
          <Text style={styles.headerDate}>Généré le {dateFormatted}</Text>
        </View>

        {/* TABLEAU */}
        <View>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableHeaderText, flex: 1.5 }}>Réf.</Text>
            <Text style={{ ...styles.tableHeaderText, flex: 2 }}>Article</Text>
            <Text style={{ ...styles.tableHeaderText, flex: 1.5 }}>Catégorie</Text>
            <Text style={{ ...styles.tableHeaderText, flex: 1, textAlign: 'center' }}>Stock</Text>
            <Text style={{ ...styles.tableHeaderText, flex: 1, textAlign: 'center' }}>Stock Min</Text>
          </View>

          {articles.map((article, index) => (
            <View key={article.id || index} style={styles.tableRow}>
              <Text style={{ ...styles.tableRowText, flex: 1.5 }}>{article.reference || ''}</Text>
              <Text style={{ ...styles.tableRowText, flex: 2 }}>{article.nom || ''}</Text>
              <Text style={{ ...styles.tableRowText, flex: 1.5 }}>{article.categorie || '-'}</Text>
              <Text style={{ ...styles.tableRowText, flex: 1, textAlign: 'center' }}>{article.stock || 0}</Text>
              <Text style={{ ...styles.tableRowText, flex: 1, textAlign: 'center' }}>{article.stockMin || 0}</Text>
            </View>
          ))}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Total : {articles.length} article(s) - {entreprise}
          </Text>
        </View>
      </Page>
    </Document>
  );
}