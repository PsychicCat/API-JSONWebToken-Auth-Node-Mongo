var $loginForm;
var $testDiv;
var $registerForm;
var $user;
var $error;
var $content;
var $logout;
var $networking;

$(document).ready(function () {

    $loginForm = $('#login');
    $testDiv = $('#test');
    $registerForm = $('#register');
    $error = $('#error');
    $content = $('#content');
    $logout = $('#logout');
    $user = $('#user');
    $networking = $('#networking');
    $events = $('#events');
    $ul = $('<ul>');

    $networking.hide();

    $networking.on('submit', function(e){
        e.preventDefault();
        var data = $(this).serializeArray();

        $.ajax({
            method: 'POST',
            url: '/api/test',
            data: data,
        }).done(function (data, textStatus, jqXHR) {

           console.log("hello");
            getEvents();

        }).fail(function (jqXHR, textStatus, errorThrown) {

            // on a failure, put that in the content area
            $content.text(jqXHR.responseText);

        }).always(function () {
            console.log("complete");
        });
    });

    setupAjax();

    bindEvents();

    showUser();

});

function showUser() {
    if (localStorage.getItem('userProfile')) {
        var user = JSON.parse(localStorage.getItem('userProfile'));
        $loginForm.hide();
        $networking.show();
        getEvents();
        $content.text('');
    }
}

function hideUser() {
    if (localStorage.getItem('userToken')) {
        localStorage.removeItem('userToken');
    }

    if (localStorage.getItem('userProfile')) {
        localStorage.removeItem('userProfile');
    }
    $loginForm.show();
    $networking.hide();
    $events.empty();
    $user.text('');
    $content.text('');
}

function getEvents(){
    $.ajax({
        method: 'GET',
        url:'/api/test/events'
    }).done(function (data, textStatus, jqXHR) {
        var events = data[0].events;

        events.forEach(function(elem){
            var $ul = $('<ul>');
            var $newLidate = $('<li>').text("Date: " + elem.date);
            var $newLidescription = $('<li>').text("Description: " + elem.description);
            var $newLilocation = $('<li>').text("Location: " + elem.location);
            var $newLitime = $('<li>').text("Time: " + elem.time);
            var $newLititle = $('<li>').text("Title: " + elem.title);

            $ul.append($newLititle, $newLidate, $newLidescription, $newLilocation, $newLitime);
            $('#events').append($ul);

        });



    }).fail(function (jqXHR, textStatus, errorThrown) {

        // on a failure, put that in the content area
        $content.text(jqXHR.responseText);

    }).always(function () {
        console.log("complete");
    });
}

function setupAjax() {
    $.ajaxSetup({
        'beforeSend': function (xhr) {
            if (localStorage.getItem('userToken')) {
                xhr.setRequestHeader('Authorization',
                    'Bearer ' + localStorage.getItem('userToken'));
            }
        }
    });
}

function bindEvents() {

    // set up the API test
    $testDiv.on('click', function (e) {
        $.ajax('/api/test', {
            method: 'get'
        }).done(function (data, textStatus, jqXHR) {

            // on a success, put the secret into content area
            $content.text(data);

        }).fail(function (jqXHR, textStatus, errorThrown) {

            // on a failure, put that in the content area
            $content.text(jqXHR.responseText);

        }).always(function () {
            console.log("complete");
        });
    });

    // set up login
    $loginForm.on('submit', function (e) {
        // stop the form from submitting, since we're using ajax
        e.preventDefault();

        // get the data from the inputs
        var data = $(this).serializeArray();

        // go authenticate
        $.ajax('/authenticate', {
            method: 'post',
            data: data
        }).done(function (data, textStatus, jqXHR) {

            // Save the JWT token
            localStorage.setItem('userToken', data.token);
            // Set the user
            localStorage.setItem('userProfile', JSON.stringify(data.user));

            // clear form
            $loginForm[0].reset();

            showUser();
            setupAjax();

        }).fail(function (jqXHR, textStatus, errorThrown) {
            $error.text(jqXHR.responseText);
        }).always(function () {
            console.log("complete");
        });
    });

    // set up register
    $registerForm.on('submit', function (e) {
        // stop the form from submitting, since we're using ajax
        e.preventDefault();

        // get the data from the inputs
        var data = $(this).serializeArray();

        // go authenticate
        $.ajax('/register', {
            method: 'post',
            data: data
        }).done(function (data, textStatus, jqXHR) {

            //redirect back home, so that they can log in
            window.location.replace('/');

        }).fail(function (jqXHR, textStatus, errorThrown) {

            // show the user the error
            $error.text(jqXHR.responseText);

        }).always(function () {
            console.log("complete");
        });
    });

    $logout.on('click', function () {
        hideUser();
    })
}