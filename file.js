// Inital user value state
let user = null;

// Storing commonly used elements for reference
const elements = {
    // We use getElementById for Id because it is 65% faster in most browsers
    showParty: document.getElementById("show-party"),
    loginBtn: document.getElementById("loginBtn"),
    logoutBtn: document.getElementById("logoutBtn"),
    loginForm: document.getElementById("loginForm"),
    loginModal: document.getElementById("loginModal"),
    partyDeck: document.getElementById("party"),
    // Use querySelector for more advanced lookups for convenience
    emailInput: document.querySelector("#loginForm input[name=email]"),
    passwordInput: document.querySelector("#loginForm input[name=password]")
};

/*
    Register event handlers
*/
elements.showParty.addEventListener("click", handleShowPartyClick);

// Register event handler for the submit action of the login form
elements.loginForm.addEventListener("submit", handleLoginFormSubmit);

// Register event handler for the logout button
elements.logoutBtn.addEventListener("click", signOut);

/*
    End Registering event handlers
*/

/*
    Event handlers
*/
function handleShowPartyClick($event) {
    var btn = $event.currentTarget;
    var innerHtml = btn.innerHTML;
    var newText = innerHtml === "Hide the Party Members" ? "See the Party Members" : "Hide the Party Members";

    btn.innerHTML = newText;
}

function handleLoginFormSubmit($event) {
    // This prevents the forms submit action from reloading the page/calling the form's action
    $event.preventDefault();

    // Getting form values
    var emailInput = elements.emailInput;
    var email = emailInput.value;
    var passwordInput = elements.passwordInput;
    var password = passwordInput.value;

    // Calling function to login with provided values
    signInWithEmailAndPassword(email, password);
}

function signInWithEmailAndPassword(email, password) {
    firebaseSignInWithEmailAndPassword(email, password);
}

function signOut() {
    firebaseSignOut();
}

/*
    End event handlers
*/

function showLoggedOutUi() {
    removeClass(elements.loginBtn, "d-none");
    addClass(elements.logoutBtn, "d-none");
}

function showLoggedInUi() {
    // we have to wrap in jquery selector 
    // so that we can call the bootstrap function modal;
    // jquery needs to be loaded before this will work
    $(elements.loginModal).modal('hide');
    addClass(elements.loginBtn, "d-none");
    removeClass(elements.logoutBtn, "d-none");
}

function buildCharacterCards(users) {
    // Empty out card container so if data is changed we are not
    // creating the same cards/modals again
    elements.partyDeck.innerHTML = "";
    // iterate of the list of users
    users.forEach(function (user) {
        // iterate of each character a user has
        user.characters.forEach(function (character) {
            // build the character card
            buildCharacterCard(character);
            // build the character modal
            buildCharacterModal(character);
        })
    });
}

function buildCharacterCard(character) {
    // Get the character props
    const id = character.id;
    const name = character.name;
    const level = character.level;
    const motto = character.motto;
    const description = character.description;
    const image = character.image;
    const title = character.title;
    const characterClass = character.class;

    // Build the card string
    const cardString =
        '<div class="card">' +
        '<img class="card-img-top" src="' + image + '" alt="' + title + '">' +
        '<div class="card-body text-center">' +
        '<h5>' + name + '</h5>' +
        '<p class="card-text">' + characterClass + '</p>' +
        '<a data-toggle="modal" href="#' + name + 'Modal" class="card-link">Learn about ' + name + '</a>' +
        '</div>' +
        '</div>';

    // Append the new card to the card deck container
    //$("#party.card-deck").append(cardString);

    const nodes = getDomNodesFromString(cardString);
    appendChildrenNodes(elements.partyDeck, nodes);
}

