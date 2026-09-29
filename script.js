const STORAGE_KEY = "shitIWontForgetItems";

const $ = (id) => document.getElementById(id);
const modal = $("modal");
const openModalBtn = $("openModalBtn");
const closeModalBtn = $("closeModalBtn");
const cancelBtn = $("cancelBtn");
const itemForm = $("itemForm");
const cardGrid = $("cardGrid");
const modalTitle = $("modalTitle");
const searchInput = $("searchInput");
const totalCount = $("totalCount");
const backlogCount = $("backlogCount");
const finishedCount = $("finishedCount");
const likedCount = $("likedCount");
const imageUpload = $("imageUpload");
const imageUrl = $("imageUrl");
const imagePreview = $("imagePreview");
const imagePlaceholder = $("imagePlaceholder");
const removeImageBtn = $("removeImageBtn");
const tasteDNA = $("tasteDNA");
const memoryGlitch = $("memoryGlitch");
const rerollMemoryBtn = $("rerollMemoryBtn");
const pickerModal = $("pickerModal");
const openPickerBtn = $("openPickerBtn");
const closePickerBtn = $("closePickerBtn");
const runPickerBtn = $("runPickerBtn");
const pickerQuestions = $("pickerQuestions");
const pickerResult = $("pickerResult");
const cursorGlow = $("cursorGlow");

const filterButtons = document.querySelectorAll(".filter-btn");
const statusButtons = document.querySelectorAll(".status-btn");

let currentTypeFilter = "all";
let currentStatusFilter = "all";
let currentImageData = "";
let lastMemoryId = null;

function getItems() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load saved items:", error);
    return [];
  }
}

function saveItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    alert("Browser storage is full. Try smaller images or image URLs instead.");
    console.error(error);
  }
}

function escapeHTML(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showImagePreview(imageSource) {
  if (!imageSource) {
    imagePreview.src = "";
    imagePreview.classList.add("hidden");
    imagePlaceholder.classList.remove("hidden");
    return;
  }
  imagePreview.src = imageSource;
  imagePreview.classList.remove("hidden");
  imagePlaceholder.classList.add("hidden");
}

function clearImage() {
  currentImageData = "";
  imageUrl.value = "";
  imageUpload.value = "";
  showImagePreview("");
}

imageUpload.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) {
    alert("That image is pretty large. Please use an image under 3 MB.");
    this.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = (event) => {
    currentImageData = event.target.result;
    imageUrl.value = "";
    showImagePreview(currentImageData);
  };
  reader.readAsDataURL(file);
});

imageUrl.addEventListener("input", function () {
  const url = this.value.trim();
  if (!url) {
    if (currentImageData?.startsWith("http")) clearImage();
    return;
  }
  currentImageData = url;
  imageUpload.value = "";
  showImagePreview(url);
});
removeImageBtn.addEventListener("click", clearImage);

function openModal(editing = false) {
  modal.classList.remove("hidden");
  modalTitle.textContent = editing ? "Edit Memory" : "Add Memory";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  itemForm.reset();
  $("itemId").value = "";
  currentImageData = "";
  showImagePreview("");
  modalTitle.textContent = "Add Memory";
  document.body.style.overflow = "";
}

openModalBtn.addEventListener("click", () => {
  itemForm.reset();
  currentImageData = "";
  showImagePreview("");
  openModal(false);
});
closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

function openPicker() {
  pickerQuestions.classList.remove("hidden");
  pickerResult.classList.add("hidden");
  pickerResult.innerHTML = "";
  pickerModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closePicker() {
  pickerModal.classList.add("hidden");
  document.body.style.overflow = "";
}
openPickerBtn.addEventListener("click", openPicker);
closePickerBtn.addEventListener("click", closePicker);

window.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
  if (event.target === pickerModal) closePicker();
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!modal.classList.contains("hidden")) closeModal();
    if (!pickerModal.classList.contains("hidden")) closePicker();
  }
});

itemForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const id = $("itemId").value;
  const existing = getItems().find((item) => item.id === id);

  const itemData = {
    title: $("title").value.trim(),
    type: $("type").value,
    notes: $("notes").value.trim(),
    status: $("status").value,
    liked: $("liked").value,
    image: currentImageData,
    source: $("source").value.trim(),
    timeMinutes: Number($("timeMinutes").value) || 0,
    moodBefore: $("moodBefore").value,
    moodAfter: $("moodAfter").value,
    reason: $("reason").value.trim(),
    loved: $("loved").value.trim(),
    annoyed: $("annoyed").value.trim(),
    tags: $("tags").value.split(",").map(t => t.trim().toLowerCase()).filter(Boolean)
  };

  let items = getItems();
  if (id) {
    items = items.map((item) => item.id === id ? { ...item, ...itemData, updatedAt: new Date().toISOString() } : item);
  } else {
    items.push({
      id: crypto.randomUUID(),
      ...itemData,
      createdAt: new Date().toISOString()
    });
  }
  saveItems(items);
  closeModal();
  renderAll();
});

function editItem(id) {
  const item = getItems().find((entry) => entry.id === id);
  if (!item) return;

  $("itemId").value = item.id;
  $("title").value = item.title || "";
  $("type").value = item.type || "movie";
  $("notes").value = item.notes || "";
  $("status").value = item.status || "want";
  $("liked").value = item.liked || "unknown";
  $("source").value = item.source || "";
  $("timeMinutes").value = item.timeMinutes || "";
  $("moodBefore").value = item.moodBefore || "";
  $("moodAfter").value = item.moodAfter || "";
  $("reason").value = item.reason || "";
  $("loved").value = item.loved || "";
  $("annoyed").value = item.annoyed || "";
  $("tags").value = Array.isArray(item.tags) ? item.tags.join(", ") : (item.tags || "");

  currentImageData = item.image || "";
  imageUrl.value = item.image?.startsWith("http") ? item.image : "";
  imageUpload.value = "";
  showImagePreview(currentImageData);
  openModal(true);
}

function deleteItem(id) {
  if (!confirm("Delete this from your brain archive?")) return;
  saveItems(getItems().filter((item) => item.id !== id));
  renderAll();
}

window.editItem = editItem;
window.deleteItem = deleteItem;

function normalizedTags(item) {
  if (Array.isArray(item.tags)) return item.tags;
  if (typeof item.tags === "string") return item.tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
  return [];
}

function getFilteredItems() {
  let items = getItems();
  const search = searchInput.value.trim().toLowerCase();

  if (currentTypeFilter !== "all") items = items.filter((item) => item.type === currentTypeFilter);
  if (currentStatusFilter !== "all") items = items.filter((item) => item.status === currentStatusFilter);

  if (search) {
    items = items.filter((item) => {
      const haystack = [
        item.title, item.notes, item.source, item.reason, item.loved, item.annoyed,
        item.moodBefore, item.moodAfter, ...normalizedTags(item)
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(search);
    });
  }
  return items;
}

function updateStats() {
  const items = getItems();
  totalCount.textContent = items.length;
  backlogCount.textContent = items.filter((item) => item.status === "want").length;
  finishedCount.textContent = items.filter((item) => item.status === "finished").length;
  likedCount.textContent = items.filter((item) => item.liked === "yes").length;
}

function formatMinutes(minutes) {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function renderItems() {
  const items = getFilteredItems();
  cardGrid.innerHTML = "";

  if (!items.length) {
    cardGrid.innerHTML = `<div class="empty-state">[ NO SIGNAL ]<br><br>Nothing matches this part of your brain yet.</div>`;
    return;
  }

  [...items].reverse().forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";

    const title = escapeHTML(item.title);
    const notes = escapeHTML(item.notes || item.reason || "No notes. Just vibes.");
    const firstLetter = escapeHTML((item.title || "?").charAt(0).toUpperCase());
    const typeLabel = item.type === "game" ? "GAME" : "MOVIE / TV";
    const statusLabel = item.status === "finished" ? "WATCHED / PLAYED" : "WANT TO";
    const likedBadge = item.liked === "yes"
      ? `<span class="badge liked">♥ HIT</span>`
      : item.liked === "no"
        ? `<span class="badge disliked">× MISS</span>` : "";

    const imageHTML = item.image
      ? `<img class="card-image" src="${escapeHTML(item.image)}" alt="${title}" loading="lazy" />`
      : `<div class="card-placeholder">${firstLetter}</div>`;

    const tags = normalizedTags(item).slice(0, 5)
      .map((tag) => `<span class="tag">#${escapeHTML(tag)}</span>`).join("");

    const memoryMeta = [
      item.source ? `<div>FOUND VIA: <b>${escapeHTML(item.source)}</b></div>` : "",
      item.moodAfter ? `<div>AFTER: <b>${escapeHTML(item.moodAfter)}</b></div>` : "",
      item.timeMinutes ? `<div>TIME: <b>${formatMinutes(item.timeMinutes)}</b></div>` : ""
    ].filter(Boolean).join("");

    card.innerHTML = `
      <div class="card-image-container">
        ${imageHTML}
        <div class="image-overlay"></div>
        <span class="card-status-top">${statusLabel}</span>
        <span class="card-type">${typeLabel}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${title}</h3>
        <p class="card-notes">${notes}</p>
        ${memoryMeta ? `<div class="memory-meta">${memoryMeta}</div>` : ""}
        ${tags ? `<div class="tag-row">${tags}</div>` : ""}
        <div class="meta">
          <span class="badge ${escapeHTML(item.status || "want")}">${statusLabel}</span>
          ${likedBadge}
        </div>
        <div class="card-actions">
          <button class="edit-btn" onclick="editItem('${item.id}')">EDIT MEMORY</button>
          <button class="delete-btn" onclick="deleteItem('${item.id}')">DELETE</button>
        </div>
      </div>`;

    cardGrid.appendChild(card);
  });
}

