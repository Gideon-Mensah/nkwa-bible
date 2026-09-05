const fs = require("fs");
const path = require("path");
const vm = require("vm");
const babel = require("@babel/core");

const projectRoot = path.resolve(__dirname, "..");
const mappingPath = path.join(projectRoot, "src/data/bookMappings.js");
const source = fs.readFileSync(mappingPath, "utf8");
const transformed = babel.transformSync(source, {
  plugins: ["@babel/plugin-transform-modules-commonjs"],
  filename: mappingPath,
}).code;
const moduleRecord = { exports: {} };
vm.runInNewContext(transformed, { module: moduleRecord, exports: moduleRecord.exports, Set, Object });

const twiBible = require(path.join(projectRoot, "src/data/bible.json"));
const englishBible = require(path.join(projectRoot, "src/data/web_bible.json"));
const { BOOK_MAPPINGS, validateBookMappings } = moduleRecord.exports;
const errors = validateBookMappings(twiBible, englishBible);

if (new Set(BOOK_MAPPINGS.map((book) => book.id)).size !== 66) errors.push("Canonical IDs are not exactly 66 unique values.");
if (BOOK_MAPPINGS.map((book) => book.twi).join("|") !== Object.keys(twiBible.books).join("|")) errors.push("Twi mapping order differs from the dataset order.");
if (BOOK_MAPPINGS.map((book) => book.english).join("|") !== Object.keys(englishBible.books).join("|")) errors.push("English mapping order differs from the dataset order.");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Validated 66 unique canonical books across the Twi and English datasets.");
