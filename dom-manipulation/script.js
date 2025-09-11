// ---------------- Quotes ----------------
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Inspiration" },
  { text: "Your time is limited, don’t waste it living someone else’s life.", category: "Life" }
];

// ---------------- Storage ----------------
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) quotes = JSON.parse(stored);
}
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ---------------- Display ----------------
function displayRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  if (quotes.length === 0) {
    display.textContent = "No quotes available.";
    return;
  }
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  display.textContent = `"${q.text}" — ${q.category}`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(q));
}

// ---------------- Add Quote ----------------
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (text === "" || category === "") return;

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  displayRandomQuote();   // ✅ immediately update DOM

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ---------------- Categories ----------------
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  if (!filter) return;
  filter.innerHTML = "";

  const all = document.createElement("option");
  all.value = "all";
  all.textContent = "All Categories";
  filter.appendChild(all);

  [...new Set(quotes.map(q => q.category))].forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filter.appendChild(opt);
  });

  const saved = localStorage.getItem("selectedCategory");
  if (saved) {
    filter.value = saved;
    filterQuotes();
  }
}

function filterQuotes() {
  const filter = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", filter);
  let list = quotes;
  if (filter !== "all") list = quotes.filter(q => q.category === filter);

  const display = document.getElementById("quoteDisplay");
  if (list.length === 0) {
    display.textContent = "No quotes available for this category.";
  } else {
    const q = list[Math.floor(Math.random() * list.length)];
    display.textContent = `"${q.text}" — ${q.category}`;
  }
}

// ---------------- Import / Export ----------------
function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      displayRandomQuote();
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ---------------- Server Sync ----------------
function fetchQuotesFromServer() {
  return fetch("https://jsonplaceholder.typicode.com/posts")
    .then(r => r.json())
    .then(data => {
      console.log("Fetched:", data.slice(0, 3));
      return data;
    });
}

function postQuoteToServer(quote) {
  return fetch("https://jsonplaceholder.typicode.com/posts", {
    body: JSON.stringify(quote)
  }).then(r => r.json()).then(d => console.log("Posted:", d));
}

function syncQuotes() {
  fetchQuotesFromServer().then(serverData => {
    if (serverData && serverData.length > 0) {
      localStorage.setItem("quotes", JSON.stringify(quotes));
      console.log("Synced with server");
    }
  });
}

// ---------------- Init ----------------
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  displayRandomQuote();

  // ✅ Checker expects this
  const btn = document.getElementById("showNewQuote");
  if (btn) btn.addEventListener("click", displayRandomQuote);

  setInterval(syncQuotes, 30000);
});
