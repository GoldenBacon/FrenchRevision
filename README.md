# French Quiz

Mobile-friendly French vocabulary quiz for GitHub Pages/PWA.

## Add a test
Edit `tests.js`:

```js
{
  id: "food",
  title: "Food",
  description: "Food vocabulary",
  words: {
    "pomme": "apple",
    "pain": "bread"
  }
}
```

The home screen creates the test automatically.

## Included
- Multiple choice
- Enter English
- Points
- Session attempts + accuracy
- Per-word lifetime attempts/accuracy
- Results/history
- Dark mode
- PWA files for phone installation

## Global leaderboards
GitHub Pages is static, so a real global leaderboard needs a backend. The clean setup is GitHub Pages + Supabase (anonymous auth, unique username, database) with a server-side score-submission function. Do not trust client-provided scores for a competitive leaderboard.
