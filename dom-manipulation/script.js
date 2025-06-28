// Step 1: Initial array of quotes
let quotes = [
    { text: "The best way to predict the future is to create it.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "No pressure, no diamonds.", category: "Inspiration" }
  ];
  
  // Step 2: Show random quote
  function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
  
    const display = document.getElementById('quoteDisplay');
    display.innerHTML = `<p><strong>${quote.category}</strong>: ${quote.text}</p>`;
  }
  
  // Step 3: Add a new quote
  function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');
  
    const newText = textInput.value.trim();
    const newCategory = categoryInput.value.trim();
  
    if (newText && newCategory) {
      quotes.push({ text: newText, category: newCategory });
      textInput.value = '';
      categoryInput.value = '';
      alert("New quote added successfully!");
    } else {
      alert("Please enter both quote and category.");
    }
  }
  
  // Step 4: Add event to button
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  
  // Optional: Show quote when page loads
  window.onload = showRandomQuote;