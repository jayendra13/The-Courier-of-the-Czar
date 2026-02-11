/**
 * Parse book.txt and extract chapter boundaries into chapters.json.
 * Run: node scripts/extract-chapters.js
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bookPath = resolve(__dirname, '..', 'book.txt');
const outPath = resolve(__dirname, '..', 'src', 'data', 'chapters.json');

const text = readFileSync(bookPath, 'utf-8');
const lines = text.split('\n');

const chapters = [];
let currentBook = '';
let currentChapter = null;
let buffer = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // Detect book headers (in the body text, e.g. "BOOK I" on its own line)
  if (/^BOOK\s+(I{1,3}V?)\s*$/.test(line)) {
    currentBook = line.match(/^BOOK\s+(I{1,3}V?)/)[1];
    continue;
  }

  // Detect chapter headers — format: "CHAPTER XIV THE NIGHT OF THE FIFTH OF OCTOBER"
  // Also matches TOC format "CHAPTER XIV.   TITLE" but we skip lines < 120 (TOC area)
  const chapterMatch = line.match(/^CHAPTER\s+([IVXLC]+)\.?\s+(.+)/);
  if (chapterMatch && i > 120) {
    // Save previous chapter
    if (currentChapter) {
      currentChapter.text = buffer.join('\n').trim();
      chapters.push(currentChapter);
    }

    currentChapter = {
      book: currentBook,
      chapter: chapterMatch[1],
      title: chapterMatch[2],
      id: `${currentBook}.${chapterMatch[1]}`,
    };
    buffer = [];
    continue;
  }

  if (currentChapter) {
    buffer.push(lines[i]);
  }
}

// Save last chapter
if (currentChapter) {
  currentChapter.text = buffer.join('\n').trim();
  chapters.push(currentChapter);
}

// Write summary (without full text to keep file manageable)
const summary = chapters.map((ch) => ({
  id: ch.id,
  book: ch.book,
  chapter: ch.chapter,
  title: ch.title,
  wordCount: ch.text.split(/\s+/).length,
  firstLine: ch.text.split('\n').find((l) => l.trim().length > 20)?.trim() || '',
}));

writeFileSync(outPath, JSON.stringify(summary, null, 2));
console.log(`Extracted ${chapters.length} chapters to ${outPath}`);
