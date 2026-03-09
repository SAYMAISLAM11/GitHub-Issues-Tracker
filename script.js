const BASE_URL = "https://phi-lab-server.vercel.app/api/v1/lab";
const LOGIN_USERNAME = "admin";
const LOGIN_PASSWORD = "admin123";

const loginPage = document.getElementById("loginPage");
const appPage = document.getElementById("appPage");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const issuesContainer = document.getElementById("issuesContainer");
const issueCount = document.getElementById("issueCount");
const spinner = document.getElementById("spinner");
const emptyState = document.getElementById("emptyState");
const tabButtons = document.querySelectorAll(".tab-btn");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const issueModal = document.getElementById("issueModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const modalOverlay = document.getElementById("modalOverlay");

let allIssues = [];
let currentFilter = "all";

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === LOGIN_USERNAME && password === LOGIN_PASSWORD) {
    loginError.textContent = "";
    loginPage.classList.remove("active");
    appPage.classList.add("active");
    loadAllIssues();
  } else {
    loginError.textContent = "Invalid username or password.";
  }
});

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((item) => item.classList.remove("active"));
    btn.classList.add("active");

    currentFilter = btn.dataset.filter;
    filterAndRenderIssues();
  });
});

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const searchText = searchInput.value.trim();

  if (!searchText) {
    filterAndRenderIssues();
    return;
  }

  showSpinner(true);

  try {
    const res = await fetch(`${BASE_URL}/issues/search?q=${encodeURIComponent(searchText)}`);
    const data = await res.json();

    let issues = data?.data || [];
    issues = applyStatusFilter(issues, currentFilter);
    renderIssues(issues);
  } catch (error) {
    console.error("Search error:", error);
    renderIssues([]);
  } finally {
    showSpinner(false);
  }
});

closeModal.addEventListener("click", closeIssueModal);
modalOverlay.addEventListener("click", closeIssueModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeIssueModal();
  }
});

async function loadAllIssues() {
  showSpinner(true);

  try {
    const res = await fetch(`${BASE_URL}/issues`);
    const data = await res.json();

    allIssues = data?.data || [];
    filterAndRenderIssues();
  } catch (error) {
    console.error("Failed to load issues:", error);
    renderIssues([]);
  } finally {
    showSpinner(false);
  }
}

function filterAndRenderIssues() {
  let filteredIssues = applyStatusFilter(allIssues, currentFilter);
  renderIssues(filteredIssues);
}

function applyStatusFilter(issues, filter) {
  if (filter === "open") {
    return issues.filter((issue) => issue.status?.toLowerCase() === "open");
  }

  if (filter === "closed") {
    return issues.filter((issue) => issue.status?.toLowerCase() === "closed");
  }

  return issues;
}

function renderIssues(issues) {
    
  issuesContainer.innerHTML = "";
  issueCount.textContent = issues.length;

  if (!issues.length) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  issues.forEach((issue) => {
    const card = document.createElement("div");
    card.className = `issue-card ${issue.status?.toLowerCase()}`;
  
    card.innerHTML = `
  <div class="card-top">
    <div class="card-icon ${issue.status?.toLowerCase()}">
      <img 
        src="${issue.status?.toLowerCase() === 'closed' ? 'assets/Closed- Status .png' : 'assets/Open-Status.png'}" 
        alt="${issue.status} icon"
      >
    </div>

    <span class="card-priority-badge ${String(issue.priority || 'low').toLowerCase()}">
      ${capitalize(issue.priority || 'low')}
    </span>
  </div>

  <h3 class="issue-title">${issue.title || "No title"}</h3>

  <p class="issue-description">
    ${truncateText(issue.description || "No description available.", 110)}
  </p>

  <div class="issue-meta">
    <div class="meta-box">
      <p class="meta-label">Author</p>
      <p class="meta-value">${issue.author || "N/A"}</p>
    </div>

    <div class="meta-box">
      <p class="meta-label">Priority</p>
      <p class="meta-value">${capitalize(issue.priority || "N/A")}</p>
    </div>
  </div>

  <div class="labels">
    ${renderLabels(issue.labels)}
  </div>

  <div class="issue-footer">
    <span class="status-pill ${issue.status?.toLowerCase()}">${capitalize(issue.status || "N/A")}</span>
    <span>${formatDate(issue.createdAt)}</span>
  </div>
`;



    card.addEventListener("click", () => openIssueModal(issue.id));
    issuesContainer.appendChild(card);
  });
}

function renderLabels(labels = []) {
  if (!labels.length) {
    return `<span class="label-badge">No Label</span>`;
  }

  return labels
    .map((label) => {
      const text = String(label).toLowerCase();
      let extraClass = "";

      if (text.includes("bug")) extraClass = "bug";
      else if (text.includes("help")) extraClass = "help";
      else if (text.includes("enhancement")) extraClass = "enhancement";

      return `<span class="label-badge ${extraClass}">${label}</span>`;
    })
    .join("");
}

async function openIssueModal(id) {
  issueModal.classList.remove("hidden");
  modalBody.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  try {
    const res = await fetch(`${BASE_URL}/issue/${id}`);
    const data = await res.json();
    const issue = data?.data;

    if (!issue) {
      modalBody.innerHTML = `<p>Issue details not found.</p>`;
      return;
    }

    modalBody.innerHTML = `
      <div class="custom-modal">
        <h2 class="details-title">${issue.title || "No title"}</h2>

        <div class="details-top-row">
          <span class="details-status ${issue.status?.toLowerCase()}">
            ${capitalize(issue.status || "N/A")}
          </span>
          <span class="details-dot">•</span>
          <span class="details-author">Opened by ${issue.author || "Unknown"}</span>
          <span class="details-dot">•</span>
          <span class="details-date">${formatDate(issue.createdAt)}</span>
        </div>

        <div class="details-labels">
          ${renderLabels(issue.labels)}
        </div>

        <p class="details-description">
          ${issue.description || "No description available."}
        </p>

        <div class="details-info-box">
          <div class="details-info-item">
            <span class="details-info-label">Assignee:</span>
            <span class="details-info-value">${issue.assignee || "Unassigned"}</span>
          </div>

          <div class="details-info-item">
            <span class="details-info-label">Priority:</span>
            <span class="priority-badge ${String(issue.priority || "").toLowerCase()}">
              ${capitalize(issue.priority || "N/A")}
            </span>
          </div>
        </div>

        <div class="details-footer">
          <button class="close-btn" onclick="closeIssueModal()">Close</button>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Modal load error:", error);
    modalBody.innerHTML = `<p>Failed to load issue details.</p>`;
  }
}

function closeIssueModal() {
  issueModal.classList.add("hidden");
}

function showSpinner(show) {
  if (show) {
    spinner.classList.remove("hidden");
  } else {
    spinner.classList.add("hidden");
  }
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

function formatDate(dateString) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  date.setFullYear(2026);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}