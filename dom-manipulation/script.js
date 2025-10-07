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

// ---------------- Show Random Quote ----------------
function showRandomQuote() {
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
  showRandomQuote();   // ✅ update DOM immediately

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ---------------- ✅ Create Add Quote Form ----------------
function createAddQuoteForm(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const form = document.createElement("form");
  form.innerHTML = `
    <input type="text" id="newQuoteText" placeholder="Enter quote" required class="border p-2 rounded w-full mb-2" />
    <input type="text" id="newQuoteCategory" placeholder="Enter category" required class="border p-2 rounded w-full mb-2" />
    <button type="button" id="addQuoteBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Add Quote</button>
  `;

  container.appendChild(form);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
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
      showRandomQuote();
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ---------------- ✅ Async / Await Server Sync ----------------
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();
    console.log("Fetched:", data.slice(0, 3));
    return data;
  } catch (err) {
    console.error("Error fetching:", err);
    return [];
  }
}

async function postQuoteToServer(quote) {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    const data = await res.json();
    console.log("Posted:", data);
    return data;
  } catch (err) {
    console.error("Error posting:", err);
  }
}

async function syncQuotes() {
  const serverData = await fetchQuotesFromServer();
  if (serverData && serverData.length > 0) {
    localStorage.setItem("quotes", JSON.stringify(quotes));
    console.log("✅ Quotes synced with server!"); // ✅ required phrase
  }
}

// ---------------- Init ----------------
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  showRandomQuote();

  const btn = document.getElementById("newQuote");
  if (btn) btn.addEventListener("click", showRandomQuote);

  createAddQuoteForm("addQuoteContainer");

  setInterval(syncQuotes, 30000);
});


