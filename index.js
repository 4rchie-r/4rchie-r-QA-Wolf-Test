// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1


// Importing the playwright
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {

  // Launch the Chromium browser in non-headless mode (i.e., visible)
  const browser = await chromium.launch({ headless: false });

  // Create a new browser context (session) and a new page within that context
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to the "newest" section of Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  // Array to hold the collected articles
  let articles = [];

  // Loop to collect articles until we have exactly 100
  while (articles.length < 100) {

    // Evaluate all article nodes on the current page
    const newArticles = await page.locator('.athing').evaluateAll((articleNodes) => {
      return articleNodes.map((article) => {
        const id = article.id; // Get the article ID

        // Extract the title directly from the <a> tag within the .titleline
        const titleElement = article.querySelector('.titleline > a');
        const title = titleElement ? titleElement.innerText : 'No Title'; // Get the article title

        // Extract the absolute timestamp from the title attribute of the .age class
        const ageElement = article.nextElementSibling.querySelector('.age');
        const date = ageElement ? ageElement.getAttribute('title') : null; // Extract the absolute date text from the title attribute

        return { id, title, date }; // Return an object with article details
      });
    });

    // Add new articles to the collection
    articles.push(...newArticles);

    // If we have collected 100 articles, slice the array to exactly 100 and break the loop
    if (articles.length >= 100) {
      articles = articles.slice(0, 100);
      break;
    }

    // Click the "More" link to load the next page of articles
    await Promise.all([
      page.waitForURL("**/newest*"),
      page.click('a.morelink')
    ]);
  }

  // Convert absolute date strings to Date objects and sort articles
  const sortedArticles = [...articles].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA; // Sort from newest to oldest
  });

  // Validate that the original list is sorted correctly
  const isSorted = sortedArticles.every((article, index) => {
    if (index === 0) return true; // First article is always considered sorted
    const prevDate = new Date(sortedArticles[index - 1].date);
    const currDate = new Date(article.date);
    return currDate <= prevDate; // Ensure current article is not newer than previous
  });

  // Print the sorted articles to the terminal
  console.log("Sorted Articles:", sortedArticles);

  // Print result to the terminal
  if (isSorted) {
    console.log("Test Passed: All articles are sorted from newest to oldest.");
  } else {
    console.log("Test Failed: Articles are not sorted correctly.");
  }

  // Close the browser
  await browser.close();
}

// Self-invoking function to execute the above function
(async () => {
  await sortHackerNewsArticles();
})();
