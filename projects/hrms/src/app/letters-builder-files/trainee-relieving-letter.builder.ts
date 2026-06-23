export interface TraineeRelievingLetterData {
  firstName: string;
  middleName?: string;
  lastName: string;
  gender3: string;
  jobRole: string;
  managerTitle?: string;
  managerFirstName?: string;
  managerMiddleName?: string;
  managerLastName?: string;
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

export function buildTraineeRelievingLetterDoc(data: TraineeRelievingLetterData): any {
  const bodyFont = data.useVerdanaFont ? 'VERDANA' : undefined;
  const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');
  const managerName = [data.managerTitle, data.managerFirstName, data.managerMiddleName, data.managerLastName]
    .filter(Boolean).join(' ');

  function p(text: any, marginBottom = 10): any {
    return { text, font: bodyFont, margin: [0, 0, 0, marginBottom] };
  }

  const content: any[] = [
    { text: 'TO WHOM IT MAY CONCERN', font: 'VERDANABOLD', fontSize: PX(16), alignment: 'center', margin: [0, 0, 0, 16]},
    { text: [{ text: 'Date: ', font: 'VERDANABOLD' }, { text: fmt(data.issuedDate), font: bodyFont }], alignment: 'right', margin: [0, 0, 0, 20] },
    p([
      'This is to certify that ',
      { text: `${data.gender3} ${fullName}`, font: 'VERDANABOLD' },
      ', has successfully completed an ',
      { text: 'Internship', font: 'VERDANABOLD' },
      ' with the Business & Growth team as a ',
      { text: data.jobRole, font: 'VERDANABOLD' },
      ' intern at ',
      { text: 'RightlyHR.' },
    ], 12),
    p([
      'The internship was undertaken under the supervision of ',
      { text: managerName, font: 'VERDANABOLD' },
      ', Reporting Manager, from ',
      { text: fmt(data.dateOfJoining), font: 'VERDANABOLD' },
      ' to ',
      { text: `${fmt(data.lastWorkingDay)}.`, font: 'VERDANABOLD' },
      ` During this period, he was involved in various tasks and assignments related to the field of ${data.jobRole}.`,
    ], 12),
    p('He exhibited a positive attitude, a willingness to learn, and contributed meaningfully to the team. His performance throughout the internship tenure was appreciable, and he conducted himself with professionalism.', 12),
    p([
      'We extend our heartfelt best wishes to ',
      { text: `${data.gender3} ${fullName}`, font: 'VERDANABOLD' },
      ' for continued success and fulfillment in all his future professional endeavors. May his journey ahead be marked with growth, achievements, and new opportunities.',
    ], 24),
    p('Your Sincerely,', 4),
    { text: 'For RightlyHR', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 16], noWrap: true },
    { text: data.authorityFullName, font: data.useAutographyFont ? 'Autography' : bodyFont, fontSize: PX(28), margin: [0, 0, 0, 0], noWrap: true, alignment: 'left' },
    { text: 'Authorized Signatory', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 4], noWrap: true },
    { text: data.authorityFullName, font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 0], noWrap: true },
    { text: data.authorityDesignation, font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 0], noWrap: true },
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