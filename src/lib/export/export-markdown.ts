import type { ClinicalBrief } from '../types';

const DISCLAIMER = `> This brief is generated from publicly available clinical data sources and is intended to support, not replace, clinical judgment. All content must be verified against current prescribing information and institutional protocols before clinical application. ClinicalIQ does not provide medical advice.`;

const TIER_LABELS: Record<number, string> = {
  1: '[Tier 1 — Meta-Analysis/Systematic Review]',
  2: '[Tier 2 — RCT]',
  3: '[Tier 3 — Cohort/Observational]',
  4: '[Tier 4 — Case Report]',
  5: '[Tier 5 — Editorial/Opinion]',
};

export function briefToMarkdown(brief: ClinicalBrief): string {
  const lines: string[] = [];

  lines.push(`# ClinicalIQ — Clinical Intelligence Brief`);
  lines.push('');
  lines.push(`**Query:** ${brief.query}`);
  lines.push(`**Type:** ${brief.query_type.replace('_', ' ')}`);
  lines.push(`**Retrieved:** ${brief.retrieved_at}`);
  lines.push(`**Exported:** ${new Date().toISOString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // FDA Label
  if (brief.fda_label) {
    const l = brief.fda_label;
    lines.push('## FDA Drug Label');
    lines.push('');
    lines.push(`**Brand:** ${l.brand_name.join(', ')} · **Generic:** ${l.generic_name.join(', ')}`);
    lines.push(`**Manufacturer:** ${l.manufacturer}`);
    lines.push('');

    if (l.boxed_warning) {
      lines.push(`> ⚠ BLACK BOX WARNING: ${l.boxed_warning.value}`);
      lines.push('');
    }

    if (l.indications_and_usage) {
      lines.push('### Indications & Usage');
      lines.push(l.indications_and_usage.value);
      lines.push(`*Source: [OpenFDA](${l.indications_and_usage.source_url}) · ${l.indications_and_usage.retrieved_at}*`);
      lines.push('');
    }

    if (l.dosage_and_administration) {
      lines.push('### Dosage & Administration');
      lines.push(l.dosage_and_administration.value);
      lines.push(`*Source: [OpenFDA](${l.dosage_and_administration.source_url}) · ${l.dosage_and_administration.retrieved_at}*`);
      lines.push('');
    }

    if (l.contraindications) {
      lines.push('### Contraindications');
      lines.push(l.contraindications.value);
      lines.push('');
    }

    if (l.warnings_and_precautions) {
      lines.push('### Warnings & Precautions');
      lines.push(l.warnings_and_precautions.value);
      lines.push('');
    }

    if (l.drug_interactions) {
      lines.push('### Drug Interactions');
      lines.push(l.drug_interactions.value);
      lines.push('');
    }

    if (l.pregnancy) {
      lines.push('### Pregnancy');
      lines.push(l.pregnancy.value);
      lines.push('');
    }

    if (l.nursing_mothers) {
      lines.push('### Nursing Mothers');
      lines.push(l.nursing_mothers.value);
      lines.push('');
    }

    if (l.renal_impairment) {
      lines.push('### Renal Impairment');
      lines.push(l.renal_impairment.value);
      lines.push('');
    }

    if (l.hepatic_impairment) {
      lines.push('### Hepatic Impairment');
      lines.push(l.hepatic_impairment.value);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  // Adverse Events
  if (brief.adverse_events && brief.adverse_events.reactions.length > 0) {
    const ae = brief.adverse_events;
    lines.push('## Adverse Event Signals (FAERS)');
    lines.push('');
    lines.push(`Drug matched: **${ae.drug_name_matched}** (${ae.match_strategy})`);
    lines.push('');
    lines.push('| Reaction (MedDRA PT) | Reports | Serious | Fatal |');
    lines.push('|---------------------|---------|---------|-------|');
    for (const r of ae.reactions) {
      lines.push(`| ${r.meddra_pt} | ${r.report_count.toLocaleString()} | ${r.serious_count.toLocaleString()} | ${r.fatal_count.toLocaleString()} |`);
    }
    lines.push('');
    lines.push('> FAERS data represents voluntary reports and does not establish causation or incidence rate. Underreporting is known to occur.');
    lines.push(`*Source: [OpenFDA FAERS](${ae.source_url}) · ${ae.retrieved_at}*`);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Clinical Trials
  if (brief.trials.length > 0) {
    lines.push('## Clinical Trials');
    lines.push('');
    for (const t of brief.trials) {
      lines.push(`### [${t.nct_id}](${t.source_url}) — ${t.phase.replace('PHASE', 'Phase ')}`);
      lines.push(`**${t.title}**`);
      lines.push(`- Status: ${t.status} · Enrollment: ${t.enrollment_count ?? 'N/A'}`);
      lines.push(`- Sponsor: ${t.lead_sponsor}`);
      lines.push(`- Primary outcome: ${t.primary_outcome.slice(0, 200)}`);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  // Literature
  if (brief.literature.length > 0) {
    lines.push('## Literature');
    lines.push('');
    for (const p of brief.literature) {
      const tier = TIER_LABELS[p.evidence_tier] || '';
      const authors = p.authors.length > 3
        ? `${p.authors[0]} et al.`
        : p.authors.join(', ');
      lines.push(`### [${p.pmid}](${p.source_url}) ${tier}`);
      lines.push(`**${p.title}**`);
      lines.push(`${authors} · *${p.journal}* (${p.pub_year})`);
      if (p.doi) lines.push(`DOI: [${p.doi}](https://doi.org/${p.doi})`);
      if (p.abstract) lines.push(`> ${p.abstract.slice(0, 300)}${p.abstract.length > 300 ? '...' : ''}`);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  // Drug Summary
  if (brief.medlineplus) {
    const ml = brief.medlineplus;
    lines.push('## Drug Summary (MedlinePlus)');
    lines.push('');
    lines.push(ml.drug_summary.value);
    lines.push('');
    if (ml.related_links.length > 0) {
      lines.push('**Related Links:**');
      for (const link of ml.related_links) {
        lines.push(`- [${link.label}](${link.url})`);
      }
      lines.push('');
    }
    lines.push(`*Source: [MedlinePlus](${ml.drug_summary.source_url}) · ${ml.drug_summary.retrieved_at}*`);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Disclaimer
  lines.push(DISCLAIMER);
  lines.push('');

  return lines.join('\n');
}

export function downloadMarkdown(brief: ClinicalBrief): void {
  const md = briefToMarkdown(brief);
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const safeName = brief.query.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50);
  const filename = `clinicaliq_${safeName}_${dateStr}.md`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
