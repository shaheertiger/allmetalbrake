export const SITE_URL = 'https://www.allmetalbrake.com';

export interface Author {
  slug: string;
  name: string;
  role: string;
  short: string;
  bio: string[];
  initials: string;
  beat: string[];
  education?: { degree: string; school: string }[];
  certifications?: { name: string; issuer: string; issuerUrl?: string }[];
  sameAs?: string[];
}

export const AUTHORS: Record<string, Author> = {
  'alex-rivers': {
    slug: 'alex-rivers',
    name: 'Alex Rivers',
    role: 'Home Improvement Editor',
    initials: 'AR',
    short:
      'Alex has spent over a decade working on residential and light commercial property maintenance, and now writes the guides to outdoor power, backup power, driveway, garage and masonry products.',
    bio: [
      'Alex Rivers is the Home Improvement Editor at All Metal Brake, where he covers outdoor power equipment, home backup power, driveway and masonry coatings, garage flooring, and household tools.',
      'Before joining the site he spent more than a decade maintaining residential and light commercial properties — sealing driveways, coating garage floors, running pressure washers hard enough to kill several of them, and learning which products fail in the second season rather than the first. Most of the strong opinions in these guides come from that period rather than from a spec sheet.',
      'He ranks products on the specifications that predict failure, their labels and data sheets, and what owners report after a season or two, and each guide says what its picks are based on. He does not accept payment for coverage, and manufacturers do not see a guide before it is published.',
    ],
    beat: [
      'Outdoor power equipment',
      'Driveway and masonry sealers',
      'Garage flooring and coatings',
      'Pressure washers and cleaning gear',
      'Home backup power',
    ],
  },
  'shaheer-ali-khan': {
    slug: 'shaheer-ali-khan',
    name: 'Shaheer Ali Khan',
    role: 'Materials & Product Performance Specialist',
    initials: 'SK',
    short:
      'Shaheer Ali Khan holds a PhD in Materials Science and Engineering from Georgia Tech and is an ASQ Certified Quality Engineer and Certified Reliability Engineer. He covers household appliances, water treatment, cleaning products, and caulks, adhesives and sealants.',
    bio: [
      'Shaheer Ali Khan specializes in evaluating household appliances, cleaning products, building materials, and everyday home improvement solutions.',
      'His product evaluation approach focuses on measurable performance, durability, material compatibility, ease of use, and overall value. He holds a PhD in Materials Science and Engineering from the Georgia Institute of Technology, an MS in Mechanical Engineering from the University of Michigan and a BS in Mechanical Engineering from Purdue University, and is certified by the American Society for Quality as a Quality Engineer and a Reliability Engineer.',
      'His areas of coverage include vacuum cleaners, fabric softeners, laundry detergents, caulking products, adhesives, sealants, and household maintenance equipment. Through comparative analysis of specifications, certifications and long-term owner reports, he provides practical insights to help consumers make informed purchasing decisions.',
    ],
    beat: [
      'Vacuum cleaners and household appliances',
      'Fabric softeners and laundry detergents',
      'Caulking, adhesives and sealants',
      'Household cleaning chemicals',
      'Home improvement and DIY products',
      'Product durability, safety and performance',
    ],
    education: [
      { degree: 'PhD, Materials Science and Engineering', school: 'Georgia Institute of Technology' },
      { degree: 'MS, Mechanical Engineering', school: 'University of Michigan' },
      { degree: 'BS, Mechanical Engineering', school: 'Purdue University' },
    ],
    certifications: [
      { name: 'Certified Quality Engineer (CQE)', issuer: 'American Society for Quality (ASQ)', issuerUrl: 'https://asq.org/' },
      { name: 'Certified Reliability Engineer (CRE)', issuer: 'American Society for Quality (ASQ)', issuerUrl: 'https://asq.org/' },
    ],
    sameAs: ['https://www.linkedin.com/in/shaheer-ali-khan-data'],
  },
};

export const DEFAULT_AUTHOR = 'alex-rivers';

// Which author covers a page, decided by its topic. Shaheer covers appliances,
// vacuums, cleaning products and caulks/adhesives/sealants; Alex covers
// everything else (outdoor power, backup power, driveway, masonry and deck
// coatings, garage floors, lawn and tools). Generator and deck pages stay with
// Alex even when they mention a water heater or a sealant.
const SHAHEER_TOPICS =
  /refrigerat|fridge|freezer|space-heater|caulk|adhesive|silicone|gutter-sealant|vacuum|shop-vac|dust-extractor|dishwasher|induction|cookware|cooktop|rice-cooker|kettle|air-purifier|dehumidifier|water-filter|filtration|softener|water-heater|tankless|mini-split|brita|hepa|ozone/;
const ALEX_FIRST = /generator|power-station|pressure-washer|leaf|deck|driveway|paver|garage-floor/;

export function authorForPath(path = ''): string {
  const slug = path.replace(/^\/|\/$/g, '');
  if (ALEX_FIRST.test(slug)) return DEFAULT_AUTHOR;
  return SHAHEER_TOPICS.test(slug) ? 'shaheer-ali-khan' : DEFAULT_AUTHOR;
}

const resolve = (slugOrPath: string) =>
  AUTHORS[slugOrPath.startsWith('/') ? authorForPath(slugOrPath) : slugOrPath] ?? AUTHORS[DEFAULT_AUTHOR];

export const authorName = (slugOrPath: string = DEFAULT_AUTHOR) => resolve(slugOrPath).name;

// Accepts an author slug or a page path ("/best-shop-vac/").
export function authorSchema(slugOrPath: string = DEFAULT_AUTHOR) {
  const a = resolve(slugOrPath);
  return {
    '@type': 'Person',
    name: a.name,
    url: `${SITE_URL}/authors/${a.slug}/`,
    jobTitle: a.role,
    worksFor: { '@type': 'Organization', name: 'All Metal Brake', url: SITE_URL },
    knowsAbout: a.beat,
    ...(a.education?.length
      ? { alumniOf: [...new Set(a.education.map((e) => e.school))].map((name) => ({ '@type': 'CollegeOrUniversity', name })) }
      : {}),
    ...(a.certifications?.length
      ? {
          hasCredential: a.certifications.map((c) => ({
            '@type': 'EducationalOccupationalCredential',
            name: c.name,
            credentialCategory: 'certification',
            recognizedBy: { '@type': 'Organization', name: c.issuer, ...(c.issuerUrl ? { url: c.issuerUrl } : {}) },
          })),
        }
      : {}),
    ...(a.sameAs?.length ? { sameAs: a.sameAs } : {}),
  };
}
