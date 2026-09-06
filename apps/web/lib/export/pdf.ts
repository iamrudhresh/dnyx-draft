'use client';

export async function exportToPDF(
  title: string,
  appearance: 'light' | 'dark' = 'light',
): Promise<void> {
  const previewEl = document.querySelector<HTMLElement>('.markdown-body');
  if (!previewEl) throw new Error('Preview element not found');

  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  const backgroundColor = appearance === 'dark' ? '#090d16' : '#ffffff';

  // Serialize any inline SVGs (Mermaid, Markmap, etc.) to <img> so html2canvas captures them.
  const svgEls = previewEl.querySelectorAll<SVGSVGElement>('svg');
  const svgRestoreMap: Array<{ svg: SVGSVGElement; img: HTMLImageElement; url: string }> = [];
  for (const svg of svgEls) {
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;

    const serializer = new XMLSerializer();
    // Inline all stylesheets referenced by the SVG for faithful capture.
    const svgStr = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = document.createElement('img');
    img.src = url;
    img.width = Math.round(rect.width) || 400;
    img.height = Math.round(rect.height) || 300;
    img.style.maxWidth = '100%';
    svg.parentNode?.insertBefore(img, svg);
    svg.style.display = 'none';
    svgRestoreMap.push({ svg, img, url });
  }

  // Wait a tick for images to load their object URLs.
  await new Promise<void>((resolve) => setTimeout(resolve, 80));

  try {
    const canvas = await html2canvas(previewEl, {
      scale: 2,
      useCORS: true,
      backgroundColor,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    let yOffset = 0;
    while (yOffset < contentHeight) {
      if (yOffset > 0) pdf.addPage();
      pdf.addImage(
        imgData,
        'PNG',
        margin,
        margin - (yOffset / contentHeight) * canvas.height * (contentWidth / canvas.width),
        contentWidth,
        contentHeight,
      );
      yOffset += pageHeight - margin * 2;
    }

    const safeTitle = title.replace(/\.md$/, '').replace(/[^a-zA-Z0-9-_\s]/g, '') || 'document';
    pdf.save(`${safeTitle}.pdf`);
  } finally {
    for (const { svg, img, url } of svgRestoreMap) {
      svg.style.display = '';
      URL.revokeObjectURL(url);
      img.parentNode?.removeChild(img);
    }
  }
}
