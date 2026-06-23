import { color } from "html2canvas/dist/types/css/types/color";

export interface TraineeOfferLetterData {
  firstName: string;
  middleName?: string;
  lastName: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  offerIssuedDate: string;
  dateOfJoining: string;
  endDate: string;
  internshipperiod: number;
  reportingmanagerName?: string;
  officeAddress?: string;
  stipendApplicable: boolean;
  monthlyAmount?: number | string;
  annualCTC?: number | string;
  note?: string;
  authorityName: string;
  authorityDesignation?: string;
  backgroundImageBase64?: string;
  useVerdanaFont?: boolean;
  useAutographyFont?: boolean;
  employeeFullName?: string;
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

export function buildTraineeOfferLetterDoc(data: TraineeOfferLetterData): any {
  const bodyFont = data.useVerdanaFont ? 'VERDANA' : undefined;
  const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');

  function p(text: any, marginBottom = 10): any {
    return { text, font: bodyFont, margin: [0, 0, 0, marginBottom] };
  }

  const stipendItems = data.stipendApplicable ? [
    [
      { text: 'Stipend:', font: 'VERDANABOLD' },
      { text: ` As per company policy, you will be entitled to receive a monthly stipend of INR `, font: bodyFont },
      { text: `${data.monthlyAmount ?? 0}`, font: 'VERDANABOLD' },
      { text: ' for the duration of your internship.', font: bodyFont },
    ],
    [
      { text: 'Full-Time Employment:', font: 'VERDANABOLD' },
      { text: ' Upon successful completion of your internship and subject to satisfactory performance, you may be considered for full-time employment with SNAD. The terms and conditions of full-time employment, including compensation and benefits, will be communicated at the time of confirmation.', font: bodyFont },
    ],
  ] : [
    [
      { text: 'Internship Period (First 3 Months):', font: 'VERDANABOLD' },
      { text: ' This will be an unpaid internship, and you will not be eligible for any stipend/salary during this period.', font: bodyFont },
    ],
    [
      { text: 'Stipend (Next 3 Months):', font: 'VERDANABOLD' },
      { text: ' Upon successful completion of the first 3 months, you will receive a stipend of ', font: bodyFont },
      { text: `INR ${data.monthlyAmount ?? 0} per month`, font: 'VERDANABOLD' },
      { text: ' for the next 3 months.', font: bodyFont },
    ],
    [
      { text: 'Full-Time Employment:', font: 'VERDANABOLD' },
      { text: ' After completion 6 months from the date of joining, based on satisfactory performance, you will be appointed as a full-time employee of SNAD with a ', font: bodyFont },
      { text: `CTC of ${data.annualCTC ?? 0} per annum`, font: 'VERDANABOLD' },
      { text: '.', font: bodyFont },
    ],
  ];

  const addressLines: string[] = [];
  if (data.addressLine1) addressLines.push(`${data.addressLine1},`);
  if (data.addressLine2) addressLines.push(`${data.addressLine2},`);
  if (data.city && data.state) addressLines.push(`${data.city}, ${data.state},`);
  if (data.country && data.pinCode) addressLines.push(`${data.country} - ${data.pinCode}.`);

  const page1: any[] = [
    { text: 'OFFER LETTER', font: 'VERDANABOLD', fontSize: PX(18), alignment: 'center', margin: [0, 0, 0, 16] },
    {
      columns: [
        {
          width: '60%',
          stack: [
            { text: fullName + ',', font: bodyFont, margin: [0, 0, 0, 2] },
            ...addressLines.map(line => ({ text: line, font: bodyFont, margin: [0, 0, 0, 2] })),
          ],
        },
        {
          width: '40%',
          text: `Date: ${fmt(data.offerIssuedDate)}`,
          alignment: 'right',
          font: 'VERDANABOLD',
        },
      ],
      margin: [0, 0, 0, 16],
    },
    { text: `Dear ${fullName},`, font: 'VERDANABOLD', margin: [0, 0, 0, 8] },
    p('The details of your internship offer are as follows:', 8),
    {
      ol: [
        {
          text: [
            { text: 'Start Date and Duration: ', font: 'VERDANABOLD'},
            'Your internship will commence on ',
            { text: fmt(data.dateOfJoining), font: 'VERDANABOLD', decoration: 'underline' },
            ' and is expected to complete on ',
            { text: fmt(data.endDate), font: 'VERDANABOLD', decoration: 'underline' },
            ' lasting for a period of ',
            { text: `${Math.round(data.internshipperiod)} Months`, font: 'VERDANABOLD'},
            '.',
          ],
          font: bodyFont,
          margin: [0, 0, 0, 10],
        },
        {
          text: [
            { text: 'Working Hours and Location: ', font: 'VERDANABOLD'},
            'The standard working hours are (10:00 AM to 7:00 PM), from (Monday to Friday), at our office located at RightlyHR',
            data.officeAddress ? `, ${data.officeAddress}` : '',
            '. Occasionally, you may be required to work additional hours or remotely, depending on the nature of the projects and business requirements.',
          ],
          font: bodyFont,
          margin: [0, 0, 0, 10],
        },
        {
          text: [
            { text: 'Reporting Manager: ', font: 'VERDANABOLD' },
            'You will be reporting to ',
            { text: data.reportingmanagerName ?? '', decoration: 'underline' },
            '.',
          ],
          font: bodyFont,
          margin: [0, 0, 0, 10],
        },
        {
          stack: [
            { text: [{ text: 'Stipend/Salary and Benefits: ', font: 'VERDANABOLD' }], font: bodyFont, margin: [0, 0, 0, 4] },
            {
              ul: stipendItems.map(item => ({ text: item, margin: [0, 0, 0, 4] })),
              font: bodyFont,
              margin: [0, 0, 0, 0],
            },
          ],
          margin: [0, 0, 0, 10],
        },
        {
          text: [
            { text: 'Responsibilities: ', font: 'VERDANABOLD' },
            'Your primary responsibilities will be explained by your reporting manager during the onboarding process. We expect you to conduct yourself professionally and adhere to company policies and procedures at all times.',
          ],
          font: bodyFont,
          margin: [0, 0, 0, 10],
        },
        {
          text: [
            { text: 'Confidentiality and Non-Disclosure: ', font: 'VERDANABOLD' },
            'As an intern, you will have access to sensitive and proprietary information. You are required to sign and adhere to the Confidentiality and Non-Disclosure Agreement, which will be provided separately.',
          ],
          font: bodyFont,
          margin: [0, 0, 0, 10],
        },
        {
          text: [
            { text: 'Evaluation and Feedback: ', font: 'VERDANABOLD' },
            'Your performance will be evaluated periodically. Constructive feedback will be provided to help you grow and make the most out of this opportunity.',
          ],
          font: bodyFont,
          margin: [0, 0, 0, 10],
        },
        {
          text: [
            { text: 'Termination: ', font: 'VERDANABOLD' },
            'The company may terminate this internship by providing 15 days written notice or the company is having a right to terminate this internship immediately, in case of poor performance.',
          ],
          font: bodyFont,
          margin: [0, 0, 0, 0],
        },
      ],
      font: bodyFont,
    },
  ];

  const page2: any[] = [
    { text: '', pageBreak: 'before' },
    ...(data.note ? [p([{ text: 'Note: ', font: 'VERDANABOLD' }, data.note], 12)] : []),
    p([
      'Please confirm your acceptance of this offer by signing and returning a scanned copy of this letter within 1 day to ',
      { text: 'hr@snaddevelopers.com', decoration: 'underline', color:'#0d6efd' },
      '.',
    ], 12),
    p('We are excited about the possibility of you joining our team and look forward to a productive and successful internship.', 20),
    p('Your Sincerely,', 4),
    { text: 'For RightlyHR', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 16] },
    { text: data.authorityName, font: 'Autography', fontSize: PX(32), margin: [0, 0, 0, 4], noWrap: true, alignment: 'left' },
    { text: 'Authorized Signatory,', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 4] },
    { text: data.authorityName, font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 4] },
    { text: data.authorityDesignation ?? '', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 36] },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 470, y2: 0, lineWidth: 1, lineColor: '#d8d8da' }], margin: [0, 0, 0, 36] },
    {
      text: data.employeeFullName
        ? ['I, ', { text: data.employeeFullName, font: 'VERDANABOLD' }, ', acknowledge that I have read and understood the terms of this Internship Offer, and I accept the offer as outlined above.']
        : 'I, _________________, acknowledge that I have read and understood the terms of this Internship Offer, and I accept the offer as outlined above.',
      font: bodyFont, margin: [0, 0, 0, 16],
    },
    {
      text: data.employeeFullName
        ? ['Signature: ', { text: data.employeeFullName, font: 'Autography' , fontSize: PX(32), noWrap: true }]
        : 'Signature: _________________________',
      font: bodyFont, margin: [0, 0, 0, 4], alignment: 'left',
    },
    { text: `Date: ${data.employeeFullName ? fmt(new Date().toISOString()) : '______________________________'}`, font: bodyFont, margin: [0, 0, 0, 0] },
  ];

  function stampFont(nodes: any[]): any[] {
    return nodes.map(node => {
      if (typeof node === 'string') return node;
      if (Array.isArray(node)) return stampFont(node);
      const stamped: any = node.font ? node : { font: bodyFont, ...node };
      if (stamped.table?.body) {
        stamped.table.body = stamped.table.body.map((row: any[]) =>
          row.map((cell: any) => {
            if (!cell || typeof cell !== 'object') return cell;
            if (cell.font || cell.text === '') return cell;
            const s: any = { font: bodyFont, ...cell };
            if (Array.isArray(s.text)) {
              s.text = s.text.map((t: any) => typeof t === 'string' ? t : (t.font ? t : { font: bodyFont, ...t }));
            }
            return s;
          })
        );
      }
      if (Array.isArray(stamped.text)) {
        stamped.text = stamped.text.map((t: any) => typeof t === 'string' ? t : (t.font ? t : { font: bodyFont, ...t }));
      }
      if (stamped.stack) stamped.stack = stampFont(stamped.stack);
      if (stamped.columns) stamped.columns = stampFont(stamped.columns);
      if (stamped.ol) stamped.ol = stampFont(stamped.ol);
      if (stamped.ul) stamped.ul = stampFont(stamped.ul);
      return stamped;
    });
  }

  const allContent = stampFont([...page1, ...page2]);
  const topMargin = data.backgroundImageBase64 ? 120 : 50;
  const bottomMargin = data.backgroundImageBase64 ? 120 : 50;

  const docDef: any = {
    pageSize: 'A4',
    pageMargins: [60, topMargin, 60, bottomMargin],
    defaultStyle: { font: bodyFont, fontSize: PX(13), color: '#000' },
    content: allContent,
  };

  if (data.backgroundImageBase64) {
    docDef.images = { letterBg: data.backgroundImageBase64 };
    docDef.background = () => ({ image: 'letterBg', width: 620, height: 870, absolutePosition: { x: -12, y: -14 } });
  }

  return docDef;
}