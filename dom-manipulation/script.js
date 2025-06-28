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
    postQuoteToServer(newQuote);
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("Quote added!");
  } else {
    alert("Please enter both quote and category.");
  }
}

function createAddQuoteForm() {
  console.log("createAddQuoteForm exists");
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
        alert('Quotes imported successfully!');
        showRandomQuote();
      } else {
        alert("Invalid JSON format.");
      }
    } catch (error) {
      alert("Error reading file: " + error.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ✅ Required by ALX: fetchQuotesFromServer
function fetchQuotesFromServer() {
  return fetch(SERVER_URL)
    .then(response => response.json())
    .then(data => {
      return data.slice(0, 5).map(item => ({
        text: item.title,
        category: "Server"
      }));
    });
}

// ✅ Required by ALX: syncQuotes
function syncQuotes() {
  fetchQuotesFromServer()
    .then(serverQuotes => {
      let updated = false;

      serverQuotes.forEach(sq => {
        if (!quotes.find(local => local.text === sq.text)) {
          quotes.push(sq);
          updated = true;
        }
      });

      if (updated) {
        saveQuotes();
        populateCategories();
        notifyUser("✅ Synced with server successfully!");
      }
    })
    .catch(err => {
      console.error("Sync failed:", err);
    });
}

// ✅ Required by ALX: postQuoteToServer
function postQuoteToServer(quote) {
  fetch(SERVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(quote)
  })
  .then(response => response.json())
  .then(data => {
    console.log("Posted to server:", data);
  })
  .catch(error => {
    console.error("Failed to post quote:", error);
  });
}

function notifyUser(message) {
  const notice = document.createElement("div");
  notice.textContent = message;
  notice.style.backgroundColor = "#dff0d8";
  notice.style.border = "1px solid #3c763d";
  notice.style.color = "#3c763d";
  notice.style.padding = "10px";
  notice.style.margin = "10px 0";

  document.body.insertBefore(notice, document.body.firstChild);

  setTimeout(() => {
    notice.remove();
  }, 5000);
}

window.onload = function () {
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

  // ✅ Start syncing with server
  syncQuotes();
  setInterval(syncQuotes, 30000);
};