// Crisis lines shown on the Support screen and the crisis screen.
// IMPORTANT for the team: verify every number below before submission, and
// review them with the Challenge Partner. Tide makes no claims about what
// these services do or about confidentiality; it only links to them.
// The buttons use tel: links so the phone's own dialer opens; Tide never
// places a call or sends a message itself.

export interface CrisisLine {
  id: string;
  label: string; // what the button says
  tel: string; // value for the tel: link
  sms?: string; // value for an sms: link, when the line takes texts
}

export const CRISIS_LINES: CrisisLine[] = [
  {
    id: 'linea-de-la-vida',
    label: 'Call Línea de la Vida (Mexico) · 800 911 2000',
    tel: '8009112000',
  },
  {
    id: '988',
    label: 'Call or text 988 (U.S. Suicide & Crisis Lifeline)',
    tel: '988',
    sms: '988',
  },
  {
    id: '911',
    label: 'Emergency · 911',
    tel: '911',
  },
];