function tally(values) {
  return values.reduce((map, value) => {
    if (!value) return map;
    map[value] = (map[value] || 0) + 1;
    return map;
  }, {});
}

function topEntries(map, limit = 4) {
  return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0,limit);
}

function renderTasteDNA() {
  const finished = getItems().filter(item => item.status === "finished");
  const liked = finished.filter(item => item.liked === "yes");
  if (finished.length < 2) {
    tasteDNA.innerHTML = `<p class="muted">Finish and rate at least two things. Then the archive starts judging your taste.</p>`;
    return;
  }

  const tagCounts = tally(liked.flatMap(normalizedTags));
  const moodCounts = tally(liked.map(item => item.moodAfter).filter(Boolean));
  const topTags = topEntries(tagCounts, 5);
  const topMood = topEntries(moodCounts, 1)[0];

  const chips = topTags.length
    ? topTags.map(([tag,count]) => `<span class="dna-chip"><strong>#${escapeHTML(tag)}</strong> × ${count}</span>`).join("")
    : `<span class="dna-chip">needs more tags</span>`;

  let insight = "Your archive is still collecting evidence.";
  if (topTags.length >= 2) {
    insight = `Current brain pattern: you repeatedly reward <strong>${escapeHTML(topTags[0][0])}</strong> + <strong>${escapeHTML(topTags[1][0])}</strong>.`;
  }
  if (topMood) insight += ` Your most common post-experience state is <strong>${escapeHTML(topMood[0])}</strong>.`;

  tasteDNA.innerHTML = `${chips}<p class="dna-insight">${insight}</p>`;
}

function renderMemoryGlitch() {
  const items = getItems().filter(item => item.status === "finished" && item.liked === "yes");
  if (!items.length) {
    memoryGlitch.innerHTML = `<p class="muted">Nothing has earned haunting privileges yet.</p>`;
    return;
  }

  let pool = items.filter(item => item.id !== lastMemoryId);
  if (!pool.length) pool = items;
  const item = pool[Math.floor(Math.random() * pool.length)];
  lastMemoryId = item.id;

  const ageText = item.createdAt
    ? `${Math.max(0, Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 86400000))} days ago`
    : "some forgotten point in time";

  memoryGlitch.innerHTML = `
    <p>You archived <strong>${escapeHTML(item.title)}</strong> ${ageText}.</p>
    <p>${escapeHTML(item.loved || item.notes || "Past You liked it. Apparently that was enough.")}</p>`;
}
rerollMemoryBtn.addEventListener("click", renderMemoryGlitch);

function scoreCandidate(item, prefs, likedTagCounts) {
  let score = 1 + Math.random() * 1.5;
  if (prefs.type !== "all" && item.type === prefs.type) score += 5;
  if (prefs.maxTime && item.timeMinutes && item.timeMinutes <= prefs.maxTime) score += 3;
  if (prefs.maxTime && item.timeMinutes && item.timeMinutes > prefs.maxTime) score -= 6;
  if (prefs.mood && item.moodBefore === prefs.mood) score += 4;

  for (const tag of normalizedTags(item)) {
    score += Math.min(likedTagCounts[tag] || 0, 3) * 1.2;
  }
  if (item.reason) score += .4;
  return score;
}

