// In a project with react or webpack (etc) this would be replaced with the supabase npm package
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Generates a supabase client connection
const supabase = createClient(
    "https://zkjmdhhvcxwjgjsryyow.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpram1kaGh2Y3h3amdqc3J5eW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc2MjAxMjQsImV4cCI6MjAzMzE5NjEyNH0.M3aEkryg17fMtWrC1hKigqovebKhSOz5P4Y1Pd17ug4"
);
console.log(supabase);

// Hold the current userID (updated with auth later, used for the liked_users list)
let userID = "local";

/**
 * renderCurrentUser
 * To be called whenever the auth state changes, updates ui elements related to the current user
 */
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

        // playlistFromDatabase();
        
    }
    renderPlaylistList();

    
}

/**
 * binds a listner to the the auth state change
 * calls renderCurrentUser when an important state change has happend
 */
const { stateChange } = supabase.auth.onAuthStateChange((event, session) => {
    console.log(event, session);

    if (event === "INITIAL_SESSION") {
        // handle initial session
        renderCurrentUser();
    } else if (event === "SIGNED_IN") {
        // handle sign in event
        // const user = await supabase.auth.getUser();
        // Ask to recover data
        console.log(localStorage.getItem("data"));
        if(localStorage.getItem("data") != "" && localStorage.getItem("data") != "{}" && localStorage.getItem("data") != '{"playlists":[]}'){
            let shouldRecover = confirm("Local Data was found from a signed out session\nWhould you like to upload it to your account?");
            if(shouldRecover){
                uploadLocalData(localStorage.getObject("data"));
            }
            localStorage.setItem("data", "");
        }
        playlistFromDatabase();
        
    } else if (event === "SIGNED_OUT") {
        // handle sign out event
        data = {playlists:[]};;
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

//modified from https://stackoverflow.com/questions/2010892/how-to-store-objects-in-html5-localstorage-sessionstorage
Storage.prototype.setObject = function(key, value) {
    if(value != {} && value != null){
        this.setItem(key, JSON.stringify(value));
    }
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

/**
 * Attempts to sign in or create an avlnilkeduhijikheekgbrnlvuuglhkrgccount with github as the Oauth provider
 * will redirect
 */
async function gitHubignIn() {
    //save any temporary data that was created to be revived after login
    localStorage.setObject("data", data)
    const { responsedata, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
    });
    // I'm not sure if this is ever called or if the redirect blocks it
    renderCurrentUser();
}

/**
 * Signs out the current auth user, doesn't redirect
 */
async function signOut() {
    const { error } = await supabase.auth.signOut();
    console.log(error);
    renderCurrentUser();
}

//binding the signout and signin buttons to elements in the header
//TODO style elements
document.getElementById("githubSignUp").addEventListener("click", () => {
    gitHubignIn();
});
document.getElementById("signOut").addEventListener("click", () => {
    signOut();
});



// the Data varible Contains the local version the the playlist json
let data = {playlists:[]};

// Grabs the playlistsContainer from the dom for use in renderPlaylistList
const playlistsContainer = document.getElementById("playlistsContainer");

// JavaScript for Opening and Closing the Modal
var modal = document.getElementById("playlistModal");
var span = document.getElementById("modalClose");

// a simple frontend sanitizer
// found at https://stackoverflow.com/questions/2794137/sanitizing-user-input-before-adding-it-to-the-dom-in-javascript
function encodeHTML(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

// modified from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// min is inclusive and max is exclusive
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

/**
 * Seaches the given liked users list and returns a image path with a full heart if the signed in user is present in the list
 * otherwise returns a path to a outline svg of a heart
 * @param {Array} likedUsersArray
 * @returns {String}
 */
function getHeartPath(likedUsersArray) {
    for (let i = 0; i < likedUsersArray.length; i++) {
        if (likedUsersArray[i] == userID) {
            return heartLiked;
        }
    }
    return heartNotLiked;
}

/**
 * searches the current data object for a given playlist id
 * @param {number} playlistID
 * @returns a playlist object or null
 */
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

/**
 * renders the song list into the modal
 */
function renderSongList(playlistToOpen) {
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
}

// declorated outside of the function so it can be shuffled later
let playlistToOpen = null;

/**
 * First updates the data inside the hidden modal to a given playlist
 * then displays the modal
 * @param {number} playlistIDToGet
 */
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

    renderSongList(playlistToOpen);

    document.getElementById("playlistModalLikesContainer").addEventListener("click", function () {
        likePlaylist(playlistToOpen.playlistID);
        openModal(playlistIDToGet);
    });

    modal.style.display = "block";
}

//binds a few closing onclick that will close the modal
document.getElementById("modalClose").onclick = function () {
    modal.style.display = "none";
};
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

/**
 * shuffles the modal songs array and then rerenders them
 */
function shuffleSongs() {
    const songlistContainer = document.getElementById("playlistListOfSongs");
    // clears all elements from the song container
    songlistContainer.innerHTML = "";
    shuffleArray(playlistToOpen.songs);
    renderSongList(playlistToOpen);
}

// binds the shuffle songs the suffle songs button
document.getElementById("shuffleSongsList").addEventListener("click", function () {
    shuffleSongs();
});

/**
 * creates the html for the plylists
 */
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

/**
 * asyncronly render the playlists
 */
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

// load the example playlists from json
document.getElementById("loadExampleDataButton").addEventListener("click", () => {
    playlistJSON();
})

async function playlistFromDatabase() {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    console.log(user.id);
    const resobj = await supabase
        .from('playlists')
        .select('playlistData')
        // .eq('user_id', user.id)
    console.log(resobj);
    data = {playlists:[]};
    resobj.data.forEach((dbplaylist) => {
        data.playlists.push(dbplaylist.playlistData);
    })
    console.log(data);
    renderCurrentUser();

}

/**
 * uploads the data currenlty stored locally, will not delete anything from postgres ever
 */
async function uploadLocalData(localData) {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    console.log(user);
    localData.playlists.forEach(async (playlist) => {
        const { returndata, error } = await supabase.from("playlists").upsert({id:playlist.playlistID, playlistData: playlist}).select();
        console.log(returndata, error)
    })
}

/**
 * updates 1 playlist currenlty stored locally
 */
async function updatePlaylist(freshPlaylistData) {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    console.log(user);
    const { returndata, error } = await supabase.from("playlists").update({playlistData: freshPlaylistData}).eq('id', freshPlaylistData.playlistID,);
    console.log(returndata, error)
}

/**
 * changes the stored data object to like or dislike a playlist and the rerenders it
 * @param {number} playlistID
 */
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
    updatePlaylist(curPlaylist)

    renderPlaylistList();
}
