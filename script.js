const STORAGE_KEY =
  "shitIWontForgetItems";


const modal =
  document.getElementById(
    "modal"
  );

const openModalBtn =
  document.getElementById(
    "openModalBtn"
  );

const closeModalBtn =
  document.getElementById(
    "closeModalBtn"
  );

const cancelBtn =
  document.getElementById(
    "cancelBtn"
  );

const itemForm =
  document.getElementById(
    "itemForm"
  );

const cardGrid =
  document.getElementById(
    "cardGrid"
  );

const modalTitle =
  document.getElementById(
    "modalTitle"
  );

const searchInput =
  document.getElementById(
    "searchInput"
  );


const totalCount =
  document.getElementById(
    "totalCount"
  );

const backlogCount =
  document.getElementById(
    "backlogCount"
  );

const finishedCount =
  document.getElementById(
    "finishedCount"
  );

const likedCount =
  document.getElementById(
    "likedCount"
  );


const imageUpload =
  document.getElementById(
    "imageUpload"
  );

const imageUrl =
  document.getElementById(
    "imageUrl"
  );

const imagePreview =
  document.getElementById(
    "imagePreview"
  );

const imagePlaceholder =
  document.getElementById(
    "imagePlaceholder"
  );

const removeImageBtn =
  document.getElementById(
    "removeImageBtn"
  );


const filterButtons =
  document.querySelectorAll(
    ".filter-btn"
  );

const statusButtons =
  document.querySelectorAll(
    ".status-btn"
  );


let currentTypeFilter =
  "all";

let currentStatusFilter =
  "all";


/*
  This stores whichever
  image is currently selected.

  Could be:
  - a URL
  - base64 uploaded image
  - blank
*/

let currentImageData =
  "";


/* -------------------------
   STORAGE
------------------------- */

function getItems() {

  const stored =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!stored) {
    return [];
  }

  try {

    return JSON.parse(
      stored
    );

  } catch (error) {

    console.error(
      "Could not load saved items:",
      error
    );

    return [];

  }

}


function saveItems(items) {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        items
      )
    );

  } catch (error) {

    alert(
      "Your browser storage is full. Try using smaller images or image URLs instead."
    );

    console.error(
      error
    );

  }

}


/* -------------------------
   IMAGE PREVIEW
------------------------- */

function showImagePreview(
  imageSource
) {

  if (!imageSource) {

    imagePreview.src =
      "";

    imagePreview.classList.add(
      "hidden"
    );

    imagePlaceholder.classList.remove(
      "hidden"
    );

    return;

  }


  imagePreview.src =
    imageSource;

  imagePreview.classList.remove(
    "hidden"
  );

  imagePlaceholder.classList.add(
    "hidden"
  );

}


function clearImage() {

  currentImageData =
    "";

  imageUrl.value =
    "";

  imageUpload.value =
    "";

  showImagePreview(
    ""
  );

}


/* FILE UPLOAD */

imageUpload.addEventListener(
  "change",
  function () {

    const file =
      this.files[0];

    if (!file) {
      return;
    }


    /*
      3MB limit keeps
      localStorage more manageable.
    */

    const maxSize =
      3 * 1024 * 1024;


    if (
      file.size >
      maxSize
    ) {

      alert(
        "That image is pretty large. Please use an image under 3 MB."
      );

      this.value =
        "";

      return;

    }


    const reader =
      new FileReader();


    reader.onload =
      function (event) {

        currentImageData =
          event.target.result;

        imageUrl.value =
          "";

        showImagePreview(
          currentImageData
        );

      };


    reader.readAsDataURL(
      file
    );

  }
);


/* IMAGE URL */

imageUrl.addEventListener(
  "input",
  function () {

    const url =
      this.value.trim();


    if (!url) {
      return;
    }


    currentImageData =
      url;

    imageUpload.value =
      "";

    showImagePreview(
      url
    );

  }
);


removeImageBtn.addEventListener(
  "click",
  clearImage
);


/* -------------------------
   MODAL
------------------------- */

function openModal(
  editing = false
) {

  modal.classList.remove(
    "hidden"
  );

  modalTitle.textContent =
    editing
      ? "Edit Something"
      : "Add Something";

}


