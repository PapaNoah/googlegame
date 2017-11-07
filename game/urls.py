from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^start$', views.start, name='start'),
    url(r'^start/(?P<game_id>[0-9a-f-]+)$', views.game, name='game'),
    url(r'^api/search$', views.search, name='search'),
    url(r'^api/random$', views.random, name='random'),
]