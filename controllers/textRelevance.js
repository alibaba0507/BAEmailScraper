const natural = require("natural");

// Tokenize and preprocess the text
function preprocessText(text) {
  const tokenizer = new natural.WordTokenizer();
  const words = tokenizer.tokenize(text.toLowerCase()); // Convert to lowercase for case-insensitive comparison

  return words;
}
// Calculate cosine similarity
function calculateRelevance(query, text) {
  const queryWords = preprocessText(query);
  const textWords = preprocessText(text);

  const tfidf = new natural.TfIdf();
  tfidf.addDocument(queryWords);
  tfidf.addDocument(textWords);

  const queryVector = tfidf.listTerms(0).map(term => term.tfidf);
  const textVector = tfidf.listTerms(1).map(term => term.tfidf);

  const dotProduct = queryVector.reduce((sum, value, i) => sum + value * textVector[i], 0);
  const queryMagnitude = Math.sqrt(queryVector.reduce((sum, value) => sum + value ** 2, 0));
  const textMagnitude = Math.sqrt(textVector.reduce((sum, value) => sum + value ** 2, 0));

  const cosineSimilarity = dotProduct / (queryMagnitude * textMagnitude);
  return cosineSimilarity;
}
module.exports = {
  calculateRelevance
};
