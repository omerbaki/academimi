# Academimi

Hebrew-English dictation practice app for kids.

## Tech Stack
- React 19 + TypeScript
- Vite
- Web Speech API (Samantha voice preferred)
- Deployed on Vercel

## Key Files
- `public/default-banks.json` - Word bank data (edit here to add/change words)
- `src/components/Practice.tsx` - Main practice flow with text-to-speech
- `src/components/Results.tsx` - Score display

## Commands
- `npm run dev` - Start dev server
- `npm run deploy` - Deploy to Vercel

## Notes
- UI is in Hebrew
- Grade >= 80% shows "כל הכבוד!"
- Two test modes: all words or random 10
