import { LETTER_MARGINS, stampFont, applyLetterPageSetup } from "./letter-builder.utils";

export interface ContractorLetterData {
  title?: string;
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
  jobRole?: string;
  currencySymbol?: string;
  currencyType?: string;
  amount?: number | string;
  frequency?: string;
  rolesAndResponsibilities?: string;
  authorityName: string;
  authorityDesignation?: string;
  backgroundImageBase64?: string;
  useVerdanaFont?: boolean;
  useAutographyFont?: boolean;
  employeeFullName?: string;
  acceptanceDate?: string;
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

function parseHtmlToPdfMake(html: string, bodyFont?: string): any[] {
  if (!html) return [];
  const result: any[] = [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const root = doc.body.firstChild;

    function processNode(node: any): any {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        return text ? text : null;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        if (tag === 'ol') {
          const items = Array.from(node.children)
            .filter((child: any) => child.tagName.toLowerCase() === 'li')
            .map((li: any) => {
              const c = processChildren(li);
              if (Array.isArray(c)) return { text: c, font: bodyFont };
              return c || ' ';
            });
          return { ol: items, margin: [0, 0, 0, 8], font: bodyFont };
        }
        if (tag === 'ul') {
          const items = Array.from(node.children)
            .filter((child: any) => child.tagName.toLowerCase() === 'li')
            .map((li: any) => {
              const c = processChildren(li);
              if (Array.isArray(c)) return { text: c, font: bodyFont };
              return c || ' ';
            });
          return { ul: items, margin: [0, 0, 0, 8], font: bodyFont };
        }
        if (tag === 'p') {
          const content = processChildren(node);
          if (!content && content !== 0) return null;
          return { text: content, margin: [0, 0, 0, 8], font: bodyFont };
        }
        if (tag === 'strong' || tag === 'b') {
          return { text: processChildren(node) || '', font: 'VERDANABOLD' };
        }
        if (tag === 'br') return '\n';
        const inline = processChildren(node);
        if (Array.isArray(inline)) return { text: inline, font: bodyFont };
        return inline;
      }
      return null;
    }

    function processChildren(node: any): any {
      const children = Array.from(node.childNodes).map(processNode).filter((c: any) => c !== null && c !== undefined && c !== '');
      if (children.length === 0) return '';
      if (children.length === 1) return children[0];
      return children;
    }

    if (root) {
      Array.from(root.childNodes).forEach((child: any) => {
        const processed = processNode(child);
        if (processed === null || processed === undefined || processed === '') return;
        if (Array.isArray(processed)) {
          result.push({ text: processed, font: bodyFont });
        } else {
          result.push(processed);
        }
      });
    }
  } catch {
    // return whatever was collected before the error
  }
  return result;
}

