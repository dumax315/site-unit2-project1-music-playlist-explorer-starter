import { Auth } from "./auth.js";

const auth = await Auth.setUpAuth();

let data = { playlists: [] };

/**
 * creates the html for the plylists
 */
async function renderFeaturedPlaylistList() {
    let user = await auth.getUser();
    if(user == null){
        user = {
            email:null
        }
    }

    const resobj = await auth.supabase.from("playlists").select().eq("public", true);
    console.log(resobj);

    const playlistsContainer = document.getElementById("featuredPlaylistsContainer");

    // // the first item in the grids opens the create playlist <dialog> modally
    // // This is in reference to // add playlist code
    // document.getElementById("createNewPlaylistButton").addEventListener("click", () => {
    //     if (typeof createPlaylistModal.showModal === "function") {
    //         createPlaylistModal.showModal();
    //     } else {
    //         outputBox.value = "Sorry, the dialog API is not supported by this browser.";
    //     }
    // });
    data = { playlists: [] };

    resobj.data.forEach((dbplaylist) => {
        dbplaylist.playlistData.playlistID = dbplaylist.id;
        data.playlists.push(dbplaylist.playlistData);
    });

    playlistsContainer.innerHTML = "";
    // rendering the playlists
    data.playlists.forEach((playlist) => {
        const currentHeartPath = auth.getHeartPath(playlist.liked_users, user.email);

        let playlistItem = document.createElement("li"); // Create a <li> element
        playlistItem.innerHTML = `
                    <img class="playlistItemImage" src="${auth.encodeHTML(
                        playlist.playlist_art
                    )}" alt="playlist Image"></img>
                    <h3 class="playlistItemTitle">${auth.encodeHTML(playlist.playlist_name)}</h3>
                    <p class="playlistItemCreatorName">${auth.encodeHTML(playlist.playlist_creator)}</p>
                    <div id="${"LikesContainerID" + playlist.playlistID}" class="playlistItemLikesContainer">
                        <img class="playlistItemHeart" src="${currentHeartPath}" >
                        <div class="playlistItemLikesCount">${playlist.liked_users.length}</div>
                    </div>
            `; // Set the item's name
        playlistItem.classList.add("playlistItem");
        playlistItem.classList.add("featuredPlaylistItem");
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
 * TODO find a way for this to not be a copy from script.js
 * changes the stored data object to like or dislike a playlist and the rerenders it
 * @param {number} playlistID
 */
async function likePlaylist(playlistID) {
    const user = await auth.getUser();
    if (user == null) {
        alert("log in to like public playlists");
        return;
    }
    let curPlaylist = getPlaylistByID(playlistID);
    if (curPlaylist.liked_users.indexOf(user.email) == -1) {
        curPlaylist.liked_users.push(user.email);
        console.log(curPlaylist);
    } else {
        curPlaylist.liked_users = curPlaylist.liked_users.filter((itemuserID) => {
            return itemuserID != user.email;
        });
    }
    console.log(data);
    await auth.dbUpdatePlaylist(curPlaylist);
    renderFeaturedPlaylistList();
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

const { stateChange } = auth.supabase.auth.onAuthStateChange(async (event, session) => {
    console.log(event, session);

    if (event === "SIGNED_IN") {
        // handle sign in event
        // const user = await supabase.auth.getUser();
        // Ask to recover data
        renderCurrentUser();
    } else if (event === "SIGNED_OUT") {
        // handle sign out event
        data = { playlists: [] };
        renderCurrentUser();
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
    } else {
        document.getElementById("notLogedIn").style.display = "none";
        document.getElementById("logedIn").style.display = "unset";
        document.getElementById("username").innerText = user.email;

        // playlistFromDatabase();
    }
    renderFeaturedPlaylistList();
}

/**
 * Signs out the current auth user, doesn't redirect
 */
async function signOut() {
    auth.signOut();
    renderCurrentUser();
}

//binding the signout and signin buttons to elements in the header
//TODO style elements
document.getElementById("githubSignUp").addEventListener("click", () => {
    auth.signInWithOAuth();
});
document.getElementById("signOut").addEventListener("click", () => {
    signOut();
});


renderCurrentUser()