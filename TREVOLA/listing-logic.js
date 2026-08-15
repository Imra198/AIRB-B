//import both the Listing class and the createListing function to handle listing creation logic
import Listing from "./listing.js";
import { createListing } from "./listingService.js";
import { uploadMediaToS3, validateMedia } from "./mediaService.js";

// Check if user is logged in before allowing access to the listing creation page
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

if (!currentUser) {
  alert("Please log in to access this page.");
  window.location.href = "index.html";
} else if (!currentUser.role || currentUser.role !== "host") {
  alert("Only hosts can create listings.");
  window.location.href = "listings.html";
} else {
  document.addEventListener("DOMContentLoaded", init);
}

// Helper function to handle uploading a file via your new AWS Backend

const MIN_IMAGES = 8;
const MIN_VIDEOS = 4;

function countMedia(files) {
    let images = 0;
    let videos = 0;

    for (const file of files) {
        if (file.type.startsWith("image/")) {
            images++;
        } else if (file.type.startsWith("video/")) {
            videos++;
        }
    }

    return {
        images,
        videos
    };
}

// Initialize the listing creation form
function init() {
  const form = document.getElementById("createListing");
  // If form is not found, exit the function
  if (!form) return;

  //add an event listener to handle form submission
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const images1 = document.getElementById("images");
    const images = images1.files;

    const mediaError = validateMedia(images);
    if (mediaError) {
      alert(mediaError);
      return;
  }

    const mediaCount = countMedia(images);
    const imageCount = mediaCount.images;
    const videoCount = mediaCount.videos;

    //disable the submit button and change its text to indicate that media files are being uploaded
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true; // Disable the submit button initially

    // show  both the number of files being uploaded and the total number of media files selected by the user
    submitButton.textContent = 
        `Uploading ${images.length} file(s)...`; // Change button text to indicate uploading

    // Get form values
    const title1 = document.getElementById("title");
    const description1 = document.getElementById("description");
    const address1 = document.getElementById("address");
    const price1 = document.getElementById("price");
    const lat1 = document.getElementById("latitude");
    const lng1 = document.getElementById("longitude");
    const amenities1 = document.getElementById("amenities");

    //Trim values trim to remove extra spaces, value is converted to a number using parseFloat, and validation is performed to ensure all fields are filled correctly and price is a positive number
    const title = title1.value.trim();
    const description = description1.value.trim();
    const address = address1.value.trim();
    const pricePerNight = parseFloat(price1.value.trim());

    // if the user has not selected any media files, an alert is shown and the function returns early
    if (images.length === 0) {
      submitButton.disabled = false;
      submitButton.textContent = "Create Listing";

      alert("Please select at least one media file to upload.");
      return;
    }

    // Trevola upload requirements
    if (imageCount < MIN_IMAGES) {
      submitButton.disabled = false;
      submitButton.textContent = "Create Listing";

        alert(
          `Trevola requires at least ${MIN_IMAGES} images.
          You selected ${imageCount} images.`
      );
      return;
    }

    if (videoCount < MIN_VIDEOS) {
      submitButton.disabled = false;
      submitButton.textContent = "Create Listing";

      alert(
        `Trevola requires at least ${MIN_VIDEOS} videos.
        You selected ${videoCount} videos.`
      );
      return;
    }

    // Convert latitude and longitude to numbers, defaulting to 0 if invalid
    const latitude = parseFloat(lat1.value.trim());
    const longitude = parseFloat(lng1.value.trim());

    // Validate form inputs
    if (
      !title ||
      !description ||
      !address ||
      isNaN(pricePerNight) ||
      pricePerNight <= 0
    ) {
      submitButton.disabled = false;
      submitButton.textContent = "Create Listing";

      alert(
        "Please fill in all fields correctly. Price per night must be a positive number.",
      );
      return;
    }

    // Validate latitude and longitude values
    if (isNaN(latitude) || isNaN(longitude)) {
      submitButton.disabled = false;
      submitButton.textContent = "Create Listing";

      alert("Please enter a valid latitude and longitude numbers");
      return;
    }

    // Process media & amenities input, splitting by commas and trimming whitespace, while filtering out any empty values
    const amenities = amenities1.value
      ? amenities1.value
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a)
      : [];

    try {
      // Upload media to S3 and collect their URLs
      const mediaUrls = (
        await Promise.all(
            Array.from(images).map(uploadMediaToS3)
        )
    ).filter(Boolean);

      // add checker to ensure at least one media file was successfully uploaded
      if (mediaUrls.length === 0) {
        submitButton.disabled = false;
        submitButton.textContent = "Create Listing";
        alert("Failed to upload any media. Please try again.");
        return;
      }

      const category = document.getElementById("category").value.trim();

      if (!category) {
        submitButton.disabled = false;
        submitButton.textContent = "Create Listing";
        alert("Please select a category");
        return;
      }
      // Create a new listing object
      const listing = new Listing(
        Date.now(), // unique ID
        currentUser.id, // ownership (host user ID)
        title,
        description,
        category,
        {
          address: address,
          latitude: latitude,
          longitude: longitude,
        },
        pricePerNight,
        amenities,
        mediaUrls,
      );

      // save listing
      createListing(listing);
      form.reset();

      // re-enable the submit button and reset its text
      submitButton.disabled = false;
      submitButton.textContent = "Create Listing";

      alert(`"${title}" has been created successfully.`);

      setTimeout(() => {
        window.location.href = "manage-listings.html";
      }, 300);
    } catch (error) {
      console.error("Error creating listing:", error);
      submitButton.disabled = false;
      submitButton.textContent = "Create Listing";
      alert("An error occurred while creating the listing. Please try again.");
    }
  });
}
