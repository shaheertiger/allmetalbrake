/**
 * Vercel Web Analytics Integration
 * This file initializes Vercel Web Analytics for the site.
 * 
 * Documentation: https://vercel.com/docs/analytics/quickstart
 */

// Initialize the Vercel Analytics queue
window.va = window.va || function () { 
  (window.vaq = window.vaq || []).push(arguments); 
};

// Optional: Add beforeSend hook for filtering events (if needed)
// window.va('beforeSend', (event) => {
//   // Example: Filter out certain URLs
//   if (event.url.includes('/private')) {
//     return null;
//   }
//   return event;
// });

console.log('Vercel Web Analytics initialized');
