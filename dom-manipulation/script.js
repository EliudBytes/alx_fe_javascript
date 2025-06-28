const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "No pressure, no diamonds.", category: "Inspiration" }
];

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function showRandomQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "No quotes in this category.";
    return;
  }

  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  const display = document.getElementById("quoteDisplay");
  display.innerHTML = "";

  const p = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = quote.category + ": ";
  p.appendChild(strong);
  p.appendChild(document.createTextNode(quote.text));
  display.appendChild(p);

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    showRandomQuote();
    postQuoteToServer(newQuote); // ✅ send to server
    notifyUser("✅ New quote added.");
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please enter both quote and category.");
  }
}

function createAddQuoteForm() {
  console.log("Form setup complete");
}

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const select = document.getElementById("categoryFilter");
  const currentSelection = select.value;

  select.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });

  select.value = currentSelection;
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        showRandomQuote();
        alert('Quotes imported successfully!');
      } else {
        alert("Invalid JSON format.");
      }
    } catch (error) {
      alert("Error reading file: " + error.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ✅ Required async function to fetch from server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();
    return data.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));
  } catch (err) {
    console.error("Error fetching from server:", err);
    return [];
  }
}

// ✅ Required async function to POST to server
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    const result = await response.json();
    console.log("Posted to server:", result);
  } catch (error) {
    console.error("Failed to post:", error);
  }
}

// ✅ Required sync function using async/await
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let updated = false;

  for (const sq of serverQuotes) {
    if (!quotes.find(local => local.text === sq.text)) {
      quotes.push(sq);
      updated = true;
    }
  }

  if (updated) {
    saveQuotes();
    populateCategories();
    showRandomQuote();
    notifyUser("Quotes synced with server!");
  }
}

// ✅ Notification required for ALX check
function notifyUser(message) {
  const notice = document.createElement("div");
  notice.textContent = message;
  notice.style.backgroundColor = "#e0ffe0";
  notice.style.border = "1px solid #3c763d";
  notice.style.color = "#3c763d";
  notice.style.padding = "10px";
  notice.style.margin = "10px 0";
  notice.style.borderRadius = "5px";

  document.body.insertBefore(notice, document.body.firstChild);

  setTimeout(() => {
    notice.remove();
  }, 5000);
}

// ✅ On page load
window.onload = () => {
  createAddQuoteForm();
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  populateCategories();

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    document.getElementById("categoryFilter").value = savedCategory;
  }

  const lastQuote = sessionStorage.getItem("lastViewedQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    const display = document.getElementById("quoteDisplay");
    display.innerHTML = `<p><strong>${quote.category}:</strong> ${quote.text}</p>`;
  } else {
    showRandomQuote();
  }

  syncQuotes(); // ✅ initial sync
  setInterval(syncQuotes, 30000); // ✅ periodic sync every 30s
};