function runPicker() {
  const prefs = {
    type: $("pickType").value,
    maxTime: Number($("pickTime").value) || 0,
    mood: $("pickMood").value
  };

  const all = getItems();
  const likedTagCounts = tally(all.filter(i => i.liked === "yes").flatMap(normalizedTags));
  let candidates = all.filter(item => item.status === "want");
  if (prefs.type !== "all") candidates = candidates.filter(item => item.type === prefs.type);

  if (!candidates.length) {
    pickerResult.innerHTML = `<h3>NO CANDIDATES.</h3><p>Your backlog has nothing that matches this category. Add something you want to watch/play first.</p><button class="ghost-btn pick-again" id="pickAgainBtn">CHANGE INPUT</button>`;
    pickerQuestions.classList.add("hidden");
    pickerResult.classList.remove("hidden");
    $("pickAgainBtn").addEventListener("click", () => { pickerResult.classList.add("hidden"); pickerQuestions.classList.remove("hidden"); });
    return;
  }

  const ranked = candidates
    .map(item => ({ item, score: scoreCandidate(item, prefs, likedTagCounts) }))
    .sort((a,b) => b.score-a.score);
  const pick = ranked[0].item;
  const matchingTags = normalizedTags(pick).filter(tag => likedTagCounts[tag]).slice(0,3);

  const reasons = [];
  if (prefs.maxTime && pick.timeMinutes && pick.timeMinutes <= prefs.maxTime) reasons.push(`fits inside your ${prefs.maxTime}-minute limit`);
  if (prefs.mood && pick.moodBefore === prefs.mood) reasons.push(`you saved it for a ${prefs.mood} kind of brain`);
  if (matchingTags.length) reasons.push(`it overlaps with patterns you already like: ${matchingTags.map(t => `#${t}`).join(", ")}`);
  if (pick.reason) reasons.push(`Past You literally saved it because “${pick.reason}”`);
  if (!reasons.length) reasons.push("it survived the archive and the machine picked it. Stop negotiating.");

  pickerResult.innerHTML = `
    <p class="eyebrow">THE VERDICT</p>
    <h3>${escapeHTML(pick.title)}</h3>
    ${pick.timeMinutes ? `<p>${formatMinutes(pick.timeMinutes)}.</p>` : ""}
    <p class="reason-line">${escapeHTML(reasons[0])}${reasons[1] ? `. ${escapeHTML(reasons[1])}` : ""}</p>
    <p><strong>Press play. Stop thinking.</strong></p>
    <button class="ghost-btn pick-again" id="pickAgainBtn">NO, THE MACHINE IS WRONG</button>`;

  pickerQuestions.classList.add("hidden");
  pickerResult.classList.remove("hidden");
  $("pickAgainBtn").addEventListener("click", () => {
    pickerResult.classList.add("hidden");
    pickerQuestions.classList.remove("hidden");
  });
}
runPickerBtn.addEventListener("click", runPicker);

filterButtons.forEach((button) => {
  button.addEventListener("click", function () {
    filterButtons.forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
    currentTypeFilter = this.dataset.filter;
    renderItems();
  });
});
statusButtons.forEach((button) => {
  button.addEventListener("click", function () {
    statusButtons.forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
    currentStatusFilter = this.dataset.status;
    renderItems();
  });
});
searchInput.addEventListener("input", renderItems);

let glowX = innerWidth / 2;
let glowY = innerHeight / 2;
let targetX = glowX;
let targetY = glowY;
window.addEventListener("pointermove", (event) => {
  targetX = event.clientX;
  targetY = event.clientY;
  cursorGlow.style.opacity = ".72";
});
window.addEventListener("pointerleave", () => cursorGlow.style.opacity = ".25");
function animateGlow() {
  glowX += (targetX - glowX) * .12;
  glowY += (targetY - glowY) * .12;
  cursorGlow.style.left = `${glowX}px`;
  cursorGlow.style.top = `${glowY}px`;
  requestAnimationFrame(animateGlow);
}
animateGlow();

function renderAll() {
  renderItems();
  updateStats();
  renderTasteDNA();
  renderMemoryGlitch();
}

renderAll();
