export interface WelcomeLetterData {
  employeeFullname: string;
  jobRole: string;
  note: string;
  authorityFullName: string;
  authorityDesignation: string;
  backgroundImageBase64?: string;
  useVerdanaFont?: boolean;
  useAutographyFont?: boolean;
}

const PX = (px: number) => Math.round((px * 72) / 96);

export function buildWelcomeLetterDoc(data: WelcomeLetterData): any {
  const {
    employeeFullname, jobRole, note,
    authorityFullName, authorityDesignation,
  } = data;

  const bodyFont = data.useVerdanaFont ? 'VERDANA' : undefined;

  function p(text: any, marginBottom = 10): any {
    return { font: bodyFont, text, margin: [0, 0, 0, marginBottom] };
  }

  const content: any[] = [
    {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          stack: [
            { text: 'RightlyHR', font: 'VERDANABOLD' },
            { text: 'Vijaya Krishna Towers, Floor#16,', font: bodyFont },
            { text: 'Madhava Reddy Colony, Gachibowli,', font: bodyFont },
            { text: 'HYD - 500032', font: bodyFont },
            { text: '+91 (703) 636-0933', font: bodyFont },
            { text: 'admin@rightlyhr.com', font: bodyFont },
            { text: 'www.rightlyhr.com', font: bodyFont },
          ],
          fontSize: PX(11),
          alignment: 'right',
        }
      ],
      margin: [0, 0, 0, 20],
    },
    {
      text: 'Welcome Letter',
      font: 'VERDANABOLD',
      fontSize: PX(16),
      alignment: 'center',
      decoration: 'underline',
      margin: [0, 0, 0, 24],
    },
    p([{ text: 'Dear ', font: 'VERDANABOLD' }, { text: `${employeeFullname},`, font: 'VERDANABOLD' }], 4),
    p([{ text: 'Welcome to RightlyHR.!', font: 'VERDANABOLD' }], 14),
    p([
      'We are excited to have you onboard and look forward to the remarkable contributions you will make as part of our team. As the new ',
      { text: jobRole || '_______________________', font: 'VERDANABOLD' },
      ', you\'ll be joining a group of dedicated and talented professionals committed to delivering excellence in everything we do.',
    ], 10),
    p([
      'At RightlyHR, we pride ourselves on fostering a positive, collaborative work environment where everyone can grow and succeed together. With your expertise, we are confident that you will play a pivotal role in shaping the future of our ERP Services',
      note ? { text: ` - ${note}.`, font: bodyFont } : '.',
    ], 10),
    p('We understand that starting a new position can sometimes feel overwhelming, but please know that we are here to support you every step of the way. If you have any questions or need guidance, feel free to reach out to me or your colleagues.', 10),
    p('Once again, welcome to the team! We are thrilled to have you with us and can\'t wait to see what we will achieve together.', 20),
    p('Best wishes,', 16),
    { text: authorityFullName, font: data.useAutographyFont ? 'Autography' : bodyFont, fontSize: PX(32), margin: [0, 0, 0, 4], noWrap: true, alignment: 'left' },
    { text: authorityFullName, font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 4] },
    { text: authorityDesignation, font: 'VERDANABOLD', fontSize: PX(13), margin: [0, 0, 0, 0] },
  ];

  function stampFont(nodes: any[]): any[] {
    return nodes.map(node => {
      if (typeof node === 'string') return node;
      if (Array.isArray(node)) return stampFont(node);
      const stamped: any = node.font ? node : { font: bodyFont, ...node };
      if (stamped.stack) stamped.stack = stampFont(stamped.stack);
      if (stamped.columns) stamped.columns = stampFont(stamped.columns);
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
      fontSize: PX(16),
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
