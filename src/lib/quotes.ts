/**
 * Favorite quotes shown by the paper-airplane "Favorite quote" dock feature
 * (src/components/FavoriteQuote.astro). One is chosen at random — never the
 * same twice in a row — each time the airplane is launched.
 *
 * The card wraps `text` in curly quotes and prepends "— " to `author`, so store
 * the bare line here. `author` is optional (omit for anonymous / proverb lines).
 */
export interface Quote {
  text: string;
  author?: string;
}

export const QUOTES: Quote[] = [
  {
    text: "Price is what you pay. Value is what you get.",
    author: "Warren Buffett",
  },
  {
    text: "Luck is a dividend of sweat. The more you sweat, the luckier you get.",
    author: "Ray Kroc",
  },
  {
    text: "Whether you think you can, or you think you can't, you're right.",
    author: "Henry Ford",
  },
  {
    text: "Design is not just what it looks like and feels like. Design is how it works.",
    author: "Steve Jobs",
  },
  {
    text: "The impediment to action advances action. What stands in the way becomes the way.",
    author: "Marcus Aurelius",
  },
  {
    text: "Well done is better than well said.",
    author: "Benjamin Franklin",
  },
  {
    text: "Genius is one percent inspiration and ninety-nine percent perspiration.",
    author: "Thomas Edison",
  },
  {
    text: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller",
  },
  {
    text: "I've failed over and over and over again in my life. And that is why I succeed.",
    author: "Michael Jordan",
  },
  {
    text: "Some people want it to happen, some wish it would happen, others make it happen.",
    author: "Michael Jordan",
  },
];
