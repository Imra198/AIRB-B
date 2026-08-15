import { getAllListings, deleteListingLocal } from "./listingService.js";
import { uploadMediaToS3, validateMedia } from "./mediaService.js";

// Trevola Media Requirements Checker
const DELETE_LISTING_LAMBDA_URL =
  "https://4ypg37nddysqxxn5o5p3nut2si0vwhdk.lambda-url.eu-west-2.on.aws/";

// Delete function triggered when the user clicks the Delete button
async function deleteListing(listingId, mediaUrls) {
  if (!confirm("Are you sure you want to delete this listing?")) {
    return;
  }

  try {
    const response = await fetch(DELETE_LISTING_LAMBDA_URL, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: listingId,
        mediaUrls: mediaUrls,
      }),
    });

    if (response.ok) {
      alert("Listing deleted successfully!");

      // remove browser copy
      deleteListingLocal(listingId);

      const cardElement = document.getElementById(`listing-${listingId}`);

      if (cardElement) {
        cardElement.remove();
      }
    } else {
      const data = await response.json();

      alert("Delete failed: " + (data.message || "Unknown error"));
    }
  } catch (error) {
    console.error("Delete error:", error);

    alert("Could not delete listing.");
  }
}
async function deleteSelectedMedia(listingId, mediaUrls) {
  try {
    const response = await fetch(DELETE_LISTING_LAMBDA_URL, {
      method: "DELETE",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        listingId: listingId,
        mediaUrls: mediaUrls,
      }),
    });

    if (!response.ok) {
      throw new Error("Media delete failed");
    }

    return true;
  } catch (error) {
    console.error(error);

    alert("Failed to delete media");

    return false;
  }
}

