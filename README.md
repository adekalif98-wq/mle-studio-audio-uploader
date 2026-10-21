# MLE STUDIO Audio Uploader (Starter)

A mobile-friendly Node.js starter for managing Roblox audio upload metadata and validating a locally selected audio file.

## Important limitations
- This starter **does not yet upload audio to Roblox Open Cloud**. It validates the form, accepts the file temporarily, and removes it.
- It does not download/extract audio from YouTube, TikTok, Spotify, or SoundCloud.
- It does not bypass copyright or Roblox moderation.
- A Roblox API key alone is not sufficient: configure the correct creator, permissions, asset request metadata, and follow current Roblox API documentation before enabling real uploads.
- Never put API keys in frontend code or commit them to GitHub.

## Run locally
1. Install Node.js 20+.
2. Run `npm install`.
3. Run `npm start`.
4. Open `http://localhost:3000`.

## Deploy to Render
- Push this repository to GitHub.
- In Render, create a Web Service connected to this repository.
- Build command: `npm install`
- Start command: `npm start`
- Runtime: Node.
- The free service may sleep and has limited resources.

## Environment variables
`ROBLOX_API_KEY` and `ROBLOX_CREATOR_ID` are reserved configuration names for a future server-side Open Cloud integration. This starter does not use the key to perform an upload yet. Set secrets only in the hosting provider dashboard, never in GitHub or browser code.

## File limits
UI/server accepts MP3, WAV, OGG, FLAC up to 20 MB as a starter validation limit. Confirm the current Roblox limits and requirements before implementing production upload.
