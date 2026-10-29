// Numbers written out as English words before "Read aloud" speaks them. On a
// device set to Spanish, the speech engine reads digits in Spanish even with
// an English voice ("Breathe in for cuatro"). Words are read as words.
const ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export function numberInWords(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '');
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} hundred` + (n % 100 ? ` ${numberInWords(n % 100)}` : '');
  if (n < 10000) return `${numberInWords(Math.floor(n / 1000))} thousand` + (n % 1000 ? ` ${numberInWords(n % 1000)}` : '');
  // Anything bigger never appears in Tide's text; read it digit by digit.
  return String(n).split('').map((d) => ONES[Number(d)]).join(' ');
}

const say = (digits: string) => numberInWords(Number(digits));

export function spokenText(text: string): string {
  return (
    text
      // Clock times: "4:50" → "four fifty", "4:05" → "four oh five", "4:00" → "four".
      .replace(/\b(\d{1,2}):(\d{2})\b/g, (_, h: string, m: string) => {
        const minutes = Number(m);
        if (minutes === 0) return say(h);
        return `${say(h)} ${minutes < 10 ? `oh ${say(m)}` : say(m)}`;
      })
      .replace(/\b(\d+)\s?%/g, (_, n: string) => `${say(n)} percent`)
      // A countdown like "5-4-3-2-1" is read as separate numbers with pauses.
      .replace(/\b\d+(?:-\d+)+\b/g, (run) => run.split('-').map(say).join(', '))
      .replace(/\d+/g, say)
  );
}