function checkMediaRequirements(mediaUrls) {
  let imageCount = 0;
  let videoCount = 0;

  mediaUrls.forEach((url) => {
    if (url.match(/\.(mp4|webm|mov|avi)$/i)) {
      videoCount++;
    } else {
      imageCount++;
    }
  });

  return {
    imageCount,
    videoCount,
    approved: imageCount >= 8 && videoCount >= 4,
  };
}
// Load Manage Listings Page
document.addEventListener("DOMContentLoaded", () => {
  console.log("Manage Listings Loaded");
  const container = document.getElementById("myListings");
  if (!container) return;

  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!currentUser || currentUser.role !== "host") {
    alert("Only hosts can access this page");

    window.location.href = "listings.html";

    return;
  }

  const myListings = getAllListings().filter(
    (listing) => Number(listing.host_id) === Number(currentUser.id),
  );

  container.innerHTML = "";

  if (myListings.length === 0) {
    container.innerHTML = `<p>You have no listings yet.</p>`;
    return;
  }

  myListings.forEach((listing) => {
    const card = document.createElement("div");
    card.className = "listing-card";
    card.id = `listing-${listing.id}`;

    const media = listing.mediaUrls || [];

    const mediaStatus = checkMediaRequirements(media);

    card.innerHTML = `

    <img src="${listing.mediaUrls?.[0] || ""}" 
    class="manage-image"
    alt ="${listing.title}">
    
    <h2>${listing.title}</h2>

    <p>£${
      mediaStatus.approved
        ? "✅ Approved"
        : `❌ Missing media (${mediaStatus.imageCount}/8 images, ${mediaStatus.videoCount}/4 videos)`
    }
    </p>
    
    <h3>Media</h3>

    <div class ="media-gallery"></div>

    <input 
      type="file"
      class= "upload-input"
      multiple
      accept="image/*,video/*">

    <button type="button" class="upload-media-btn">
      UpLoad More Media
    </button>

    <button type="button" class="delete-media-btn">
    Delete Selected Media
    </button>

    <button type="button" class="delete-listing-btn">
      Delete Entire Listing
    </button>

    `;

    container.appendChild(card);

    const gallery = card.querySelector(".media-gallery");
    const uploadInput = card.querySelector(".upload-input");
    const uploadButton = card.querySelector(".upload-media-btn");

    console.log("Upload input:", uploadInput);
    console.log("Upload button:", uploadButton);

    uploadInput.addEventListener("change", () => {
      console.log("FILE INPUT CHANGED");
      console.log("Selected files:", uploadInput.files);
      console.log("Number of files selected:", uploadInput.files.length);
    });

    uploadButton.addEventListener("click", async () => {
      console.log("Upload button clicked");
      const files = uploadInput.files;
      console.log("Files to upload:", files);
      console.log("Number of files to upload:", files.length);
  
      if(files.length === 0){
          alert("Please select media first.");
          return;
      }
  
      // Validate files before uploading
      const mediaError = validateMedia(files);
  
      if(mediaError){
          alert(mediaError);
          return;
      }
  
      // Disable button while uploading
      uploadButton.disabled = true;
      uploadButton.textContent = "Uploading...";
  
  
      try {
        const uploadedUrls = [];
  
          for(const file of files){
              const url = await uploadMediaToS3(file);
  
              if(url){
                  uploadedUrls.push(url);
              }
          }
  
          if(uploadedUrls.length === 0){
              alert("No media uploaded.");
              return;
          }
  
          const allListings = getAllListings();
  
          const index = allListings.findIndex(
              l => Number(l.id) === Number(listing.id)
          );
  
          if(index === -1){
            alert("Listing not found");
            return;
          }

          // IMPORTANT: get existing images first
          const existingMedia = Array.isArray(allListings[index].mediaUrls)
            ? allListings[index].mediaUrls
            : [];

            // Temporarily add these logs:
            console.log("EXISTING MEDIA:", existingMedia);
            console.log("NEW MEDIA:", uploadedUrls);
    
          // Keep existing media and add new media
          allListings[index].mediaUrls = [
              ...existingMedia,
              ...uploadedUrls
          ];

          // Temporarily add these logs:
          console.log("FINAL MEDIA:", allListings[index].mediaUrls);

          // keep current listing object updated
          listing.mediaUrls = allListings[index].mediaUrls;

          localStorage.setItem(
              "listings",
              JSON.stringify(allListings)
          );

          alert(
              `${uploadedUrls.length} media files uploaded successfully`
          );

          location.reload();

      } catch(error){
          console.error(
              "Upload error:",
              error
          );

          alert(
              "Something went wrong uploading media."
          );

      } finally {  
          uploadButton.disabled = false;
          uploadButton.textContent = "Upload More Media";
      }
  });

    const mediaList = listing.mediaUrls || [];

    // track selected urls for this card
    const selectedMediaUrls = new Set();

    mediaList.forEach((url) => {
      const mediaItemWrapper = document.createElement("div");
      mediaItemWrapper.className = "media-item";

      let element;
      if (url.match(/\.(mp4|webm|mov|avi)$/i)) {
        element = document.createElement("video");
        element.src = url;
        element.muted = true;
        element.playsInline = true;
        element.controls = true;
        element.width = 200;
      } else {
        element = document.createElement("img");
        element.src = url;
        element.alt = "Listing Image";
        element.width = 200;
      }

      mediaItemWrapper.appendChild(element);
      gallery.appendChild(mediaItemWrapper);

      // Handle Media selection/Deselection
      mediaItemWrapper.addEventListener("click", () => {
        mediaItemWrapper.classList.toggle("selected");
        if (mediaItemWrapper.classList.contains("selected")) {
          selectedMediaUrls.add(url);
        } else {
          selectedMediaUrls.delete(url);
        }
      });
    });

    // Action: Delete Selected Media
    const deleteMediaBtn = card.querySelector(".delete-media-btn");

    deleteMediaBtn.addEventListener("click", async () => {
      if (selectedMediaUrls.size === 0) {
        alert("Select media first");
        return;
      }

      const selectedUrls = Array.from(selectedMediaUrls);

      if (!confirm(`Delete ${selectedUrls.length} media files?`)) {
        return;
      }

      const success = await deleteSelectedMedia(listing.id, selectedUrls);

      if (success) {
        // Remove deleted media locally
        listing.mediaUrls = listing.mediaUrls.filter(
          (url) => !selectedMediaUrls.has(url),
        );

        const allListings = getAllListings();

        const index = allListings.findIndex((l) => l.id === listing.id);

        if (index !== -1) {
          allListings[index].mediaUrls = listing.mediaUrls;

          localStorage.setItem("listings", JSON.stringify(allListings));
        }
        alert("Media deleted successfully");
        location.reload();
      }
    });
    // Delete Whole Listing
    const deleteListingBtn = card.querySelector(".delete-listing-btn");

    deleteListingBtn.addEventListener("click", () => {
      deleteListing(listing.id, listing.mediaUrls);
    });
  });
});
