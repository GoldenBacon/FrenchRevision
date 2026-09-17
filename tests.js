// =====================================================
// FRENCH REVISION TESTS
// =====================================================
//
// ADD NEW TESTS HERE.
//
// Each test needs:
// - category
// - id
// - title
// - description
// - words
//
// Multiple English meanings should be separated with "/".
//
// Example:
// "difficile": "difficult/hard"
//
// In Enter English mode, typing either "difficult" or "hard"
// will be accepted.
// =====================================================


const TESTS = [

  // ===================================================
  // OPINIONS & DESCRIPTIONS — TEST 1
  // ===================================================

  {
    category: "Opinions & Descriptions",

    id: "opinions-1",

    title: "Opinions & Descriptions 1",

    description:
      "Core adjectives and descriptions.",

    words: {

      "bruit, bruyant(e)":
        "noise/noisy",

      "cher, chère":
        "expensive",

      "courant(e)":
        "current/common",

      "(des)agréable":
        "(un)pleasant",

      "divers":
        "varied/diverse",

      "drôle":
        "funny",

      "dur":
        "hard",

      "efficace":
        "efficient/effective",

      "égal(e)":
        "equal",

      "embêtant(e)":
        "annoying"

    }
  },


  // ===================================================
  // OPINIONS & DESCRIPTIONS — TEST 2
  // ===================================================

  {
    category: "Opinions & Descriptions",

    id: "opinions-2",

    title: "Opinions & Descriptions 2",

    description:
      "More useful descriptive vocabulary.",

    words: {

      "équilibré":
        "balanced",

      "étonnant":
        "surprising/amazing",

      "évident(e)":
        "obvious",

      "faible":
        "weak",

      "formidable":
        "brilliant",

      "grave":
        "serious",

      "indispensable":
        "essential",

      "inquiétant(e)":
        "worrying",

      "inutile":
        "useless",

      "juste":
        "fair"

    }
  },


  // ===================================================
  // OPINIONS & DESCRIPTIONS — TEST 3
  // ===================================================

  {
    category: "Opinions & Descriptions",

    id: "opinions-3",

    title: "Opinions & Descriptions 3",

    description:
      "Useful expressions and descriptions.",

    words: {

      "pas mal":
        "not bad/alright",

      "passionnant(e)":
        "exciting",

      "perte de temps":
        "waste of time",

      "perte d'argent":
        "waste of money",

      "responsable":
        "responsible",

      "pratique":
        "practical",

      "suffisant(e)":
        "sufficient/enough",

      "sûr(e)":
        "sure/safe",

      "sympa":
        "nice/kind/friendly",

      "utile":
        "useful"

    }
  }

];


// =====================================================
// HOW TO ADD ANOTHER TEST
// =====================================================
//
// Copy this template and put it before the final ];
//
// {
//   category: "School",
//   id: "school-1",
//   title: "School 1",
//   description: "School vocabulary.",
//
//   words: {
//     "livre": "book",
//     "professeur": "teacher",
//     "difficile": "difficult/hard",
//     "important": "important"
//   }
// }
//
// The app will automatically:
// - create the category
// - add the test to that category
// - include it in the category's "All" test
// - include its words in Word Accuracy
// - allow the words to be searched
//
// =====================================================
