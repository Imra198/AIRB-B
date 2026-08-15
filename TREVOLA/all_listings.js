import { getAllListings } from "./listingService.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("listingsContainer");

  // Fetch initial listings from your service
  let listings = getAllListings();

  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const manageListingsBtn = document.getElementById("manageListingsBtn");

  // Show/hide the create listing button based on user role
  if (manageListingsBtn) {
    if (currentUser && currentUser.role === "host") {
      manageListingsBtn.style.display = "inline-flex";
      manageListingsBtn.addEventListener("click", () => {
        window.location.href = "manage-listings.html";
      });
    } else {
      manageListingsBtn.style.display = "none";
    }
  }

  const createListingBtn = document.getElementById("createListingBtn");

  //show/hide the create listing button based on user role
  if (createListingBtn) {
    if (currentUser && currentUser.role === "host") {
      createListingBtn.style.display = "inline-flex";
      createListingBtn.addEventListener("click", () => {
        window.location.href = "create_listing.html";
      });
    } else {
      createListingBtn.style.display = "none";
    }
  }

  if (!container) return;

  // Filter Buttons setup
  const buttons = document.querySelectorAll(".category-btn");
  const allButton = document.querySelector('[data-category="all"]');

  if (allButton) {
    allButton.classList.add("active");
  }

  // DISPLAY LISTING CARDS
  function renderListings(listingsToRender) {
    container.innerHTML = "";

    if (listingsToRender.length === 0) {
      container.innerHTML = `
                <div class="no-listings">
                    <p>No listings found in this category.</p>
                </div>
            `;
      return;
    }

    listingsToRender.forEach((listing) => {
      const card = document.createElement("div");
      card.className = "listing-card";

      let imageUrl =
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80";
      if (listing.mediaUrls && listing.mediaUrls.length > 0) {
        imageUrl = listing.mediaUrls[0];
      } else if (listing.imageUrl) {
        imageUrl = listing.imageUrl;
      }

      const amenitiesFormatted =
        (listing.amenities || []).join(" • ") || "No specific amenities";
      const truncatedDescription =
        listing.description && listing.description.length > 85
          ? listing.description.substring(0, 85) + "..."
          : listing.description || "No description provided.";

      // Flexible location check for string or object formats
      const locationText =
        typeof listing.location === "object"
          ? listing.location?.address || "Location unavailable"
          : listing.location || "Location unavailable";

      // Format and capitalize Category name for display (e.g. "professional" -> "PROFESSIONAL")
      const categoryDisplay = listing.category
        ? listing.category.toUpperCase()
        : "GENERAL";

      card.innerHTML = `
                <div class="main-image-wrapper">
                    <img src="${imageUrl}" alt="${listing.title || "Property"}" class="gallery-main-img" loading="lazy">
                </div>
                <div class="listing-body">
                    <div class="listing-header">
                        <h2 class="listing-title">${listing.title || "Property"}</h2>
                        <p class="listing-location">📍 ${listing.location?.address || "Location unavailable"}</p>
                    </div>
                    <p class="listing-description">${truncatedDescription}</p>
                    <p class="listing-amenities">${amenitiesFormatted}</p>
                    <div class="info-panel">
                        <div class="price-tag">
                            <span class="price-amount">£${listing.pricePerNight || 0}</span>
                            <span class="price-unit">/ night</span>
                        </div>
                        <a href="single-listing.html?id=${listing.id}" class="view-details-link">
                            View Details →
                        </a>  
                    </div>
                </div>
            `;

      container.appendChild(card);
    });
  }

  // Helper to get active category filter
  function getActiveCategory() {
    const activeBtn = document.querySelector(".category-btn.active");
    return activeBtn ? activeBtn.dataset.category : "all";
  }

  // Combined Search and Category Filter Handler
  function filterAndRenderListings() {
    const locationQuery =
      document.getElementById("locationInput")?.value.toLowerCase().trim() ||
      "";
    const currentCategory = getActiveCategory();

    const filtered = listings.filter((listing) => {
      // Category check
      const matchesCategory =
        currentCategory === "all" || listing.category === currentCategory;

      // Location/Title Search check
      const locString =
        typeof listing.location === "object"
          ? listing.location?.address || ""
          : listing.location || "";

      const titleString = listing.title || "";

      const matchesSearch =
        !locationQuery ||
        locString.toLowerCase().includes(locationQuery) ||
        titleString.toLowerCase().includes(locationQuery);

      return matchesCategory && matchesSearch;
    });

    renderListings(filtered);
  }

  // Initial Render
  renderListings(listings);

  // Attach Category Button Listeners
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      filterAndRenderListings();
    });
  });

  // Attach Search Input Listeners (Triggers on click or typing)
  const locationInput = document.getElementById("locationInput");
  const searchBtn = document.querySelector(".search-btn");

  if (locationInput) {
    locationInput.addEventListener("input", filterAndRenderListings);
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      filterAndRenderListings();
    });
  }
});
