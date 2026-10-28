document.addEventListener("DOMContentLoaded", () => {
  const transactionForm = document.getElementById("transaction-form");
  const transactionList = document.getElementById("transaction-list");
  const totalIncomeEl = document.getElementById("total-income");
  const totalExpensesEl = document.getElementById("total-expenses");
  const currentBalanceEl = document.getElementById("current-balance");
  const filterTypeEl = document.getElementById("filter-type");
  const searchInputEl = document.getElementById("search-input");
  const clearBtn = document.getElementById("clear-btn");
  const dateInput = document.getElementById("date");

  
  dateInput.valueAsDate = new Date();

  // Load transactions from localStorage or initialize empty array
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  // Event Listeners
  transactionForm.addEventListener("submit", addTransaction);
  clearBtn.addEventListener("click", clearForm);
  filterTypeEl.addEventListener("change", renderTransactions);
  searchInputEl.addEventListener("input", renderTransactions);

  function addTransaction(e) {
    e.preventDefault();

    const type = document.getElementById("type").value;
    const description = document.getElementById("description").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    // Form Validation
    if (!description || isNaN(amount) || amount <= 0 || !category || !date) {
      alert(
        "Please fill in all required fields and ensure the amount is greater than zero.",
      );
      return;
    }

    const newTransaction = {
      id: Date.now(),
      type,
      description,
      amount,
      category,
      date,
    };

    transactions.push(newTransaction);
    saveAndRefresh();

    // Reset form inputs except date
    transactionForm.reset();
    dateInput.valueAsDate = new Date();
    alert("Transaction added successfully!");
  }

  window.deleteTransaction = function (id) {
    transactions = transactions.filter((t) => t.id !== id);
    saveAndRefresh();
  };

  function clearForm() {
    transactionForm.reset();
    dateInput.valueAsDate = new Date();
  }

  function saveAndRefresh() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderTransactions();
  }

  function calculateTotals() {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((t) => {
      if (t.type === "Income") {
        totalIncome += t.amount;
      } else if (t.type === "Expense") {
        totalExpenses += t.amount;
      }
    });

    const balance = totalIncome - totalExpenses;

    totalIncomeEl.textContent = `LKR ${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    totalExpensesEl.textContent = `LKR ${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    currentBalanceEl.textContent = `LKR ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function renderTransactions() {
    calculateTotals();

    const filterValue = filterTypeEl.value;
    const searchValue = searchInputEl.value.toLowerCase().trim();

    // Filter and Search logic
    const filteredTransactions = transactions.filter((t) => {
      const matchesType = filterValue === "All" || t.type === filterValue;
      const matchesSearch =
        t.description.toLowerCase().includes(searchValue) ||
        t.category.toLowerCase().includes(searchValue);
      return matchesType && matchesSearch;
    });

    transactionList.innerHTML = "";

    if (filteredTransactions.length === 0) {
      transactionList.innerHTML = `<tr><td colspan="6" class="empty-message">No transactions found.</td></tr>`;
      return;
    }

    // Render rows dynamically
    filteredTransactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach((t) => {
        const row = document.createElement("tr");

        const badgeClass =
          t.type === "Income" ? "badge-income" : "badge-expense";
        const formattedAmount = t.amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        const amountPrefix = t.type === "Income" ? "+ LKR " : "- LKR ";

        row.innerHTML = `
                <td>${t.date}</td>
                <td>${escapeHTML(t.description)}</td>
                <td><span class="${badgeClass}">${t.type}</span></td>
                <td>${escapeHTML(t.category)}</td>
                <td>${amountPrefix}${formattedAmount}</td>
                <td><button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button></td>
            `;
        transactionList.appendChild(row);
      });
  }

  function escapeHTML(str) {
    return str.replace(
      /[&<>'"]/g,
      (tag) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[tag] || tag,
    );
  }

  // Initial render call on page load
  renderTransactions();
});
