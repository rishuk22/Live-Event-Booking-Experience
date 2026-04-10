// Shared interactive logic for the Live Event Booking Platform.
// This script handles event selection, seat toggles, page navigation, and localStorage storage.

const rowPrices = {
  'A': 4000,
  'B': 3000,
  'C': 2000,
  'D': 1500
};

const events = {
  "the-rift": {
    id: "the-rift",
    name: "The Rift: Immersive Music Experience",
    date: "Sat, May 24",
    time: "7:30 PM",
    venue: "Galaxy Arena",
    price: 799,
    image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=1200&q=80"
  },
  "arijit-singh": {
    id: "arijit-singh",
    name: "Arijit Singh Concert",
    date: "Fri, Dec 19",
    time: "6:00 PM",
    venue: "Inorbit Mall, Malad",
    price: 999,
    image: "https://mumbai.mallsmarket.com/sites/default/files/photos/events/InorbitMall-Malad-ArijitSingh-LiveInConcert-19Dec2014.jpg"
  },
  "street-beat": {
    id: "street-beat",
    name: "Street Beat Live",
    date: "Sun, Jun 15",
    time: "6:00 PM",
    venue: "Pulse Grounds",
    price: 699,
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80"
  },
  "cosmic-fest": {
    id: "cosmic-fest",
    name: "Cosmic Fest",
    date: "Sat, Jul 5",
    time: "9:00 PM",
    venue: "Aurora Dome",
    price: 1199,
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
  }
};

const localStore = {
  setEvent(eventId) {
    const booking = {
      event: events[eventId] || events["the-rift"],
      selectedSeats: [],
      selectedTime: "6:00 PM",
      subtotal: 0
    };
    localStorage.setItem("bookingInfo", JSON.stringify(booking));
  },
  getBooking() {
    const stored = localStorage.getItem("bookingInfo");
    return stored ? JSON.parse(stored) : null;
  },
  saveBooking(booking) {
    localStorage.setItem("bookingInfo", JSON.stringify(booking));
  },
  clearBooking() {
    localStorage.removeItem("bookingInfo");
  }
};

function getCurrentPage() {
  return window.location.pathname.split("/").pop();
}

function initIndexPage() {
  const cards = document.querySelectorAll(".event-card");
  cards.forEach((card) => {
    card.addEventListener("click", (event) => {
      const targetLink = event.target.closest("a");
      const eventId = card.dataset.eventId;
      localStore.setEvent(eventId);
      if (targetLink) {
        return;
      }
      window.location.href = "details.html";
    });
  });
}

function initDetailsPage() {
  const booking = localStore.getBooking() || { event: events["the-rift"], selectedTime: "6:00 PM", selectedSeats: [], subtotal: 0 };
  const title = document.getElementById("eventTitle");
  const meta = document.getElementById("eventMeta");
  title.textContent = booking.event.name;
  meta.textContent = `${booking.event.date} · ${booking.event.time} · ${booking.event.venue}`;
  document.querySelector(".details-image").style.backgroundImage = `url('${booking.event.image}')`;
  const selectSeatsBtn = document.getElementById("selectSeatsBtn");
  selectSeatsBtn.addEventListener("click", () => {
    booking.selectedTime = booking.event.time;
    booking.selectedSeats = booking.selectedSeats || [];
    booking.subtotal = booking.selectedSeats.reduce((sum, seat) => sum + (rowPrices[seat.charAt(0)] || 0), 0);
    localStore.saveBooking(booking);
    window.location.href = "seats.html";
  });
}

function createSeats() {
  const seatGrid = document.getElementById("seatGrid");
  const bookedSeats = ["A4", "A5", "B2", "B3", "B9", "C6", "C7", "D1", "D10"];
  for (const row of ["A", "B", "C", "D"]) {
    for (let num = 1; num <= 10; num++) {
      const seatCode = `${row}${num}`;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = seatCode;
      button.dataset.seat = seatCode;
      if (bookedSeats.includes(seatCode)) {
        button.classList.add("booked");
      } else {
        button.classList.add("available");
      }
      seatGrid.appendChild(button);
    }
  }
}