function closeModal() {

  modal.classList.add(
    "hidden"
  );

  itemForm.reset();

  document.getElementById(
    "itemId"
  ).value = "";

  currentImageData =
    "";

  showImagePreview(
    ""
  );

  modalTitle.textContent =
    "Add Something";

}


openModalBtn.addEventListener(
  "click",
  () => {

    itemForm.reset();

    currentImageData =
      "";

    showImagePreview(
      ""
    );

    openModal(
      false
    );

  }
);


closeModalBtn.addEventListener(
  "click",
  closeModal
);


cancelBtn.addEventListener(
  "click",
  closeModal
);


window.addEventListener(
  "click",
  function (event) {

    if (
      event.target ===
      modal
    ) {

      closeModal();

    }

  }
);


/* -------------------------
   ADD / SAVE / EDIT
------------------------- */

itemForm.addEventListener(
  "submit",
  function (event) {

    event.preventDefault();


    const id =
      document
        .getElementById(
          "itemId"
        )
        .value;


    const title =
      document
        .getElementById(
          "title"
        )
        .value
        .trim();


    const type =
      document
        .getElementById(
          "type"
        )
        .value;


    const notes =
      document
        .getElementById(
          "notes"
        )
        .value
        .trim();


    const status =
      document
        .getElementById(
          "status"
        )
        .value;


    const liked =
      document
        .getElementById(
          "liked"
        )
        .value;


    let items =
      getItems();


    if (id) {

      items =
        items.map(
          item => {

            if (
              item.id === id
            ) {

              return {

                ...item,

                title,

                type,

                notes,

                status,

                liked,

                image:
                  currentImageData

              };

            }

            return item;

          }
        );

    } else {

      const newItem = {

        id:
          crypto.randomUUID(),

        title,

        type,

        notes,

        status,

        liked,

        image:
          currentImageData,

        createdAt:
          new Date().toISOString()

      };


      items.push(
        newItem
      );

    }


    saveItems(
      items
    );

    closeModal();

    renderItems();

  }
);


/* -------------------------
   EDIT
------------------------- */

function editItem(id) {

  const items =
    getItems();


  const item =
    items.find(
      item =>
        item.id === id
    );


  if (!item) {
    return;
  }


  document.getElementById(
    "itemId"
  ).value =
    item.id;


  document.getElementById(
    "title"
  ).value =
    item.title;


  document.getElementById(
    "type"
  ).value =
    item.type;


  document.getElementById(
    "notes"
  ).value =
    item.notes || "";


  document.getElementById(
    "status"
  ).value =
    item.status;


  document.getElementById(
    "liked"
  ).value =
    item.liked || "unknown";


  currentImageData =
    item.image || "";


  if (
    item.image &&
    item.image.startsWith(
      "http"
    )
  ) {

    imageUrl.value =
      item.image;

  } else {

    imageUrl.value =
      "";

  }


  imageUpload.value =
    "";


  showImagePreview(
    currentImageData
  );


  openModal(
    true
  );

}


/* -------------------------
   DELETE
------------------------- */

function deleteItem(id) {

  const confirmDelete =
    confirm(
      "Delete this from your archive?"
    );


  if (
    !confirmDelete
  ) {
    return;
  }


  let items =
    getItems();


  items =
    items.filter(
      item =>
        item.id !== id
    );


  saveItems(
    items
  );

  renderItems();

}


/* -------------------------
   FILTER
------------------------- */

function getFilteredItems() {

  let items =
    getItems();


  const search =
    searchInput
      .value
      .trim()
      .toLowerCase();


  if (
    currentTypeFilter !==
    "all"
  ) {

    items =
      items.filter(
        item =>
          item.type ===
          currentTypeFilter
      );

  }


  if (
    currentStatusFilter !==
    "all"
  ) {

    items =
      items.filter(
        item =>
          item.status ===
          currentStatusFilter
      );

  }


  if (search) {

    items =
      items.filter(
        item => {

          const title =
            (
              item.title ||
              ""
            ).toLowerCase();


          const notes =
            (
              item.notes ||
              ""
            ).toLowerCase();


          return (
            title.includes(
              search
            ) ||
            notes.includes(
              search
            )
          );

        }
      );

  }


  return items;

}


