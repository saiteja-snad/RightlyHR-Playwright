export interface NdaLetterData {
  firstName: string;
  middleName?: string;
  lastName: string;
  panNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  ndaSentDate: string;
  authorityFullName: string;
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

export function buildNdaLetterDoc(data: NdaLetterData): any {
  const bodyFont = data.useVerdanaFont ? 'VERDANA' : undefined;
  const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');

  const addressParts = [data.addressLine1, data.addressLine2, data.city, data.state].filter(Boolean).join(', ');
  const addressFull = addressParts
    ? `${addressParts}, ${data.country ?? ''} - ${data.pinCode ?? ''} (Hereinafter referred to as "Receiving Party").`
    : '';

  function p(text: any, marginBottom = 8): any {
    return { text, font: bodyFont, margin: [0, 0, 0, marginBottom] };
  }

  const content: any[] = [
    {text: 'Non-Disclosure Agreement and Invention Assignment Agreement', font: 'VERDANABOLD', decoration: 'underline', alignment: 'center',
      fontSize: PX(16), margin: [0, 0, 0, 16]},
    p('This Non-Disclosure Agreement and Invention Assignment Agreement (hereinafter "Agreement") is effective as of by and between'),
    p([{ text: 'Snad Developers India Private Limited', font: 'VERDANABOLD' }, ', with its office at [Vijaya Krishna Towers, Floor#16, Madhava Reddy Colony, Gachibowli, HYD - 500032] (hereinafter referred to as the "Company")']),
    p([{ text: 'And', font: 'VERDANABOLD' }]),
    p([`${fullName} PAN No: ${data.panNumber ?? ''} residing at `, addressFull]),
    p('The Company and the Receiving Party shall collectively be referred to as "Parties" and individually as a "Party".'),
    p([{ text: 'RECITALS: ', font: 'VERDANABOLD' }]),
    p(['A. As per the Appointment Letter dated ', fmt(data.ndaSentDate),', the Receiving Party is working with the Snad Developers Private Limited, During the course of Engagement, the Receiving Party may be exposed to the Confidential Information (as defined below) of the Company and/or the Company\'s affiliates, clients, customers, consultants, vendors, partners, agents or suppliers etc. The Receiving Party may also generate, create or receive, possess, oversee information that is confidential in nature.']),
    p('B. Whereas the Receiving Party undertakes to protect all such information from any unauthorized use or disclosure and undertakes to handover all intellectual property rights in the Developments (as defined below), on the terms agreed between the Parties.'),
    p([{ text: 'The Parties agree as follows:', font: 'VERDANABOLD' }]),

    // Main ol — items 1, 2, 3
    {
      ol: [
        {
          stack: [
            p([
              { text: 'Confidential Information and Exclusion: ', font: 'VERDANABOLD' },
              'Confidential information, includes but is not limited to, any and all technical and non-technical information including patent, copyright, trade secret, and proprietary information, technique, sketches, drawings, models, inventions, Innovations, know-how, processes, apparatus, equipment, algorithms, software programs, software source documents, and formulae related to the current, future and proposed services and products of the Company or its clients, details of the Company and its clients suppliers and customers, and includes, without limitation, the Company or its clients Innovations, property and information concerning research, experimental work, development, design details and specifications, engineering, financial information, procurement requirements, purchasing, manufacturing, business forecasts, sales and merchandising and marketing plans and information which according to the Company or its clients are necessarily confidential and form valuable property of the Company or its clients. If any information is disclosed orally, it shall at the time of disclosure be identified as confidential or shall be summarized and designated in writing by the Company and delivered within 30 days of disclosure to the Receiving Party to qualify it as Confidential Information. Confidential Information shall however exclude any information which (a) is in the public domain; (b) was known to the Receiving Party of such disclosure or becomes known to the Receiving Party without breach of any confidentiality agreement.',
            ], 8),
          ],
        },
        {
          stack: [
            p([
              { text: 'Definition of Developments: ', font: 'VERDANABOLD' },
              '"Development(s)" shall mean and include all inventions, improvements, discoveries, methods, developments, software, and works of authorship, whether patentable or not, any new or useful research, experiment, new contribution, finding, creativity (including without limitation any designs, drawings, plans, technology, computer programs, software, test, concept, idea, mechanism, equipment, machinery, process, formula, or technique, algorithm), whether or not granted protection under intellectual property laws, which are created, made, conceived or reduced to practice by the Receiving Party or under the Receiving Party\'s direction or jointly with others during the Engagement, whether or not during normal working hours or on the premises of the Company.',
            ], 8),
          ],
        },
        {
          stack: [
            p([{ text: 'Non-disclosure and Non-Use of Confidential Information:', font: 'VERDANABOLD' }], 4),
            {
              ol: [
                p('The Receiving Party acknowledges that the Confidential Information is the exclusive property of the Company or its client and the Receiving Party shall make use of the Confidential Information only for the purpose of carrying out obligations of the Engagement and for no other purpose. During the Engagement and thereafter, the Receiving Party unconditionally and unequivocally agrees and undertakes for self to take onerous responsibility not to disclose any of the Confidential Information or any related information obtained from discussions or meetings or tale-conference or video-conference or any other source to any third parties and shall restrict disclosure of Confidential Information only to the Company\'s concerned officers, employees, attorneys, subcontractors or professional advisors who need to have access to the Confidential Information and each of whom shall be informed by Receiving Party of the confidential nature of Confidential Information and agree to observe the same terms and conditions', 4),
                p('set forth herein as if specifically named a party hereto.', 4),
                p('The Receiving Party shall not make copies of Confidential Information unless the same are reasonably necessary.', 4),
                p('The Receiving Party shall immediately notify the Company in the event of any unauthorized use or disclosure of the Confidential Information and reasonably support the Company in taking necessary remedial action.', 4),
                p('The Receiving Party shall protect the Confidential Information by using the same degree of care to prevent unauthorized use, dissemination, or publication of the Confidential Information as the Receiving Party would use to protect his/her own confidential information of a like nature, but no less than a reasonable degree of care.', 4),
                p('The Receiving Party shall not use, modify, reverse engineer, decompile, create other works from or disassemble anything in the Company\'s Confidential Information unless permitted in writing by the Company.', 4),
                p('The Receiving Party agrees and undertakes to not make copies or duplicates of the Confidential Information, without prior written consent for the same from the Company.', 4),
                p('The Receiving Party further agrees to notify the Company in writing of any actual or suspected misuse, misappropriation or unauthorized disclosure of the Company\'s Confidential Information, which may come to the Receiving Party\'s attention.', 4),
                p('The Receiving Party shall not interact with the press or any third party with respect to the Company\'s business, customers, competitors or anything related to the Company without the Company\'s prior written approval. The Receiving Party shall not publicize or disclose the presence of this Agreement nor use in any manner the name or logos of the Company without the prior written permission of the Company.', 4),
                p('During the tenure of the Engagement, the Receiving Party shall not bring any media storage devices such as external hard drives, USB drives, external hard discs, or any other devices that can store data, to the Company office premises without prior written permission of the Company.', 4),
                p('The Receiving Party shall not, during his/her Engagement with the Company or otherwise, use or disclose to the Company any confidential, trade secret, or other proprietary information or material of any previous employer or other person and will not bring into the Company\'s premises any unpublished document or any other property belonging to any former employer without the written consent of that former employer.', 4),
                p('The Receiving Party hereby undertakes not to, under any circumstances disclose, destroy, delete, alter, steal, or cause to disclose, destroy, delete, alter, steal the Confidential Information.', 4),
              ],
              type: 'lower-alpha',
              font: bodyFont,
              margin: [0, 0, 0, 8],
            },
          ],
        },
      ],
      font: bodyFont,
    },

    // Standalone paragraph between item 3 and item 4
    p([
      { text: 'The Company\'s Property', font: 'VERDANABOLD' },
      ': All works, programs, papers, records, data, notes, drawings, files, documents, samples, devices, opinions, research material, checklists, dockets, processes and other materials, including copies in whatever form and translations into any other language and intellectual property, relating to the business of the Company that the Receiving Party possesses or creates during the term of the engagement with the Company, whether or not confidential, are and shall remain the sole and exclusive property of the Company.',
    ], 8),

    // Main ol — items 4–11
    {
      ol: [
        // Item 4
        {
          stack: [
            p([{ text: 'Disclosure and Assignment of Developments:', font: 'VERDANABOLD' }], 4),
            {
              ol: [
                p('The Receiving Party agrees to promptly disclose to the Company in writing, all the Developments which are conceived, made, discovered, written or created whether alone or jointly with someone else during the Engagement.', 4),
                p('The Receiving Party understands and acknowledges that no license is granted to the Receiving Party in and to the Confidential Information and/or the Developments, nor is any intellectual property right implied to be granted by this Agreement. The Receiving Party understands and acknowledges that the Company shall be the exclusive owner of all rights pertaining to the Developments created or developed by him/her. The Receiving Party agrees to assign and does hereby assign to the Company all his/her right, title and interest in and to all Developments and all related patents, patent applications, copyrights and copyright applications. The Receiving Party understands and acknowledges that all Developments shall be the property of the Company and, to the greatest extent permitted by law, shall be \'works made for hire\'.', 4),
                p('The Receiving Party shall give the Company all assistance it reasonably requires to perfect, protect, and use its rights to the Developments. In particular, the Receiving Party shall sign all documents, do all things, and supply all information that the Company considers necessary or desirable to transfer or record the transfer of entire rights, title and interest in the Developments; and to enable the Company to obtain patent, copyright, or other legal protection to the Developments.', 4),
                p('Receiving Party acknowledges and agrees that the assignment set forth herein is worldwide and perpetual, and that he/she will have no rights to reversion of the Developments, even if the Company does not exploit them.', 4),
                p('Receiving Party hereby permanently waives all paternity, integrity, special, moral or similar rights, if any, that vest or may vest in Receiving Party as of the date in any Developments. Receiving Party further acknowledges and agrees that through the complete and permanent waiver contained herein neither do Receiving Party\'s legal heirs retain any paternity, integrity, moral, special or similar rights in and to any Developments. Receiving Party hereby agrees, at the request and expense of the Company, to provide any assistance as may be necessary to confirm Receiving Party\'s waiver of any paternity, integrity, special, moral or similar rights associated with the Developments that may vest in the Receiving Party.', 4),
                p('Inventions, if any, patented or unpatented, made by the Receiving Party prior to the commencement of his/her Engagement with the Company are excluded from the scope of this Agreement. To preclude any possible uncertainty, the Receiving Party sets forth on Exhibit A (Previous Inventions) attached hereto a complete list of all inventions that the Receiving Party has, alone or jointly with others, conceived, developed or reduced to practice or caused to be conceived, developed or reduced to practice prior to the commencement of his/her Engagement, that the Receiving Party considers to be his/her property or the property of third parties and that the Receiving Party wishes to have excluded from the scope of this Agreement (collectively referred to as "Prior Inventions"). If, the Receiving Party incorporates a Prior Invention into the Company product, process or machine, the Company is hereby granted and shall have a nonexclusive, royalty-free, irrevocable, perpetual, worldwide license (with rights to sub license through multiple tiers of sub-licensees) to make, have made, modify, use and sell such Prior Invention. Notwithstanding the foregoing, the Receiving Party agrees that the Receiving Party will not incorporate, or permit to be incorporated, Prior Inventions in any the Company\'s products without the Company\'s prior written consent.', 4),
                p('In the event the Company is unable for any reason, after reasonable effort, to secure the Receiving Party\'s signature on any document needed in connection with the actions specified in the preceding paragraphs, the Receiving Party hereby irrevocably designate and appoint the Company and its duly authorized officers and agents as the Receiving Party\'s agent and attorney in fact, which appointment is coupled with an interest, to act for and in the Receiving Party\'s behalf to execute, verify and file any such documents and to do all other lawfully permitted acts to further the purposes of the preceding paragraphs with the same legal force and effect as if executed by the Receiving Party.', 4),
                p('The Receiving Party further represents that he/she has no other employment(s), consultancies or undertakings which would restrict and impair his/her performance of this Agreement.', 4),
              ],
              type: 'lower-alpha',
              font: bodyFont,
              margin: [0, 0, 0, 8],
            },
          ],
        },
        // Item 5: Return
        p([{ text: 'Return: ', font: 'VERDANABOLD' }, 'In the event of termination of Engagement, or upon request by the Company, the Receiving Party agrees to promptly return or destroy, at the Company\'s discretion, all Confidential Information provided by the Company, and any computer files and other materials incorporating any such Confidential Information and all copies thereof.'], 8),
        // Item 6: Indemnity
        p([{ text: 'Indemnity: ', font: 'VERDANABOLD' }, 'The Receiving Party agrees to indemnify and save harmless the Company and its employees, successors and assigns against all losses, damages (including reasonable attorney fees) incurred by the Company and its employees, successors and assigns due to any breach of the terms of this Agreement.'], 8),
        // Item 7: Survival
        p([{ text: 'Survival: ', font: 'VERDANABOLD' }, 'The Receiving Party agrees to indemnify and save harmless the Company and its employees, successors and assigns against all losses, damages (including reasonable attorney fees) incurred by the Company and its employees, successors and assigns due to any breach of the terms of this Agreement.'], 8),
        // Item 8: Warranty
        p([{ text: 'Warranty: ', font: 'VERDANABOLD' }, 'The Receiving Party understands and acknowledges that the Company is not obligated to supply any Confidential Information under this Agreement. Further, no representation or warranty is made or given about the accuracy or completeness of any Confidential Information or any other information supplied pursuant to this Agreement.'], 8),
        // Item 9: Remedies
        p([{ text: 'Remedies: ', font: 'VERDANABOLD' }, 'The Receiving Party agrees that any violation of this Agreement will cause irreparable injury to the Company, the Company will be entitled to seek equitable relief in court, including but not limited to temporary restraining orders, preliminary injunctions and permanent injunctions without the necessity of posting a bond or other security and in addition to and without prejudice to any other right and remedies that the Company may have under the applicable law for a breach of this Agreement.'], 8),
        // Item 10: Governing Law
        p([{ text: 'Governing Law and Jurisdiction: ', font: 'VERDANABOLD' }, '"This Agreement shall be governed by and construed in accordance with the laws of India and shall be subject to jurisdiction of courts at Hyderabad, Telangana"'], 8),
        // Item 11: Miscellaneous
        {
          stack: [
            p([{ text: 'Miscellaneous:', font: 'VERDANABOLD' }], 4),
            {
              ol: [
                p([{ text: 'Enforcement. ', decoration: 'underline' }, 'If any provision of this Agreement shall be determined to be invalid or unenforceable for any reason, it shall be adjusted rather than voided, if possible, in order to achieve the intent of the parties to the extent possible. In any event, all other provisions of this Agreement shall be deemed valid and enforceable to the full extent possible.'], 4),
                p([{ text: 'Waiver. ', decoration: 'underline' }, 'The waiver by the Company of a breach of any provision of this Agreement shall not operate or be construed as a waiver of any subsequent breach of the same or any other provision hereof.'], 4),
                p([{ text: 'Attorneys\' Fees. ', decoration: 'underline' }, 'If either party seeks to enforce its rights under this Agreement by legal proceedings or otherwise, the non-prevailing party shall pay all costs and expenses of the prevailing Party.'], 4),
                p([{ text: 'Entire Agreement. ', decoration: 'underline' }, 'This Agreement contains the entire understanding between the Company and the Receiving Party concerning the subject matter hereof and is in addition to any and all prior and contemporaneous negotiations, correspondence, understandings and agreements, whether oral or written, respecting that subject matter.'], 4),
              ],
              type: 'lower-alpha',
              font: bodyFont,
              margin: [0, 0, 0, 8],
            },
          ],
        },
      ],
      start: 4,
      font: bodyFont,
    },

    // Date
    { text: [{ text: 'Date ', font: 'VERDANABOLD' }, fmt(data.ndaSentDate)], alignment: 'right', margin: [0, 12, 0, 16] },

    // Acceptance
    { text: 'ACCEPTANCE', font: 'VERDANABOLD', decoration: 'underline', margin: [0, 0, 0, 8] },
    p('I accept this offer letter and will complete all the necessary documents as required.', 20),

    // Two-column signature block
    {
      columns: [
        {
          width: '50%',
          stack: [
            { text: 'RightlyHR', font: 'VERDANABOLD', margin: [0, 0, 0, 24] },
            {
              text: ['Signature: ', { text: data.authorityFullName, font: 'Autography', fontSize: PX(32), noWrap: true }],
              margin: [0, 0, 0, 4], font: bodyFont, alignment: 'left',
            },
            { text: ['Name: ', data.authorityFullName], margin: [0, 0, 0, 4], font: bodyFont },
            { text: ['Title: ', data.authorityDesignation ?? ''], margin: [0, 0, 0, 4], font: bodyFont },
            { text: ['Date: ', fmt(data.ndaSentDate)], font: bodyFont },
          ],
        },
        {
          width: '50%',
          stack: [
            { text: 'CONSULTANT', font: 'VERDANABOLD', margin: [0, 0, 0, 16] },
            {
              text: data.employeeFullName
                ? ['Signature: ', { text: data.employeeFullName, font: data.useAutographyFont ? 'Autography' : bodyFont, fontSize: PX(32), noWrap: true }]
                : 'Signature: ',
              margin: [0, 0, 0, 4], font: bodyFont, alignment: 'left',
            },
            { text: ['Name: ', data.employeeFullName ?? ''], margin: [0, 0, 0, 4], font: bodyFont },
            { text: ['Date: ', data.employeeFullName ? fmt(new Date().toISOString()) : ''], font: bodyFont },
          ],
        },
      ],
    },
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
      if (stamped.ol) stamped.ol = stampFont(stamped.ol);
      if (stamped.ul) stamped.ul = stampFont(stamped.ul);
      return stamped;
    });
  }

  const styledContent = stampFont(content);
  const topMargin = data.backgroundImageBase64 ? 120 : 50;
  const bottomMargin = data.backgroundImageBase64 ? 120 : 50;

  const docDef: any = {
    pageSize: 'A4',
    pageMargins: [60, topMargin, 60, bottomMargin],
    defaultStyle: { font: bodyFont, fontSize: PX(12), color: '#000' },
    content: styledContent,
  };

  if (data.backgroundImageBase64) {
    docDef.images = { letterBg: data.backgroundImageBase64 };
    docDef.background = () => ({ image: 'letterBg', width: 620, height: 870, absolutePosition: { x: -12, y: -14 } });
  }

  return docDef;
}