// Initial array of quotes
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do one thing every day that scares you.", category: "Courage" }
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// Function to show a random quote
function showRandomQuote() {
  if (quotes.length === 0) return;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><em>- ${quote.category}</em>`;
}

newQuoteBtn.addEventListener("click", showRandomQuote);

// Function to add a new quote

function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (quoteText && quoteCategory) {
    quotes.push({ text: quoteText, category: quoteCategory });
    saveQuotes(); // Save to localStorage
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    showRandomQuote();
  } else {
    alert("Please fill in both fields.");
  }
}

populateCategories(); // Updates dropdown with any new categories

function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function showRandomQuote() {
  if (quotes.length === 0) return;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><em>- ${quote.category}</em>`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// Load last viewed quote on refresh
function loadLastViewedQuote() {
  const last = sessionStorage.getItem("lastViewedQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.innerHTML = `<p>"${quote.text}"</p><em>- ${quote.category}</em>`;
  }
}

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        importedQuotes.forEach(q => {
          if (q.text && q.category) quotes.push(q);
        });
        saveQuotes();
        showRandomQuote();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  reader.readAsText(file);
}

function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  // Clear existing options except "All"
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const lastFilter = localStorage.getItem("selectedCategory");
  if (lastFilter) {
    categoryFilter.value = lastFilter;
    filterQuotes(); // apply filter on load
  }
}

function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);

  const filtered = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = `<p><em>No quotes in this category.</em></p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><em>- ${quote.category}</em>`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

const SERVER_API = {
  fetchQuotes: () =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { text: "Server wisdom takes priority.", category: "Server" },
          { text: "Data sync is the new gravity.", category: "Tech" }
        ]);
      }, 1000);
    }),
  postQuotes: updatedQuotes =>
    new Promise(resolve => {
      setTimeout(() => resolve({ success: true }), 1000);
    })
};

function startPeriodicSync(interval = 60000) {
  setInterval(async () => {
    const serverQuotes = await SERVER_API.fetchQuotes();
    const merged = mergeQuotes(serverQuotes, quotes);
    quotes = merged;
    saveQuotes();
    populateCategories();
    filterQuotes();
    notifyUpdate("Synced with server – conflicts resolved in favor of server.");
  }, interval);
}

function mergeQuotes(serverQuotes, localQuotes) {
  const localMap = new Map(localQuotes.map(q => [q.text + q.category, q]));
  serverQuotes.forEach(q => {
    localMap.set(q.text + q.category, q); // Overwrites local in case of conflict
  });
  return [...localMap.values()];
}

function notifyUpdate(message) {
  const note = document.createElement("div");
  note.textContent = message;
  note.style.cssText = "background: #f0f0f0; padding: 10px; margin: 10px 0;";
  document.body.insertBefore(note, document.body.firstChild);
  setTimeout(() => note.remove(), 5000);
}

async function fetchQuotesFromServer() {
  return await SERVER_API.fetchQuotes();
}

async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();

    // Convert API response to quote objects
    const quotesFromServer = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server" // You can customize this or use post.userId for variety
    }));

    return quotesFromServer;
  } catch (error) {
    console.error("Failed to fetch from server:", error);
    notifyUpdate("⚠️ Could not fetch quotes from server.");
    return [];
  }
}

loadQuotes();
createAddQuoteForm();
populateCategories();
loadLastViewedQuote(); // Optional but neat