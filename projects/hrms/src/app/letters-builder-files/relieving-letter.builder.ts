export interface RelievingLetterData {
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  gender2: string;
  gender3: string;
  jobRole: string;
  dateOfJoining: string;
  lastWorkingDay: string;
  issuedDate: string;
  authorityFullName: string;
  authorityDesignation: string;
  backgroundImageBase64?: string;
  useVerdanaFont?: boolean;
  useAutographyFont?: boolean;
}

const PX = (px: number) => Math.round((px * 72) / 96);

function fmt(dateStr: string): string {
  if (!dateStr) return '';
  const ddmm = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateStr);
  if (ddmm) {
    const d = new Date(`${ddmm[3]}-${ddmm[2]}-${ddmm[1]}`);
    if (!isNaN(d.getTime())) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function buildRelievingLetterDoc(data: RelievingLetterData): any {
  const bodyFont = data.useVerdanaFont ? 'VERDANA' : undefined;
  const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');

  function p(text: any, marginBottom = 10): any {
    return { text, font: bodyFont, margin: [0, 0, 0, marginBottom] };
  }

  const content: any[] = [
    { text: 'RELIEVING & EXPERIENCE LETTER', fontSize: PX(16), alignment: 'center', margin: [0, 0, 0, 16], font: 'VERDANABOLD' },
    { text: [{ text: 'Issued Date: ', font: 'VERDANABOLD' }, { text: fmt(data.issuedDate), font: bodyFont }], alignment: 'right', margin: [0, 0, 0, 20] },
    p([
      'We hereby certify that ',
      { text: `${data.gender3} ${fullName}`, font: 'VERDANABOLD' },
      ' was employed with RightlyHR as a ',
      { text: data.jobRole, font: 'VERDANABOLD' },
      ' from ',
      { text: fmt(data.dateOfJoining), font: 'VERDANABOLD' },
      ' to ',
      { text: `${fmt(data.lastWorkingDay)}.`, font: 'VERDANABOLD' },
    ], 12),
    p([
      `During ${data.gender} tenure with our organization, `,
      { text: fullName, font: 'VERDANABOLD' },
      ` exhibited commendable dedication, professionalism, and competence in ${data.gender} role.`,
    ], 12),
    p([
      'We deeply appreciate ',
      { text: fullName, font: 'VERDANABOLD' },
      ` contributions during ${data.gender} employment with SNAD, and we believe ${data.gender} commitment and expertise will be an asset to any organization they choose to join in the future.`,
    ], 12),
    p([
      'We wish ',
      { text: fullName, font: 'VERDANABOLD' },
      ` the very best for ${data.gender} future endeavors, and we trust that ${data.gender2} will achieve continued success in ${data.gender} professional journey.`,
    ], 24),
    p('Your Sincerely,', 4),
    { text: 'FOR RightlyHR', fontSize: PX(13), margin: [0, 0, 0, 24], font: 'VERDANABOLD' },
    { text: data.authorityFullName, font: data.useAutographyFont ? 'Autography' : bodyFont, fontSize: PX(28), margin: [0, 0, 0, 0], noWrap: true, alignment: 'left' },
    { text: 'Authorized Signatory', fontSize: PX(13), margin: [0, 0, 0, 4], font: 'VERDANABOLD' },
    { text: data.authorityFullName, fontSize: PX(13), margin: [0, 0, 0, 4], font: 'VERDANABOLD' },
    { text: data.authorityDesignation, fontSize: PX(13), margin: [0, 0, 0, 0], font: 'VERDANABOLD' },
  ];

  function stampFont(nodes: any[]): any[] {
    return nodes.map(node => {
      if (typeof node === 'string') return node;
      if (Array.isArray(node)) return stampFont(node);
      const stamped: any = node.font ? node : { font: bodyFont, ...node };
      if (Array.isArray(stamped.text)) {
        stamped.text = stamped.text.map((t: any) => typeof t === 'string' ? t : (t.font ? t : { font: bodyFont, ...t }));
      }
      if (stamped.stack) stamped.stack = stampFont(stamped.stack);
      if (stamped.columns) stamped.columns = stampFont(stamped.columns);
      return stamped;
    });
  }

  const styledContent = stampFont(content);
  const topMargin = data.backgroundImageBase64 ? 120 : 50;
  const bottomMargin = data.backgroundImageBase64 ? 120 : 50;

  const docDef: any = {
    pageSize: 'A4',
    pageMargins: [60, topMargin, 60, bottomMargin],
    defaultStyle: { font: bodyFont, fontSize: PX(13), color: '#000' },
    content: styledContent,
  };

  if (data.backgroundImageBase64) {
    docDef.images = { letterBg: data.backgroundImageBase64 };
    docDef.background = () => ({ image: 'letterBg', width: 620, height: 870, absolutePosition: { x: -12, y: -14 } });
  }

  return docDef;
}