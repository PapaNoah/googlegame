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
Mousetrap.bind('alt+a', addPlayer);
Mousetrap.bind('alt+s', function(e, combo) {
    $('#game-form').trigger("submit");
});
Mousetrap.bind('alt+n', function(e, combo) {
    $('#new-button')[0].click();
});
Mousetrap.bind('alt+h', function(e, combo) {
    $('#home-button')[0].click();
});
Mousetrap.bind('alt+q', function(e, combo) {
    $('#eval-button').trigger("click");
});
Mousetrap.bind('alt+r', function(e, combo) {
    $('#base-button').trigger("click");
});
Mousetrap.bind('alt+j', shoeOn);
Mousetrap.bind('alt+k', ticketOn);
Mousetrap.bind('alt+0', reset);

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
        if(player == winner) {
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
    Mousetrap.unbind('alt+c');
}

function compareResults() {
    var minPerson = "";
    var minHits = Number.MAX_VALUE;
    $("div.input-group > input[type='number']").each(function(index, element) {
        var value = parseInt($(element).val());
        var playerName = $(element).data("player");
        if(value != 0 && value < minHits) {
            minHits = value;
            minPerson = playerName;
        }
    });
    if(minHits == Number.MAX_VALUE) {
        alert("Die Runde wurde noch nicht gestartet.");
        return;
    }
    winner = minPerson;
    golden = minHits == 1;
    var points = minHits == 1 ? 3 : 1;
    var winnerClass = minHits == 1 ? "golden-win" : "win";
    var totalPoints = $("#" + minPerson + "-points");
    totalPoints.text(parseInt(totalPoints.text()) + points);
    $("#" + minPerson + "-points").addClass(winnerClass);
    Mousetrap.bind('alt+c', function(e, combo) {
        $('#next-button').trigger("click");
    });
    $('#next-button').prop("disabled", false);


}

function keyPressed(key, element) {
    if(key.keyCode == 13) {
        searchGoogle($(element).next().children().first());
    }
}

function randomBase() {
    $.ajax({
        url: '/api/random',
        type: "get",
        success: function (data) {
            $('#base-text').val(data);
        },
    });
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
    $("#shoe-img").css("display", "block");
}
function shoeOff() {
    $("#shoe-img").css("display", "none");
}
function ticketOn() {
    $("#ticket-img").css("display", "block");
}
function ticketOff() {
    $("#ticket-img").css("display", "none");
}
