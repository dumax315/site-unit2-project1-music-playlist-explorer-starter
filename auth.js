// In a project with react or webpack (etc) this would be replaced with the supabase npm package
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const isLocal = false;

// filepaths for the heart svg files
const heartNotLiked = "assets/img/heart-regular.svg";
const heartLiked = "assets/img/heart-solid.svg";

// idea for the asyc constructor from https://dev.to/somedood/the-proper-way-to-write-async-constructors-in-javascript-1o8c

export class Auth {
    static async setUpAuth() {
        let supabase;
        if (isLocal) {
            supabase = await createClient(
                "https://mghxvvwddvshdvzkghjb.supabase.co",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1naHh2dndkZHZzaGR2emtnaGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc3MDYxNDYsImV4cCI6MjAzMzI4MjE0Nn0.PGQPVzRRG49OhWdfyNYjptSV0rrw0AyKNmb5BtQaDks"
            );
        } else {
            supabase = await createClient(
                "https://zkjmdhhvcxwjgjsryyow.supabase.co",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpram1kaGh2Y3h3amdqc3J5eW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc2MjAxMjQsImV4cCI6MjAzMzE5NjEyNH0.M3aEkryg17fMtWrC1hKigqovebKhSOz5P4Y1Pd17ug4"
            );
        }
        console.log(supabase);
        return new Auth(supabase);
    }

    constructor(supabase) {
        this.supabase = supabase;
    }

    async getUser() {
        const {
            data: { user },
        } = await this.supabase.auth.getUser();
        return user;
    }

    async signInWithOAuth() {
        const { responsedata, error } = await this.supabase.auth.signInWithOAuth({
            provider: "github",
        });
    }

    async signOut() {
        const { error } = await this.supabase.auth.signOut();
        console.log(error);
    }

    /**
     * updates 1 playlist currenlty stored locally
     */
    async dbUpdatePlaylist(freshPlaylistData) {
        const user = await this.getUser();
        console.log(user);
        const { returndata, error } = await this.supabase
            .from("playlists")
            .update({ playlistData: freshPlaylistData })
            .eq("id", freshPlaylistData.playlistID);
        console.log(returndata, error);
    }

    /**
     * add user to user_emails array
     * @param {number} playlistID
     */
    async addUserToPlaylist(playlistID, userEmailtoAdd = null) {
        if (userEmailtoAdd == null) {
            const user = await this.getUser();
            userEmailtoAdd = user.email;
        }

        const resobj = await this.supabase.from("playlists").select().eq("id", playlistID);
        // .eq('user_id', user.id)
        if (resobj.data[0].user_emails.indexOf(userEmailtoAdd) != -1) {
            console.log("email already present");
            return;
        }
        resobj.data[0].user_emails.push(userEmailtoAdd);
        console.log(resobj.data[0].user_emails);

        // const { returndata, error } = await auth.supabase.from('playlists').select().eq('id', playlistID)
        // console.log(returndata, error)

        const { returndata2, error2 } = await this.supabase
            .from("playlists")
            .update({ user_emails: resobj.data[0].user_emails })
            .select()
            .eq("id", playlistID);
        console.log(returndata2, error2);
    }

    async upsertPlaylist(playlist) {
        const user = await this.getUser();
        if (playlist.liked_users.indexOf("local") != -1) {
            playlist.liked_users = [];
            playlist.liked_users.push(user.id);
        }
        const { returndata, error } = await this.supabase
            .from("playlists")
            .upsert({ playlistData: playlist, user_emails: [user.email] })
            .select();
        console.log(returndata, error);
    }

    /**
     * Seaches the given liked users list and returns a image path with a full heart if the signed in user is present in the list
     * otherwise returns a path to a outline svg of a heart
     * @param {Array} likedUsersArray
     * @returns {String}
     */
    getHeartPath(likedUsersArray, userID = "local") {
        for (let i = 0; i < likedUsersArray.length; i++) {
            if (likedUsersArray[i] == userID) {
                return heartLiked;
            }
        }
        return heartNotLiked;
    }

    // a simple frontend sanitizer
    // found at https://stackoverflow.com/questions/2794137/sanitizing-user-input-before-adding-it-to-the-dom-in-javascript
    encodeHTML(s) {
        return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    }
}
// sorting functions
function numberOfLikesCompare(playlist1, playlist2) {
    return playlist2.liked_users.length - playlist1.liked_users.length;
}

function numberOfLikesCompareReverse(playlist1, playlist2) {
    return playlist1.liked_users.length - playlist2.liked_users.length;
}

function alphaSort(str1, str2){
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

function alphaSortName(playlist1, playlist2) {
    return alphaSort(playlist1.playlist_name, playlist2.playlist_name);

}

function alphaSortNameReverse(playlist1, playlist2) {
    return alphaSort(playlist2.playlist_name, playlist1.playlist_name);
}

// modified from https://stackoverflow.com/questions/7555025/fastest-way-to-sort-an-array-by-timestamp
function dateSort(playlist1, playlist2) {
    if (playlist1.created_at == undefined || playlist2.created_at == undefined) {
        return 0;
    }
    return new Date(playlist1.created_at) > new Date(playlist2.created_at) ? 1 : -1;
}

function dateSortReverse(playlist2, playlist1) {
    return dateSort(playlist1, playlist2)
}

function alphaSortCreator(playlist1, playlist2) {
    return alphaSort(playlist1.playlist_creator, playlist2.playlist_creator);

}

function alphaSortCreatorReverse(playlist1, playlist2) {
    return alphaSort(playlist2.playlist_creator, playlist1.playlist_creator);
}

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