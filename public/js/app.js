$(function () {
    refresh();

    $(document).ready(function () {
        $('.modal').modal();
    });

    $("#access").on("click", function (e) {
        e.preventDefault();
        refresh();
    });

    refreshTimer = setInterval(function () {
        refresh();
    }, 10000);

    $("#coinAdded").on("click", function (e) {
        e.preventDefault();
        var coinWatched = {
            coinName: $("#coinName").val().trim(),
            coinPrice: $("#priceAlert").val().trim()
        }
        $.ajax("/api/coinwatched", {
            type: "POST",
            data: coinWatched
        }).done(function (response) {
            window.location.href = "/dashboard";
        })
    })

    $("#login").on("click", function (e) {
        e.preventDefault();

        var existingUser = {
            username: $("#username").val().trim(),
            password: $("#password").val().trim()
        }
        $.ajax("/login", {
            type: "POST",
            data: existingUser
        }).done(function (response) {
            console.log("success");
            window.location.href = "/dashboard";
        })
    })

    $("#create").on("click", function (e) {
        e.preventDefault();

        var firstname = $("#firstname").val().trim();
        var lastname = $("#lastname").val().trim();
        var email = $("#email").val().trim();
        var username = $("#createUsername").val().trim();
        var password = $("#createPassword").val().trim();

        var newUser = {
            username: username,
            password: password,
            firstname: firstname,
            lastname: lastname,
            email: email
        }

        $.ajax("/register", {
            type: 'POST',
            data: newUser
        }).done(function (response) {
            console.log(response);
            $('#modal1').modal("open");
        });
    })

    function refresh() {
        $.ajax("/api/coins", {
            type: "GET"
        }).done(function (response) {
            $("#names").html("");
            $("#prices").html("");
            $("#percent").html("");
            for (var i = 0; i < response.length; i++) {
                $("#percent").append("<p>" + response[i].percent + "</p>");
                $("#names").append("<p>" + response[i].name + "</p>");
                $("#prices").append("<p>" + response[i].price + "</p>");
            }
        })
    }
})