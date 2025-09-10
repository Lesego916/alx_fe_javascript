// ==================== Quotes Data ====================
let quotes = [
  { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

// ==================== Initialization ====================
window.onload = function () {
  loadQuotes();
  populateCategories();
  restoreLastCategory();
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  syncQuotes(); // start server sync
  setInterval(syncQuotes, 10000); // sync every 10s
};

// ==================== Show Random Quote ====================
function showRandomQuote() {
  let filteredQuotes = getFilteredQuotes();
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes available for this category.";
    return;
  }
  let randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  let quote = filteredQuotes[randomIndex];
  document.getElementById("quoteDisplay").textContent = `"${quote.text}" — ${quote.category}`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// ==================== Add New Quote ====================
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    showNotification("Quote added successfully!");
  }
}

// ==================== Local Storage ====================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// ==================== Import / Export JSON ====================
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    showNotification("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// ==================== Category Filtering ====================
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];

  filter.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory && categories.includes(savedCategory)) {
    filter.value = savedCategory;
  }
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

function getFilteredQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  if (selectedCategory === "all") return quotes;
  return quotes.filter(q => q.category === selectedCategory);
}

function restoreLastCategory() {
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    document.getElementById("categoryFilter").value = savedCategory;
    filterQuotes();
  }
}

// ==================== Server Sync Simulation ====================
async function fetchQuotesFromServer() {
  // Using JSONPlaceholder to simulate server quotes
  const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
  const data = await response.json();
  return data.map(post => ({
    text: post.title,
    category: "Server"
  }));
}

async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    // Conflict resolution: server overwrites local if duplicates
    const allQuotes = [...quotes];
    serverQuotes.forEach(sq => {
      if (!allQuotes.some(lq => lq.text === sq.text)) {
        allQuotes.push(sq);
      }
    });
    quotes = allQuotes;
    saveQuotes();
    populateCategories();
    showNotification("Quotes synced with server!");
  } catch (err) {
    showNotification("Server sync failed!", true);
  }
}

// ==================== Notifications ====================
function showNotification(message, isError = false) {
  const notifications = document.getElementById("notifications");
  const div = document.createElement("div");
  div.textContent = message;
  div.style.color = isError ? "red" : "green";
  notifications.appendChild(div);
  setTimeout(() => notifications.removeChild(div), 3000);
}
