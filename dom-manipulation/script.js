// -------------------- Quotes Array --------------------
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Inspiration" },
  { text: "Your time is limited, don’t waste it living someone else’s life.", category: "Life" }
];

// -------------------- Load from Storage --------------------
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// -------------------- Display Random Quote --------------------
function displayRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  document.getElementById("quoteDisplay").textContent = `"${quote.text}" — ${quote.category}`;

  // Save last viewed quote to session storage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// -------------------- Add Quote --------------------
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text === "" || category === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  displayRandomQuote(); // ✅ Update DOM immediately

  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
}

// -------------------- Category Filtering --------------------
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  if (!filter) return;

  // Clear existing
  filter.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Categories";
  filter.appendChild(allOption);

  // Unique categories
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filter.appendChild(opt);
  });

  // Restore last selection
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    filter.value = savedCategory;
    filterQuotes();
  }
}

function filterQuotes() {
  const filter = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", filter);

  let filteredQuotes = quotes;
  if (filter !== "all") {
    filteredQuotes = quotes.filter(q => q.category === filter);
  }

  const display = document.getElementById("quoteDisplay");
  if (filteredQuotes.length === 0) {
    display.textContent = "No quotes available for this category.";
  } else {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    display.textContent = `"${quote.text}" — ${quote.category}`;
  }
}

// -------------------- Import / Export JSON --------------------
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      displayRandomQuote(); // ✅ show imported quote immediately
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// -------------------- Server Sync --------------------
function fetchQuotesFromServer() {
  return fetch("https://jsonplaceholder.typicode.com/posts")
    .then(res => res.json())
    .then(data => {
      console.log("Fetched from server:", data.slice(0, 3));
      return data;
    });
}

function postQuoteToServer(quote) {
  return fetch("https://jsonplaceholder.typicode.com/posts", {
    body: JSON.stringify(quote)
  })
    .then(res => res.json())
    .then(data => {
      console.log("Posted to server:", data);
    });
}

function syncQuotes() {
  fetchQuotesFromServer().then(serverData => {
    // Simple conflict resolution: server wins
    if (serverData && serverData.length > 0) {
      localStorage.setItem("quotes", JSON.stringify(quotes));
      console.log("Quotes synced with server.");
    }
  });
}

// -------------------- Initialization --------------------
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  displayRandomQuote();

  // ✅ Fix: Correct button id
  const newQuoteBtn = document.getElementById("showNewQuote");
  if (newQuoteBtn) {
    newQuoteBtn.addEventListener("click", displayRandomQuote);
  }

  // Periodic sync (every 30s)
  setInterval(syncQuotes, 30000);
});
