
function createApp() {
    return {
        // Inital user value state
        user: null,

        init () {
            this.firebaseInit();
            this.registerEventListeners();

            return this;
        },

        destroy () {
            this.unregisterEventListeners();
        },

        // Storing commonly used elements for reference
        elements: {
            // Use getElementById for elements with IDs because it is 65% faster in some browsers
            showParty: document.getElementById("show-party"),
            loginBtn: document.getElementById("loginBtn"),
            logoutBtn: document.getElementById("logoutBtn"),
            loginForm: document.getElementById("loginForm"),
            loginModal: document.getElementById("loginModal"),
            partyDeck: document.getElementById("party"),
            // Use querySelector on more advanced lookups for convenience
            emailInput: document.querySelector("#loginForm input[name=email]"),
            passwordInput: document.querySelector("#loginForm input[name=password]")
        },
        /*
            Register event handlers
        */
        registerEventListeners () {
            this.elements.showParty.addEventListener("click", this.handleShowPartyClick);

            // Register event handler for the submit action of the login form
            this.elements.loginForm.addEventListener("submit", this.handleLoginFormSubmit);

            // Register event handler for the logout button
            this.elements.logoutBtn.addEventListener("click", this.signOut);
        },
        unregisterEventListeners () {
            this.elements.showParty.removeEventListener("click", this.handleShowPartyClick);

            // Register event handler for the submit action of the login form
            this.elements.loginForm.removeEventListener("submit", this.handleLoginFormSubmit);

            // Register event handler for the logout button
            this.elements.logoutBtn.removeEventListener("click", this.signOut);
        },
        /*
            End Registering event handlers
        */
        /*
            Event handlers
        */
        handleShowPartyClick (event) {
            var btn = event.currentTarget;
            var innerHtml = btn.innerHTML;
            var newText = innerHtml === "Hide the Party Members" ? "See the Party Members" : "Hide the Party Members";

            btn.innerHTML = newText;
        },
        handleLoginFormSubmit (event) {
            // This prevents the forms submit action from reloading the page/calling the form's action
            event.preventDefault();

            // Getting form values
            var emailInput = this.elements.emailInput;
            var email = emailInput.value;
            var passwordInput = this.elements.passwordInput;
            var password = passwordInput.value;

            // Calling function to login with provided values
            this.signInWithEmailAndPassword(email, password);
        },
        signInWithEmailAndPassword (email, password) {
            this.firebaseSignInWithEmailAndPassword(email, password);
        },
        signOut () {
            this.firebaseSignOut();
        },

        /*
            End event handlers
        */

        showLoggedOutUi () {
            this.removeClass(this.elements.loginBtn, "d-none");
            this.addClass(this.elements.logoutBtn, "d-none");
        },

        showLoggedInUi () {
            // we have to wrap in jquery selector 
            // so that we can call the bootstrap function modal;
            // jquery needs to be loaded before this will work
            $(this.elements.loginModal).modal('hide');
            this.addClass(this.elements.loginBtn, "d-none");
            this.removeClass(this.elements.logoutBtn, "d-none");
        },
        buildCharacterCards(users) {
            // Empty out card container so if data is changed we are not
            // creating the same cards/modals again
            this.elements.partyDeck.innerHTML = "";
            // iterate over the list of users
            users.forEach((user) => {
                // iterate over each character a user has
                user.characters.forEach((character) => {
                    // build the character card
                    this.buildCharacterCard(character);
                    // build the character modal
                    this.buildCharacterModal(character);
                })
            });
        },
        buildCharacterCard(character) {
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
            this.appendToElement(this.elements.partyDeck, cardString);
        },
        buildCharacterModal (character) {
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

            // iterate over the descriptions and add it to the modal string
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
            // the modals gets emptied as well
            this.appendToElement(this.elements.partyDeck, modalString);
        },

        /*
            Helper functions
        */

        appendToElement (element, str) {
            const nodes = this.getDomNodesFromString(str);
            this.appendChildrenNodes(element, nodes);
        },

        getDomNodesFromString (str) {
            const nodes = new DOMParser().parseFromString(str, 'text/html');
            const htmlNode = nodes.childNodes[0];
            const bodyNode = htmlNode.childNodes[1];
            const content = bodyNode.childNodes;
            return content;
        },

        appendChildrenNodes(element, arrayOfNodes) {
            arrayOfNodes.forEach(function (node) {
                element.appendChild(node);
            })
        },

        addClass(element, className) {
            element.classList.add(className);
        },

        removeClass(element, className) {
            element.classList.remove(className);
        },

        /*
            End helper functions
        */

        /*
            Firebase
        */
        database: null,
        usersRef: null,
        firebaseInit () {
            config = {
                apiKey: "AIzaSyCrTQ1lP-zuy4qlPzGYY-CDMALbOJnU1Fg",
                authDomain: "gloom-36e1b.firebaseapp.com",
                databaseURL: "https://gloom-36e1b.firebaseio.com",
                projectId: "gloom-36e1b",
                storageBucket: "gloom-36e1b.appspot.com",
                messagingSenderId: "667862872382"
            };
            firebase.initializeApp(config);
            // Gets a reference to our firebase realtime database instance
            this.database = firebase.database();
            // reference to location in database we are going to attach a handler to
            this.usersRef = this.database.ref('users/');

            // This is an observable added by firebase
            // Here we are registering functions to be called on the 'onAuthStateChanged' event of firebase.auth
            // https://firebase.google.com/docs/reference/js/firebase.auth.Auth?authuser=0#onAuthStateChanged
            firebase.auth().onAuthStateChanged((user) => this.onAuthStateChanged(user));
            // database observer, this will call the handleUserUpdate
            // when data is changed/first time it is bound
            this.usersRef.on('value', (event) => this.handleUsersUpdate(event));
        },
        firebaseSignInWithEmailAndPassword(email, password) {
            // Firebase sign in with email and password
            // https://firebase.google.com/docs/reference/js/firebase.auth.Auth?authuser=0#isSignInWithEmailLink
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((user) => this.signInWithEmailAndPasswordSuccessHandler(user))
                .catch((error) => this.signInWithEmailAndPasswordErrorHandler(error));
        },
        firebaseSignOut() {
            // Signs the user out
            // https://firebase.google.com/docs/reference/js/firebase.auth.Auth?authuser=0#signOut
            firebase.auth().signOut();
        },
        /*
            Firebase event handlers
        */
        onAuthStateChanged(user) {
            // New user value
            // if null then user has logged out
            // this.user is a reference to the global user variable
            this.user = user;
            console.log('User value has changed!', user);
            if (user) {
                // User is signed in.
                // show logged in ui // hide logged out ui
                this.showLoggedInUi();
            } else {
                // No user is signed in.
                // hide logged in ui / show logged out ui
                this.showLoggedOutUi();
            }
        },
        handleUsersUpdate(snapshot) {
            // snapshot is the object that is returned from firebase
            // calling the .val() method on the snapshot returns the 
            // values from the database as a javascript object

            // .val() is a method added by firebase
            // snapshot.val() returns an object with the properties being the items id
            // we don't want that; we want an array with all the values
            // Object.values() gives us that
            const users = Object.values(snapshot.val());

            // pass the array of users to build the character cards function
            this.buildCharacterCards(users);
        },
        signInWithEmailAndPasswordSuccessHandler(user) {
            // We are letting the onAuthStateChanged event handle the login events
        },
        signInWithEmailAndPasswordErrorHandler(error) {
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
    }
    
}

const app = createApp().init();
