# 🇫🇷 French Revision

A simple French vocabulary revision app designed to work on GitHub Pages.

It is completely local-only, so no account or database is required.


## Files

- `index.html` — app structure
- `style.css` — styling and dark mode
- `tests.js` — vocabulary, tests and categories
- `app.js` — quiz logic and accuracy tracking
- `manifest.json` — PWA information
- `README.md` — instructions


## Features

- Multiple Choice
- Enter English
- Random question order
- Random multiple-choice answers
- Multiple English meanings
- One correct meaning is enough in Enter English
- Multiple meanings can be entered together
- Per-word accuracy tracking
- Search French and English words
- Search test categories
- Categories contain multiple tests
- **All** button to test every word in a category
- Points
- Streaks
- Practice Mistakes
- Dark mode
- Statistics saved on the device
- Works with GitHub Pages
- No Supabase
- No accounts


## Adding a new test

Open `tests.js`.

Add another test inside the `TESTS` array.

For example:

```js
{
  category: "School",

  id: "school-1",

  title: "School 1",

  description: "School vocabulary.",

  words: {
    "livre": "book",
    "professeur": "teacher",
    "difficile": "difficult/hard",
    "important": "important"
  }
}
