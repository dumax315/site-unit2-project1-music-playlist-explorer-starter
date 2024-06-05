let data = {};
const playlistsContainer = document.getElementById("playlistsContainer");

// JavaScript for Opening and Closing the Modal
var modal = document.getElementById("playlistModal");
var span = document.getElementById("modalClose");

function openModal(playlistIDToGet) {
    //TODO: switch to binary search
    console.log(data.playlists.filter((playlist) => {
        return playlist.playlistID == playlistIDToGet;
    })[0])
    let playlistToOpen = data.playlists.filter((playlist) => 
         playlist.playlistID == playlistIDToGet)
    console.log(playlistIDToGet);
    document.getElementById('playlistModalName').innerText = playlistToOpen.name;
    document.getElementById('playlistModalImage').src = playlistToOpen.imageUrl;
    
    modal.style.display = "block";
}

span.onclick = function () {
    modal.style.display = "none";
}
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// a simple frontend sanitizer
// found at https://stackoverflow.com/questions/2794137/sanitizing-user-input-before-adding-it-to-the-dom-in-javascript
function encodeHTML(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

//asyncronly render the playlists
async function playlistJSON() {
    // get the playlist json data from a hosted file
    const response = await fetch('/data/data.json');
    data = await response.json();

    if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }
    // rendering the playlists
    data.playlists.forEach(playlist => {
        let playlistItem = document.createElement('li'); // Create a <li> element
        playlistItem.innerHTML = `
                <img class="playlistItemImage" src="${encodeHTML(playlist.playlist_art)}" alt="playlist Image"></img>
                <h3 class="playlistItemTitle">${encodeHTML(playlist.playlist_name)}</h3>
                <p class="playlistItemCreatorName">${encodeHTML(playlist.playlist_creator)}</p>
                <div class="playlistItemLikesContainer">
                    <button class="playlistItemHeart">Like</button>
                    <div class="playListItemLikesCount">${playlist.likeCount}</div>
                </div>
        `; // Set the item's name 
        playlistItem.classList.add("playlistItem");
        playlistsContainer.appendChild(playlistItem); // Add <li> to the <ul>
    });

}

playlistJSON()