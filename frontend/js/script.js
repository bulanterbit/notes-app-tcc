document.addEventListener("DOMContentLoaded", function () {
  const noteForm = document.getElementById("note-form");
  const notesList = document.getElementById("notes-list");
  const notesCount = document.getElementById("notes-count");
  let currentNoteId = null;

  // Fetch all notes and display them
  async function fetchNotes() {
    try {
      notesList.innerHTML = `
          <div class="p-6 text-center text-gray-500">
            <i class="fas fa-spinner fa-spin text-xl"></i>
            <p class="mt-2">Loading notes...</p>
          </div>
        `;

      const response = await fetch(`${BASE_URL}/api/notes`);
      const data = await response.json();

      if (data.success) {
        displayNotes(data.data);
      } else {
        console.error("Failed to fetch notes:", data.message);
        notesList.innerHTML = `
            <div class="p-6 text-center text-red-500">
              <i class="fas fa-exclamation-circle text-xl"></i>
              <p class="mt-2">Failed to load notes. Please try again.</p>
            </div>
          `;
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      notesList.innerHTML = `
          <div class="p-6 text-center text-red-500">
            <i class="fas fa-exclamation-circle text-xl"></i>
            <p class="mt-2">Network error. Please check your connection.</p>
          </div>
        `;
    }
  }

  // Display notes in the UI
  function displayNotes(notes) {
    notesList.innerHTML = "";
    updateNotesCount(notes.length);

    if (notes.length === 0) {
      notesList.innerHTML = `
          <div class="p-8 text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
              <i class="fas fa-sticky-note text-2xl"></i>
            </div>
            <p class="text-gray-500">No notes found. Create your first note!</p>
          </div>
        `;
      return;
    }

    notes.forEach((note) => {
      const noteElement = document.createElement("div");
      noteElement.className = "p-6 hover:bg-gray-50 transition duration-150";
      noteElement.dataset.id = note.id;

      const formattedDate = formatDate(new Date(note.createdAt));

      const tagsHtml = note.tags.length
        ? note.tags
            .map(
              (tag) =>
                `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              <i class="fas fa-tag text-xs mr-1"></i>${tag}
            </span>`
            )
            .join(" ")
        : "";

      noteElement.innerHTML = `
          <div class="flex items-start justify-between">
            <h3 class="text-lg font-medium text-gray-900">${note.title}</h3>
            <span class="text-xs text-gray-500 flex items-center">
              <i class="far fa-clock mr-1"></i> ${formattedDate}
            </span>
          </div>
          <div class="mt-2 text-sm text-gray-600 whitespace-pre-line line-clamp-3">${note.content}</div>
          <div class="mt-3 flex flex-wrap gap-2">${tagsHtml}</div>
          <div class="mt-4 flex space-x-2">
            <button class="edit-btn inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    data-id="${note.id}">
              <i class="fas fa-edit mr-1"></i> Edit
            </button>
            <button class="delete-btn inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    data-id="${note.id}">
              <i class="fas fa-trash-alt mr-1"></i> Delete
            </button>
          </div>
        `;

      notesList.appendChild(noteElement);
    });

    // Add event listeners to edit and delete buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", handleEditNote);
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", handleDeleteNote);
    });
  }

  // Format date nicely
  function formatDate(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds ago

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  }

  // Update notes count
  function updateNotesCount(count) {
    notesCount.textContent = count === 1 ? "1 note" : `${count} notes`;
  }

  // Handle form submission (create or update note)
  async function handleSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById("submit-btn");
    const originalBtnContent = submitBtn.innerHTML;

    // Show loading state
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin mr-2"></i> Saving...';
    submitBtn.disabled = true;

    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const tagsInput = document.getElementById("tags").value;
    const tags = tagsInput
      ? tagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      : [];

    const noteData = { title, content, tags };

    try {
      let url = `${BASE_URL}/api/notes`;
      let method = "POST";

      if (currentNoteId) {
        url = `${BASE_URL}/api/notes/${currentNoteId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      });

      const data = await response.json();

      if (data.success) {
        showToast(
          currentNoteId
            ? "Note updated successfully!"
            : "Note created successfully!"
        );
        resetForm();
        fetchNotes();
      } else {
        console.error("Failed to save note:", data.message);
        showToast(`Failed: ${data.message}`, true);
      }
    } catch (error) {
      console.error("Error saving note:", error);
      showToast("Error saving note. Please try again.", true);
    } finally {
      // Restore button state
      submitBtn.innerHTML = originalBtnContent;
      submitBtn.disabled = false;
    }
  }

  // Handle edit note
  async function handleEditNote(event) {
    const noteId = event.target.closest("button").dataset.id;

    try {
      const response = await fetch(`${BASE_URL}/api/notes/${noteId}`);
      const data = await response.json();

      if (data.success) {
        const note = data.data;

        // Populate form
        document.getElementById("title").value = note.title;
        document.getElementById("content").value = note.content;
        document.getElementById("tags").value = note.tags.join(", ");

        // Change button text and store current note ID
        document.getElementById("submit-btn").innerHTML =
          '<i class="fas fa-save mr-2"></i><span>Update Note</span>';
        currentNoteId = noteId;

        // Scroll to form
        document.querySelector("form").scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error fetching note for edit:", error);
      showToast("Error fetching note for edit. Please try again.", true);
    }
  }

  // Handle delete note
  async function handleDeleteNote(event) {
    const noteElement = event.target.closest("div[data-id]");
    const noteId = event.target.closest("button").dataset.id;

    // Create modal for confirmation
    const modal = document.createElement("div");
    modal.className = "fixed inset-0 z-10 overflow-y-auto";
    modal.innerHTML = `
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity" aria-hidden="true">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <i class="fas fa-exclamation-triangle text-red-600"></i>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Note</h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">Are you sure you want to delete this note? This action cannot be undone.</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="button" id="confirm-delete" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                Delete
              </button>
              <button type="button" id="cancel-delete" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      `;

    document.body.appendChild(modal);

    // Handle modal actions
    document.getElementById("cancel-delete").addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    document
      .getElementById("confirm-delete")
      .addEventListener("click", async () => {
        document.body.removeChild(modal);

        try {
          // Show loading state on the note
          noteElement.innerHTML = `<div class="p-6 text-center text-gray-400"><i class="fas fa-spinner fa-spin"></i> Deleting...</div>`;

          const response = await fetch(`${BASE_URL}/api/notes/${noteId}`, {
            method: "DELETE",
          });

          const data = await response.json();

          if (data.success) {
            showToast("Note deleted successfully!");
            fetchNotes();

            // If the deleted note was being edited, reset the form
            if (currentNoteId === noteId) {
              resetForm();
            }
          } else {
            console.error("Failed to delete note:", data.message);
            showToast(`Failed to delete note: ${data.message}`, true);
            fetchNotes(); // Refresh the list anyway
          }
        } catch (error) {
          console.error("Error deleting note:", error);
          showToast("Error deleting note. Please try again.", true);
          fetchNotes(); // Refresh the list anyway
        }
      });
  }

  // Show toast notification
  function showToast(message, isError = false) {
    const toast = document.createElement("div");
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-500 ${
      isError ? "bg-red-500" : "bg-green-500"
    } text-white`;
    toast.innerHTML = `
        <div class="flex items-center">
          <i class="fas ${
            isError ? "fa-exclamation-circle" : "fa-check-circle"
          } mr-2"></i>
          <span>${message}</span>
        </div>
      `;

    document.body.appendChild(toast);

    // Fade in
    setTimeout(() => {
      toast.style.opacity = "1";
    }, 10);

    // Fade out and remove
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 500);
    }, 3000);
  }

  // Reset form
  function resetForm() {
    noteForm.reset();
    document.getElementById("submit-btn").innerHTML =
      '<i class="fas fa-save mr-2"></i><span>Save Note</span>';
    currentNoteId = null;
  }

  // Add event listeners
  noteForm.addEventListener("submit", handleSubmit);

  // Initial fetch of notes
  fetchNotes();
});
