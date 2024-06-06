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

// add playlist code
// modal controls modified from https://developer.mozilla.org/en-US/docs/Web/CSS/:modal
const createPlaylistModal = document.getElementById("createPlaylistModal");
const outputBox = document.querySelector("output");

// If a browser doesn't support the dialog, then hide the
// dialog contents by default.
if (typeof createPlaylistModal.showModal !== "function") {
    createPlaylistModal.hidden = true;
    // Your fallback script
    alert("This website is not compatible with your browser");
}

// "Confirm" button of form triggers "close" on dialog because of [method="dialog"]
createPlaylistModal.addEventListener("close", async () => {
    // the return value is the value of the button pressed to close the modal
    // either cancel or confirm

    if (createPlaylistModal.returnValue === "confirm") {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        let freshPlaylistData = {
            playlist_name: document.getElementById("name").value,
            playlist_art: document.getElementById("url").value,
            liked_users: [],
            songs: [],
        };

        if (user != null) {
            freshPlaylistData.playlist_creator = user.email;
            if (freshPlaylistData.liked_users.indexOf("local") != -1) {
                freshPlaylistData.liked_users = [];
                freshPlaylistData.liked_users.push(userID);
            }

            let isPublic = false;
            if (document.getElementById("public").value === "on") {
                isPublic = true;
            }
            const { returndata, error } = await supabase
                .from("playlists")
                .insert({ playlistData: freshPlaylistData, user_emails: [user.email], public: isPublic });
            console.log(returndata, error);
            if (error) {
                alert(error);
            }
            playlistFromDatabase();

        }else{
            freshPlaylistData.playlist_creator = "local";
            freshPlaylistData["playlistID"] = data.playlists.length*7+getRandomInt(0,7);
            data.playlists.push(freshPlaylistData);
            renderCurrentUser()
        }

    }
});

// add song code
// modal controls modified from https://developer.mozilla.org/en-US/docs/Web/CSS/:modal
const createSongModal = document.getElementById("createSongModal");

// If a browser doesn't support the dialog, then hide the
// dialog contents by default.
if (typeof createSongModal.showModal !== "function") {
    createSongModal.hidden = true;
    // Your fallback script
    alert("This website is not compatible with your browser");
}

// "Confirm" button of form triggers "close" on dialog because of [method="dialog"]
createSongModal.addEventListener("close", async () => {
    // the return value is the value of the button pressed to close the modal
    // either cancel or confirm

    if (createSongModal.returnValue === "confirm") {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        console.log(playlistToOpen)
        // TODO, check for id
        playlistToOpen.songs.push({
            "songID": playlistToOpen.songs.length*8+getRandomInt(0,8),
            "title": document.getElementById("addSongName").value,
            "artist": document.getElementById("addSongArtist").value,
            "album": document.getElementById("addSongAlbum").value,
            "cover_art": document.getElementById("addSongCoverArt").value,
            "duration": document.getElementById("addSongDuration").value}
        )

        if (user != null) {
            await dbUpdatePlaylist(playlistToOpen);


            await playlistFromDatabase();
            renderSongList(playlistToOpen)

        }else{
            await renderCurrentUser()
            renderSongList(playlistToOpen)

        }

    }
});


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
        document.getElementById("loadExampleDataButton").innerText = "Load example data from json"
    } else {
        userID = user.id;
        document.getElementById("notLogedIn").style.display = "none";
        document.getElementById("logedIn").style.display = "unset";
        document.getElementById("username").innerText = user.email;
        document.getElementById("loadExampleDataButton").innerText = "Add self to example public playlists"

        
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
        console.log(localStorage.getItem("data"));
        if (
            localStorage.getItem("data") != "" &&
            localStorage.getItem("data") != "{}" &&
            localStorage.getItem("data") != '{"playlists":[]}'
        ) {
            let shouldRecover = confirm(
                "Local Data was found from a signed out session\nWhould you like to upload it to your account?"
            );
            if (shouldRecover) {
                uploadLocalData(localStorage.getObject("data"));
            }
            localStorage.setItem("data", "");
        }
        playlistFromDatabase();
        renderCurrentUser();
    } else if (event === "SIGNED_IN") {
        // handle sign in event
        // const user = await supabase.auth.getUser();
        // Ask to recover data

    } else if (event === "SIGNED_OUT") {
        // handle sign out event
        data = { playlists: [] };
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
Storage.prototype.setObject = function (key, value) {
    if (value != {} && value != null) {
        this.setItem(key, JSON.stringify(value));
    }
};

Storage.prototype.getObject = function (key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
};

/**
 * Attempts to sign in or create an account with github as the Oauth provider
 * will redirect
 */
async function gitHubignIn() {
    //save any temporary data that was created to be revived after login
    localStorage.setObject("data", data);
    const { responsedata, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
    });
    // I'm not sure if this is ever called or if the redirect blocks it
    renderCurrentUser();
}

