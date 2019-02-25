var user = null;
var database = firebase.database();

$(document).ready(function () {
    $(function () {
        $(".btn-primary").click(function () {
            $(this).text(function (i, text) {
                return text === "Hide the Party Members" ? "See the Party Members" : "Hide the Party Members";
            })
        });
    })

    // Register event handler for the submit action of the login form
    $("#loginForm").on('submit', handleLoginFormSubmit)
});


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
        alert('You are logged in to ' + user.email + "!");

        $('#loginModal').modal('hide')

        /* TODO show logged in ui */
    } else {
        // No user is signed in.
        /* TODO hided logged in ui / show logged out ui */
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

var usersRef = firebase.database().ref('users/');
usersRef.on('value', handleUsersUpdate);

function handleUsersUpdate(snapshot) {
    console.log('database snapshot', snapshot.val());
    buildCharacterCards(snapshot.val());

};

function buildCharacterCards(users) {
    $.each(users, function (id, user) {
        $.each(user.characters, function (index, character) {
            console.log(character);
            buildCharacterCard(character);
            buildCharacterModal(character);
        })
    });
}

function buildCharacterCard(character) {
    var id = character.id;
    var name = character.name;
    var level = character.level;
    var motto = character.motto;
    var description = character.description;
    var image = character.image;
    var title = character.title;
    var characterClass = character.class;

    $("#party.card-deck").append(
        '<div class="card">' +
        '<img class="card-img-top" src="' + image + '" alt="' + title + '">' +
        '<div class="card-body text-center">' +
        '<h5>' + name + '</h5>' +
        '<p class="card-text">' + characterClass + '</p>' +
        '<a data-toggle="modal" href="#' + name + 'Modal" class="card-link">Learn about ' + name + '</a>' +
        '</div>' +
        '</div>');
}

function buildCharacterModal(character) {
    var id = character.id;
    var name = character.name;
    var level = character.level;
    var motto = character.motto;
    var description = character.description;
    var image = character.image;
    var title = character.title;
    var characterClass = character.class;

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

    $.each(description, function (index, value) {
        modalString += '<div>' + value + '</div>';
    });

    modalString +=
        '<div class="modal-footer">' +
        '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';

    $("body").append(modalString);
}