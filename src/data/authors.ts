import { SITE } from './site';

export interface Author {
  slug: string;
  name: string;
  role: string;
  initials: string;
  short: string;
  bio: string[];
  beat: string[];
  sameAs?: string[];
  /** One-line professional summary for schema `description`. */
  summary?: string;
  /** Real credentials, emitted in schema exactly as written. */
  credential?: string;
  alumniOf?: string;
  knowsAbout?: string[];
  /** Real roles, newest first: [organisation, role and years, place]. */
  background?: [string, string, string][];
}

// The site's author, the same as enthusiastreview.com and besthometheaterreview.com. Every fact
// here is from his real profile (copied from shaheertiger/enthusiastreview src/data/authors.ts).
// Do not add roles, credentials or claims he has not made.
export const AUTHORS: Record<string, Author> = {
  'justin-lee': {
    slug: 'justin-lee',
    name: 'Justin Lee',
    role: 'Author',
    initials: 'JL',
    short:
      'Justin Lee writes every guide, comparison and product verdict on All Metal Brake. Software engineer: ex-Apple, ex-Tesla firmware, Waterloo CS.',
    summary: 'Software engineer (ex-Apple, ex-Tesla firmware) with a background in embedded software and digital signal processing. University of Waterloo Computer Science.',
    bio: [
      `Justin Lee writes the buying guides, brand reviews, comparisons and product verdicts on ${SITE.name}.`,
      'He is a software engineer whose work has sat close to the hardware: embedded and firmware engineering and digital signal processing. That is why our pages spend so much time on what a spec sheet actually promises: running vs starting watts, usable vs rated watt-hours, surge ratings and the conditions behind each number.',
      'Every page is researched against manufacturer spec sheets and owner\'s manuals, EPA and CARB listings, safety certifications and owner reports. He has not hands-on tested these products, and every page says so. We do not accept payment for placement.',
    ],
    beat: ['Home standby and portable generators', 'Inverter and dual fuel generators', 'Portable power stations and home batteries', 'Transfer switches and surge protection', 'Outage gear: UPS, CPAP batteries, heaters, lights and radios'],
    background: [
      ['Apple', 'Software Engineer (2024–2026) and Software Engineer Intern (2023)', 'Cupertino'],
      ['Tesla', 'Firmware Engineer Intern (2023)', 'Palo Alto'],
      ['Coherent Logix', 'Digital Signal Processing Software Engineer Intern (2022)', 'Waterloo'],
      ['Peraso', 'Embedded Software Engineer co-op (2021–2022)', 'Toronto'],
      ['University of Waterloo', "Bachelor's degree in Computer Science (2019–2024)", ''],
    ],
    sameAs: ['https://www.linkedin.com/in/justinllee32/'],
    credential: "Bachelor's degree in Computer Science",
    alumniOf: 'University of Waterloo',
    knowsAbout: ['Embedded software', 'Firmware', 'Digital signal processing', 'Backup power'],
  },
};

export const DEFAULT_AUTHOR = 'justin-lee';
export const getAuthor = (slug?: string) => AUTHORS[slug ?? DEFAULT_AUTHOR] ?? AUTHORS[DEFAULT_AUTHOR];
export const authorPath = (slug?: string) => `/authors/${getAuthor(slug).slug}/`;

export function authorSchema(slug?: string) {
  const a = getAuthor(slug);
  return {
    '@type': 'Person',
    name: a.name,
    url: `${SITE.url}/authors/${a.slug}/`,
    ...(a.sameAs?.length ? { sameAs: a.sameAs } : {}),
    ...(a.summary ? { description: a.summary } : {}),
    ...(a.alumniOf ? { alumniOf: { '@type': 'CollegeOrUniversity', name: a.alumniOf } } : {}),
    ...(a.credential ? { hasCredential: { '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name: a.credential } } : {}),
    ...(a.knowsAbout?.length ? { knowsAbout: a.knowsAbout } : {}),
  };
}
