from django.shortcuts import render, reverse, redirect
from django.http import Http404, HttpResponseRedirect, HttpResponse
from django.contrib import messages
from uuid import uuid1
import requests
from bs4 import BeautifulSoup
import re
from .models import Noun

def home(request):
    return render(request, 'game/home.html')

def start(request):
    if request.method != 'POST':
        raise Http404('Seite nicht gefunden')
    player_names = request.POST.getlist('players')
    player_names = [player for player in player_names if player != ""]
    if not player_names:
        messages.error(request, 'Bitte mindestens einen Spieler angeben.')
        return redirect(reverse('home'))
    game_id = uuid1()
    request.session['players'] = player_names
    request.session['game_id'] = str(game_id)
    return redirect(reverse('game', args = [game_id]))

def game(request, game_id):
    players = request.session.get('players', [])
    game_id_session = request.session.get('game_id', None)
    if game_id_session != game_id:
        request.session.flush()
        return redirect(reverse('home'))
    return render(request, 'game/game.html', context = {'players': players})

def search(request):
    search_word = request.GET.get('word', 'schuh')
    payload = {'q' : '{}'.format(search_word), 'nfpr': '1'}
    req = requests.get('https://www.google.de/search', params=payload)
    soup = BeautifulSoup(req.text, "html.parser")
    if soup.findAll(class_='spell_orig'):
        return HttpResponse(0)
    stats = soup.select("#resultStats")
    if not stats[0].string:
        return HttpResponse(0)
    match = re.search("(Ungefähr )?(.+?) Ergebnis(se)?", stats[0].string)
    if match:
        number = match.group(2)
        number = number.replace(".", "")
        return HttpResponse(number)
    return HttpResponse(0)

def random(request):
    return HttpResponse(Noun.random().word)
