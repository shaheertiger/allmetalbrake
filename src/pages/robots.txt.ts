import { SITE } from '../data/site';
export function GET() {
  return new Response(
    [
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${SITE.url}/sitemap.xml`,
      '',
      '# Site guide for AI agents (llmstxt.org) and AI usage policy.',
      '# Every page also has a Markdown twin at the same path + .md (https://dualmark.dev).',
      `# LLMs: ${SITE.url}/llms.txt`,
      `# LLMs (full): ${SITE.url}/llms-full.txt`,
      `# AI policy: ${SITE.url}/ai.txt`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
