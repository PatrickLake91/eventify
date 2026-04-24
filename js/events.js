const STORAGE_KEY = "eventifyEvents";

function getEvents() {
  const eventsJson = localStorage.getItem(STORAGE_KEY);

  if (!eventsJson) {
    return [];
  }

  return JSON.parse(eventsJson);
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function showMessage(message, type) {
  const messageBox = document.getElementById("formMessage");

  if (!messageBox) {
    return;
  }

  messageBox.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
}

function validateEventForm(eventData) {
  if (!eventData.title) {
    return "Please enter an event title.";
  }

  if (!eventData.date) {
    return "Please select an event date.";
  }

  if (!eventData.location) {
    return "Please enter an event location.";
  }

  if (!eventData.category) {
    return "Please select an event category.";
  }

  if (!eventData.description) {
    return "Please enter an event description.";
  }

  if (eventData.description.length < 10) {
    return "Please enter a longer event description.";
  }

  return "";
}

function handleAddEventForm() {
  const form = document.getElementById("addEventForm");

  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const eventData = {
      id: Date.now().toString(),
      title: document.getElementById("eventTitle").value.trim(),
      date: document.getElementById("eventDate").value,
      location: document.getElementById("eventLocation").value.trim(),
      category: document.getElementById("eventCategory").value,
      description: document.getElementById("eventDescription").value.trim()
    };

    const validationError = validateEventForm(eventData);

    if (validationError) {
      showMessage(validationError, "danger");
      return;
    }

    const events = getEvents();
    events.push(eventData);
    saveEvents(events);

    showMessage("Event saved successfully. You can now view it on the View Events page.", "success");
    form.reset();
  });
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Date not provided";
  }

  const date = new Date(dateValue);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function getEventStatusBadge(dateValue) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDate = new Date(dateValue);
  eventDate.setHours(0, 0, 0, 0);

  if (eventDate < today) {
    return `<span class="event-status event-status-past">Past</span>`;
  }

  return `<span class="event-status event-status-upcoming">Upcoming</span>`;
}

function getFilteredAndSortedEvents() {
  let events = getEvents();

  const filterCategory = document.getElementById("filterCategory");
  const sortEvents = document.getElementById("sortEvents");

  const selectedCategory = filterCategory ? filterCategory.value : "";
  const sortOption = sortEvents ? sortEvents.value : "newest";

  if (selectedCategory) {
    events = events.filter(function (eventItem) {
      return eventItem.category === selectedCategory;
    });
  }

  events.sort(function (a, b) {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    if (sortOption === "oldest") {
      return dateA - dateB;
    }

    return dateB - dateA;
  });

  return events;
}

function renderEvents() {
  const container = document.getElementById("eventsContainer");

  if (!container) {
    return;
  }

  const allEvents = getEvents();
  const events = getFilteredAndSortedEvents();

  if (allEvents.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <h3 class="h5">No events added yet</h3>
          <p class="text-muted mb-3">
            Use the Add Event page to create your first public event.
          </p>
          <a href="add-event.html" class="btn btn-primary">Add Event</a>
        </div>
      </div>
    `;
    return;
  }

  if (events.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <h3 class="h5">No matching events found</h3>
          <p class="text-muted mb-0">
            Try changing the category filter to show more events.
          </p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = events.map(function (eventItem) {
    return `
      <div class="col-md-6 col-xl-4">
        <article class="event-card">
          <div class="event-card-body">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
              <span class="event-category">${eventItem.category}</span>
              ${getEventStatusBadge(eventItem.date)}
            </div>

            <h3 class="h5">${eventItem.title}</h3>

            <p class="event-meta mb-1">
              <strong>Date:</strong> ${formatDate(eventItem.date)}
            </p>

            <p class="event-meta mb-3">
              <strong>Location:</strong> ${eventItem.location}
            </p>

            <p class="mb-4">${eventItem.description}</p>

            <div class="d-flex gap-2 flex-wrap">
              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                onclick="openEditEventModal('${eventItem.id}')"
              >
                Edit Event
              </button>

              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                onclick="deleteEvent('${eventItem.id}')"
              >
                Delete Event
              </button>
            </div>
          </div>
        </article>
      </div>
    `;
  }).join("");
}

function handleClearDemoData() {
  const clearButton = document.getElementById("clearEventsButton");

  if (!clearButton) {
    return;
  }

  clearButton.addEventListener("click", function () {
    const confirmed = confirm("This will remove all saved demo events. Continue?");

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    renderEvents();
  });
}

function openEditEventModal(eventId) {
  const events = getEvents();
  const selectedEvent = events.find(function (eventItem) {
    return eventItem.id === eventId;
  });

  if (!selectedEvent) {
    alert("Event could not be found.");
    return;
  }

  document.getElementById("editEventId").value = selectedEvent.id;
  document.getElementById("editEventTitle").value = selectedEvent.title;
  document.getElementById("editEventDate").value = selectedEvent.date;
  document.getElementById("editEventLocation").value = selectedEvent.location;
  document.getElementById("editEventCategory").value = selectedEvent.category;
  document.getElementById("editEventDescription").value = selectedEvent.description;

  const editModal = new bootstrap.Modal(document.getElementById("editEventModal"));
  editModal.show();
}

function handleEditEventForm() {
  const editForm = document.getElementById("editEventForm");

  if (!editForm) {
    return;
  }

  editForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const updatedEvent = {
      id: document.getElementById("editEventId").value,
      title: document.getElementById("editEventTitle").value.trim(),
      date: document.getElementById("editEventDate").value,
      location: document.getElementById("editEventLocation").value.trim(),
      category: document.getElementById("editEventCategory").value,
      description: document.getElementById("editEventDescription").value.trim()
    };

    const validationError = validateEventForm(updatedEvent);

    if (validationError) {
      alert(validationError);
      return;
    }

    const events = getEvents();

    const updatedEvents = events.map(function (eventItem) {
      if (eventItem.id === updatedEvent.id) {
        return updatedEvent;
      }

      return eventItem;
    });

    saveEvents(updatedEvents);
    renderEvents();

    const modalElement = document.getElementById("editEventModal");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
  });
}

function deleteEvent(eventId) {
  const confirmed = confirm("Are you sure you want to delete this event?");

  if (!confirmed) {
    return;
  }

  const events = getEvents();
  const updatedEvents = events.filter(function (eventItem) {
    return eventItem.id !== eventId;
  });

  saveEvents(updatedEvents);
  renderEvents();
}

function handleFilterAndSortControls() {
  const filterCategory = document.getElementById("filterCategory");
  const sortEvents = document.getElementById("sortEvents");

  if (filterCategory) {
    filterCategory.addEventListener("change", renderEvents);
  }

  if (sortEvents) {
    sortEvents.addEventListener("change", renderEvents);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  handleAddEventForm();
  renderEvents();
  handleClearDemoData();
  handleEditEventForm();
  handleFilterAndSortControls();
});