export interface SalaryRevisionLetterData {
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: string;
  jobRole: string;
  letterDate: string;
  compEffectiveDate: string;
  totalCTC: number;
  variablePayAmount?: number;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
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

export function buildSalaryRevisionLetterDoc(data: SalaryRevisionLetterData): any {
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
    return [c(label, { alignment: 'center' }), c(monthly ?? '', { alignment: 'center' }), c(annual ?? '', { alignment: 'center' })];
  }

  function boldRow(label: string, monthly: any, annual: any, fillColor?: string): any[] {
    const fill = fillColor ? { fillColor } : {};
    return [
      boldCell(label, fill),
      boldCell(monthly ?? '', { alignment: 'center', ...fill }),
      boldCell(annual ?? '', { alignment: 'center', ...fill }),
    ];
  }

  function ctcSpan(label: string, value: any): any[] {
    return [boldCell(label), { text: value !== '' ? String(value ?? '') : '', font: 'VERDANABOLD', alignment: 'center', colSpan: 2 }, { text: '' }];
  }

  const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');
  function genderPrefix(g?: string): string {
    if (!g) return '';
    const lower = g.toLowerCase();
    if (lower === 'male') return 'Mr.';
    if (lower === 'female') return 'Ms.';
    return g;
  }
  const prefix = genderPrefix(data.gender);
  const salutation = prefix ? `${prefix} ${fullName}` : fullName;

  const hasAddress = !!(data.addressLine1);
  const addressLines: string[] = [];
  if (data.addressLine1) addressLines.push(data.addressLine1);
  if (data.addressLine2) addressLines.push(data.addressLine2);
  if (data.city) addressLines.push(data.city);
  if (data.state && data.zipCode) addressLines.push(`${data.state} - ${data.zipCode}`);
  else if (data.state) addressLines.push(data.state);

