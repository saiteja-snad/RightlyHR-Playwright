export interface ProbationConfirmationLetterData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fusionEmpId?: string;
  jobRole?: string;
  department?: string;
  workLocation?: string;
  issuedDate: string;
  effectiveDate: string;
  authorityName: string;
  authorityDesignation?: string;
  employeeSignatureDate?: string;
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

export function buildProbationConfirmationLetterDoc(data: ProbationConfirmationLetterData): any {
  const bodyFont = data.useVerdanaFont ? 'VERDANA' : undefined;
  const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');

  function p(text: any, marginBottom = 10): any {
    return { text, font: bodyFont, margin: [0, 0, 0, marginBottom] };
  }

  const content: any[] = [
    { text: 'PROBATION CONFIRMATION', fontSize: PX(16), alignment: 'center', margin: [0, 0, 0, 20], font: 'VERDANABOLD' },
    {
      columns: [
        {
          width: '60%',
          stack: [
            { text: 'To', font: bodyFont, margin: [0, 0, 0, 4] },
            ...(fullName ? [{ text: fullName + ',', font: bodyFont, margin: [0, 0, 0, 2] }] : [{ text: 'Name:', font: bodyFont, margin: [0, 0, 0, 2] }]),
            ...(data.fusionEmpId ? [{ text: data.fusionEmpId, font: bodyFont, margin: [0, 0, 0, 2] }] : []),
            ...(data.jobRole ? [{ text: data.jobRole, font: bodyFont, margin: [0, 0, 0, 2] }] : []),
            ...(data.department ? [{ text: data.department, font: bodyFont, margin: [0, 0, 0, 2] }] : []),
            ...(data.workLocation ? [{ text: data.workLocation, font: bodyFont, margin: [0, 0, 0, 2] }] : []),
          ],
        },
        {
          width: '40%',
          text: [{ text: 'Issued Date: ', font: 'VERDANABOLD' }, fmt(data.issuedDate)],
          alignment: 'right',
          font: bodyFont,
        },
      ],
      margin: [0, 0, 0, 16],
    },
    { text: `Dear ${fullName},`, margin: [0, 0, 0, 12], font: 'VERDANABOLD' },
    p('We are pleased to inform you that, following a comprehensive assessment of your performance during the probationary period, you have successfully completed your probationary period with RightlyHR.', 12),
    p([
      `Effective from ${fmt(data.effectiveDate)}, your position as `,
      { text: data.jobRole ?? '', font: 'VERDANABOLD' },
      ' within our organization is officially confirmed, and your terms and conditions of employment will remain unchanged.',
    ], 12),
    p('We believe that your continued presence at RightlyHR will further contribute to our success, and we look forward to seeing your continued growth and contributions to the organization.', 12),
    p('Congratulations on this milestone in your career, and we look forward to a successful and rewarding journey together.', 20),
    p('Sincerely,', 4),
    { text: 'For RightlyHR', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 8] },
    { text: data.authorityName, font: 'Autography', fontSize: PX(32), margin: [0, 0, 0, 4], noWrap: true },
    { text: 'Authority Signature', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 4] },
    { text: data.authorityName, font: 'VERDANABOLD', fontSize: PX(13) },
    { text: data.authorityDesignation ?? '', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 16] },
    ...(data.employeeSignatureDate ? [
      { text: fullName, font: 'Autography', fontSize: PX(32), alignment: 'right', noWrap: true, margin: [0, 0, 0, 4] },
      { text: "Employee's Signature", font: bodyFont, fontSize: PX(13), alignment: 'right' },
    ] : []),
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