export function buildContractorLetterDoc(data: ContractorLetterData): any {
  const bodyFont = data.useVerdanaFont ? 'VERDANA' : undefined;
  const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');
  const titleFullName = [data.title, data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');

  function p(text: any, marginBottom = 10): any {
    return { text, font: bodyFont, margin: [0, 0, 0, marginBottom] };
  }

  const currencySymbol = data.currencyType === 'INR'
    ? { text: 'Rs.', font: 'VERDANABOLD' }
    : { text: '$', font: 'VERDANABOLD' };

  const amountText = data.currencyType === 'INR'
    ? [currencySymbol, { text: ` ${data.amount ?? 0} /-`, font: 'VERDANABOLD' }]
    : [currencySymbol, { text: ` ${data.amount ?? 0}`, font: 'VERDANABOLD' }];

  // Address stack items
  const addressStack: any[] = [
    { text: 'To,', font: 'VERDANABOLD', margin: [0, 0, 0, 4] },
    ...(data.firstName || data.lastName
      ? [{ text: `${fullName},`, font: 'VERDANABOLD', margin: [0, 0, 0, 2] }]
      : [{ text: 'Name:', font: 'VERDANABOLD', margin: [0, 0, 0, 2] }]),
  ];
  if (data.addressLine1) {
    addressStack.push({ text: `${data.addressLine1},`, font: 'VERDANABOLD', margin: [0, 0, 0, 2] });
    if (data.addressLine2) addressStack.push({ text: `${data.addressLine2},`, font: 'VERDANABOLD', margin: [0, 0, 0, 2] });
    addressStack.push({ text: `${data.city ?? ''}, ${data.state ?? ''},`, font: 'VERDANABOLD', margin: [0, 0, 0, 2] });
    addressStack.push({ text: `${data.country ?? ''} - ${data.pinCode ?? ''}.`, font: 'VERDANABOLD', margin: [0, 0, 0, 0] });
  } else {
    addressStack.push({ text: 'Employee Location:', font: 'VERDANABOLD', margin: [0, 0, 0, 0] });
  }

  const page1: any[] = [
    { text: 'Contract Offer Letter', font: 'VERDANABOLD', fontSize: PX(16), alignment: 'center', margin: [0, 0, 0, 16]},
    {
      columns: [
        { width: '65%', stack: addressStack },
        { width: '35%', text: fmt(data.offerIssuedDate), alignment: 'right', font: 'VERDANABOLD' },
      ],
      margin: [0, 0, 0, 12],
    },
    { text: `Dear ${fullName},`, margin: [0, 0, 0, 8], font: 'VERDANABOLD' },
    p([
      'We are pleased to offer you contract employment in RightlyHR. as a ',
      { text: data.jobRole ?? '', font: 'VERDANABOLD' },
      ' on a remuneration of ',
      ...amountText,
      { text: ` per ${data.frequency ?? ''}`, font: 'VERDANABOLD' },
      '. You will have to submit weekly/monthly Time sheet approved by the reporting manager. You will be working part time as required by SNAD. Your approximate start date with the company is ',
      fmt(data.dateOfJoining), '.',
    ], 8),
    p('Please note the following details regarding your consultancy engagement', 8),
    ...(data.rolesAndResponsibilities ? parseHtmlToPdfMake(data.rolesAndResponsibilities, bodyFont) : []),
    p('RightlyHR is in the business of product development and deployment and also providing technology and business consultants to various multinational companies.', 0),
  ];

  const page2: any[] = [
    {
      text: [
        { text: titleFullName, font: 'VERDANABOLD' },
        ', please sign this offer letter along with Non-Disclosure Agreement and return them to our office to confirm your acceptance of this offer.',
      ],
      font: bodyFont,
      margin: [0, 0, 0, 8],
      pageBreak: 'before',
    },
    p([{ text: 'Yours Sincerely', font: 'VERDANABOLD' }, ','], 4),
    { text: 'For RightlyHR', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 16], noWrap: true },
    { text: data.authorityName, font: 'Autography', fontSize: PX(32), margin: [0, 0, 0, 4], noWrap: true, alignment: 'left' },
    { text: 'Authorized Signatory,', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 4], noWrap: true },
    { text: data.authorityName, font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 0], noWrap: true },
    { text: data.authorityDesignation ?? '', font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 20], noWrap: true },
    {
      columns: [
        { width: '50%', text: 'ACCEPTANCE', font: 'VERDANABOLD' },
        {
          width: '50%',
          text: [
            { text: 'Date', font: 'VERDANABOLD' },
            { text: data.acceptanceDate ? ' ' + fmt(data.acceptanceDate) : ' (DD/MM/YYYY)', font: bodyFont }
          ],
          alignment: 'right'
        }
      ],
      margin: [0, 0, 0, 8],
    },
    p('I accept this offer letter and will provide the required pre-onboarding details and documents through the portal.', 16),
    {
      text: data.employeeFullName
        ? ['Signature: ', { text: data.employeeFullName, font: 'Autography', fontSize: PX(32) }]
        : 'Signature: _________________________',
      margin: [0, 0, 0, 8], font: bodyFont,
    },
    { text: ['Name: ', data.employeeFullName ?? ''], margin: [0, 0, 0, 8], font: bodyFont },
    { text: ['Date: ', data.acceptanceDate ? fmt(data.acceptanceDate) : ''], font: bodyFont },
  ];

  const content: any[] = [...page1, ...page2];

     const isSoftCopy = !!data.backgroundImageBase64;
      const margins = isSoftCopy ? LETTER_MARGINS.softCopy : LETTER_MARGINS.hardCopy;

      const docDef: any = {
        pageSize: 'A4',
        pageMargins: [margins.left, margins.top, margins.right, margins.bottom],
        defaultStyle: {
          font: bodyFont,
          fontSize: PX(16),
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