  const salaryTable = {
    table: {
      widths: ['*', 85, 85],
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
    margin: [0, 0, 0, 10],
    font: bodyFont,
  };

  const ctcTable = {
    table: {
      widths: ['*', 85, 85],
      body: [
        [{ text: 'CTC Calculation', font: 'VERDANABOLD', colSpan: 3, alignment: 'center', fillColor: '#e7f0fd', color: '#000' }, { text: '' }, { text: '' }],
        salRow('Employer PF Contribution', e(data.pfContribution), e(data.pfPreAnuum)),
        salRow('Employer ESI Contribution', e(data.esicContribution), e(data.esiPerAnnum)),
        ctcSpan('Variable Amount', e(data.variablePayAmount)),
        [boldCell('CTC = Gross Salary + (Employer PF+ESI+Variable Amount)'), boldCell(e(data.grossSalary), { alignment: 'center', fillColor: '#fce4d6' }), boldCell(e(data.salary), { alignment: 'center', fillColor: '#fce4d6' })],
      ],
    },
    margin: [0, 0, 0, 14],
    font: bodyFont,
  };

  const additionalDetails = [
    { text: 'TDS will be deducted from the Gross Salary after statutory deductions.', label: 'a)' },
    { text: 'Employees are responsible for their Tax Planning.', label: 'b)' },
    { text: 'Employees may avail tax benefit by submitting bills against Leave Travel Allowance.', label: 'c)' },
    { text: 'All eligible employees as per the respective policies of the Company will be covered under the Group Medical Coverage Policy and Group Covid policy.', label: 'd)' },
    { text: 'All the above benefits are as per the Company\'s policies, which are subjective to change from time to time. Further salary, allowances, any alteration in salary structure and other payments/benefits will be governed by The Company\'s rules as well as statutory provisions in force from time to time and subject to deduction of appropriate taxes as applicable under government norms.', label: 'e)' },
    { text: 'While the other terms and conditions of your appointment remain unchanged, please do take note that as per the current Company\'s Separation Policy, if you resign from the services of the company, you will be liable to serve Ninety (90) days i.e. Three (3) months of Notice Period.', label: 'f)' },
    { text: 'Medical insurance amount will be calculated based on the number of dependents; the respective amount will be deducted from your monthly salary.', label: 'g)', bold: true },
  ];

  const page1: any[] = [
    { text: 'Salary Revision Letter', fontSize: PX(14), alignment: 'center', decoration: 'underline', margin: [0, 0, 0, 12], font: 'VERDANABOLD' },
    { text: `Date: ${fmt(data.letterDate)}`, alignment: 'right', margin: [0, 0, 0, 12], font: bodyFont },
    p(`${salutation},`, 4),
    ...(hasAddress ? [
      p('Address', 4),
      ...addressLines.map(line => p(line, 2)),
    ] : []),
    p('', 8),
    p(`Dear ${salutation},`, 12),
    p('Management has truly recognized your potential for growth with the company and thus has given you a salary revision with great expectations. We would like you to take it as a challenge and prove your mettle.', 10),
    p([
      'Keeping in view the above, Management has decided to revise your CTC to ',
      { text: `Rs.${n(data.totalCTC)}/-`, font: 'VERDANABOLD' },
      ' w.e.f. This revision will be effective from ',
      { text: fmt(data.compEffectiveDate), decoration: 'underline' },
      '.',
    ], 10),
    p('We are confident that you will put in your best efforts in discharging your duties and responsibilities even more efficiently and in the best of interest of the organization and measure up to the confidence and faith reposed in you by the Management repeatedly.', 10),
    p('All other terms & conditions of your Appointment Letter will remain unchanged.', 16),
    p('Yours sincerely,', 4),
    { text: 'For RightlyHR', fontSize: PX(12), margin: [0, 0, 0, 24], font: 'VERDANABOLD' },
    {
      columns: [
        {
          width: '*',
          stack: [
            {
              table: {
                widths: ['*'],
                body: [[{
                  text: data.authorityFullName,
                  font: 'Autography',
                  fontSize: PX(32),
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
              margin: [0, 0, 0, 0],
            },
            { text: 'Authorized Signatory,', fontSize: PX(12), margin: [0, 0, 0, 0], font: 'VERDANABOLD' },
            { text: data.authorityFullName, fontSize: PX(12), margin: [0, 0, 0, 0], font: 'VERDANABOLD' },
            { text: data.authorityDesignation, fontSize: PX(12), margin: [0, 0, 0, 0], font: 'VERDANABOLD' },
          ],
        },
        {
          width: '*',
          stack: [
            { text: [{ text: 'Employee Name: ', font: 'VERDANABOLD' }, { text: fullName, font: bodyFont }], margin: [0, 0, 0, 8] },
            {
              columns: [
                { text: 'Employee Signature: ', font: 'VERDANABOLD', width: 'auto', margin: [0, 0, 0, 8] },
                data.employeeSignatureDate
                  ? { text: fullName, font: 'Autography', fontSize: PX(24), width: 'auto', noWrap: true }
                  : { text: '', width: 'auto' },
              ],
              columnGap: 2,
              margin: [0, 0, 0, 8],
            },
            { text: [{ text: 'Date: ', font: 'VERDANABOLD' }, { text: data.employeeSignatureDate ? fmt(data.employeeSignatureDate) : '', font: bodyFont }], margin: [0, 0, 0, 0] },
          ],
        },
      ],
      margin: [0, 0, 0, 0],
    },
  ];

  const page2: any[] = [
    { text: 'Annexure – A', fontSize: PX(14), alignment: 'center', margin: [0, 0, 0, 8], font: 'VERDANABOLD' },
    { text: 'STRICTLY PRIVATE & CONFIDENTIAL', fontSize: PX(13), alignment: 'center', margin: [0, 0, 0, 8], font: 'VERDANABOLD' },
    {
      table: {
        widths: ['auto', '*', 'auto', '*'],
        body: [[
          { text: 'NAME', font: bodyFont },
          { text: fullName, font: 'VERDANABOLD' },
          { text: 'Designation', font: bodyFont },
          { text: data.jobRole || '', font: 'VERDANABOLD' },
        ]],
      },
      margin: [0, 0, 0, 8],
    },
    { text: ['Compensation Details ', { text: '(All figures in Rs.)', bold: false }], alignment: 'center', margin: [0, 0, 0, 8], font: 'VERDANABOLD'},
    salaryTable,
    ctcTable,
    { text: 'Additional Details Related to Salary Structure:', margin: [0, 0, 0, 2], font: 'VERDANABOLD'},
    {
      table: {
        widths: ['auto', '*'],
        body: additionalDetails.map(item => [
          { text: item.label, font: bodyFont, bold: item.bold || false, margin: [0, 0, 0, 0] },
          { text: item.text, font: bodyFont, bold: item.bold || false, margin: [0, 0, 0, 0] },
        ]),
      },
      layout: 'noBorders',
      margin: [12, 0, 0, 0],
    },
    p([
      { text: 'Note: ', font: 'VERDANABOLD', decoration: 'underline' },
      { text: 'The above compensation package is strictly confidential between you and the Company and should not be discussed with anyone nor divulged to anyone in any manner whatsoever.', font: 'VERDANABOLD' },
    ], 0),
  ];

  function stampFont(nodes: any[]): any[] {
    return nodes.map(node => {
      if (typeof node === 'string') return node;
      if (Array.isArray(node)) return stampFont(node);
      const stamped: any = node.font ? node : { font: bodyFont, ...node };
      if (stamped.table?.body) {
        stamped.table.body = stamped.table.body.map((row: any[]) =>
          row.map(cell => {
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
      return stamped;
    });
  }

  const topMarginPage1 = data.backgroundImageBase64 ? 115 : 50;
  const topMarginPage2 = data.backgroundImageBase64 ? 100 : 50;
  const bottomMargin   = data.backgroundImageBase64 ? 115 : 50;

  const page1Content = {
    margin: [0, topMarginPage1, 0, bottomMargin],
    stack: stampFont([...page1]),
  };

  const page2Content = {
    pageBreak: 'before',
    margin: [0, topMarginPage2, 0, bottomMargin],
    stack: stampFont([...page2]),
  };

  const docDef: any = {
    pageSize: 'A4',
    pageMargins: [60, 0, 60, 0],
    defaultStyle: { font: bodyFont, fontSize: PX(12), color: '#000' },
    content: [page1Content, page2Content],
  };

  if (data.backgroundImageBase64) {
    docDef.images = { letterBg: data.backgroundImageBase64 };
    docDef.background = () => ({ image: 'letterBg', width: 620, height: 870, absolutePosition: { x: -12, y: -14 } });
  }

  return docDef;
}