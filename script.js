let data = {};
const playlistsContainer = document.getElementById("playlistsContainer");

// JavaScript for Opening and Closing the Modal
var modal = document.getElementById("playlistModal");
var span = document.getElementById("modalClose");

// a simple frontend sanitizer
// found at https://stackoverflow.com/questions/2794137/sanitizing-user-input-before-adding-it-to-the-dom-in-javascript
function encodeHTML(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

// modified from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    return Math.floor(Math.random() * max-min)+min;
}

// Fisher–Yates shuffle
// based off of https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
function shuffleArray(arr) {
    console.log(arr);
    for (let i = 0; i < arr.length-2; i++) {
        // random integer such that i <= j < arr.length
        j = getRandomInt(i, arr.length);
        // exchange arr[i] and arr[j]
        let temp = arr[i]
        arr[i] = arr[j];
        arr[j] = temp;
    }
}

// declorated outside of the function so it can be shuffled later
let playlistToOpen = null;

function openModal(playlistIDToGet) {
    //TODO: switch to binary search
    // console.log(data.playlists.filter((playlist) => {
    //     return playlist.playlistID == playlistIDToGet;
    // })[0].playlist_name)
    console.log(playlistIDToGet + "  " + "")
    for (let i = 0; i < data.playlists.length; i++) {
        if (data.playlists[i].playlistID == playlistIDToGet) {
            playlistToOpen = data.playlists[i];
            break;
        }
    }
    //  = data.playlists.filter((playlist) => {
    //     return playlist.playlistID == playlistIDToGet;
    // })[0];
    console.log(playlistToOpen);
    document.getElementById('playlistModalName').innerText = playlistToOpen.playlist_name;
    document.getElementById('playlistModalImage').src = playlistToOpen.playlist_art;
    document.getElementById('playlistModalCreatorName').innerText = playlistToOpen.playlist_creator;
    document.getElementById('playlistModalLikesCount').innerText = playlistToOpen.likeCount;
    const songlistContainer = document.getElementById("playlistListOfSongs");
    playlistToOpen.songs.forEach(song => {
        let songlistItem = document.createElement('li'); // Create a <li> element
        songlistItem.innerHTML = `
                <img class="songlistItemImg" src="${encodeHTML(song.cover_art)}">
                <div class="songlistItemTextContainer">
                    <h3 class="songlistItemTitle">${encodeHTML(song.title)}</h3>
                    <div class="songlistItemArtist">${encodeHTML(song.artist)}</div>
                    <div class="songlistItemArtist">${encodeHTML(song.album)}</div>

                </div>
                <div class="songlistItemLength">${encodeHTML(song.duration)}</div>`;
        songlistItem.classList.add("songlistItemContainer");
        songlistContainer.appendChild(songlistItem); // Add <li> to the <ul>
    })
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

function shuffleSongs(){
    const songlistContainer = document.getElementById("playlistListOfSongs");
    songlistContainer.innerHTML = "";
    shuffleArray(playlistToOpen.songs);
    playlistToOpen.songs.forEach(song => {
        let songlistItem = document.createElement('li'); // Create a <li> element
        songlistItem.innerHTML = `
                <img class="songlistItemImg" src="${encodeHTML(song.cover_art)}">
                <div class="songlistItemTextContainer">
                    <h3 class="songlistItemTitle">${encodeHTML(song.title)}</h3>
                    <div class="songlistItemArtist">${encodeHTML(song.artist)}</div>
                    <div class="songlistItemArtist">${encodeHTML(song.album)}</div>

                </div>
                <div class="songlistItemLength">${encodeHTML(song.duration)}</div>`;
        songlistItem.classList.add("songlistItemContainer");
        songlistContainer.appendChild(songlistItem); // Add <li> to the <ul>
    })
}
document.getElementById("shuffleSongsList").addEventListener("click", function () { shuffleSongs(); });


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
                    <div class="playlistItemLikesCount">${playlist.likeCount}</div>
                </div>
        `; // Set the item's name 
        playlistItem.classList.add("playlistItem");
        playlistsContainer.appendChild(playlistItem); // Add <li> to the <ul>
        playlistItem.addEventListener("click", function () { openModal(playlist.playlistID); });
    });


}

playlistJSON()