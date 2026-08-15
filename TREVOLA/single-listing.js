import { getListingById } from "./listingService.js";

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('listingContainer');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get('id');
    if (!listingId) {
        container.innerHTML = '<p>No listing ID provided.</p>';
        return;
    }

    const id = Number(listingId);
    const listing = getListingById(id);

    if (!listing) {
        container.innerHTML = '<p>Listing not found.</p>';
        return;
    }

    const media = listing.mediaUrls || [];
    
    let mainDisplay = '';

    if (media.length === 0) {

        mainDisplay = '<p>No media available for this listing.</p>';
        
    } else if (media[0].match(/\.(mp4|webm|ogg)$/i)) {
        mainDisplay = `
            <video id="mainMedia" controls width="100%">
                <source src="${media[0]}" />
            </video>
        `;
    } else {
        mainDisplay = `
            <img id="mainImage" src="${media[0]}" alt="Listing Image">
        `;
    }

    container.innerHTML = `
        <h1>${listing.title}</h1>
        <p>${listing.description}</p>
        <p><strong>Price:</strong> £${listing.pricePerNight}</p>
        <p><strong>Location:</strong> ${listing.location?.address || "N/A"}</p>
        
        <div class="main-image">
            ${mainDisplay}
        </div>
        
        <div class="thumbnails">
            ${media.map((url, index) => {
                if (url.match(/\.(mp4|webm|ogg)$/i)) {
                    return `
                        <video class="thumb" data-media="${url}" width="100" muted>
                                <source src="${url}" />
                            </video>
                `;
                }
                return `
                    <img 
                        class="thumb" 
                        src="${url}"
                        data-media="${url}" 
                        alt="Thumbnail ${index + 1}">`; 
            }).join('')}
            
        </div>
    `;

    const thumbs = document.querySelectorAll(".thumb");

thumbs.forEach(thumb => {

    thumb.addEventListener("click", () => {

        const mediaUrl = thumb.dataset.media;

        if (thumb.tagName === "IMG") {

            container.querySelector(".main-image").innerHTML = `
                <img id="mainImage"
                     src="${mediaUrl}"
                     alt="Listing Image">
            `;
        } else {

            container.querySelector(".main-image").innerHTML = `
                <video id="mainMedia" controls width="100%">
                    <source src="${mediaUrl}">
                </video>
            `;
        }
    });
});
});

          