// Single source of truth for the site's identity: site.config.json (also read by scripts/).
import config from '../../site.config.json';

export const SITE = {
  ...config,
  email: config.email, // confirm this mailbox exists before launch
  /** Name of the research score shown on every product: config.score. */
  score: config.score,
};
