import { Auth } from "./auth.js";

const auth = await Auth.setUpAuth();

/**
 * creates the html for the plylists
 */
async function renderFeaturedPlaylistList() {
    const resobj = await auth.supabase.from('playlists').select().eq("public", true);
    console.log(resobj);

    // playlistsContainer.innerHTML = addPlaylistButtonCode;

    // // the first item in the grids opens the create playlist <dialog> modally
    // // This is in reference to // add playlist code
    // document.getElementById("createNewPlaylistButton").addEventListener("click", () => {
    //     if (typeof createPlaylistModal.showModal === "function") {
    //         createPlaylistModal.showModal();
    //     } else {
    //         outputBox.value = "Sorry, the dialog API is not supported by this browser.";
    //     }
    // });

    // // rendering the playlists
    // data.playlists.forEach((playlist) => {
    //     const currentHeartPath = getHeartPath(playlist.liked_users);

    //     let playlistItem = document.createElement("li"); // Create a <li> element
    //     playlistItem.innerHTML = `
    //             <img class="playlistItemImage" src="${encodeHTML(playlist.playlist_art)}" alt="playlist Image"></img>
    //             <h3 class="playlistItemTitle">${encodeHTML(playlist.playlist_name)}</h3>
    //             <p class="playlistItemCreatorName">${encodeHTML(playlist.playlist_creator)}</p>
    //             <div id="${"LikesContainerID" + playlist.playlistID}" class="playlistItemLikesContainer">
    //                 <img class="playlistItemHeart" src="${currentHeartPath}" >
    //                 <div class="playlistItemLikesCount">${playlist.liked_users.length}</div>
    //             </div>
    //     `; // Set the item's name
    //     playlistItem.classList.add("playlistItem");
    //     playlistsContainer.appendChild(playlistItem); // Add <li> to the <ul>
    //     playlistItem.addEventListener("click", function () {
    //         openModal(playlist.playlistID);
    //     });
    //     document.getElementById("LikesContainerID" + playlist.playlistID).addEventListener("click", function (e) {
    //         if (e && e.stopPropagation) e.stopPropagation();
    //         likePlaylist(playlist.playlistID);
    //     });
    // });
}

renderFeaturedPlaylistList()