/* -------------------------
   STATS
------------------------- */

function updateStats() {

  const items =
    getItems();


  totalCount.textContent =
    items.length;


  backlogCount.textContent =
    items.filter(
      item =>
        item.status ===
        "want"
    ).length;


  finishedCount.textContent =
    items.filter(
      item =>
        item.status ===
        "finished"
    ).length;


  likedCount.textContent =
    items.filter(
      item =>
        item.liked ===
        "yes"
    ).length;

}


/* -------------------------
   HTML SECURITY
------------------------- */

function escapeHTML(text) {

  return String(
    text || ""
  )

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* -------------------------
   RENDER CARDS
------------------------- */

function renderItems() {

  const items =
    getFilteredItems();


  cardGrid.innerHTML =
    "";


  if (
    items.length === 0
  ) {

    cardGrid.innerHTML = `

      <div class="empty-state">

        ✦ Nothing here yet.<br><br>

        Add something before
        it disappears into the void.

      </div>

    `;


    updateStats();

    return;

  }


  items.forEach(
    item => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "card";


      const title =
        escapeHTML(
          item.title
        );


      const notes =
        escapeHTML(
          item.notes ||
          "No notes. Just vibes."
        );


      const firstLetter =
        title
          .charAt(0)
          .toUpperCase();


      const typeLabel =
        item.type ===
        "game"
          ? "GAME"
          : "MOVIE / TV";


      const statusLabel =
        item.status ===
        "finished"
          ? "WATCHED / PLAYED"
          : "WANT TO";


      let likedBadge =
        "";


      if (
        item.liked ===
        "yes"
      ) {

        likedBadge = `

          <span class="badge liked">
            ♥ LIKED
          </span>

        `;

      }


      if (
        item.liked ===
        "no"
      ) {

        likedBadge = `

          <span class="badge disliked">
            ✕ NOT FOR ME
          </span>

        `;

      }


      let imageHTML =
        "";


      if (
        item.image
      ) {

        imageHTML = `

          <img
            class="card-image"
            src="${escapeHTML(item.image)}"
            alt="${title}"
          />

        `;

      } else {

        imageHTML = `

          <div class="card-placeholder">
            ${firstLetter}
          </div>

        `;

      }


      card.innerHTML = `

        <div class="card-image-container">

          ${imageHTML}

          <div class="image-overlay"></div>

          <span class="card-status-top">
            ${statusLabel}
          </span>

          <span class="card-type">
            ${typeLabel}
          </span>

        </div>


        <div class="card-body">

          <h3 class="card-title">
            ${title}
          </h3>


          <p class="card-notes">
            ${notes}
          </p>


          <div class="meta">

            <span
              class="badge ${item.status}"
            >
              ${statusLabel}
            </span>

            ${likedBadge}

          </div>


          <div class="card-actions">

            <button
              class="edit-btn"
              onclick="editItem('${item.id}')"
            >
              EDIT
            </button>


            <button
              class="delete-btn"
              onclick="deleteItem('${item.id}')"
            >
              DELETE
            </button>

          </div>

        </div>

      `;


      cardGrid.appendChild(
        card
      );

    }
  );


  updateStats();

}


/* -------------------------
   FILTER BUTTONS
------------------------- */

filterButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      function () {

        filterButtons.forEach(
          button =>
            button.classList.remove(
              "active"
            )
        );


        this.classList.add(
          "active"
        );


        currentTypeFilter =
          this.dataset.filter;


        renderItems();

      }
    );

  }
);


/* STATUS */

statusButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      function () {

        statusButtons.forEach(
          button =>
            button.classList.remove(
              "active"
            )
        );


        this.classList.add(
          "active"
        );


        currentStatusFilter =
          this.dataset.status;


        renderItems();

      }
    );

  }
);


/* SEARCH */

searchInput.addEventListener(
  "input",
  renderItems
);


/* FIRST LOAD */

renderItems();
