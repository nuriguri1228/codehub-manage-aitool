/**
 * CSV / PDF export utilities
 */

interface CsvHeader {
  key: string;
  label: string;
}

export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  headers: CsvHeader[]
): void {
  const BOM = '\uFEFF';

  const headerRow = headers.map((h) => `"${h.label}"`).join(',');

  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = row[h.key];
        if (val == null) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',')
  );

  const csv = BOM + [headerRow, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPDF(): void {
  window.print();
}
