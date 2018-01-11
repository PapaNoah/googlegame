function addPlayer() {
    var list = $('#player-list');
    var listEntry = $(document.createElement('li'));
    listEntry.addClass('list-group-item');
    list.data('num', list.data('num') + 1);
    listEntry.attr("id", "player-id-" + list.data('num'));
    var inputGroup = $(document.createElement('div'));
    inputGroup.addClass("input-group");
    var icon = $(document.createElement('i'))
    icon.addClass("fa fa-user");
    icon.attr("aria-hidden", "true");
    var playerTitle = $(document.createElement('span'));
    playerTitle.addClass("input-group-addon");
    playerTitle.append(icon);
    playerTitle.append('&nbsp;Spieler ' + list.data('num'));
    var playerInput = $(document.createElement('input'));
    playerInput.attr('type', 'text');
    playerInput.attr('placeholder', 'Spielername');
    playerInput.attr('name', 'players');
    playerInput.addClass('form-control mousetrap');
    inputGroup.append(playerTitle);
    inputGroup.append(playerInput);
    listEntry.append(inputGroup);
    list.append(listEntry);
    playerInput.focus();
}
Mousetrap.bind('alt+o', addPlayer);
Mousetrap.bind('alt+p', function(e, combo) {
    $('#game-form').trigger("submit");
});
Mousetrap.bind('alt+m', function(e, combo) {
    $('#new-button')[0].click();
});
Mousetrap.bind('alt+n', function(e, combo) {
    $('#home-button')[0].click();
});
Mousetrap.bind('alt+j', function(e, combo) {
    $('#eval-button').trigger("click");
});

Mousetrap.bind('alt+r', function(e, combo) {
    $('#base-button').trigger("click");
});

Mousetrap.bind('alt+t', fillAllWithBase);

Mousetrap.bind('alt+1', shoeOn);
Mousetrap.bind('alt+2', ticketOn);
Mousetrap.bind('alt+3', buchklubOn);
Mousetrap.bind('alt+,', reset);

function searchGoogle(element) {
    var input = $(element).parent().prev();
    window.open("https://www.google.de/search?q="+input.val()+"&nfpr=1")
    $.ajax({
        url: '/api/search',
        type: "get",
        dataType: "html",
        success: function (data) {
            $('#'+$(element).data("player")+'-hits').val(data);
        },
        data: {
            word: input.val()
        }
    });
}
function editHits(element) {
    var input = $(element).parent().prev();
    input.prop("disabled", !input.prop("disabled"));
}

function nextRound() {
    var row = $(document.createElement('tr'));
    var round = parseInt($("#round").data("round"));
    $("#round").data("round", round + 1);
    var rowNumber = $(document.createElement('th'));
    rowNumber.attr("scope", "row");
    rowNumber.append(round);
    row.append(rowNumber);
    var base_entry = $(document.createElement('td'));
    base_entry.text($("#base-text").val());
    row.append(base_entry);
    $('span > button.search').each(function(index, element) {
        var entry = $(document.createElement('td'));
        var player = $(element).data("player");
        if(winner.includes(player)) {
            entry.addClass(golden ? "golden-win" : "win");
        }
        var word = $('#' + player + "-word");
        var word_elem = $(document.createElement('p'));
        word_elem.text(word.val());
        var hits = $('#' + player + "-hits");
        var hits_elem = $(document.createElement('p'));
        hits_elem.text(hits.val());
        var points = $('#' + player + "-points");
        var points_elem = $(document.createElement('p'));
        points_elem.addClass('lead');
        points_elem.text(points.text());
        entry.append(word_elem);
        entry.append(hits_elem);
        entry.append(points_elem);
        row.append(entry);
        word.val('');
        hits.val('');
        points.removeClass("win");
        points.removeClass("golden-win");
    });
    $("#round").text("Runde " + (round+1));
    $("#table-body").append(row);
    $("#base-text").val('');
    $("#next-button").prop('disabled', true);
    $('#base-text').focus();
    Mousetrap.unbind('alt+k');
    $('#eval-button').prop('disabled', false);
    Mousetrap.bind('alt+j', function(e, combo) {
        $('#eval-button').trigger("click");
    });
    evaluated = true;
}

function compareResults() {
    var minPerson = [];
    var minHits = Number.MAX_VALUE;
    $("input[id*='-hits']").each(function(index, element) {
        var value = parseInt($(element).val());
        var playerName = $(element).data("player");
        if(value > 0 && value < minHits) {
            minHits = value;
            minPerson.length = 0;
            minPerson.push(playerName);
        } else if(value == minHits) {
            minPerson.push(playerName);
        }
    });
    if(minHits == Number.MAX_VALUE) {
        alert("Die Runde wurde noch nicht gestartet.");
        return;
    }
    golden = minHits == 1;
    winner = minPerson;
    var points = minHits == 1 ? 2 : 1;
    var winnerClass = minHits == 1 ? "golden-win" : "win";
    minPerson.forEach(function(person) {
        var totalPoints = $("#" + person + "-points");
        totalPoints.text(parseInt(totalPoints.text()) + points);
        $("#" + person + "-points").addClass(winnerClass);
    });
    $('#eval-button').prop('disabled', true);
    Mousetrap.unbind('alt+j');
    Mousetrap.bind('alt+k', function(e, combo) {
        $('#next-button').trigger("click");
    });
    $('#next-button').prop("disabled", false);
}

function keyPressed(key, element) {
    if(key.keyCode == 13) {
        searchGoogle($(element).next().children().first());
    }
}

function reset() {
    $("h4.center.points").each(function(index, element) {
        $(element).removeClass("win");
        $(element).removeClass("golden-win");
        $(element).text(0);
        $('#next-button').prop("disabled", true);
    });
}

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

function shoeOn() {
    Mousetrap.unbind('alt+1');
    $("#shoe-img").css("display", "block");
    $("#shoe-img").addClass("anim-shoe");
    $("#shoe-audio")[0].play();
    setTimeout(shoeOff, 2500);
}
function shoeOff() {
    $("#shoe-img").removeClass("anim-shoe");
    $("#shoe-img").css("display", "none");
    $("#shoe-audio")[0].pause();
    $("#shoe-audio")[0].currentTime = 0;
    Mousetrap.bind('alt+1', shoeOn);
}

function ticketOn() {
    Mousetrap.unbind('alt+2');
    $("#ticket-img").css("display", "block");
    $("#ticket-img").addClass("anim-ticket");
    $("#ticket-audio")[0].play();
    setTimeout(ticketOff, 2100);
}
function ticketOff() {
    $("#ticket-img").removeClass("anim-ticket");
    $("#ticket-img").css("display", "none");
    $("#ticket-audio")[0].pause();
    $("#ticket-audio")[0].currentTime = 0;
    Mousetrap.bind('alt+2', ticketOn);
}

function buchklubOn() {
    Mousetrap.unbind('alt+3');
    $("#buchklub-img").css("display", "block");
    $("#buchklub-img").addClass("anim-buchklub");
    $("#buchklub-audio")[0].play();
    setTimeout(buchklubOff, 3800);
}
function buchklubOff() {
    $("#buchklub-img").removeClass("anim-buchklub");
    $("#buchklub-img").css("display", "none");
    $("#buchklub-audio")[0].pause();
    $("#buchklub-audio")[0].currentTime = 0;
    Mousetrap.bind('alt+3', buchklubOn);
}

function fillAllWithBase() {
    $('input[id*="-word"]').val($('#base-text').val());
}
