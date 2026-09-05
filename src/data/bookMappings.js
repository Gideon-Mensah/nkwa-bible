const englishBooks = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
  "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum",
  "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians",
  "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James",
  "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation",
];

const twiBooks = [
  "Gyenesis", "Eksodɔs", "Lewitikɔs", "Numeri", "Deuteronomium", "Yosua", "Atemmufoɔ", "Rut",
  "1 Samuel", "2 Samuel", "1 Ahemfo", "2 Ahemfo", "1 Berɛsosɛm", "2 Berɛsosɛm", "Esra", "Nehemia",
  "Ester", "Hiob", "Nnwom", "Mmebusɛm", "Ɔsɛnkafoɔ", "Nnwom mu dwom", "Yesaia", "Yeremia",
  "Kwadwom", "Hesekiel", "Daniel", "Hosea", "Yoel", "Amos", "Obadia", "Yona", "Mika", "Nahum",
  "Habakuk", "Sefania", "Hagai", "Sakaria", "Malaki", "Mateo", "Marko", "Luka", "Yohane", "Asomafoɔ",
  "Romafoɔ", "1 Korintofoɔ", "2 Korintofoɔ", "Galatifoɔ", "Efesofoɔ", "Filipifoɔ", "Kolosefoɔ",
  "1 Tesalonikafoɔ", "2 Tesalonikafoɔ", "1 Timoteo", "2 Timoteo", "Tito", "Filemon", "Hebrifoɔ", "Yakobo",
  "1 Petro", "2 Petro", "1 Yohane", "2 Yohane", "3 Yohane", "Yuda", "Adiyisɛm",
];

const ids = [
  "genesis", "exodus", "leviticus", "numbers", "deuteronomy", "joshua", "judges", "ruth",
  "first_samuel", "second_samuel", "first_kings", "second_kings", "first_chronicles", "second_chronicles",
  "ezra", "nehemiah", "esther", "job", "psalms", "proverbs", "ecclesiastes", "song_of_solomon",
  "isaiah", "jeremiah", "lamentations", "ezekiel", "daniel", "hosea", "joel", "amos", "obadiah", "jonah",
  "micah", "nahum", "habakkuk", "zephaniah", "haggai", "zechariah", "malachi", "matthew", "mark", "luke",
  "john", "acts", "romans", "first_corinthians", "second_corinthians", "galatians", "ephesians", "philippians",
  "colossians", "first_thessalonians", "second_thessalonians", "first_timothy", "second_timothy", "titus",
  "philemon", "hebrews", "james", "first_peter", "second_peter", "first_john", "second_john", "third_john",
  "jude", "revelation",
];

export const BOOK_MAPPINGS = ids.map((id, index) => ({
  id,
  english: englishBooks[index],
  twi: twiBooks[index],
  testament: index < 39 ? "old" : "new",
}));

export function findBook(identifier) {
  if (!identifier) return null;
  return BOOK_MAPPINGS.find(
    (book) => book.id === identifier || book.english === identifier || book.twi === identifier
  ) || null;
}

export function getCanonicalBookId(identifier) {
  return findBook(identifier)?.id || null;
}

export function getBookName(identifier, language) {
  const book = findBook(identifier);
  return book ? book[language === "english" ? "english" : "twi"] : null;
}

export function convertBookName(bookName, language) {
  return getBookName(bookName, language);
}

export function getTestamentBooks(testament, language) {
  return BOOK_MAPPINGS.filter((book) => book.testament === testament).map(
    (book) => ({ id: book.id, name: getBookName(book.id, language) })
  );
}

export function validateBookMappings(twiBible, englishBible) {
  const errors = [];
  const idsSeen = new Set();
  const twiSeen = new Set();
  const englishSeen = new Set();

  if (BOOK_MAPPINGS.length !== 66) errors.push(`Expected 66 mappings, found ${BOOK_MAPPINGS.length}.`);

  BOOK_MAPPINGS.forEach((book) => {
    if (idsSeen.has(book.id)) errors.push(`Duplicate canonical ID: ${book.id}`);
    if (twiSeen.has(book.twi)) errors.push(`Duplicate Twi book: ${book.twi}`);
    if (englishSeen.has(book.english)) errors.push(`Duplicate English book: ${book.english}`);
    idsSeen.add(book.id);
    twiSeen.add(book.twi);
    englishSeen.add(book.english);

    const twiChapters = twiBible?.books?.[book.twi];
    const englishChapters = englishBible?.books?.[book.english];
    if (!twiChapters || Object.keys(twiChapters).length === 0) errors.push(`Missing Twi chapters: ${book.twi}`);
    if (!englishChapters || Object.keys(englishChapters).length === 0) errors.push(`Missing English chapters: ${book.english}`);
  });

  return errors;
}
