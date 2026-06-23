import { applyLetterPageSetup, LETTER_MARGINS, stampFont } from "./letter-builder.utils";

export interface OfferLetterData {
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
  offerExpiryDate: string;
  jobRole: string;
  workAddress: string;
  amount: number;
  variablePayAmount: number;
  authorityName: string;
  authorityDesignation: string;
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
  totalDeduction?: number;
  totalDeductionsPerAnnum?: number;
  netSalary?: number;
  netSalaryPerAnnum?: number;
  grossSalary?: number;
  esicContribution?: number;
  esiPerAnnum?: number;
  backgroundImageBase64?: string;
  headerLogoBase64?:string;
  useVerdanaFont?: boolean;
  useAutographyFont?: boolean;
  employeeFullName?: string;
}

const PX = (px: number) => Math.round((px * 72) / 96);

function fmt(dateStr: string): string {
  if (!dateStr) return dateStr;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function v(n?: number): string {
  return n ? n.toString() : '';
}

export function buildOfferLetterDoc(data: OfferLetterData): any {
  const {
    firstName, middleName, lastName,
    addressLine1, addressLine2, city, state, country, pinCode,
    offerIssuedDate, dateOfJoining, offerExpiryDate,
    jobRole, workAddress, amount, variablePayAmount,
    authorityName, authorityDesignation, note,
  } = data;

  const bodyFont = data.useVerdanaFont ? 'VERDANA' : undefined;
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
  const hasAddress = !!(addressLine1);
  const issuedDate = fmt(offerIssuedDate);
  const doj = fmt(dateOfJoining);
  const expiryDate = fmt(offerExpiryDate);
  const ctcTotal = (+(amount ?? 0)) + (+(variablePayAmount ?? 0));
  const ctcPerAnnumDisplay = amount ? ctcTotal.toString() : '';

  function p(text: any, marginBottom = 8): any {
    return { font: bodyFont, text, margin: [0, 0, 0, marginBottom] };
  }

  function checkbox(label: string, marginBottom = 4, leftMargin = 0): any {
    return {
      columns: [
        {
          canvas: [{ type: 'rect', x: 0, y: 1, w: PX(20), h: PX(16), lineWidth: 0.5, lineColor: '#a3a2a2' }],
          width: PX(24) + PX(8),
        },
        { text: label, width: '*' },
      ],
      margin: [leftMargin, 0, 0, marginBottom],
    };
  }

  function th(text: string): any {
    return { text, font: 'VERDANABOLD', fillColor: '#e7f0fd', alignment: 'center' };
  }

  function cell(text: string, extra?: any, styles?: {
    fillColor?: string;
    color?: string;
    alignment?: 'left' | 'center' | 'right'
  }): any {
    return { text, ...extra, ...styles };
  }

  function boldCell(text: string, extra?: any, styles?: {
    fillColor?: string;
    color?: string;
    alignment?: 'left' | 'center' | 'right'
  }): any {
    return { text, font: 'VERDANABOLD', ...extra, ...styles };
  }

  const addressLines: any[] = [];
  if (hasAddress) {
    addressLines.push({ text: `${addressLine1},`,font: 'VERDANABOLD', margin: [0, 0, 0, 2] });
    if (addressLine2) addressLines.push({ text: `${addressLine2},`,font: 'VERDANABOLD', margin: [0, 0, 0, 2] });
    addressLines.push({ text: `${city}, ${state},`,font: 'VERDANABOLD', margin: [0, 0, 0, 2] });
    addressLines.push({ text: `${country} - ${pinCode}.`,font: 'VERDANABOLD', margin: [0, 0, 0, 2] });
  }

  const content: any[] = [
    // ── PAGE 1 ──────────────────────────────────────────────────
    { text: 'OFFER LETTER', fontSize: PX(14), font: 'VERDANABOLD', alignment: 'center', margin: [0, 0, 0, 24] },
    {
      columns: [
        {
          width: '*',
          stack: [
            { text: `${fullName},`,font: 'VERDANABOLD', margin: [0, 0, 0, 2] },
            ...addressLines,
          ]
        },
        { width: 'auto', text: issuedDate, alignment: 'right',font: 'VERDANABOLD', }
      ],
      margin: [0, 0, 0, 10]
    },
    p([{ text: `Dear ${fullName},`, font: 'VERDANABOLD' }], 10),
    p('Congratulations and Welcome to RightlyHR!!!', 12),
    p([
      'Further to your application for employment with us,and the subsequent selection process, we are delighted to offer you the role of ',
      { text: jobRole, font: 'VERDANABOLD' },' in our organization and your ',{ text: 'CTC', font: 'VERDANABOLD' },' will be ',
      { text: `INR ${ctcTotal}`, font: 'VERDANABOLD' },' per annum.',
    ], 12),
    p('RightlyHR is formed as an INDIAN Spin-off of AVERON SOLUTIONS INC., a US based organization for providing Software Development and Services to various IT Organizations across the globe. We are a core team of engineers with a mindset to excel as a family under the guidance of our superior leadership.', 12),
    p([
      'Your reporting location will be ',
      { text: `RightlyHR, ${workAddress}. Your date of joining would be ${doj}.`, font: 'VERDANABOLD' },
    ], 12),
    p([
      'Your respective ',
      { text: 'Cost to Company', font: 'VERDANABOLD' },
      ' as applicable has been detailed in Annexure 2 of this letter. On your joining, you are expected to enter into an agreement, which specifies the details of the scope, terms, and conditions of your employment.',
    ], 12),

    {
      ol: [
        {
          text: [
            { text: 'Offer Letter Valid Period: ', font: 'VERDANABOLD' },
            'The currently issued offer letter will be valid up to ',
            { text: `${expiryDate}.`, font: 'VERDANABOLD' },
            ' The accepted offer letter along with the list of documents should be provided at least 30 days before the Joining Date for performing the necessary Background verification and initial setup.'
          ],
          margin: [0, 0, 0, 12]
        },

        {
          stack: [
            {
              text: [
                { text: 'Working Hours: ', font: 'VERDANABOLD' },
                'Your normal hours of work are from 10:00 AM hrs. to 07:00 PM hrs. Monday to Friday. Staff of support departments may be required to work on Weekends. The normal working hours are forty-five hours/week, Monday to Friday. Depending on project contingencies, working hours for specific employees or groups of employees may be modified / altered from time to time.'
              ],
              margin: [0, 0, 0, 8]
            },

            {
              text: "The working hours applicable to you will be observed depending upon your workplace of posting and as amended from time to time. Further you should be prepared to work in any shift, as may be warranted by the Company's / Client's work requirement. The employee may also be required to attend duties on Public Holidays as per the exigencies of work.",
              margin: [0, 0, 0, 12]
            }
          ]
        },

        {
          text: [
            { text: 'Annual Leave: ', font: 'VERDANABOLD' },
            'You will be entitled to Paid Leave and Public Holidays yearly as per your eligibility and the Company policies.'
          ],
          margin: [0, 0, 0, 12]
        }
      ],
      font: bodyFont,
      alignment: 'justify',
      margin: [6, 0, 0, 80]
    },

    {
      start: 4,
      ol: [
        {
          font: bodyFont, alignment: 'justify', margin: [0, 0, 0, 12], text: [
            { text: 'Notice Period: ', font: 'VERDANABOLD' },
            "Your services can be terminated by you by giving a notice of 90 days in writing or salary in lieu thereof, subject to the Company's discretion. The Company may terminate your employment by giving you salary for 30 days in lieu of the notice. Any employee who breaches the Company's terms and conditions under this offer would be terminated immediately without notice.",
          ]
        },

        {
          stack: [
            {
              text: [
                { text: 'Other Terms & Conditions of this Offer', font: 'VERDANABOLD' }
              ],
              margin: [0, 0, 0, 4]
            },
            {
              ul: [
                "During your service with the Company, you are expected to dedicate your whole time and attention to the Company's affairs and abstain from directly or indirectly engaging in any other business.",
                'Information pertaining to RightlyHR operations and intellectual property is confidential and you will sign a non-disclosure agreement. If you are bound by a confidentiality agreement with a previous employer, you must notify the Company and indemnify the Company against any breach thereof.',
                'You may be required to travel on Company work, and you will be reimbursed expenses as per Company policy.',
                'Your Remuneration and the terms and conditions of this offer letter shall remain confidential and are not to be disclosed to any third party.',
                'Upon acceptance of the offer letter, your official Employment ID will be created with us and you will entitled to the corporate benefits structure based on the category of work. Your employment with the company as a FTE will stand confirmed subjected to the terms and conditions as per rules, regulations, and policies of The Company.',
                'On termination of employment, you will immediately give up to the Company all correspondence, specifications, formulae, books, documents, hardware, market data, cost data, literature, drawings, effects or records, backup copies of programs source / data, etc. belonging to the Company and any other Company property or relating to its business and shall not make or retain any copies of the items.',
                "If you are absent from work without prior notification & approval as per Company policies, you will be liable for disciplinary action depending on the severity of the effects caused by the individual's absence.",
                "If you are absent for a continuous period of 7 days without leave or obtaining your manager's approval, you will be deemed to have voluntarily terminated your service without notice.",
                "All the terms and conditions of service may be modified or changed at the Company's discretion. You will abide by all the rules and regulations of the Company which are in force from time to time."
              ],
              margin: [0, 0, 0, 12]
            }
          ]
        }
      ],
      font: bodyFont,
      alignment: 'justify',
      margin: [6, 0, 0, 0]
    },

    p([
      'To confirm please send your ',
      { text: 'acceptance', font: 'VERDANABOLD' },
      ' of the offer via reply to the same ',
      { text: 'email', font: 'VERDANABOLD' },
      ' on or before ',
      { text: `${expiryDate}.`, font: 'VERDANABOLD' },
      ' We request you to please carry a signed copy of the offer letter & other required documents (',
      { text: 'Annexure 1', font: 'VERDANABOLD' },
      ') on the day of your joining.',
    ], 12),

    p(['We wish you a long, rewarding and fulfilling career experience and look forward to having you on board with us. Please visit our website ',
      { text: 'www.snaddevelopers.com', link: 'https://www.snaddevelopers.com', color: '#0d6efd', decoration: 'underline'},
      ' for more information about our Company.'], 12),

    p('All other detailed terms and conditions of your employment will be specified in the appointment letter, invention assignment and confidentiality agreement and the Company policies which will be provided to you separately. This Offer Letter along with the appointment letter, invention assignment and confidentiality agreement and the Company policies collectively form a part of your employment conditions.', 100),

    p("This Offer Letter is conditional upon you executing the appointment letter and/or any other agreement as may be requested by the Company at the time of joining. The Company may revoke this offer of employment anytime before execution of the appointment letter. Similarly, after accepting this offer, if you do not intend to join the Company, you shall have a right to inform your intentions any-time before your joining date.", 8),

    p(['For any further information or clarification required, please feel free to reach us on our email at ',{ text: 'hr@snaddevelopers.com', color: '#0d6efd', decoration: 'underline'}], 12),

    p('Yours Sincerely,', 4),
    { text: 'For RightlyHR', font: 'VERDANABOLD', fontSize: PX(14), margin: [0, 0, 0, 20] },
    { text: authorityName, font: data.useAutographyFont ? 'Autography' : bodyFont, fontSize: PX(32), margin: [0, 0, 0, 2], noWrap: true, alignment: 'left' },
    { text: 'Authorized Signatory,', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 0] },
    { text: authorityName, font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 0] },
    { text: authorityDesignation, font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 16] },

    p('I accept this offer of employment.', 24),
    {
      columns: [
        { width: '*', text: '______________________________' },
        { width: 'auto', text: 'Date (DD/MM/YYYY)' }
      ],
      margin: [0, 0, 0, 36]
    },

    { text: 'ACCEPTANCE', font: 'VERDANABOLD', fontSize: PX(14), margin: [0, 0, 0, 8] },
    p('I accept this offer letter and will complete all the necessary documents as required.', 16),
    {
      text: data.employeeFullName
        ? ['Signature: ', { text: data.employeeFullName, font: data.useAutographyFont ? 'Autography' : bodyFont, fontSize: PX(32), noWrap: true }]
        : 'Signature: _________________________',
      margin: [0, 0, 0, 8], alignment: 'left',
    },
    { text: ['Name: ', data.employeeFullName ?? ''], margin: [0, 0, 0, 8] },
    { text: ['Date: ', data.employeeFullName ? fmt(new Date().toISOString()) : ''], margin: [0, 0, 0, 8] },
    { text: 'Place:', margin: [0, 0, 0, 8] },
    { text: 'My Date of joining will be ________________________ (If different from the agreed joining Date above)', margin: [0, 0, 0, 8] },

    // ── ANNEXURE 1 ──────────────────────────────────────────────────
    { text: 'ANNEXURE - 1', font: 'VERDANABOLD', fontSize: PX(16), alignment: 'center', pageBreak: 'before', margin: [0, 0, 0, 8] },
    { text: 'Documents / Information required to be submitted on the day of joining:', font: 'VERDANABOLD', margin: [0, 0, 0, 8] },
    { text: 'On the day joining, you are requested to bring to the following original documents and certificates (For verification purpose), along with 1 copy of each', margin: [0, 0, 0, 8] },
    checkbox('Acceptance copies of RightlyHR. duly signed offer Letter.', 4),
    checkbox("Certificates' supporting your educational qualifications along with marks sheet", 4),
    checkbox('Xth certificate & marks sheet', 3, 20),
    checkbox('XII th certificate & marks sheet', 3, 20),
    checkbox('Graduation Degree certificate & Semester/year-wise mark sheets', 3, 20),
    checkbox("Master's Degree certificate & Semester/year-wise mark sheets (If Applicable)", 3, 20),
    checkbox('Diploma/PG Diploma certificate & Transcripts (If Applicable)', 3, 20),
    checkbox('Any other Certificate with supporting documents', 8, 20),
    checkbox('PAN Card (Mandatory)', 4),
    checkbox('AADHAAR Card (Mandatory)', 4),
    checkbox('Passport size photographs 3 colored photos.', 4),
    checkbox('Fitness/Medical report with proper blood group certified by medical practitioner.', 4),
    checkbox("Offer Letter from your current employer and all previous employer's (If Applicable).", 4),
    checkbox("Experience letter from your current employer and all previous employer's (If Applicable).", 4),
    checkbox('Relieving letter from your current employer (If Applicable).', 4),
    checkbox('Trainee Relieving letter from your current employer (If Applicable).', 4),
    checkbox('Valid Passport – Please submit a copy of the valid Passport (inclusive of all blank pages). In case you have applied for it, please submit the proof of Passport Office submission ticket. Upon receipt of Passport from Passport Office, please submit the documents to HCM Team. If you do not have a passport, please apply ASAP, and submit the acknowledgement.', 4),
    checkbox("Three last drawn salary pay slips of your previous employer (If Applicable).", 4),
    checkbox('Form 16 of last year if paying tax previously (If Applicable).', 4),

    // ── ANNEXURE 2 ──────────────────────────────────────────────────
    { text: 'ANNEXURE - 2', font: 'VERDANABOLD', fontSize: PX(16), alignment: 'center', pageBreak: 'before', margin: [0, 0, 0, 12] },
    { text: 'STRICTLY PRIVATE & CONFIDENTIAL', font: 'VERDANABOLD', alignment: 'center', margin: [0, 0, 0, 16], fontSize: PX(13), },
    {
      table: {
        widths: ['auto', '*', 'auto', '*'],
        body: [
          [
            cell('NAME'),
            boldCell(fullName),
            cell('Designation'),
            boldCell(jobRole),
          ]
        ]
      },
      margin: [0, 0, 0, 10]
    },
    {
      text: [{ text: 'Compensation Details ', font: 'VERDANABOLD' }, { text: '(All figures in Rs.)' }],
      alignment: 'center', margin: [0, 0, 0, 8]
    },

    // Salary breakdown table
    {
      table: {
        widths: ['*', 85, 85],
        body: [
          [th('Components In Salary'), th('Per Month'), th('Per Annum')],
          [cell('Basic Salary',{ alignment: 'center' }), cell(v(data.basicSalary),{ alignment: 'center' }), cell(v(data.basicPerannum),{ alignment: 'center' })],
          [cell('HRA',{ alignment: 'center' }), cell(v(data.hraSalary),{ alignment: 'center' }), cell(v(data.hraPerAnnum),{ alignment: 'center' })],
          [cell('Other Allowances',{ alignment: 'center' }), cell(v(data.otherAllowances),{ alignment: 'center' }), cell(v(data.otherAllowancesPerAnnum),{ alignment: 'center' })],
          [boldCell('Total Gross Salary',{ fillColor: '#ffffcc', alignment: 'center' }), boldCell(v(data.totalGrossSalary),{ fillColor: '#ffffcc', alignment: 'center' }),
            boldCell(v(data.totalGrossPerAnnum),{ fillColor: '#ffffcc', alignment: 'center' })],
          [cell('PF Contribution by Employee',{ alignment: 'center' }), cell(v(data.pfContribution),{ alignment: 'center' }), cell(v(data.pfPreAnuum),{ alignment: 'center' })],
          [cell('ESI Contribution by Employee',{ alignment: 'center' }), cell(v(data.employeeEsi),{ alignment: 'center' }), cell(v(data.esiPerAnnumemployee),{ alignment: 'center' })],
          [cell('Professional Tax (PT)',{ alignment: 'center' }), cell(v(data.professionalTax),{ alignment: 'center' }), cell(v(data.professionalPerAnnum),{ alignment: 'center' })],
          [boldCell('Total Deductions (PF+ESI+PT)',{ alignment: 'center' }), boldCell(v(data.totalDeduction),{ alignment: 'center' }), boldCell(v(data.totalDeductionsPerAnnum),{ alignment: 'center' })],
          [boldCell('Net Salary',{ fillColor: '#fff2cc', alignment: 'center' }), boldCell(v(data.netSalary),{ fillColor: '#fff2cc', alignment: 'center' }),
            boldCell(v(data.netSalaryPerAnnum),{ fillColor: '#fff2cc', alignment: 'center' })],
        ]
      },
      layout: {
        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 4,
        paddingBottom: () => 4,
      },
      fontSize: PX(12),
      margin: [0, 0, 0, 10]
    },
    // CTC calculation table
    {
      table: {
        widths: ['*', 85, 85],
        body: [
          [{ text: 'CTC Calculation', font: 'VERDANABOLD', colSpan: 3, alignment: 'center', fillColor: '#e7f0fd', color: '#000' }, { text: '' }, { text: '' }],
          [cell('Employer PF Contribution',{ alignment: 'center' }), cell(v(data.pfContribution),{ alignment: 'center' }), cell(v(data.pfPreAnuum),{ alignment: 'center' })],
          [cell('Employer ESI Contribution',{ alignment: 'center' }), cell(v(data.esicContribution),{ alignment: 'center' }), cell(v(data.esiPerAnnum),{ alignment: 'center' })],
          [boldCell('Variable Amount',{ alignment: 'center' }), { text: v(variablePayAmount) || '', font: 'VERDANABOLD', colSpan: 2, alignment: 'center' }, { text: '' }],
          [boldCell('CTC=Gross Salary +(Employer PF+ESI+Variable Amount)',{ alignment: 'center', noWrap: true }), boldCell(v(data.grossSalary),{ alignment: 'center' }),
            boldCell(ctcPerAnnumDisplay,{ alignment: 'center' })],
        ]
      },
      layout: {
        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 4,
        paddingBottom: () => 4,
      },
      fontSize: PX(12),
      margin: [0, 0, 0, 10]
    },
    { text: [{ text: 'Note: ', font: 'VERDANABOLD' }, note ?? ''], margin: [0, 0, 0, 8] },
    {
      text: [{ text: 'The Company presently has a Performance Award Program. Performance Award Program will be made available to you upon joining SNAD. Please note: RightlyHR reserves the right, in its sole discretion, to amend, change, suspend, or terminate the Performance Award Program at any time.', font: 'VERDANABOLD'}],
      margin: [0, 0, 0, 8]
    },

    // ── ADDITIONAL DETAILS ──────────────────────────────────────────────────
    { text: 'Additional Details Related to Salary Structure:', font: 'VERDANABOLD', pageBreak: 'before', margin: [0, 0, 0, 8] },
    { text: [{ text: 'a) ' }, 'TDS will be deducted from the Gross Salary after statutory deductions.'], margin: [10, 0, 0, 4] },
    { text: [{ text: 'b) ' }, 'Employees are responsible for their Tax Planning.'], margin: [10, 0, 0, 4] },
    { text: [{ text: 'c) ' }, 'Employees may avail tax benefit by submitting bills against Leave Travel Allowance.'], margin: [10, 0, 0, 4] },
    { text: [{ text: 'd) ' }, 'All eligible employees as per the respective policies of the Company will be covered under the Group Medical Coverage Policy and Group Covid policy.'], margin: [10, 0, 0, 4] },
    { text: [{ text: 'e) ' }, "All the above benefits are as per the Company's policies, which are subjective to change from time to time. Further salary, allowances, any alteration in salary structure and other payments/benefits will be governed by The Company's rules as well as statutory provisions in force from time to time and subject to deduction of appropriate taxes as applicable under government norms."], margin: [10, 0, 0, 4] },
    { text: [{ text: 'f) ' }, "While the other terms and conditions of your appointment remain unchanged, please do take note that as per the current Company's Separation Policy, if you resign from the services of the company, you will be liable to serve Ninety (90) days i.e. Three (3) months of Notice Period."], margin: [10, 0, 0, 4] },
    { text: [{ text: 'g) ' }, 'Medical insurance amount will be calculated based on the number of dependents; the respective amount will be deducted from your monthly salary.'], margin: [10, 0, 0, 2] },
    {
      text: [
        { text: 'Note: ', font: 'VERDANABOLD' },
        {
          text: 'The above compensation package is strictly confidential between you and the Company and should not be discussed with anyone nor divulged to anyone in any manner whatsoever.',
          italics: true, font: 'VERDANA', fontSize: PX(10),
        }
      ],
      margin: [0, 8, 0, 0]
    },
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
