import { applyLetterPageSetup, LETTER_MARGINS, stampFont } from "./letter-builder.utils";

export interface AppraisalLetterData {
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: string;
  jobRole: string;
  letterDate: string;
  compEffectiveDate: string;
  totalCTC: number;
  isPromotion?: boolean;
  newJobRole?: string;
  reviewDate?: string;
  variablePayAmount?: number;
  note?: string;
  basicSalary?: number;
  basicPerannum?: number;
  hraSalary?: number;
  hraPerAnnum?: number;
  otherAllowances?: number;
  otherAllowancesPerAnnum?: number;
  totalGrossSalary?: number;
  totalGrossPerAnnum?: number;
  pfContribution?: number;
  pfPreAnuum?: number;
  employeeEsi?: number;
  esiPerAnnumemployee?: number;
  professionalTax?: number;
  professionalPerAnnum?: number;
  educationAllowances?: number;
  educationallowancesPerAnnum?: number;
  totalDeduction?: number;
  totalDeductionsPerAnnum?: number;
  netSalary?: number;
  netSalaryPerAnnum?: number;
  esicContribution?: number;
  esiPerAnnum?: number;
  grossSalary?: number;
  salary?: number;
  authorityFullName: string;
  authorityDesignation: string;
  employeeSignatureDate?: string;
  backgroundImageBase64?: string;
  headerLogoBase64?: string;
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

function n(v: number | undefined): number { return v ?? 0; }
function e(v: number | undefined): number | string { return v ? v : ''; }

export function buildAppraisalLetterDoc(data: AppraisalLetterData): any {
  const bodyFont = data.useVerdanaFont ? 'VERDANA' : undefined;

  function c(text: any, extra?: any): any {
    return { text: text ?? '', font: bodyFont, ...extra };
  }

  function th(text: string): any {
    return { text, font: 'VERDANABOLD', fillColor: '#e7f0fd', alignment: 'center' };
  }

  function boldCell(text: any, extra?: any): any {
    return { text: text ?? '', font: 'VERDANABOLD', ...extra, alignment: 'center' };
  }

  function p(text: any, marginBottom = 10): any {
    return { text, font: bodyFont, margin: [0, 0, 0, marginBottom] };
  }

  function salRow(label: string, monthly: any, annual: any): any[] {
    return [c(label, { alignment: 'center' }), c(monthly ?? 0, { alignment: 'center' }), c(annual ?? 0, { alignment: 'center' })];
  }

  function boldRow(label: string, monthly: any, annual: any, fillColor?: string): any[] {
    const fill = fillColor ? { fillColor } : {};
    return [
      boldCell(label, fill),
      boldCell(monthly ?? 0, { alignment: 'center', ...fill }),
      boldCell(annual ?? 0, { alignment: 'center', ...fill }),
    ];
  }

  function ctcSpan(label: string, value: any): any[] {
    return [boldCell(label), { text: value !== '' ? String(value ?? '') : '', font: 'VERDANABOLD', alignment: 'center', colSpan: 2 }, { text: '' }];
  }

  const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');

  const commonTableLayout = {
    paddingLeft: () => 3,
    paddingRight: () => 3,
    paddingTop: () => 3,
    paddingBottom: () => 3,
  };

  const salaryTable = {
    table: {
      widths: ['*', 72, 72],
      body: [
        [th('Components In Salary'), th('Per Month'), th('Per Annum')],
        salRow('Basic Salary', e(data.basicSalary), e(data.basicPerannum)),
        salRow('HRA', e(data.hraSalary), e(data.hraPerAnnum)),
        salRow('Other Allowances', e(data.otherAllowances), e(data.otherAllowancesPerAnnum)),
        boldRow('Total Gross Salary', e(data.totalGrossSalary), e(data.totalGrossPerAnnum), '#fff2cc'),
        salRow('PF Contribution by Employee', e(data.pfContribution), e(data.pfPreAnuum)),
        salRow('ESI Contribution by Employee', e(data.employeeEsi), e(data.esiPerAnnumemployee)),
        salRow('Professional Tax (PT)', e(data.professionalTax), e(data.professionalPerAnnum)),
        salRow('Medical Insurance', e(data.educationAllowances), e(data.educationallowancesPerAnnum)),
        boldRow('Total Deductions (PF+ESI+PT)', e(data.totalDeduction), e(data.totalDeductionsPerAnnum), '#fff2cc'),
        boldRow('Net Salary', e(data.netSalary), e(data.netSalaryPerAnnum), '#fff2cc'),
      ],
    },
    layout: commonTableLayout,
    defaultStyle: {
      alignment: 'center',
    },
    margin: [0, 0, 0, 6],
    font: bodyFont,
  };

  const ctcTable = {
    table: {
      widths: ['*', 72, 72],
      body: [
        [
          {
            text: 'CTC Calculation',
            font: 'VERDANABOLD',
            colSpan: 3,
            alignment: 'center',
            fillColor: '#e7f0fd',
            color: '#000'
          },
          { text: '' },
          { text: '' }
        ],
        salRow('Employer PF Contribution', e(data.pfContribution), e(data.pfPreAnuum)),
        salRow('Employer ESI Contribution', e(data.esicContribution), e(data.esiPerAnnum)),
        [
          boldCell('CTC=Gross Salary +(Employer PF+ESI+Medical Insurance)', { alignment: 'center' }),
          boldCell(e(data.grossSalary), { alignment: 'center', fillColor: '#fce4d6' }),
          boldCell(e(data.salary), { alignment: 'center', fillColor: '#fce4d6' })
        ],
        ctcSpan('Variable Pay', e(data.variablePayAmount)),
        ctcSpan('Total CTC (Including Variable Pay & ESOP)', e(data.totalCTC)),
      ],
    },

    layout: commonTableLayout,

    defaultStyle: {
      alignment: 'center',
    },

    margin: [0, 0, 0, 0],
    font: bodyFont,
  };

  const page1: any[] = [
    { text: 'Appraisal Letter', fontSize: PX(14), alignment: 'center', margin: [0, 0, 0, 6], font: 'VERDANABOLD', },
    { text: `Date: ${fmt(data.letterDate)}`, alignment: 'right', margin: [0, 0, 0, 6], font: 'VERDANABOLD' },
    p([{ text: `${data.gender ? data.gender + ' ' : ''}${fullName}`, font: 'VERDANABOLD' }, '\n', { text: data.jobRole || '', font: 'VERDANABOLD' }], 10),
    p([{ text: `Dear ${fullName},`, font: 'VERDANABOLD' }], 10),
    p('We are pleased to present you with this appraisal letter on behalf of RightlyHR. We want to extend our gratitude for your dedication and substantial contributions to the organization. Your hard work and commitment have made a significant impact on our success.', 7),
    ...(data.isPromotion && data.newJobRole ? [
      p([
        'We are happy with your performance and are equally pleased to share that you have been promoted to ',
        { text: data.newJobRole, font: 'VERDANABOLD', decoration: 'underline' },
        '.',
      ], 8),
    ] : []),
    p([
      'Based on your excellent performance, we have revised your compensation and benefits, effective from ',
      { text: fmt(data.compEffectiveDate), decoration: 'underline' },
      '. Your annual remuneration has been revised to ',
      { text: `Rs.${n(data.totalCTC)}`, font: 'VERDANABOLD' },
      '.',
    ], 8),
    p('We are confident that you will put in your best efforts in discharging your duties and responsibilities even more efficiently and in the best of interest of the organization and measure up to the confidence and faith reposed in you by the Management repeatedly.', 7),
    p('All other terms & conditions of your Appointment Letter will remain unchanged.', 8),
    p('Your new compensation structure is as follows:', 10),
    salaryTable,
    ctcTable,
  ];

  const additionalDetails = [
    'TDS will be deducted from the Gross Salary after statutory deductions.',
    'Employees are responsible for their Tax Planning.',
    'All the above benefits are as per the Company\'s policies, which are subjective to change from time to time. Further salary, allowances, any alteration in salary structure and other payments/benefits will be governed by The Company\'s rules as well as statutory provisions in force from time to time and subject to deduction of appropriate taxes as applicable under government norms.',
    'While the other terms and conditions of your appointment remain unchanged, please do take note that as per the current Company\'s Separation Policy, if you resign from the services of the company, you will be liable to serve Ninety (90) days i.e. Three (3) months of Notice Period.',
    'Medical insurance amount will be calculated based on the number of dependents; the respective amount will be deducted from your monthly salary.',
  ];

  const page2: any[] = [
    ...(data.note
      ? [{ text: [{ text: 'Note: ', font: 'VERDANABOLD' }, { text: data.note, font: 'VERDANABOLD' }], font: bodyFont, margin: [0, 0, 0, 12], pageBreak: 'before' }]
      : [{ text: '', pageBreak: 'before' }]
    ),
    p({ text: 'Additional Details Related to Salary Structure:', font: 'VERDANABOLD' }, 8),
    {
      ol: additionalDetails.map((item, i) => ({
        text: item,
        font: i === additionalDetails.length - 1 ? 'VERDANABOLD' : bodyFont,
        margin: [0, 0, 0, 6],
      })),
      margin: [0, 0, 0, 4],
      font: bodyFont,
    },
    p([
      'Your next compensation review will come up in ',
      { text: fmt(data.reviewDate || ''), decoration: 'underline' },
      '. We look forward to even greater contribution from you in the future.',
    ], 24),
    { text: 'For RightlyHR', font: 'VERDANABOLD', fontSize: PX(12), margin: [0, 0, 0, 16]},
    {
      table: {
        widths: ['*'],
        body: [[{
          text: data.authorityFullName,
          font: 'Autography',
          fontSize: PX(33),
          noWrap: true,
          lineHeight: 1,
          alignment: 'left',
          border: [false, false, false, false],
        }]],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
      margin: [0, 0, 0, 4],
    },
    { text: 'Authorized Signatory,', font: 'VERDANABOLD', fontSize: PX(12), margin: [0, 0, 0, 0]},
    { text: data.authorityFullName, font: 'VERDANABOLD', fontSize: PX(12), margin: [0, 0, 0, 0]},
    { text: data.authorityDesignation, font: 'VERDANABOLD', fontSize: PX(12), margin: [0, 0, 0, 30]},
    { text: [{ text: 'Employee Name: ', font: 'VERDANABOLD' }, { text: fullName, font: 'VERDANABOLD' }], margin: [0, 0, 0, 2] },
    {
      columns: [
        { text: 'Employee Signature: ', font: 'VERDANABOLD', width: 'auto', margin: [0, 8, 0, 0] },
        data.employeeSignatureDate
          ? { text: fullName, font: 'Autography', fontSize: PX(24), width: 'auto', noWrap: true }
          : { text: '', width: 'auto' },
      ],
      columnGap: 2,
      margin: [0, 0, 0, 4],
    },
    { text: [{ text: 'Date: ', font: 'VERDANABOLD' }, { text: data.employeeSignatureDate ? fmt(data.employeeSignatureDate) : '', font: bodyFont }], margin: [0, 0, 0, 8] },
  ];

   const content: any[] = [...page1, ...page2];
   const isSoftCopy = !!data.backgroundImageBase64;
    const margins = isSoftCopy ? LETTER_MARGINS.softCopy : LETTER_MARGINS.hardCopy;

    const docDef: any = {
      pageSize: 'A4',
      pageMargins: [margins.left, margins.top, margins.right, margins.bottom],
      defaultStyle: {
        font: bodyFont,
        fontSize: PX(14),
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
