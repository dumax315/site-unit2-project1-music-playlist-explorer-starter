// This file provides funtionality helpful to multiply website pages



// sorting comparison functions
/**
 * Compares playlists by the number of likes they have
 * @param {object} playlist1
 * @param {object} playlist2
 * @returns {number} comparison result
 */
function numberOfLikesCompare(playlist1, playlist2) {
    return playlist2.liked_users.length - playlist1.liked_users.length;
}

/**
 * Compares playlists by the number of likes they have in reverse order
 * @param {object} playlist1
 * @param {object} playlist2
 * @returns {number} comparison result
 */
function numberOfLikesCompareReverse(playlist1, playlist2) {
    return playlist1.liked_users.length - playlist2.liked_users.length;
}

/**
 * Compares strings alphabetcially
 * @param {string} str1
 * @param {string} str2
 * @returns {number} comparison result
 */
function alphaSort(str1, str2) {
    // alert(str1 +" vs " + str2);
    // alert(str1<str2)
    // return playlist1.playlist_name.localeCompare(playlist2.playlist_name)
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
    if (str1 < str2) {
        return -1;
    }
    if (str1 > str2) {
        return 1;
    }
    return 0;
}

/**
 * Compares playlists by the name of the playlist using alphaSort()
 * @param {object} playlist1
 * @param {object} playlist2
 * @returns comparison result
 */
function alphaSortName(playlist1, playlist2) {
    return alphaSort(playlist1.playlist_name, playlist2.playlist_name);

}

/**
 * Compares playlists by the name of the playlist using alphaSort() in reverse order
 * @param {object} playlist1
 * @param {object} playlist2
 * @returns comparison result
 */
function alphaSortNameReverse(playlist1, playlist2) {
    return alphaSort(playlist2.playlist_name, playlist1.playlist_name);
}

/**
 * Compares playlists by their timestamp
 * modified from https://stackoverflow.com/questions/7555025/fastest-way-to-sort-an-array-by-timestamp
 * @param {object} playlist1
 * @param {object} playlist2
 * @returns comparison result
 */
function dateSort(playlist1, playlist2) {
    if (playlist1.created_at == undefined || playlist2.created_at == undefined) {
        return 0;
    }
    return new Date(playlist1.created_at) > new Date(playlist2.created_at) ? 1 : -1;
}

/**
 * Compares playlists by their timestamp in reverse order
 * modified from https://stackoverflow.com/questions/7555025/fastest-way-to-sort-an-array-by-timestamp
 * @param {object} playlist1
 * @param {object} playlist2
 * @returns comparison result
 */
function dateSortReverse(playlist2, playlist1) {
    return dateSort(playlist1, playlist2)
}

/**
 * Compares playlists by the playlist creater's name alphaSort()
 * modified from https://stackoverflow.com/questions/7555025/fastest-way-to-sort-an-array-by-timestamp
 * @param {object} playlist1
 * @param {object} playlist2
 * @returns comparison result
 */
function alphaSortCreator(playlist1, playlist2) {
    return alphaSort(playlist1.playlist_creator, playlist2.playlist_creator);

}

/**
 * Compares playlists by the playlist creater's name alphaSort() in reverse order
 * modified from https://stackoverflow.com/questions/7555025/fastest-way-to-sort-an-array-by-timestamp
 * @param {object} playlist1
 * @param {object} playlist2
 * @returns comparison result
 */
function alphaSortCreatorReverse(playlist1, playlist2) {
    return alphaSort(playlist2.playlist_creator, playlist1.playlist_creator);
}

// An array of all the sort comparsion functions
// A specific comparision function is indexed into based on the state of a dropdown menu in the UI
export const sortingFunctions = [
    numberOfLikesCompare,
    numberOfLikesCompareReverse,
    alphaSortName,
    alphaSortNameReverse,
    dateSort,
    dateSortReverse,
    alphaSortCreator,
    alphaSortCreatorReverse
];

/**
 * Populates info from a given playlist into the playlist modal
 * @param {object} playlist
 * @param {string} user_email   Used to determine if the user has liked the playlist
 */
export function populateModalData(playlist, user_email) {
    document.getElementById("playlistModalName").innerText = playlist.playlist_name;
    document.getElementById("playlistModalImage").src = playlist.playlist_art;
    document.getElementById("playlistModalCreatorName").innerText = playlist.playlist_creator;
    document.getElementById("playlistModalLikesCount").innerText = playlist.liked_users.length;

    const currentHeartPath = getHeartPath(playlist.liked_users, user_email);
    // alert(currentHeartPath)
    const heartModalElement = document.getElementById("playlistModalHeart");
    heartModalElement.src = currentHeartPath;

    // Removes the old event listeners by cloning the element
    // https://stackoverflow.com/questions/9251837/how-to-remove-all-listeners-in-an-element
    let old_element = document.getElementById("playlistModalLikesContainer");
    let new_element = old_element.cloneNode(true);
    old_element.parentNode.replaceChild(new_element, old_element);
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
export function getHeartPath(likedUsersArray, userID = "local") {
    for (let i = 0; i < likedUsersArray.length; i++) {
        if (likedUsersArray[i] == userID) {
            return heartLiked;
        }
    }
    return heartNotLiked;
}
