import { Auth } from "./auth.js";
import { sortingFunctions, getHeartPath, populateModalData, renderSongList, encodeHTML, clearEventListeners } from "./utils.js";


const auth = await Auth.setUpAuth();

let data = { playlists: [] };

// -1 indicates unset, it is a global varible so that rerenders caused by liking the playlist wont change the featured playlist
let idOfFeaturedPlaylist = -1;


document.getElementById("sortSelecter").addEventListener("change", (event) => {
    // alert("ASDFasdfasdfafdadf")
    renderFeaturedPlaylistList();
});

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

    data = { playlists: [] };

    resobj.data.forEach((dbplaylist) => {
        dbplaylist.playlistData.playlistID = dbplaylist.id;
        data.playlists.push(dbplaylist.playlistData);
    });

    // Render the featchered playlist

    // if the featured playlist is unset, set it to a random playlist's playlistID (Not the array index)
    // by setting to a playlistID and not an array index the sorting no longer effects which playlist is referenced
    if(idOfFeaturedPlaylist == -1){
        idOfFeaturedPlaylist = data.playlists[Math.floor(Math.random() * data.playlists.length)].playlistID;
    }
    const featuredPlaylistObject = getPlaylistByID(idOfFeaturedPlaylist);
    document.getElementById("randomFeaturedPlaylistImage").src = featuredPlaylistObject.playlist_art;
    document.getElementById("randomFeaturedPlaylistTitle").innerText = featuredPlaylistObject.playlist_name;
    document.getElementById("randomFeaturedPlaylistCreator").innerText = featuredPlaylistObject.playlist_creator;
    document.getElementById("randomFeaturedPlaylistLikesCount").innerText = featuredPlaylistObject.liked_users.length;
    const randomFeaturedHeartPath = getHeartPath(featuredPlaylistObject.liked_users, user.email);
    document.getElementById("randomFeaturedPlaylistItemHeart").src = randomFeaturedHeartPath;

    clearEventListeners(document.getElementById("randomFeaturedPlaylistLikeContainer"));

    document.getElementById("randomFeaturedPlaylistLikeContainer").addEventListener("click", function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        likePlaylist(idOfFeaturedPlaylist);
    });

    // "randomFeaturedSongsContainer"
    renderRandomSongList(featuredPlaylistObject);

    const sortTypeIndex = parseInt(document.getElementById("sortSelecter").value);
    data.playlists.sort(sortingFunctions[sortTypeIndex]);


    playlistsContainer.innerHTML = "";
    // rendering the playlists
    data.playlists.forEach((playlist) => {
        const currentHeartPath = getHeartPath(playlist.liked_users, user.email);

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
        playlistItem.classList.add("featuredPlaylistItem");
        playlistsContainer.appendChild(playlistItem); // Add <li> to the <ul>
        playlistItem.addEventListener("click", function () {
            openModal(playlist);
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
    // const resobj = await this.supabase.from("playlists").select().eq("id", playlistID);
    // console.log(resobj)
    // alert(resobj)
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

var modal = document.getElementById("playlistModal");

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
 * renders the song list into the modal
 * @param {object} playlistToOpen
 */
function renderRandomSongList(playlistToOpen) {
    const songlistContainer = document.getElementById("randomFeaturedSongsContainer");
    songlistContainer.innerHTML = "";

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
    if(playlistToOpen.songs.length == 0){
        songlistContainer.innerText = "This playlist has no songs yet"
    }
}

/**
 * First updates the data inside the hidden modal to a given playlist
 * then displays the modal
 * @param {object} playlistIDToGet
 */
async function openModal(playlistToOpen) {
    let user = await auth.getUser();
    if(user == null){
        user = {
            email:null
        }
    }

    populateModalData(playlistToOpen, user.email);

    renderSongList(playlistToOpen);

    document.getElementById("playlistModalLikesContainer").addEventListener("click", async function () {
        await likePlaylist(playlistToOpen.playlistID);
        // alert();
        // gets a fresh copy of the playlist obj
        openModal(getPlaylistByID(playlistToOpen.playlistID));
    });

    // Joining public playlists is unique to the featured page
    if(user.email != null){
        const joinPublicPlaylistButton = document.getElementById("joinPublicPlaylistButton");
        joinPublicPlaylistButton.style.display = "block";
        joinPublicPlaylistButton.addEventListener("click", function () {
            auth.addUserToPlaylist(playlistToOpen.playlistID, user.email)
        });
    }

    modal.style.display = "block";
}



renderCurrentUser()
