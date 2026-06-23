import { LETTER_MARGINS, stampFont, applyLetterPageSetup } from "./letter-builder.utils";

export interface ProbationExtensionLetterData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fusionEmpId?: string;
  jobRole?: string;
  department?: string;
  workLocation?: string;
  issuedDate: string;
  probationmonths?: string | number;
  probationExtendedDate?: string;
  authorityName: string;
  authorityDesignation?: string;
  employeeSignatureDate?: string;
  backgroundImageBase64?: string;
  headerLogoBase64?: string;
  useVerdanaFont?: boolean;
  useAutographyFont?: boolean;
  headerLogoBase64?: string;
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

export function buildProbationExtensionLetterDoc(data: ProbationExtensionLetterData): any {
  const bodyFont = data.useVerdanaFont ? 'VERDANA' : undefined;
  const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');

  function p(text: any, marginBottom = 10): any {
    return { text, font: bodyFont, margin: [0, 0, 0, marginBottom] };
  }

  const content: any[] = [
    { text: 'EXTENSION OF PROBATION PERIOD', font: 'VERDANABOLD', fontSize: PX(16), alignment: 'center', margin: [0, 0, 0, 20] },
    {
      columns: [
        {
          width: '60%',
          stack: [
            ...(fullName ? [{ text: fullName, font: bodyFont, margin: [0, 0, 0, 2] }] : []),
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
    { text: `Dear ${fullName},`, font: 'VERDANABOLD', margin: [0, 0, 0, 12] },
    p([
      'We are pleased to inform that following a performance appraisal and subsequent review, your probation period has been extended by ',
      { text: `${data.probationmonths ?? ''} months`, font: 'VERDANABOLD' },
      '. This extension will conclude on ',
      { text: fmt(data.probationExtendedDate ?? ''), font: 'VERDANABOLD' },
      '. At the conclusion of this extended probation period, we will conduct another performance review to determine the subsequent course of action based on your performance.',
    ], 12),
    p('During this extended probationary period, we will continue to provide you with guidance, feedback, and support to help you excel in your role. Our aim is to ensure that you have the necessary time and resources to meet our performance expectations and demonstrate your full potential as a valuable member of our team.', 12),
    p('Please be aware that your terms and conditions of employment will remain the same during this extension, and all other aspects of your employment relationship with RightlyHR will remain unchanged.', 12),
    p('We believe that this extension will provide you with an opportunity to further showcase your abilities, and we have confidence in your potential to succeed in your current role. We are committed to working closely with you to ensure your continued growth and success within our organization.', 12),
    p('We look forward to witnessing your continued progress and contributions to our team during this extended probationary period.', 20),
    p('Sincerely,', 4),
    { text: 'For RightlyHR', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 8] },
    { text: data.authorityName, font: 'Autography', fontSize: PX(32), margin: [0, 0, 0, 4], noWrap: true },
    { text: 'Authority Signature', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 4] },
    { text: data.authorityName, font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 0] },
    { text: data.authorityDesignation ?? '', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 16] },
    ...(data.employeeSignatureDate ? [
      { text: fullName, font: 'Autography', fontSize: PX(32), alignment: 'right', noWrap: true, margin: [0, 0, 0, 4] },
      { text: "Employee's Signature", font: bodyFont, fontSize: PX(13), alignment: 'right' },
    ] : []),
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
