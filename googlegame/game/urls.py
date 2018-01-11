from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^api/search$', views.search, name='search'),
    url(r'^api/random$', views.random, name='random'),
]