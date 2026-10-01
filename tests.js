// =====================================================
// FRENCH REVISION TESTS
// GCSE KO - Reading + Listening (Higher)
// Opinions & Feelings
// =====================================================
//
// Multiple English meanings are separated with "/".
// In Enter English mode, any one accepted meaning
// is enough.
//
// =====================================================

const TESTS = [

  // ===================================================
  // TEST A — OPINION ADJECTIVES
  // ===================================================

  {
    category: "Opinions & Feelings",

    id: "test-a",

    title: "Test A - Opinion Adjectives",

    description:
      "Opinion adjectives and descriptions.",

    words: {
      "affreux, -euse": "awful",
      "bruit, bruyant(e)": "noise/noisy",
      "cher, chère": "expensive",
      "courant(e)": "current/common",
      "(des)agréable": "(un)pleasant",
      "divers": "varied/diverse",
      "drôle": "funny",
      "dur": "hard",
      "efficace": "efficient/effective",
      "égal(e)": "equal",
      "embêtant(e)": "annoying",
      "équilibré": "balanced",
      "étonnant": "surprising/amazing",
      "évident(e)": "obvious",
      "faible": "weak",
      "formidable": "brilliant",
      "grave": "serious",
      "indispensable": "essential",
      "inquiétant(e)": "worrying",
      "inutile": "useless",
      "juste": "fair",
      "pas mal": "not bad/alright",
      "passionnant(e)": "exciting",
      "perte de temps": "waste of time",
      "perte d'argent": "waste of money",
      "responsable": "responsible",
      "pratique": "practical",
      "suffisant(e)": "sufficient/enough",
      "sûr(e)": "sure/safe",
      "sympa": "nice/kind/friendly",
      "utile": "useful"
    }
  },


  // ===================================================
  // TEST B — FEELINGS
  // ===================================================

  {
    category: "Opinions & Feelings",

    id: "test-b",

    title: "Test B - Feelings",

    description:
      "Feelings, emotions and related vocabulary.",

    words: {
      "besoin": "need",
      "bonheur": "happiness",
      "chaud": "hot",
      "colère": "anger",
      "confiance": "trust/confidence",
      "content(e)": "happy",
      "désolé(e)": "sorry",
      "doute": "doubt",
      "échec": "failure",
      "en colère": "angry",
      "faim": "hungry",
      "fatigué(e)": "tired",
      "fier, fière": "proud",
      "froid": "cold",
      "heureux, heureuse": "happy",
      "honte": "shame",
      "inquiet, inquiète": "worried/anxious",
      "intérêt": "interest",
      "joie": "joy",
      "joyeux, joyeuse": "happy",
      "juste": "fair",
      "mal": "ill",
      "plein": "full",
      "prêt": "ready",
      "sentir, sentiment": "to feel/feeling",
      "soif": "to be thirsty",
      "souci": "doubt/worry",
      "souffrance": "suffering",
      "succès": "success",
      "tort": "wrong",
      "triste": "sad"
    }
  },


  // ===================================================
  // TEST C — OPINIONS
  // ===================================================

  {
    category: "Opinions & Feelings",

    id: "test-c",

    title: "Test C - Opinions",

    description:
      "Useful opinion words and expressions.",

    words: {
      "absolument": "absolutely",
      "accord, d'accord": "agreement/ok/alright",
      "contre": "against",
      "pour": "for",
      "vrai": "true",
      "faux, fausse": "false",
      "vérité": "truth",
      "faute": "mistake/error/fault",
      "avantage": "advantage",
      "avis": "opinion",
      "blague": "joke",
      "crise": "crisis",
      "dommage": "shame/pity",
      "entièrement": "entirely",
      "évidemment": "obviously",
      "goût": "taste",
      "idée": "idea",
      "inconvénient": "disadvantage",
      "manque": "lack",
      "meilleur(e)": "best",
      "mieux": "better",
      "par contre": "on the other hand",
      "pensée": "thought",
      "peut-être": "maybe",
      "pire": "worse",
      "plaisir": "pleasure",
      "plainte": "moan/complaint",
      "préféré(e)": "favourite",
      "probablement": "probably",
      "rêve": "dream",
      "selon": "according to"

    }
  },

    // ===================================================
  // TEST D — OPINION VERBS
  // ===================================================

  {
    category: "Opinions & Feelings",

    id: "test-d",

    title: "Test D - Opinion Verbs",

    description:
      "Opinion verbs and useful expressions.",

    words: {
      "adorer": "to love",
      "aimer": "to like",
      "apprécier": "to appreciate",
      "avouer": "to admit/confess",
      "croire": "to believe",
      "désirer": "to want",
      "détester": "to hate",
      "espérer": "to hope",
      "être d'accord": "to agree",
      "penser": "to think",
      "préférer": "to prefer",
      "réfléchir": "to think about/to reflect",
      "rêver": "to dream",
      "rire": "to laugh",
      "sembler": "to seem",
      "souffrir": "to suffer",
      "sourire": "to smile",
      "supporter": "to put up with",
      "vouloir": "to want",
      "ça m'est égal": "it doesn't bother me",
      "ça me fait rire":  "it makes me laugh",
      "ça me fait sourire":  "it makes me smile",
      "ça m'intéresse": "it interests me",
      "ça semble": "it seems",
      "il manque": "...is missing",
      "il vaut mieux": "it's better to",
      "quel dommage": "what a shame",
      "je me sens": "I feel",
      "je ne sais pas": "I don't know"
    }
  },

  
  // ===================================================
  // TEST A — NEGATIVES + DISTRACTORS
  // ===================================================

  {
    category: "Common Traps & False Friends",
    id: "common-traps-a",
    title: "Test A - Negatives + Distractors",
    description: "Negatives, distractors and commonly confused expressions.",
    words: {
      "par contre": "whereas",
      "même si": "even if, even though",
      "en fait": "in fact",
      "ne... pas": "not",
      "ne... jamais": "never",
      "ne... rien": "nothing, not anything",
      "ne... plus": "no more, no longer",
      "ne... personne": "no-one, nobody",
      "ne... que": "only",
      "seulement": "only",
      "ne... aucun(e)": "not any, not a single",
      "ni... ni": "neither ... nor",
      "malgré": "despite",
      "pas encore": "not yet",
      "pareil, pareille": "the same",
      "au lieu de": "instead of",
      "sauf": "except",
      "venir de": "to have just ...",
      "je viens de": "I have just ...",
      "certains": "certain/some people",
      "presque": "almost, nearly",
      "déjà": "already",
      "c'est-à-dire": "in other words",
      "contraire": "opposite, contrary",
      "un peu": "a bit, a little"
    }
  },

  // ===================================================
  // TEST B — FALSE FRIENDS
  // ===================================================

  {
    category: "Common Traps & False Friends",
    id: "common-traps-b",
    title: "Test B - False Friends",
    description: "French words that can be confused with English words.",
    words: {
      "actuel": "current, present",
      "l'anniversaire": "birthday",
      "attendre": "to wait",
      "blesser": "to injure",
      "le bras": "arm",
      "le but": "goal",
      "car": "because",
      "carte": "menu, map, card",
      "célibataire": "single",
      "la chambre": "bedroom",
      "la chance": "luck",
      "chanter": "to sing",
      "chanteur, chanteuse": "singer",
      "la circulation": "traffic",
      "la cité": "council estate",
      "le coin": "corner",
      "le collège": "secondary school",
      "commander": "to order",
      "contrôler": "to check, to inspect",
      "contrôle": "test, inspection",
      "la course": "race",
      "les courses": "(food) shopping",
      "la cour": "courtyard, playground",
      "les cours": "lessons",
      "court(e)": "short",
      "crier": "to shout",
      "direction": "management",
      "demander, demande": "to ask for, request"
    }
  },

  // ===================================================
  // TEST C — FALSE FRIENDS
  // ===================================================

  {
    category: "Common Traps & False Friends",
    id: "common-traps-c",
    title: "Test C - False Friends",
    description: "More commonly confused French and English vocabulary.",
    words: {
      "le dos": "back",
      "enregistrer": "to record, to save",
      "la formation": "training",
      "fort(e)": "strong, loud",
      "les fruits de mer": "seafood",
      "gentil, gentille": "kind",
      "grand, grand(e)": "big, tall",
      "grave": "serious",
      "l'hôtel de ville": "town hall",
      "joli(e)": "pretty",
      "le journal": "newspaper",
      "les journaux": "newspapers",
      "la journée": "day",
      "la lecture": "reading",
      "le magasin": "shop",
      "la main": "hand",
      "la manifestation": "demonstration, event",
      "manifester": "to protest, to demonstrate",
      "le médecin": "doctor",
      "la note": "grade, mark",
      "l'occasion": "chance, opportunity",
      "le pain": "bread",
      "le pantalon": "trousers",
      "la partie": "part, game, match",
      "passer un examen": "to sit/take an exam",
      "plein": "full",
      "le programme": "schedule",
      "le projet": "plan"
    }
  },

];
