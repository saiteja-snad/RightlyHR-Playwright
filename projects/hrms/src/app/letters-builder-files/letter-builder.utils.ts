export const PX = (px: number) => Math.round((px * 72) / 96);

export function fmt(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function stampFont(nodes: any[], bodyFont: string | undefined): any[] {
  return nodes.map(node => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return stampFont(node, bodyFont);
    const stamped: any = node.font ? node : { font: bodyFont, ...node };
    if (Array.isArray(stamped.text)) {
      stamped.text = stamped.text.map((t: any) =>
        typeof t === 'string' ? t : (t.font ? t : { font: bodyFont, ...t })
      );
    }
    if (Array.isArray(stamped.ol)) stamped.ol = stampFont(stamped.ol, bodyFont);
    if (Array.isArray(stamped.ul)) stamped.ul = stampFont(stamped.ul, bodyFont);
    return stamped;
  });
}

export const LETTER_MARGINS = {
  softCopy: { top: 85, bottom: 55, left: 60, right: 60 },
  hardCopy: { top: 50, bottom: 50, left: 60, right: 60 },
};

export interface LetterPageSetupOptions {
  backgroundImageBase64?: string;
  headerLogoBase64?: string;
  bodyFont?: string;
}

export function applyLetterPageSetup(docDef: any, options: LetterPageSetupOptions): void {
  const { backgroundImageBase64, headerLogoBase64, bodyFont } = options;
  const images: Record<string, string> = { ...(docDef.images ?? {}) };

  if (backgroundImageBase64) {
    images['letterBg'] = backgroundImageBase64;
    const wmW = PX(184);
    const wmH = PX(112);
    docDef.background = (_currentPage: number, _pageCount: number, pageSize: any) => {
      const pW: number = pageSize?.width ?? 595;
      const pH: number = pageSize?.height ?? 842;
      return {
        stack: [
          {
            image: 'letterBg',
            width: wmW,
            height: wmH,
            opacity: 0.18,
            absolutePosition: { x: (pW - wmW) / 2, y: (pH - wmH) / 2 },
          },
          {
            canvas: [{ type: 'rect', x: 0, y: 0, w: pW, h: 100, color: '#0B3A83' }],
            absolutePosition: { x: 0, y: pH - 55 },
          },
        ],
      };
    };
    docDef.footer = (_currentPage: number, _pageCount: number, _pageSize: any) => ({
      margin: [-60, 0, -60, 0],
      table: {
        widths: ['*'],
        body: [[{
          stack: [
            { text: 'RightlyHR', alignment: 'center', color: '#ffffff', font: 'VERDANABOLD', fontSize: PX(12), margin: [0, 8, 0, 6] },
            { text: 'Vijaya Krishna Towers, Floor#16, Madhava Reddy Colony, Gachibowli, HYD - 500032', alignment: 'center', color: '#ffffff', font: bodyFont || 'VERDANA', fontSize: PX(11), margin: [0, 0, 0, 8] },
          ],
        }]],
      },
      layout: 'noBorders',
    });
  }

  if (headerLogoBase64) {
    images['headerLogo'] = headerLogoBase64;
    docDef.header = (_currentPage: number, _pageCount: number, pageSize: any) => {
      const pW: number = pageSize?.width ?? 595;
      return {
        image: 'headerLogo',
        width: 144,
        height: 42,
        absolutePosition: { x: pW - 60 - 144, y: 20 },
      };
    };
  }

  if (Object.keys(images).length > 0) {
    docDef.images = images;
  }
}
