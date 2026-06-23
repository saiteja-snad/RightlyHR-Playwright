export interface BankLoanLetterData {
  employeeFullname: string;
  jobRole: string;
  effectiveDate: string;
  hisOrHer: string;
  himOrHer: string;
  letterDate: string;
  authorityFullName: string;
  authorityDesignation: string;
  backgroundImageBase64?: string;
  useVerdanaFont?: boolean;
  useAutographyFont?: boolean;
}

const PX = (px: number) => Math.round((px * 72) / 96);

function fmt(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function buildBankLoanLetterDoc(data: BankLoanLetterData): any {
  const {
    employeeFullname, jobRole, effectiveDate,
    hisOrHer, himOrHer, letterDate,
    authorityFullName, authorityDesignation,
  } = data;

  const bodyFont = data.useVerdanaFont ? 'VERDANA' : undefined;
  const dateStr = fmt(letterDate);
  const joiningStr = fmt(effectiveDate);

  function p(text: any, marginBottom = 8): any {
    return { font: bodyFont, text, margin: [0, 0, 0, marginBottom] };
  }

  const content: any[] = [
    { text: [{ text: 'Date: ', font: 'VERDANABOLD' }, dateStr], alignment: 'right', margin: [0, 0, 0, 30] },
    {
      text: 'TO WHOMSOEVER IT MAY CONCERN',
      font: 'VERDANABOLD',
      fontSize: PX(14),
      alignment: 'center',
      decoration: 'underline',
      margin: [0, 0, 0, 30],
    },
    p([
      'This letter is to confirm that ',
      { text: employeeFullname || '_______________________', font: 'VERDANABOLD' },
      ' has been working in our Establishment ',
      { text: '"RightlyHR"' },
      ' currently designated as ',
      { text: jobRole || '_______________________', font: 'VERDANABOLD' },
      ' since ',
      { text: joiningStr ? `${joiningStr}.` : '_______________________.', font: 'VERDANABOLD' },
    ], 12),
    p(`This letter is being issued on ${hisOrHer} request to enable ${himOrHer} to apply for a bank Loan.`, 12),
    p('If you have any further questions, you can call us at 8886651309.', 30),
    p('Your Sincerely,', 4),
    { text: 'For RightlyHR', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 20]},
    { text: authorityFullName, font: data.useAutographyFont ? 'Autography' : bodyFont, fontSize: PX(28), margin: [0, 0, 0, 0], noWrap: true, alignment: 'left' },
    { text: 'Authority Signature', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 4]},
    { text: authorityFullName, font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 4]},
    { text: authorityDesignation, font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 0]},
  ];

  function stampFont(nodes: any[]): any[] {
    return nodes.map(node => {
      if (typeof node === 'string') return node;
      if (Array.isArray(node)) return stampFont(node);
      const stamped: any = node.font ? node : { font: bodyFont, ...node };
      if (Array.isArray(stamped.text)) {
        stamped.text = stamped.text.map((t: any) =>
          typeof t === 'string' ? t : (t.font ? t : { font: bodyFont, ...t })
        );
      }
      return stamped;
    });
  }

  const styledContent = stampFont(content);
  const topMargin = data.backgroundImageBase64 ? 120 : 50;
  const bottomMargin = data.backgroundImageBase64 ? 120 : 50;

  const docDef: any = {
    pageSize: 'A4',
    pageMargins: [60, topMargin, 60, bottomMargin],
    defaultStyle: {
      font: bodyFont,
      fontSize: PX(13),
      alignment: 'justify',
      color: '#000',
    },
    content: styledContent,
  };

  if (data.backgroundImageBase64) {
    docDef.images = { letterBg: data.backgroundImageBase64 };
    docDef.background = () => ({
      image: 'letterBg',
      width: 620,
      height: 870,
      absolutePosition: { x: -12, y: -14 },
    });
  }

  return docDef;
}
