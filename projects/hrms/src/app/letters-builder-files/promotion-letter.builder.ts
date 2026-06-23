export interface PromotionLetterData {
  firstName: string;
  middleName?: string;
  lastName: string;
  jobRole: string;
  dateOfPromotion: string;
  compEffectiveDate: string;
  salary?: number;
  notes?: string;
  basicSalary?: number;
  basicPerannum?: number;
  hraSalary?: number;
  hraPerAnnum?: number;
  educationAllowances?: number;
  educationallowancesPerAnnum?: number;
  Conveyance?: number;
  conveyancePerAnnum?: number;
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
  totalDeduction?: number;
  totalDeductionsPerAnnum?: number;
  netSalary?: number;
  netSalaryPerAnnum?: number;
  esicContribution?: number;
  esiPerAnnum?: number;
  grossSalary?: number;
  authorityFullName: string;
  authorityDesignation: string;
  employeeSignatureDate?: string;
  backgroundImageBase64?: string;
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

function n(v: number | undefined): number { return v ?? 0; }

export function buildPromotionLetterDoc(data: PromotionLetterData): any {
  const bodyFont = data.useVerdanaFont ? 'VERDANA' : undefined;

  function c(text: any, bold = false, alignment = 'center'): any {
    return { text: text ?? '', bold, alignment, font: bodyFont };
  }
  function p(text: any, marginBottom = 10): any {
    return { text, font: bodyFont, margin: [0, 0, 0, marginBottom] };
  }
  function salRow(label: string, monthly: any, annual: any, bold = false) {
    return [c(label, bold, 'left'), c(monthly ?? 0, bold), c(annual ?? 0, bold)];
  }

  const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');

  const salaryTable = {
    table: {
      widths: ['*', 85, 85],
      body: [
        [c('Components in Salary', true), c('Per Month', true), c('Per Annum', true)],
        salRow('Basic Salary', n(data.basicSalary), n(data.basicPerannum)),
        salRow('HRA', n(data.hraSalary), n(data.hraPerAnnum)),
        salRow('Educational Allowances', n(data.educationAllowances), n(data.educationallowancesPerAnnum)),
        salRow('Conveyance', n(data.Conveyance), n(data.conveyancePerAnnum)),
        salRow('Other Allowances', n(data.otherAllowances), n(data.otherAllowancesPerAnnum)),
        salRow('Total Gross Salary', n(data.totalGrossSalary), n(data.totalGrossPerAnnum), true),
        salRow('PF Contribution by Employee', n(data.pfContribution), n(data.pfPreAnuum)),
        salRow('ESI Contribution by Employee', n(data.employeeEsi), n(data.esiPerAnnumemployee)),
        salRow('Professional Tax (PT)', n(data.professionalTax), n(data.professionalPerAnnum)),
        salRow('Total Deductions (PF+ESI+PT)', n(data.totalDeduction), n(data.totalDeductionsPerAnnum), true),
        salRow('Net Salary', n(data.netSalary), n(data.netSalaryPerAnnum), true),
      ],
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 12],
    font: bodyFont,
  };

  const ctcTable = {
    table: {
      widths: ['*', 85, 85],
      body: [
        [{ text: 'CTC Calculation', bold: true, alignment: 'center', colSpan: 3, font: bodyFont }, { text: '' }, { text: '' }],
        salRow('Employer PF Contribution', n(data.pfContribution), n(data.pfPreAnuum)),
        salRow('Employer ESI Contribution', n(data.esicContribution), n(data.esiPerAnnum)),
        salRow('CTC = Gross Salary + (PF + ESI)', n(data.grossSalary), n(data.salary), true),
      ],
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 16],
    font: bodyFont,
  };

  const content: any[] = [
    { text: 'Promotion Letter', bold: true, fontSize: PX(20), alignment: 'center', margin: [0, 0, 0, 12], font: bodyFont },
    { text: `Date: ${fmt(data.dateOfPromotion)}`, alignment: 'right', margin: [0, 0, 0, 16], font: bodyFont },
    p(`Dear ${fullName},`, 12),
    p([
      'I hope this letter finds you well. Based on your exceptional performance, dedication and contributions to our organization, you have been promoted to the position of ',
      { text: data.jobRole || '', bold: true },
      '. As a token of our appreciation for your exceptional performance, we are pleased to inform you that you will be receiving a salary increase. Your new salary shall be effective from ',
      { text: fmt(data.compEffectiveDate), bold: true },
      ' & with revised annual CTC of ',
      { text: `₹${n(data.salary)}/-`, bold: true },
      '.',
    ], 12),
    salaryTable,
    ctcTable,
    ...(data.notes ? [p(data.notes, 12)] : []),
    p('We hope that you will continue your progress with the same dedication and commitment.', 10),
    p('Once again, congratulations on your success and cheers to more good work in the future.', 10),
    p('We wish you all the best.', 20),
    p('Sincerely,', 4),
    { text: 'For SNAD Developers India Pvt Ltd', fontSize: PX(14), margin: [0, 0, 0, 36], font: 'VERDANABOLD' },
    { text: data.authorityFullName, font: data.useAutographyFont ? 'Autography' : bodyFont, fontSize: PX(32), margin: [0, 0, 0, 4], noWrap: true, alignment: 'left' },
    { text: data.authorityFullName, fontSize: PX(13), margin: [0, 0, 0, 4], font: 'VERDANABOLD' },
    { text: data.authorityDesignation, fontSize: PX(13), margin: [0, 0, 0, 16], font: 'VERDANABOLD' },
    {
      table: {
        widths: ['*', '*'],
        body: [
          [
            { text: [{ text: 'Employee Name: ', font: bodyFont }, { text: fullName, font: 'VERDANABOLD' }], border: [false, false, false, false] },
            { text: '', border: [false, false, false, false] },
          ],
          [
            {
              text: data.employeeSignatureDate ? [
                { text: 'Employee Signature: ', font: bodyFont },
                { text: fullName, font: 'Autography', fontSize: PX(24) }
              ] : [
                { text: 'Employee Signature: ', font: bodyFont }
              ],
              border: [false, false, false, false]
            },
            { text: '', border: [false, false, false, false] },
          ],
          [
            { text: [{ text: 'Date: ', font: bodyFont }, { text: data.employeeSignatureDate || '', font: bodyFont }], border: [false, false, false, false] },
            { text: '', border: [false, false, false, false] },
          ],
        ],
      },
      margin: [0, 0, 0, 0],
    },
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
      return stamped;
    });
  }

  const styledContent = stampFont(content);
  const topMargin = data.backgroundImageBase64 ? 130 : 50;
  const bottomMargin = data.backgroundImageBase64 ? 120 : 50;

  const docDef: any = {
    pageSize: 'A4',
    pageMargins: [60, topMargin, 60, bottomMargin],
    defaultStyle: { font: bodyFont, fontSize: PX(15), lineHeight: 1.3, color: '#000000' },
    content: styledContent,
  };

  if (data.backgroundImageBase64) {
    docDef.images = { letterBg: data.backgroundImageBase64 };
    docDef.background = () => ({ image: 'letterBg', width: 620, height: 870, absolutePosition: { x: -12, y: -14 } });
  }

  return docDef;
}
