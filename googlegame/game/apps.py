from django.apps import AppConfig


class GameConfig(AppConfig):
    name = 'game'
    verbs = []
    names = []
    adjectives = []

    def ready(self):
        with open('..//verbs.csv', 'r') as f_verbs, \
            open('..//names.csv', 'r') as f_names, \
            open('..//adjectives.csv', 'r') as f_adjectives:
            self.verbs = f_verbs.read().split()
            self.names = f_names.read().split()
            self.adjectives = f_adjectives.read().split()
        print("Files read")
