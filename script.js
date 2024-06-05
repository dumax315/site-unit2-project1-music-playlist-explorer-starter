// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
    "https://zkjmdhhvcxwjgjsryyow.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpram1kaGh2Y3h3amdqc3J5eW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc2MjAxMjQsImV4cCI6MjAzMzE5NjEyNH0.M3aEkryg17fMtWrC1hKigqovebKhSOz5P4Y1Pd17ug4"
);

console.log(supabase);

async function renderCurrentUser() {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    console.log(user);
    console.log("current user data above");
    if (user == null) {
        document.getElementById("notLogedIn").style.display = "unset";
        document.getElementById("logedIn").style.display = "none";
    } else {
        document.getElementById("notLogedIn").style.display = "none";
        document.getElementById("logedIn").style.display = "unset";
        document.getElementById("username").innerText = user.email;
    }
}

const { stateChange } = supabase.auth.onAuthStateChange((event, session) => {
    console.log(event, session);

    if (event === "INITIAL_SESSION") {
        // handle initial session
        renderCurrentUser();
    } else if (event === "SIGNED_IN") {
        // handle sign in event
        // const user = await supabase.auth.getUser();
        renderCurrentUser();
    } else if (event === "SIGNED_OUT") {
        // handle sign out event
        renderCurrentUser();
    } else if (event === "PASSWORD_RECOVERY") {
        // handle password recovery event
    } else if (event === "TOKEN_REFRESHED") {
        // handle token refreshed event
    } else if (event === "USER_UPDATED") {
        // handle user updated event
        renderCurrentUser();
    }
});
async function gitHubignIn() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
    });
    renderCurrentUser();
}
async function signOut() {
    const { error } = await supabase.auth.signOut();
    console.log(error);
    renderCurrentUser();
}

document.getElementById("githubSignUp").addEventListener("click", () => {
    gitHubignIn();
});
document.getElementById("signOut").addEventListener("click", () => {
    signOut();
});

let data = {};
const playlistsContainer = document.getElementById("playlistsContainer");

// JavaScript for Opening and Closing the Modal
var modal = document.getElementById("playlistModal");
var span = document.getElementById("modalClose");

let userID = "local";

// a simple frontend sanitizer
// found at https://stackoverflow.com/questions/2794137/sanitizing-user-input-before-adding-it-to-the-dom-in-javascript
function encodeHTML(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

// modified from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    return Math.floor(Math.random() * max - min) + min;
}

