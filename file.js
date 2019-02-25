// Inital user value state
var user = null;
// Gets a reference to our firebase realtime database instance
var database = firebase.database();

$(document).ready(function () {
    $(".btn-primary").click(function () {
        $(this).text(function (i, text) {
            return text === "Hide the Party Members" ? "See the Party Members" : "Hide the Party Members";
        })
    });

    // Register event handler for the submit action of the login form
    $("#loginForm").on('submit', handleLoginFormSubmit);

    // Register event handler for the logout button
    $("#logoutBtn").on('click', signOut);
});

function showLoggedOutUi() {
    $("#loginBtn").removeClass("d-none");
    $("#logoutBtn").addClass("d-none");
}

function showLoggedInUi() {
    $("#loginBtn").addClass("d-none");
    $("#logoutBtn").removeClass("d-none");
}


// This is an observable added by firebase
// Here we are registering functions to be called on the 'onAuthStateChanged' event of firebase.auth
// https://firebase.google.com/docs/reference/js/firebase.auth.Auth?authuser=0#onAuthStateChanged
firebase.auth().onAuthStateChanged(function (user) {
    // New user value
    // if null then user has logged out
    this.user = user;
    console.log('User value has changed!', user);
    if (user) {
        // User is signed in.
        //alert('You are logged in to ' + user.email + "!");

        $('#loginModal').modal('hide')

        // show logged in ui // hide logged out ui
        showLoggedInUi();
    } else {
        // No user is signed in.
        // hide logged in ui / show logged out ui
        showLoggedOutUi();
    }
});

function handleLoginFormSubmit($event) {
    // This prevents the forms submit action from reloading the page/calling the action
    $event.preventDefault();

    // Getting form values
    var emailInput = $("#loginForm input[name=email]");
    var email = emailInput.val();
    var passwordInput = $("#loginForm input[name=password]");
    var password = passwordInput.val();

    // Calling function to login with provided values
    signInWithEmailAndPassword(email, password);
}

function signInWithEmailAndPassword(email, password) {
    // Firebase sign in with email and password
    // https://firebase.google.com/docs/reference/js/firebase.auth.Auth?authuser=0#isSignInWithEmailLink
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function (user) {
            // logged in
            // Here we could handle any logic we need with the new user value that is returned
            // Instead we are letting the event handler we registered for firebase's 'onAuthStateChanged' to handle it
        })
        .catch(function (error) {
            // Handle login errors here
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log('Failed to log in', error);
            alert(errorMessage);
        });
}

function signOut() {
    // Signs the user out
    // https://firebase.google.com/docs/reference/js/firebase.auth.Auth?authuser=0#signOut
    firebase.auth().signOut();
}

// place is database we plan to attach a observer too
var usersRef = firebase.database().ref('users/');

// database observer, this will call the handleUserUpdate
// when data is changed/first time it is bound
usersRef.on('value', handleUsersUpdate);

function handleUsersUpdate(snapshot) {
    // snapshot is the object that is returned from firebase
    // calling the .val() method on the snapshot returns the 
    // values from the database as a javascript object
    var users = snapshot.val();

    // pass the array of users to build the character cards function
    buildCharacterCards(users);
};

function buildCharacterCards(users) {
    // Empty out card container so if data is changed we are not
    // creating the same cards/modals again
    $("#party.card-deck").empty();
    // iterate of the list of users
    $.each(users, function (id, user) {
        // iterate of each character a user has
        $.each(user.characters, function (index, character) {
            // build the character card
            buildCharacterCard(character);
            // build the character modal
            buildCharacterModal(character);
        })
    });
}

function buildCharacterCard(character) {
    // Get the character props
    var id = character.id;
    var name = character.name;
    var level = character.level;
    var motto = character.motto;
    var description = character.description;
    var image = character.image;
    var title = character.title;
    var characterClass = character.class;

    // Build the card string
    var cardString =
        '<div class="card">' +
        '<img class="card-img-top" src="' + image + '" alt="' + title + '">' +
        '<div class="card-body text-center">' +
        '<h5>' + name + '</h5>' +
        '<p class="card-text">' + characterClass + '</p>' +
        '<a data-toggle="modal" href="#' + name + 'Modal" class="card-link">Learn about ' + name + '</a>' +
        '</div>' +
        '</div>';

    // Append the new card to the card deck container
    $("#party.card-deck").append(cardString);
}

function buildCharacterModal(character) {
    // Get the character props
    var id = character.id;
    var name = character.name;
    var level = character.level;
    var motto = character.motto;
    var description = character.description;
    var image = character.image;
    var title = character.title;
    var characterClass = character.class;

    // Build the modal string
    var modalString =
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
    $.each(description, function (index, value) {
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
    $("#party.card-deck").append(modalString);
}