function updateSeatState(booking) {
  const selectedSeatsLabel = document.getElementById("selectedSeatsLabel");
  const subtotalLabel = document.getElementById("subtotalLabel");
  const proceedButton = document.getElementById("proceedSummaryBtn");
  const selected = booking.selectedSeats || [];
  selectedSeatsLabel.textContent = selected.length ? selected.join(", ") : "None yet";
  const total = selected.reduce((sum, seat) => sum + (rowPrices[seat.charAt(0)] || 0), 0);
  subtotalLabel.textContent = `₹${total}`;
  proceedButton.disabled = selected.length === 0;
}

function initSeatsPage() {
  const booking = localStore.getBooking() || { event: events["the-rift"], selectedSeats: [], selectedTime: "6:00 PM" };
  document.getElementById("seatEventTitle").textContent = booking.event.name;
  document.getElementById("seatEventMeta").textContent = `${booking.event.date} · ${booking.event.venue}`;
  document.getElementById("sidebarEvent").textContent = booking.event.name;
  document.getElementById("selectedTimeLabel").textContent = booking.selectedTime || "6:00 PM";

  createSeats();
  const seatGrid = document.getElementById("seatGrid");
  seatGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || button.classList.contains("booked")) return;
    const seatCode = button.dataset.seat;
    const selectedSeats = booking.selectedSeats || [];
    if (button.classList.contains("selected")) {
      button.classList.remove("selected");
      button.classList.add("available");
      booking.selectedSeats = selectedSeats.filter((seat) => seat !== seatCode);
    } else {
      button.classList.add("selected");
      button.classList.remove("available");
      booking.selectedSeats = [...selectedSeats, seatCode];
    }
    booking.subtotal = booking.selectedSeats.reduce((sum, seat) => sum + (rowPrices[seat.charAt(0)] || 0), 0);
    localStore.saveBooking(booking);
    updateSeatState(booking);
  });

  document.querySelectorAll(".slot-btn").forEach((slot) => {
    slot.addEventListener("click", () => {
      document.querySelectorAll(".slot-btn").forEach((button) => button.classList.remove("active"));
      slot.classList.add("active");
      booking.selectedTime = slot.textContent.trim();
      localStore.saveBooking(booking);
      document.getElementById("selectedTimeLabel").textContent = booking.selectedTime;
    });
  });

  document.getElementById("proceedSummaryBtn").addEventListener("click", () => {
    if (!booking.selectedSeats.length) return;
    localStore.saveBooking(booking);
    window.location.href = "summary.html";
  });

  updateSeatState(booking);
}

function initSummaryPage() {
  const booking = localStore.getBooking();
  if (!booking) {
    window.location.href = "index.html";
    return;
  }

  const seatList = booking.selectedSeats.length ? booking.selectedSeats.join(", ") : "No seats selected";
  const eventInfo = `${booking.event.name} · ${booking.event.date} · ${booking.event.venue}`;
  const subtotal = booking.selectedSeats.reduce((sum, seat) => sum + (rowPrices[seat.charAt(0)] || 0), 0);
  const convenience = 50;
  const discount = 100;
  const total = Math.max(subtotal + convenience - discount, 0);

  document.getElementById("summaryEventInfo").textContent = eventInfo;
  document.getElementById("summarySeats").textContent = seatList;
  document.getElementById("summaryTime").textContent = booking.selectedTime || booking.event.time;
  document.getElementById("breakdownBase").textContent = `₹${subtotal}`;
  document.getElementById("breakdownFee").textContent = `₹${convenience}`;
  document.getElementById("breakdownDiscount").textContent = `-₹${discount}`;
  document.getElementById("breakdownTotal").textContent = `₹${total}`;

  document.getElementById("confirmBookingBtn").addEventListener("click", () => {
    alert("Booking confirmed! Your tickets have been reserved.");
    localStore.clearBooking();
    window.location.href = "index.html";
  });
}

function initPage() {
  const page = getCurrentPage();
  if (page === "index.html" || page === "") {
    initIndexPage();
  }
  if (page === "details.html") {
    initDetailsPage();
  }
  if (page === "seats.html") {
    initSeatsPage();
  }
  if (page === "summary.html") {
    initSummaryPage();
  }
}

window.addEventListener("DOMContentLoaded", initPage);
