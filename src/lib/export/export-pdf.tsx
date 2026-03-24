'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import type { ClinicalBrief } from '../types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#1C1C1E',
  },
  header: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  subheader: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  subsectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  text: {
    fontSize: 10,
    marginBottom: 6,
  },
  bbwBox: {
    borderWidth: 2,
    borderColor: '#FF3B30',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#FEF2F2',
  },
  bbwTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#FF3B30',
    marginBottom: 4,
  },
  citation: {
    fontSize: 8,
    color: '#9CA3AF',
    marginTop: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
    paddingBottom: 4,
    marginBottom: 2,
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
  },
  tableCellBold: {
    flex: 1,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  badge: {
    fontSize: 8,
    color: '#007AFF',
    fontFamily: 'Helvetica-Bold',
  },
  disclaimer: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    lineHeight: 1.4,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 20,
    right: 40,
    color: '#9CA3AF',
  },
});

const TIER_LABELS: Record<number, string> = {
  1: 'Tier 1',
  2: 'Tier 2',
  3: 'Tier 3',
  4: 'Tier 4',
  5: 'Tier 5',
};

const DISCLAIMER_TEXT = 'This brief is generated from publicly available clinical data sources and is intended to support, not replace, clinical judgment. All content must be verified against current prescribing information and institutional protocols before clinical application. ClinicalIQ does not provide medical advice.';

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '...' : text;
}

function ClinicalBriefPDF({ brief }: { brief: ClinicalBrief }) {
  return (
    <Document title={`ClinicalIQ — ${brief.query}`} author="ClinicalIQ">
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <Text style={styles.header}>ClinicalIQ — Clinical Intelligence Brief</Text>
        <Text style={styles.subheader}>
          Query: {brief.query} · Type: {brief.query_type.replace('_', ' ')} · Retrieved: {brief.retrieved_at} · Exported: {new Date().toISOString()}
        </Text>

        {/* FDA Label */}
        {brief.fda_label && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>FDA Drug Label</Text>
            <Text style={styles.text}>
              Brand: {brief.fda_label.brand_name.join(', ')} · Generic: {brief.fda_label.generic_name.join(', ')} · Manufacturer: {brief.fda_label.manufacturer}
            </Text>

            {brief.fda_label.boxed_warning && (
              <View style={styles.bbwBox}>
                <Text style={styles.bbwTitle}>⚠ BLACK BOX WARNING</Text>
                <Text style={styles.text}>{truncate(brief.fda_label.boxed_warning.value, 1500)}</Text>
              </View>
            )}

            {brief.fda_label.indications_and_usage && (
              <View>
                <Text style={styles.subsectionTitle}>Indications & Usage</Text>
                <Text style={styles.text}>{truncate(brief.fda_label.indications_and_usage.value, 1000)}</Text>
                <Text style={styles.citation}>Source: OpenFDA · {brief.fda_label.indications_and_usage.retrieved_at}</Text>
              </View>
            )}

            {brief.fda_label.dosage_and_administration && (
              <View>
                <Text style={styles.subsectionTitle}>Dosage & Administration</Text>
                <Text style={styles.text}>{truncate(brief.fda_label.dosage_and_administration.value, 1000)}</Text>
              </View>
            )}

            {brief.fda_label.contraindications && (
              <View>
                <Text style={styles.subsectionTitle}>Contraindications</Text>
                <Text style={styles.text}>{truncate(brief.fda_label.contraindications.value, 800)}</Text>
              </View>
            )}

            {brief.fda_label.drug_interactions && (
              <View>
                <Text style={styles.subsectionTitle}>Drug Interactions</Text>
                <Text style={styles.text}>{truncate(brief.fda_label.drug_interactions.value, 800)}</Text>
              </View>
            )}
          </View>
        )}

        {/* FAERS */}
        {brief.adverse_events && brief.adverse_events.reactions.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Adverse Event Signals (FAERS)</Text>
            <Text style={styles.text}>Drug: {brief.adverse_events.drug_name_matched} ({brief.adverse_events.match_strategy})</Text>

            <View style={styles.tableHeader}>
              <Text style={styles.tableCellBold}>Reaction</Text>
              <Text style={styles.tableCellBold}>Reports</Text>
              <Text style={styles.tableCellBold}>Serious</Text>
              <Text style={styles.tableCellBold}>Fatal</Text>
            </View>
            {brief.adverse_events.reactions.slice(0, 15).map((r, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCell}>{r.meddra_pt}</Text>
                <Text style={styles.tableCell}>{r.report_count.toLocaleString()}</Text>
                <Text style={styles.tableCell}>{r.serious_count.toLocaleString()}</Text>
                <Text style={styles.tableCell}>{r.fatal_count.toLocaleString()}</Text>
              </View>
            ))}

            <Text style={styles.citation}>
              FAERS data represents voluntary reports. Does not establish causation. · Source: OpenFDA FAERS · {brief.adverse_events.retrieved_at}
            </Text>
          </View>
        )}

        {/* Clinical Trials */}
        {brief.trials.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Clinical Trials</Text>
            {brief.trials.slice(0, 10).map((t, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <Text style={styles.subsectionTitle}>{t.nct_id} — {t.phase.replace('PHASE', 'Phase ')}</Text>
                <Text style={styles.text}>{t.title}</Text>
                <Text style={styles.text}>Status: {t.status} · Enrollment: {t.enrollment_count ?? 'N/A'} · Sponsor: {t.lead_sponsor}</Text>
                <Text style={styles.citation}>Primary outcome: {truncate(t.primary_outcome, 200)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Literature */}
        {brief.literature.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Literature</Text>
            {brief.literature.slice(0, 10).map((p, i) => {
              const authors = p.authors.length > 3 ? `${p.authors[0]} et al.` : p.authors.join(', ');
              return (
                <View key={i} style={{ marginBottom: 6 }}>
                  <Text style={styles.subsectionTitle}>
                    PMID {p.pmid} <Text style={styles.badge}>{TIER_LABELS[p.evidence_tier] || ''}</Text>
                  </Text>
                  <Text style={styles.text}>{p.title}</Text>
                  <Text style={styles.citation}>{authors} · {p.journal} ({p.pub_year}){p.doi ? ` · DOI: ${p.doi}` : ''}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Drug Summary */}
        {brief.medlineplus && (
          <View>
            <Text style={styles.sectionTitle}>Drug Summary (MedlinePlus)</Text>
            <Text style={styles.text}>{truncate(brief.medlineplus.drug_summary.value, 1000)}</Text>
            <Text style={styles.citation}>Source: MedlinePlus · {brief.medlineplus.drug_summary.retrieved_at}</Text>
          </View>
        )}

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>{DISCLAIMER_TEXT}</Text>

        {/* Page Numbers */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>
    </Document>
  );
}

export async function downloadPDF(brief: ClinicalBrief): Promise<void> {
  const blob = await pdf(<ClinicalBriefPDF brief={brief} />).toBlob();
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const safeName = brief.query.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50);
  const filename = `clinicaliq_${safeName}_${dateStr}.pdf`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