addEventListener("beforeunload", (event) => {

    if(userID == "local"){
        localStorage.setObject("data", data);
    }
});


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
let data = { playlists: [] };

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
function getRandomInt(min, max){
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

const addSongButtonCode = `
<li class="songlistItemContainer" id="createNewSongButton">
<img id="addSongImage" draggable="false"  src="assets/img/plus-solid.svg">
<div class="songlistItemTextContainer">
    <h3 class="songlistItemTitle">Add a song</h3>

</div>
<div class="songlistItemLength"></div>
</li>`;


/**
 * renders the song list into the modal
 */
function renderSongList(playlistToOpen) {
    const songlistContainer = document.getElementById("playlistListOfSongs");
    songlistContainer.innerHTML = addSongButtonCode;
    // alert("Asdf")
    document.getElementById("createNewSongButton").addEventListener("click", () =>{
        if (typeof createSongModal.showModal === "function") {
            createSongModal.showModal();
        } else {
            outputBox.value = "Sorry, the dialog API is not supported by this browser.";
        }
    })
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

const addPlaylistButtonCode = `
<li class="playlistItem" id="createNewPlaylistButton">
<img id="addPlaylistImage" draggable="false"  src="assets/img/plus-solid.svg">
<h2>Create a new playlist</h2>
</li>`;

/**
 * creates the html for the plylists
 */
function renderPlaylistList() {
    playlistsContainer.innerHTML = addPlaylistButtonCode;

    // the first item in the grids opens the create playlist <dialog> modally
    // This is in reference to // add playlist code
    document.getElementById("createNewPlaylistButton").addEventListener("click", () => {
        if (typeof createPlaylistModal.showModal === "function") {
            createPlaylistModal.showModal();
        } else {
            outputBox.value = "Sorry, the dialog API is not supported by this browser.";
        }
    });

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
    if (userID != "local") {
        const privacyConfirm = confirm("warning, joining public playlists could expose your email to other users");
        if(!privacyConfirm){
            return;
        }
        addUserToPlaylist(1);
        addUserToPlaylist(5);
        addUserToPlaylist(7);
        addUserToPlaylist(6);
        addUserToPlaylist(100);
        addUserToPlaylist(2);
    } else {
        const response = await fetch("/data/data.json");
        data = await response.json();

        if (!response.ok) {
            const message = `An error has occured: ${response.status}`;
            throw new Error(message);
        }
    }
    renderPlaylistList();
}

// load the example playlists from json
document.getElementById("loadExampleDataButton").addEventListener("click", () => {
    playlistJSON();
});

async function playlistFromDatabase() {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    console.log(user.id);
    const resobj = await supabase.from("playlists").select().contains("user_emails", [user.email]);
    // .eq('user_id', user.id)
    console.log(resobj);
    data = { playlists: [] };
    resobj.data.forEach((dbplaylist) => {
        dbplaylist.playlistData.playlistID= dbplaylist.id;
        data.playlists.push(dbplaylist.playlistData);
    });
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
    if(user == null){
        data = localData
    }else{
    localData.playlists.forEach(async (playlist) => {
        if (playlist.liked_users.indexOf("local") != -1) {
            playlist.liked_users = [];
            playlist.liked_users.push(userID);
        }
        const { returndata, error } = await supabase.from("playlists").upsert({ playlistData: playlist, user_emails:[user.email] }).select();
        console.log(returndata, error);
    });
}
}

/**
 * add user to user_emails array
 * @param {number} playlistID
 */
async function addUserToPlaylist(playlistID, userEmailtoAdd = null) {
    if (userEmailtoAdd == null) {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        userEmailtoAdd = user.email;
    }

    const resobj = await supabase.from("playlists").select().eq("id", playlistID);
    // .eq('user_id', user.id)
    if (resobj.data[0].user_emails.indexOf(userEmailtoAdd) != -1) {
        console.log("email already present");
        return;
    }
    resobj.data[0].user_emails.push(userEmailtoAdd);
    console.log(resobj.data[0].user_emails);

    // const { returndata, error } = await supabase.from('playlists').select().eq('id', playlistID)
    // console.log(returndata, error)

    const { returndata2, error2 } = await supabase
        .from("playlists")
        .update({ user_emails: resobj.data[0].user_emails })
        .select()
        .eq("id", playlistID);
    console.log(returndata2, error2);
}

/**
 * updates 1 playlist currenlty stored locally
 */
async function dbUpdatePlaylist(freshPlaylistData) {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    console.log(user);
    const { returndata, error } = await supabase
        .from("playlists")
        .update({ playlistData: freshPlaylistData })
        .eq("id", freshPlaylistData.playlistID);
    console.log(returndata, error);
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
    dbUpdatePlaylist(curPlaylist);

    renderPlaylistList();
}
