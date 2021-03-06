Vue.component('shenanigan-list', {
    template: `
    <transition name="fade">
        <table class="u-full-width">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Shortcut</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="entry in shenanigans" :key="entry.id">
                    <td>{{ entry.name }}</td>
                    <td><code>{{ entry.shortcut }}</code></td>
                </tr>
            </tbody>
        </table>
    </transition>
   `,
    props: ['shenanigans'],
});

Vue.component('shenanigan', {
    template: `
   <transition :name="animation">
        <div :id="id" class="overlay" @click="turnOff" @keyup.esc="turnOff" v-show="display">
            <img :src="urls.img" :class="classes.img">
            <audio :src="urls.audio" type="audio/ogg" />
        </div>
    </transition>
   `,
    props: ['id', 'urls', 'classes', 'display', 'animation'],
    watch: {
        display: function () {
            if (this.display) {
                this.audio.play();
            } else {
                this.audio.pause();
                this.audio.currentTime = 0;
            }
        }
    },
    mounted() {
        this.audio = $('div#' + this.id + '> audio')[0];
    },
    methods: {
        turnOff: function () {
            this.$emit('off', this.id);
        }
    }
});

Vue.component('history', {
    template: `
    <transition name="fade">
        <div class="row">
            <table class='u-full-width'>
                <thead>
                <tr>
                    <th></th>
                    <th>Rounds</th>
                    <th v-for="player in players">{{ player.name }}</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="round in roundsRev" :class="{'emph': round.id == rounds.length - 1}">
                    <td @click="deleteRound(round.id)" class="t-center delete">
                        <div v-if="round.id != rounds.length - 1">
                            &times;
                        </div>
                    </td>
                    <td>Round {{ round.id + 1 }}</td>
                    <template v-if="round.players.length > 0">
                    <td v-for="player in round.players">
                        <div :class="{'winner-gold': player.hits == 1 && player.winner, 'winner': player.winner }">
                        <div>
                            {{ player.term }} <small v-if="player.winner">- win!</small>
                        </div>
                        <div>
                            {{ player.hits }}
                        </div>
                        </div>
                    </td>
                    </template>
                </tr>
                <tr class="total">
                    <td></td>
                    <td>Total</td>
                    <td v-for="total in totalHits">
                        {{ total }}
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td>Avg <i><small> - 5000 hits penalty</small></i></td>
                    <td v-for="avg in avgHits" v-if="rounds.length > 1">
                        {{ (avg / (rounds.length - 1)).toFixed(2) }}
                    </td>
                </tr>
                </tbody>
            </table>
            <button @click="clear">Clear History</button>
        </div>
    </transition>
  `,
    props: ['players', 'nextRoundFlag', 'winners'],
    watch: {
        nextRoundFlag: function () {
            if (this.nextRoundFlag) {
                this.newRound();
                this.$emit("complete");
            }
        },
        players: function () {
            if (this.rounds.length < 2) return;
            var pastLength = this.rounds[this.rounds.length - 2].players.length;
            if (pastLength <= this.players.length) return;
            var deletedPlayers = this.rounds[this.rounds.length - 2].players.filter(player => !this.players.some(pl => pl.id == player.id));
            deletedPlayers.forEach(player => {
                this.rounds.forEach(round => {
                    if (round.id == this.rounds.length - 1) return;
                    var index = round.players.findIndex(pl => pl.id == player.id);
                    round.players.splice(index, 1);
                });
            });
        }
    },
    data: function () {
        return {
            rounds: [
            ]
        }
    },
    computed: {
        roundsRev: function () {
            var rev = this.rounds.slice();
            rev.reverse();
            return rev;
        },
        totalHits: function () {
            var total = this.players.map(player => Number(player.hits));
            this.rounds.forEach(round => {
                if (round.id == this.rounds.length - 1) return;
                round.players.forEach((player, index) => {
                    if (index >= total.length) {
                        total.push(Number(player.hits));
                    } else {
                        total[index] += Number(player.hits);
                    }
                });
            });
            return total;
        },
        avgHits: function () {
            var avg = [];
            this.rounds.forEach(round => {
                if (round.id == this.rounds.length - 1) return;
                round.players.forEach((player, index) => {
                    if (index >= avg.length) {
                        avg.push(Number(player.hits) == 0 ? 5000 : Number(player.hits));
                    } else {
                        avg[index] += Number(player.hits) == 0 ? 5000 : Number(player.hits);
                    }
                });
            });
            return avg;
        }
    },
    created: function () {
        this.rounds.push({ id: 0, players: this.players });
    },
    methods: {
        newRound: function () {
            var currentRound = this.rounds[this.rounds.length - 1];
            currentRound.players = [];
            this.players.forEach(player => {
                currentRound.players.push({ id: player.id, term: player.term, hits: player.hits, winner: this.winners.some(pl => pl.id == player.id) });
            });

            this.rounds.push({ id: currentRound.id + 1, players: this.players });
        },
        deleteRound: function (id) {
            if (id == this.rounds.length - 1) return;
            this.rounds.splice(id, 1);
            this.rounds.forEach(function (round) {
                if (round.id > id) {
                    round.id--;
                }
            })
        },
        clear: function () {
            this.rounds.length = 0;
            this.rounds.push({ id: 0, players: this.players });
        }
    }
})
Vue.component('add-player', {
    template: `
  <div class="row">
    <div class="three columns">
      <input type="text" v-model="name" placeholder="player name" id="name-input" @keyup.enter="createPlayer" :class="{'u-full-width': true, 'mousetrap': true}"/> 
    </div>
    <div class="four columns">
      <button @click="createPlayer" class="u-full-width button-primary"><i class="fa fa-plus" aria-hidden="true"></i> Player</button>
    </div>
  </div>
  `,
    props: ['id'],
    data: function () {
        return {
            name: ""
        };
    },
    methods: {
        createPlayer: function () {
            if (isEmptyOrSpaces(this.name)) {
                document.getElementById("name-input").focus();
                return;
            }
            var player = {
                id: this.id,
                name: this.name,
                term: "",
                hits: 0,
                score: 0,
                winner: false
            }
            this.$emit("player", player);
            this.name = "";
        }
    },
    computed: {}
}
);
Vue.component('player-interface', {
    template: `
  <div class="row">
    <div class="three columns"><h5 :class="{ 'winner-gold': player.hits == 1, 'winner': isWinner}">{{ player.name }}</h5></div>
<div class="four columns"><input placeholder="search term" :id="inputId" type="text" v-model="player.term" @keyup.enter="getResult" class="mousetrap"> <button @click="getResult" class="button-search" tabindex="-1"><i class="fa fa-search" aria-hidden="true"></i></button></div>
    <div class="three columns"><input class="u-full-width mousetrap" :id="hitsId" type="number" min="0" v-model="player.hits"></div>
    <div class="one column"><h5 id="scoreId">{{ player.score }}</h5></div>
    <div class="one column"> <button @click="deleteMe" class="delete" tabindex="-1">&times;</button> </div>
  </div>
  `,
    props: ['player', 'base', 'winners'],
    computed: {
        inputId: function () {
            return "input-" + this.player.id;
        },
        hitsId: function () {
            return "hits-" + this.player.id;
        },
        scoreId: function () {
            return "score-" + this.player.id;
        },
        isWinner: function () {
            return this.winners.some(winner => winner.id == this.player.id);
        }
    },
    methods: {
        deleteMe: function () {
            this.$emit("delete", this.player.id)
        },
        getResult: function () {
            if (isEmptyOrSpaces(this.player.term)) return;
            window.open("https://www.google.de/search?q=" + this.player.term + "&nfpr=1");
            axios.get('/api/search?word=' + this.player.term).then(response => {
                this.player.hits = response.data.hits;
            }).catch(error => {
                console.log("Fetching google results went wrong.");
                console.log(error);
            });
        }
    },
    watch: {
        base: function (val) {
            this.player.term = val;
        }
    }
});
app = new Vue({
    el: "#app",
    data: {
        base: "",
        nextId: 0,
        players: [],
        doNextRound: false,
        showHist: false,
        showShenanigans: false,
        shenanigans: [
            {
                id: 'shoe',
                name: 'Schuh',
                shortcut: 'alt+1',
                urls: {
                    img: 'static/game/img/schuh.png',
                    audio: 'static/game/audio/shoe.ogg'
                },
                classes: {
                    img: 'shoe'
                },
                animation: 'anim-shoe',
                show: false
            },
            {
                id: 'ticket',
                name: 'Fahrkarte',
                shortcut: 'alt+2',
                urls: {
                    img: 'static/game/img/fahrkarte.jpg',
                    audio: 'static/game/audio/ticket.ogg'
                },
                classes: {
                    img: 'ticket'
                },
                animation: 'anim-ticket',
                show: false
            },
            {
                id: 'buchklub',
                name: 'Buchklub',
                shortcut: 'alt+3',
                urls: {
                    img: 'static/game/img/buchklub.png',
                    audio: 'static/game/audio/buchklub.ogg'
                },
                classes: {
                    img: 'buchklub'
                },
                animation: 'anim-buchklub',
                show: false
            }
        ]
    },
    computed: {
        winners: function () {
            if(this.players.length == 0) return [];
            var players = this.players.slice();
            players.sort(this.cmpMoreZero);
            var winners = [players.pop()];
            if (winners[0].hits == 0) {
                return [];
            }
            return winners.concat(players.filter(player => player.hits == winners[0].hits))
        }
    },
    methods: {
        cmpMoreZero: function (a, b) {
            if (Number(a.hits) == 0) return -1;
            if (Number(b.hits) == 0) return 1;
            if (Number(a.hits) > Number(b.hits)) return -1;
            if (Number(a.hits) < Number(b.hits)) return 1;
            return 0;
        },
        fetchRandom: function () {
            axios.get('/api/random').then(response => {
                this.base = response.data.word
            }).catch(error => {
                console.log('Fetching random base went wrong.');
                console.log(error);
                this.base = "Schuh";
            });
        },
        addNewPlayer: function (player) {
            this.players.push(player);
            this.nextId++;
        },
        deletePlayer: function (id) {
            var index = this.players.findIndex(element => element.id == id);
            this.players.splice(index, 1);
        },
        startNextRound: function () {
            this.doNextRound = true;
        },
        onRoundCompleted: function () {
            this.doNextRound = false;
            this.calcScore();
            this.reset();
        },
        calcScore: function () {
            this.winners.forEach(player => {
                player.score += player.hits == 1 ? 2 : 1;
            });
        },
        reset: function () {
            this.base = "";
            this.players.forEach(function (player) {
                player.hits = 0;
                player.term = "";
            });
        },
        resetScore: function () {
            this.players.forEach(player => player.score = 0);
        },
        closeAnimation: function (id) {
            this.shenanigans.find(entry => entry.id == id).show = false;
        },
        closeAllAnimations: function () {
            this.shenanigans.forEach(entry => entry.show = false);
        }
    },
    created() {
        this.shenanigans.forEach(entry => {
            Mousetrap.bind(entry.shortcut, function (e) {
                entry.show = true;
            });
        })
    }
});
function isEmptyOrSpaces(str) {
    return str === null || str.match(/^\s*$/) !== null;
}
Mousetrap.bind('alt+r', function (e) {
    app.fetchRandom();
});
Mousetrap.bind('esc', function (e) {
    app.closeAllAnimations();
});
Mousetrap.bind('alt+n', function (e) {
    app.startNextRound();
});