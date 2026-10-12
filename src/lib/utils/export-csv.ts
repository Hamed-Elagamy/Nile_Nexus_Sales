/**
 * Nile Nexus Sales - CSV Export Utility
 * Exports tabular data to CSV with UTF-8 Byte Order Mark (\uFEFF)
 * ensuring 100% crystal-clear Arabic text rendering in Microsoft Excel.
 */

export interface CsvColumn<T> {
  key?: keyof T | string;
  header: string;
  formatter?: (row: T) => string | number | null | undefined;
}

export function exportToCsv<T>(
  filename: string,
  columns: CsvColumn<T>[],
  data: T[]
): void {
  if (typeof window === "undefined") return;

  // Header row
  const headerRow = columns
    .map((col) => `"${col.header.replace(/"/g, '""')}"`)
    .join(",");

  // Data rows
  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        let val: any;
        if (col.formatter) {
          val = col.formatter(row);
        } else if (col.key && col.key in (row as object)) {
          val = (row as any)[col.key];
        } else {
          val = "";
        }

        if (val === null || val === undefined) {
          val = "";
        }

        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(",")
  );

  // Prepend UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility
  const csvContent = "\uFEFF" + [headerRow, ...dataRows].join("\r\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const finalFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", finalFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
