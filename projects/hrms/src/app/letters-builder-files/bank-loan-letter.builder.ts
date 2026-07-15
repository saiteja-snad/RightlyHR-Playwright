import { PX, fmt, stampFont, applyLetterPageSetup, LETTER_MARGINS } from './letter-builder.utils';

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
  headerLogoBase64?: string;
  useVerdanaFont?: boolean;
  useAutographyFont?: boolean;
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
    { text: 'For RightlyHR', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 20] },
    { text: authorityFullName, font: data.useAutographyFont ? 'Autography' : bodyFont, fontSize: PX(28), margin: [0, 0, 0, 0], noWrap: true, alignment: 'left' },
    { text: 'Authority Signature', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 4] },
    { text: authorityFullName, font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 4] },
    { text: authorityDesignation, font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 0] },
  ];

  const isSoftCopy = !!data.backgroundImageBase64;
  const margins = isSoftCopy ? LETTER_MARGINS.softCopy : LETTER_MARGINS.hardCopy;

  const docDef: any = {
    pageSize: 'A4',
    pageMargins: [margins.left, margins.top, margins.right, margins.bottom],
    defaultStyle: {
      font: bodyFont,
      fontSize: PX(13),
      alignment: 'justify',
      color: '#000',
    },
    content: stampFont(content, bodyFont),
  };

  applyLetterPageSetup(docDef, {
    backgroundImageBase64: data.backgroundImageBase64,
    headerLogoBase64: data.headerLogoBase64,
    bodyFont,
  });

  return docDef;
}
