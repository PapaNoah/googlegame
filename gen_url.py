import random

def generate_urlname():
    with open('names.csv', 'r') as f_name, open('verbs.csv', 'r') as f_verbs,       open('adjectives.csv', 'r') as f_adj:
        names = f_name.read().split()
        verbs = f_verbs.read().split()
        adj = f_adj.read().split()
        return random.choice(names) + random.choice(verbs) 
            + random.choice(names) \
            + random.choice(adj)

def average_length(n):
    total_len = 0
    for i in range(n):
        total_len += len(generate_urlname())
    print("Average Url Name Length:", total_len / float(n))

average_length(100)