// Fisher–Yates shuffle
// based off of https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
function shuffleArray(arr) {
    console.log(arr);
    for (let i = 0; i < arr.length - 2; i++) {
        // random integer such that i <= j < arr.length
        let j = getRandomInt(i, arr.length);
        // exchange arr[i] and arr[j]
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}

// filepaths for the heart svg files
const heartNotLiked = "assets/img/heart-regular.svg";
const heartLiked = "assets/img/heart-solid.svg";

function getHeartPath(likedUsersArray) {
    for (let i = 0; i < likedUsersArray.length; i++) {
        if (likedUsersArray[i] == userID) {
            return heartLiked;
        }
    }
    return heartNotLiked;
}

function getPlaylistByID(playlistID) {
    let playlistFound = null;
    for (let i = 0; i < data.playlists.length; i++) {
        if (data.playlists[i].playlistID == playlistID) {
            playlistFound = data.playlists[i];
            break;
        }
    }
    return playlistFound;
}

// declorated outside of the function so it can be shuffled later
let playlistToOpen = null;

function openModal(playlistIDToGet) {
    //TODO: switch to binary search
    // console.log(data.playlists.filter((playlist) => {
    //     return playlist.playlistID == playlistIDToGet;
    // })[0].playlist_name)
    console.log(playlistIDToGet + "  " + "");
    playlistToOpen = getPlaylistByID(playlistIDToGet);
    //  = data.playlists.filter((playlist) => {
    //     return playlist.playlistID == playlistIDToGet;
    // })[0];
    console.log(playlistToOpen);
    document.getElementById("playlistModalName").innerText = playlistToOpen.playlist_name;
    document.getElementById("playlistModalImage").src = playlistToOpen.playlist_art;
    document.getElementById("playlistModalCreatorName").innerText = playlistToOpen.playlist_creator;
    document.getElementById("playlistModalLikesCount").innerText = playlistToOpen.liked_users.length;

    const currentHeartPath = getHeartPath(playlistToOpen.liked_users);
    const heartModalElement = document.getElementById("playlistModalHeart");
    heartModalElement.src = currentHeartPath;

    // Clones the node to remove the previous event listners
    // https://stackoverflow.com/questions/9251837/how-to-remove-all-listeners-in-an-element
    let old_element = document.getElementById("playlistModalLikesContainer");
    let new_element = old_element.cloneNode(true);
    old_element.parentNode.replaceChild(new_element, old_element);

    document.getElementById("playlistModalLikesContainer").addEventListener("click", function () {
        likePlaylist(playlistToOpen.playlistID);
        openModal(playlistIDToGet);
    });

    const songlistContainer = document.getElementById("playlistListOfSongs");
    playlistToOpen.songs.forEach((song) => {
        let songlistItem = document.createElement("li"); // Create a <li> element
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
    });
    modal.style.display = "block";
}

span.onclick = function () {
    modal.style.display = "none";
};
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

function shuffleSongs() {
    const songlistContainer = document.getElementById("playlistListOfSongs");
    songlistContainer.innerHTML = "";
    shuffleArray(playlistToOpen.songs);
    playlistToOpen.songs.forEach((song) => {
        let songlistItem = document.createElement("li"); // Create a <li> element
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
    });
}
document.getElementById("shuffleSongsList").addEventListener("click", function () {
    shuffleSongs();
});

function renderPlaylistList() {
    playlistsContainer.innerHTML = "";
    // rendering the playlists
    data.playlists.forEach((playlist) => {
        const currentHeartPath = getHeartPath(playlist.liked_users);

        let playlistItem = document.createElement("li"); // Create a <li> element
        playlistItem.innerHTML = `
                <img class="playlistItemImage" src="${encodeHTML(playlist.playlist_art)}" alt="playlist Image"></img>
                <h3 class="playlistItemTitle">${encodeHTML(playlist.playlist_name)}</h3>
                <p class="playlistItemCreatorName">${encodeHTML(playlist.playlist_creator)}</p>
                <div id="${"LikesContainerID" + playlist.playlistID}" class="playlistItemLikesContainer">
                    <img class="playlistItemHeart" src="${currentHeartPath}" >
                    <div class="playlistItemLikesCount">${playlist.liked_users.length}</div>
                </div>
        `; // Set the item's name
        playlistItem.classList.add("playlistItem");
        playlistsContainer.appendChild(playlistItem); // Add <li> to the <ul>
        playlistItem.addEventListener("click", function () {
            openModal(playlist.playlistID);
        });
        document.getElementById("LikesContainerID" + playlist.playlistID).addEventListener("click", function (e) {
            if (e && e.stopPropagation) e.stopPropagation();
            likePlaylist(playlist.playlistID);
        });
    });
}
//asyncronly render the playlists
async function playlistJSON() {
    // get the playlist json data from a hosted file
    const response = await fetch("/data/data.json");
    data = await response.json();

    if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }
    renderPlaylistList();
}

playlistJSON();

function likePlaylist(playlistID) {
    let curPlaylist = getPlaylistByID(playlistID);
    if (curPlaylist.liked_users.indexOf(userID) == -1) {
        curPlaylist.liked_users.push(userID);
        console.log(curPlaylist);
    } else {
        curPlaylist.liked_users = curPlaylist.liked_users.filter((itemuserID) => {
            return itemuserID != userID;
        });
    }
    console.log(data);

    renderPlaylistList();
}
