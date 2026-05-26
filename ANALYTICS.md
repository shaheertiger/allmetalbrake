# Vercel Web Analytics Integration

This project has been configured with Vercel Web Analytics to track visitor metrics and page views.

## What Was Installed

- **Package**: `@vercel/analytics@^2.0.1`
- **Integration Method**: Script tags in HTML files
- **Analytics Script**: `/_vercel/insights/script.js`

## Files Modified

All HTML files in the project now include the Vercel Web Analytics initialization code:

- 19 HTML files in root directory
- 1 HTML file in `reviews/` subdirectory
- Total: 20 HTML files

## How It Works

1. **Analytics Initialization**: Each HTML file includes a script that initializes the `window.va` queue
2. **Analytics Script**: A deferred script loads from `/_vercel/insights/script.js`
3. **Automatic Tracking**: Once deployed to Vercel, analytics will automatically track:
   - Page views
   - Visitor metrics
   - Session data
   - Traffic sources

## Code Added to Each HTML File

```html
<!-- Vercel Web Analytics -->
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

## Enabling Analytics Dashboard

To start collecting analytics data:

1. Go to your Vercel project dashboard
2. Click on "Analytics" in the sidebar
3. Click "Enable Web Analytics"
4. Deploy your site to Vercel
5. Analytics data will start appearing within minutes

## Verifying Analytics

After deploying to Vercel:

1. Open your site in a browser
2. Open Developer Tools (F12)
3. Go to the Network tab
4. Visit a page on your site
5. Look for a request to `/_vercel/insights/script.js`
6. You should also see XHR requests to tracking endpoints

## Documentation

- [Vercel Web Analytics Quickstart](https://vercel.com/docs/analytics/quickstart)
- [Vercel Web Analytics Package](https://vercel.com/docs/analytics/package)

## Development

To test the site locally:

```bash
npm run dev
```

This will start a local development server on port 3000.

## Notes

- Analytics only works when deployed to Vercel
- The `/_vercel/insights/script.js` path is automatically provided by Vercel
- No additional configuration is needed after enabling in the dashboard
- Analytics data is available in the Vercel dashboard under the Analytics section
