<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/985af123-e568-4aa6-8ffc-83668eed3159

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Create a `.env.local` file or use `.env.example` and add your Gemini key:
   `GEMINI_API_KEY=YOUR_GEMINI_API_KEY`
3. Run the app:
   `npm run dev`

## Netlify Deployment

This repo is configured for Netlify with `netlify.toml` and a serverless AI function.

1. Push to GitHub and connect the repository in Netlify.
2. Set the site environment variable in Netlify:
   `GEMINI_API_KEY`
3. Build command:
   `npm run build`
4. Publish directory:
   `dist`

### Local Netlify Function Testing

If you want to run the AI function locally, install the Netlify CLI and run:

```bash
npm install -g netlify-cli
netlify dev
```

The app will proxy `/api/tailor` to the Netlify function during local development.
