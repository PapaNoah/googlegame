from django.db import models
from django.db.models.aggregates import Count
from random import randint

# Create your models here.
class Noun(models.Model):
    word = models.CharField(max_length=60)

    def random():
        count = Noun.objects.all().count()
        random_index = randint(0, count - 1)
        return Noun.objects.all()[random_index]