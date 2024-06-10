import { Auth } from "./auth.js";

const auth = await Auth.setUpAuth();

/**
 * binds a listner to the the auth state change
 * redirects if the user is loged in
 */
const { stateChange } = auth.supabase.auth.onAuthStateChange((event, session) => {
    console.log(event, session);

    if (event === "INITIAL_SESSION") {
        // handle initial session
    } else if (event === "SIGNED_IN") {
        window.location.href = "/";
    } else if (event === "SIGNED_OUT") {
    } else if (event === "PASSWORD_RECOVERY") {
        // handle password recovery event
    } else if (event === "TOKEN_REFRESHED") {
        // handle token refreshed event
    } else if (event === "USER_UPDATED") {
        // handle user updated event
    }
});

// from https://www.freecodecamp.org/news/how-to-submit-a-form-with-javascript/
let loginForm = document.getElementById("loginForm");
// checks whether the login form is present on the page
if (loginForm != null) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // handle submit
        let email = document.getElementById("email");
        let password = document.getElementById("pass");

        if (email.value == "" || password.value.length < 6) {
            alert("Ensure you input a value in both fields!");
        } else {
            loginForm.style.display = "none";
            document.getElementById("loginLoading").style.display = "block";
            // perform operation with form input
            const { data, error } = await auth.supabase.auth.signInWithPassword({
                email: email.value,
                password: password.value,

            })
            if (error) {
                alert(error);

            }
        }
    });
}
// from https://www.freecodecamp.org/news/how-to-submit-a-form-with-javascript/
let signupForm = document.getElementById("signupForm");
// checks whether the signupForm is present on the page
if (signupForm != null) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // handle submit
        let email = document.getElementById("email");
        let password = document.getElementById("pass");

        if (email.value == "" || password.value.length < 6) {
            alert("Ensure you input a value in both fields!");
        } else {
            signupForm.style.display = "none";
            document.getElementById("signupLoading").style.display = "block";
            // perform operation with form input
            const { data, error } = await auth.supabase.auth.signUp({
                email: email.value,
                password: password.value,

            })
            if (error) {
                alert(error);


            }
            // alert("check your email")
            window.location.href = "/";

        }
    });
}
