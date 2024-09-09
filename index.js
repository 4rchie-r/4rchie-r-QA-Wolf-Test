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

  // Helper function to convert relative age strings (e.g., "2 hours ago") to Date objects
  function convertAgeToDate(age) {
    const now = new Date();
    const [value, unit] = age.split(' ');

    // Calculate the date based on the current time and the relative time unit
    switch (unit) {
      case 'minute':
      case 'minutes':
        return new Date(now.getTime() - parseInt(value, 10) * 60000); // Subtract minutes
      case 'hour':
      case 'hours':
        return new Date(now.getTime() - parseInt(value, 10) * 3600000); // Subtract hours
      case 'day':
      case 'days':
        return new Date(now.getTime() - parseInt(value, 10) * 86400000); // Subtract days
      case 'month':
      case 'months':
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - parseInt(value, 10)); // Subtract months
        return monthAgo;
      case 'year':
      case 'years':
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - parseInt(value, 10)); // Subtract years
        return yearAgo;
      default:
        return now; // Default to current time if unit is not recognized
    }
  }

  // Loop to collect articles until we have exactly 100
  while (articles.length < 100) {
    
    // Evaluate all article nodes on the current page
    const newArticles = await page.locator('.athing').evaluateAll((articleNodes) => {
      return articleNodes.map((article) => {
        const id = article.id; // Get the article ID
        const title = article.querySelector('.titleline > a').innerText; // Get the article title
        const ageElement = article.nextElementSibling.querySelector('.age'); // Get the age element
        const age = ageElement ? ageElement.innerText : null; // Extract the age text
        return { id, title, age }; // Return an object with article details
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

  // Convert age strings to Date objects and sort articles
  const sortedArticles = [...articles].sort((a, b) => {
    const dateA = convertAgeToDate(a.age);
    const dateB = convertAgeToDate(b.age);
    return dateB - dateA; // Sort from newest to oldest
  });

  // Validate that the original list is sorted correctly
  const isSorted = articles.every((article, index) => {
    if (index === 0) return true; // First article is always considered sorted
    const prevDate = convertAgeToDate(articles[index - 1].age);
    const currDate = convertAgeToDate(article.age);
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

 // Self invoking function to execute the above function
(async () => {
  await sortHackerNewsArticles();
})();