function buildCharacterModal(character) {
    // Get the character props
    const id = character.id;
    const name = character.name;
    const level = character.level;
    const motto = character.motto;
    const description = character.description;
    const image = character.image;
    const title = character.title;
    const characterClass = character.class;

    // Build the modal string
    let modalString =
        '<div class="modal fade" id="' + name + 'Modal" tabindex="-1" role="dialog" aria-labelledby="modalCenterTitle" aria-hidden="true">' +
        '<div class="modal-dialog modal-dialog-centered" role="document">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<h5 class="modal-title">' + title + '</h5>' +
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
        '<span aria-hidden="true">&times;</span>' +
        '</button>' +
        '</div>' +
        '<div class="modal-body">';

    // Loop over each description and add it to the modal string
    description.forEach(function (value) {
        modalString += '<p>' + value + '</p>';
    });

    // Finish building the modal string
    modalString +=
        '<div class="modal-footer">' +
        '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';

    // Attach the modal string to the card deck;
    // We attach it to the card deck because it is a convienent place
    // to attach;
    // When we generate new cards we first empty the card deck so all
    // the modal gets emptied as well
    const nodes = getDomNodesFromString(modalString);
    appendChildrenNodes(elements.partyDeck, nodes);
}

/*
    Helper functions
*/

function getDomNodesFromString(str) {
    const nodes = new DOMParser().parseFromString(str, 'text/html');
    const htmlNode = nodes.childNodes[0];
    const bodyNode = htmlNode.childNodes[1];
    const content = bodyNode.childNodes;
    return content;
}

function appendChildrenNodes(element, arrayOfNodes) {
    arrayOfNodes.forEach(function (node) {
        element.appendChild(node);
    })
}

function addClass(element, className) {
    element.classList.add(className);
}

function removeClass(element, className) {
    element.classList.remove(className);
}

/*
    End helper functions
*/

/*
    Firebase
*/

var config = {
    apiKey: "AIzaSyCrTQ1lP-zuy4qlPzGYY-CDMALbOJnU1Fg",
    authDomain: "gloom-36e1b.firebaseapp.com",
    databaseURL: "https://gloom-36e1b.firebaseio.com",
    projectId: "gloom-36e1b",
    storageBucket: "gloom-36e1b.appspot.com",
    messagingSenderId: "667862872382"
};
firebase.initializeApp(config);

// Gets a reference to our firebase realtime database instance
const database = firebase.database();

// reference to location in database we are going to attach a handler to
var usersRef = firebase.database().ref('users/');

// This is an observable added by firebase
// Here we are registering functions to be called on the 'onAuthStateChanged' event of firebase.auth
// https://firebase.google.com/docs/reference/js/firebase.auth.Auth?authuser=0#onAuthStateChanged
firebase.auth().onAuthStateChanged(onAuthStateChanged);

function firebaseSignInWithEmailAndPassword(email, password) {
    // Firebase sign in with email and password
    // https://firebase.google.com/docs/reference/js/firebase.auth.Auth?authuser=0#isSignInWithEmailLink
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(signInWithEmailAndPasswordSuccessHandler)
        .catch(signInWithEmailAndPasswordErrorHandler);
}

function firebaseSignOut() {
    // Signs the user out
    // https://firebase.google.com/docs/reference/js/firebase.auth.Auth?authuser=0#signOut
    firebase.auth().signOut();
}

// database observer, this will call the handleUserUpdate
// when data is changed/first time it is bound
usersRef.on('value', handleUsersUpdate);

/*
    Firebase event handlers
*/

function onAuthStateChanged(user) {
    // New user value
    // if null then user has logged out
    // this.user is a reference to the global user variable
    this.user = user;
    console.log('User value has changed!', user);
    if (user) {
        // User is signed in.
        // show logged in ui // hide logged out ui
        showLoggedInUi();
    } else {
        // No user is signed in.
        // hide logged in ui / show logged out ui
        showLoggedOutUi();
    }
}

function handleUsersUpdate(snapshot) {
    // snapshot is the object that is returned from firebase
    // calling the .val() method on the snapshot returns the 
    // values from the database as a javascript object

    // .val() is a method added by firebase
    // snapshot.val() returns an object with the properties being the items id
    // we don't want that; we want an array with all the values
    // Object.values() gives us that
    const users = Object.values(snapshot.val());

    // pass the array of users to build the character cards function
    buildCharacterCards(users);
};

function signInWithEmailAndPasswordSuccessHandler(user) {
    // We are letting the onAuthStateChanged event handle the login events
}

function signInWithEmailAndPasswordErrorHandler(error) {
    // Handle login errors here
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log('Failed to log in', error);
    alert(errorMessage);
}

/*
    End firebase event handlers
*/

/*
    End firebase
*/
