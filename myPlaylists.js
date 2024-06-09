import { Auth } from "./auth.js";
import { sortingFunctions, getHeartPath, populateModalData, renderSongList, encodeHTML } from "./utils.js";


const auth = await Auth.setUpAuth();

// Hold the current userID (updated with auth later, used for the liked_users list)
let userID = "local";

const shouldRenderAddSongButtonBoolean = true;

document.getElementById("sortSelecter").addEventListener("change", (event) => {
    // alert("ASDFasdfasdfafdadf")
    renderPlaylistList();
});

document.getElementById("searchBox").addEventListener("input", (event) => {
    // alert("ASDFasdfasdfafdadf")
    renderPlaylistList();
});

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
        const user = await auth.getUser();

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

            delete freshPlaylistData.playlistID;

            let isPublic = false;
            if (document.getElementById("public").value === "on") {
                isPublic = true;
            }
            const { returndata, error } = await auth.supabase
                .from("playlists")
                .insert({ playlistData: freshPlaylistData, user_emails: [user.email], public: isPublic });
            console.log(returndata, error);
            if (error) {
                alert(error);
            }
            loadPlaylistFromDatabase();
        } else {
            freshPlaylistData.playlist_creator = "local";
            freshPlaylistData["playlistID"] = data.playlists.length * 7 + getRandomInt(0, 7);
            data.playlists.push(freshPlaylistData);
            renderCurrentUser();
        }
    }
});

const editPlaylistModal = document.getElementById("editPlaylistModal");

// If a browser doesn't support the dialog, then hide the
// dialog contents by default.
if (typeof editPlaylistModal.showModal !== "function") {
    editPlaylistModal.hidden = true;
    // Your fallback script
    alert("This website is not compatible with your browser");
}

// "Confirm" button of form triggers "close" on dialog because of [method="dialog"]
editPlaylistModal.addEventListener("close", async () => {
    // the return value is the value of the button pressed to close the modal
    // either cancel or confirm

    if (editPlaylistModal.returnValue === "confirm") {
        const user = await auth.getUser();

        let freshPlaylistData = getPlaylistByID(document.getElementById("editPlaylistID").value);
        freshPlaylistData.playlist_name = document.getElementById("editPlaylistName").value;
        freshPlaylistData.playlist_art = document.getElementById("editPlaylistUrl").value;

        if (user != null) {
            // freshPlaylistData.playlist_creator = user.email;
            // if (freshPlaylistData.liked_users.indexOf("local") != -1) {
            //     freshPlaylistData.liked_users = [];
            //     freshPlaylistData.liked_users.push(userID);
            // }

            let isPublic = false;
            if (document.getElementById("editPlaylistPublic").value === "on") {
                isPublic = true;
            }
            const { returndata, error } = await auth.supabase
                .from("playlists")
                .update({ playlistData: freshPlaylistData, public: isPublic })
                .eq("id", freshPlaylistData.playlistID);
            console.log(returndata, error);
            if (error) {
                alert(error);
            }
            await loadPlaylistFromDatabase();
        } else {
            // for(let i = 0; i < data.playlists.length; i++){
            //     if(data.playlists[i].playlistID == freshPlaylistData.playlistID){
            //         data.playlists[i] = freshPlaylistData
            //     }
            // }
            renderCurrentUser();
        }
        openModal(freshPlaylistData.playlistID);
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
        const user = await auth.getUser();

        console.log(playlistToOpen);
        // TODO, check for id
        playlistToOpen.songs.push({
            songID: playlistToOpen.songs.length * 8 + getRandomInt(0, 8),
            title: document.getElementById("addSongName").value,
            artist: document.getElementById("addSongArtist").value,
            album: document.getElementById("addSongAlbum").value,
            cover_art: document.getElementById("addSongCoverArt").value,
            duration: document.getElementById("addSongDuration").value,
        });

        if (user != null) {
            await auth.dbUpdatePlaylist(playlistToOpen);

            await loadPlaylistFromDatabase();
            renderSongList(playlistToOpen, shouldRenderAddSongButtonBoolean);
        } else {
            await renderCurrentUser();
            renderSongList(playlistToOpen, shouldRenderAddSongButtonBoolean);
        }
    }
});

/**
 * renderCurrentUser
 * To be called whenever the auth state changes, updates ui elements related to the current user
 */
