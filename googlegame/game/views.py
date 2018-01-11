import re
import json
from uuid import uuid1

import requests
from bs4 import BeautifulSoup
from django.contrib import messages
from django.http import (Http404, JsonResponse, HttpResponse)
from django.shortcuts import redirect, render, reverse

from .apps import GameConfig
from .models import Noun
from .utils import greater_zero_cmp


def home(request):
    return render(request, 'game/game.html')

def search(request):
    search_word = request.GET.get('word', 'schuh')
    payload = {'q' : '{}'.format(search_word), 'nfpr': '1'}
    req = requests.get('https://www.google.de/search', params=payload)
    soup = BeautifulSoup(req.text, "html.parser")
    if soup.findAll(class_='spell_orig'):
        return JsonResponse({'hits': 0})
    stats = soup.select("#resultStats")
    if not stats[0].string:
        return JsonResponse({'hits': 0})
    match = re.search("(Ungefähr )?(.+?) Ergebnis(se)?", stats[0].string)
    if match:
        number = match.group(2).replace(".", "")
        return JsonResponse({'hits': int(number)})
    return JsonResponse({'hits': 0})

def random(request):
    if request.method != "GET":
        return HttpResponse(status=405)
    random_noun = Noun.random().word
    return JsonResponse({"word": random_noun})