export async function renderCurrentUser() {
    const user = await auth.getUser();
    console.log(user);
    console.log("current user data above");

    if (user == null) {
        document.getElementById("notLogedIn").style.display = "unset";
        document.getElementById("logedIn").style.display = "none";
        document.getElementById("loadExampleDataButton").innerText = "Load example data from json";
    } else {
        userID = user.email;
        document.getElementById("notLogedIn").style.display = "none";
        document.getElementById("logedIn").style.display = "unset";
        document.getElementById("username").innerText = user.email;
        document.getElementById("loadExampleDataButton").innerText = "Add self to example public playlists";

        // loadPlaylistFromDatabase();
    }
    renderPlaylistList();
}

/**
 * binds a listner to the the auth state change
 * calls renderCurrentUser when an important state change has happend
 */
const { stateChange } = auth.supabase.auth.onAuthStateChange(async (event, session) => {
    console.log(event, session);

    if (event === "INITIAL_SESSION") {
        // handle initial session
        let curLocalStorageObj = localStorage.getItem("data");
        console.log(curLocalStorageObj);
        if (
            curLocalStorageObj != null &&
            curLocalStorageObj != "" &&
            curLocalStorageObj != "{}" &&
            curLocalStorageObj != '{"playlists":[]}'
        ) {
            let shouldRecover = confirm(
                "Local Data was found from a signed out session\nWould you like to upload it to your account?"
            );
            if (shouldRecover) {
                uploadLocalData(localStorage.getObject("data"));
            }
            localStorage.setItem("data", "");
        }
        const user = await auth.getUser();
        if (user != null) {
            loadPlaylistFromDatabase();
        }
        renderCurrentUser();
    } else if (event === "SIGNED_IN") {
        // handle sign in event
        // const user = await supabase.auth.getUser();
        // Ask to recover data
        loadPlaylistFromDatabase();
        renderCurrentUser();
    } else if (event === "SIGNED_OUT") {
        // handle sign out event
        userID = "local";
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
    await auth.signInWithOAuth();
    // I'm not sure if this is ever called or if the redirect blocks it
    // renderCurrentUser();
}

addEventListener("beforeunload", (event) => {
    if (userID == "local") {
        localStorage.setObject("data", data);
    }
});

/**
 * Signs out the current auth user, doesn't redirect
 */
async function signOut() {
    await auth.signOut();
    data = { playlists: [] };
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



// declorated outside of the function so it can be shuffled later
let playlistToOpen = null;

/**
 * First updates the data inside the hidden modal to a given playlist
 * then displays the modal
 * @param {number} playlistIDToGet
 */
function openModal(playlistIDToGet) {

    playlistToOpen = getPlaylistByID(playlistIDToGet);

    populateModalData(playlistToOpen, userID);

    renderSongList(playlistToOpen, shouldRenderAddSongButtonBoolean);

    document.getElementById("playlistModalLikesContainer").addEventListener("click", function () {
        likePlaylist(playlistToOpen.playlistID);
        openModal(playlistIDToGet);
    });

    document.getElementById("editPlaylistButton").addEventListener("click", () => {
        if (typeof editPlaylistModal.showModal === "function") {
            document.getElementById("editPlaylistNameDisplay").innerText = playlistToOpen.playlist_name;
            document.getElementById("editPlaylistName").value = playlistToOpen.playlist_name;
            document.getElementById("editPlaylistUrl").value = playlistToOpen.playlist_art;

            document.getElementById("editPlaylistPublic").checked = true;
            document.getElementById("editPlaylistID").value = playlistToOpen.playlistID;
            editPlaylistModal.showModal();
        } else {
            alert("Sorry, the dialog API is not supported by this browser.");
        }
    });

    // Clones the node to remove the previous event listners
    // https://stackoverflow.com/questions/9251837/how-to-remove-all-listeners-in-an-element
    let old_element = document.getElementById("deletePlaylistButton");
    let new_element = old_element.cloneNode(true);
    old_element.parentNode.replaceChild(new_element, old_element);

    document.getElementById("deletePlaylistButton").addEventListener("click", async () => {
        let confirmResponse = confirm("Confirm deletion of " + playlistToOpen.playlist_name);
        if (!confirmResponse) {
            return;
        }

        const user = await auth.getUser();

        if (user != null) {
            const response = await auth.supabase.from("playlists").delete().eq("id", playlistToOpen.playlistID);
            console.log(response);
            modal.style.display = "none";
        } else {
            data.playlists = data.playlists.filter((playlist) => {
                return playlist.playlistID != playlistToOpen.playlistID;
            });
            modal.style.display = "none";
        }

        loadPlaylistFromDatabase();
        renderPlaylistList();
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
window.onload = async function() {
    await actuallyLoadJSON();
    renderCurrentUser();
};

/**
 * shuffles the modal songs array and then rerenders them
 */
function shuffleSongs() {
    const songlistContainer = document.getElementById("playlistListOfSongs");
    // clears all elements from the song container
    songlistContainer.innerHTML = "";
    shuffleArray(playlistToOpen.songs);
    renderSongList(playlistToOpen, shouldRenderAddSongButtonBoolean);
}

// binds the shuffle songs the suffle songs button
document.getElementById("shuffleSongsList").addEventListener("click", function () {
    shuffleSongs();
});

const addPlaylistButtonCode = `
<li class="playlistItem" id="createNewPlaylistButton">
<img id="addPlaylistImage" class="playlistItemImage" draggable="false"  src="assets/img/plus-solid.svg">
<h2>Create a new playlist</h2>
</li>`;

/**
 * creates the html for the plylists
 */
function renderPlaylistList() {
    playlistsContainer.innerHTML = addPlaylistButtonCode;
    const sortTypeIndex = parseInt(document.getElementById("sortSelecter").value);
    data.playlists.sort(sortingFunctions[sortTypeIndex]);
    console.log(data.playlists);

    let filteredPlaylists = data.playlists;

    //filter by search
    let searchString = document.getElementById("searchBox").value;
    if(searchString != ""){
        filteredPlaylists = filteredPlaylists.filter((playlist)=>{
            return playlist.playlist_name.toLowerCase().includes(searchString.toLowerCase()) || playlist.playlist_creator.toLowerCase().includes(searchString.toLowerCase());

        })
    }

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
    filteredPlaylists.forEach((playlist) => {
        const currentHeartPath = getHeartPath(playlist.liked_users, userID);

        let playlistItem = document.createElement("li"); // Create a <li> element
        playlistItem.innerHTML = `
                <img class="playlistItemImage" src="${encodeHTML(
                    playlist.playlist_art
                )}" alt="playlist Image"></img>
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

async function actuallyLoadJSON() {
    const response = await fetch("/data/data.json");
    data = await response.json();

    if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }
}

/**
 * asyncronly render the playlists
 */
async function playlistJSON() {
    // get the playlist json data from a hosted file
    if (userID != "local") {
        const privacyConfirm = confirm("warning, joining public playlists could expose your email to other users");
        if (!privacyConfirm) {
            return;
        }
        await auth.addUserToPlaylist(1);
        await auth.addUserToPlaylist(2);
        await auth.addUserToPlaylist(3);
        await auth.addUserToPlaylist(4);
        await auth.addUserToPlaylist(5);
        await auth.addUserToPlaylist(6);
        await loadPlaylistFromDatabase();
    } else {
        await actuallyLoadJSON();
    }
    renderPlaylistList();
}

// load the example playlists from json
document.getElementById("loadExampleDataButton").addEventListener("click", () => {
    playlistJSON();
});

async function loadPlaylistFromDatabase() {
    const user = await auth.getUser();
    console.log(user.id);
    const resobj = await auth.supabase.from("playlists").select().contains("user_emails", [user.email]);
    // .eq('user_id', user.id)
    console.log(resobj);
    data = { playlists: [] };
    resobj.data.forEach((dbplaylist) => {
        dbplaylist.playlistData.playlistID = dbplaylist.id;
        dbplaylist.playlistData.created_at = dbplaylist.created_at;
        data.playlists.push(dbplaylist.playlistData);
    });
    console.log(data);
    const sortTypeIndex = parseInt(document.getElementById("sortSelecter").value);
    data.playlists.sort(sortingFunctions[sortTypeIndex]);
    renderCurrentUser();
}

/**
 * uploads the data currenlty stored locally, will not delete anything from postgres ever
 */
async function uploadLocalData(localData) {
    const user = await auth.getUser();
    console.log(user);
    if (user == null) {
        data = localData;
    } else {
        localData.playlists.forEach(async (playlist) => {
            auth.upsertPlaylist(playlist);
        });
    }
}

/**
 * changes the stored data object to like or dislike a playlist and the rerenders it
 *     //TODO: switch to binary search
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
    auth.dbUpdatePlaylist(curPlaylist);

    renderPlaylistList();
}
