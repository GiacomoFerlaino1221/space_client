<template>
  <div>
    <div class="overlay">
      <canvas id="stars" ref="stars"></canvas>
    </div>

    <!-- sidebar -->
    <m-sidebar
      v-if="!gameStart && game"
      :token="id"
      :local="local"
      :lang="currentLanguage"
      @toggleLanguage="toggleLanguage"
      @loadModal="toggleModal"
      @closeModal="closeModal"
      :show="sideBarShow"
    />

    <!-- launcher -->
    <div class="launcher" v-if="!gameStart">
      <div class="launcher-title">
        <img src="../assets/icons/space.svg" alt />
      </div>

      <div class="launcher-game" v-if="!showRoom">
        <div class="launcher-game-avatar">
          <img
            v-if="user && user._id"
            class="fadeIn"
            :src="`${domain}/storage/${user._id}/avatar.jpg`"
          />
        </div>

        <div class="launcher-game-username">
          <h1
            v-if="user && user.first_name || user.last_name"
            class="fadeIn"
          >{{ user.first_name }} {{ user.last_name }}</h1>
          <h1 v-else></h1>
        </div>

        <div class="launcher-game-panel">
          <div class="launcher-game-panel-coins">
            <img src="../assets/icons/coin.png" alt />
          </div>
          <div
            class="launcher-game-panel-count fadeIn"
            v-if="user.balance"
          >{{ Number(user.balance).toFixed(2) }}</div>
          <div class="launcher-game-panel-store">
            <button @click="toggleModal('balance')">
              <span>{{ local.shop }}</span>
            </button>
          </div>
          <div class="launcher-game-panel-line"></div>
        </div>

        <div class="launcher-game-list" v-for="(game, index) in games" :key="index">
          <div v-if="game.enteredPlayers < game.maxPlayers && game.creator !== user._id">
            <div class="launcher-game-list-item" @click="connectToGame(game)">
              <div class="launcher-game-list-item-avatar">
                <img :src="`${domain}/storage/${game.creator}/avatar.jpg`" class="fadeIn" alt />
              </div>
              <div class="launcher-game-list-item-info">
                <span>{{ game.creator_name }}</span>
                <span>{{ game.enteredPlayers }} / {{ game.maxPlayers }}</span>
              </div>
              <div class="launcher-game-list-item-join">
                <button>
                  <img src="../assets/icons/coin.png" alt />
                  <span>{{ game.coins }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="launcher-game-create">
          <button @click="toggleModal('game')">{{ local.btn_create }}</button>
        </div>
      </div>

      <!-- room -->
      <section class="launcher-room fadeIn" v-if="showRoom && game && game.players">
        <div class="launcher-room-leave" @click="leaveGame">
          <img src="../assets/icons/close_btn.svg" alt />
        </div>

        <div class="launcher-room-stake">
          <span>Stake:</span>
          <img src="../assets/icons/coin.png" alt />
          <span>{{ game.maxPlayers * game.coins }}</span>
        </div>

        <div class="launcher-room-players" :class="`players-0${game.maxPlayers}`">
          <div
            class="launcher-room-players-item"
            v-for="(player, index) in game.players"
            :key="index"
          >
            <div
              class="launcher-room-players-item-avatar fadeIn"
              :class="`avatar-0${game.maxPlayers}`"
            >
              <img :src="`${domain}/${player.avatar}`" />
            </div>
          </div>
          <div
            class="launcher-room-players-item"
            v-for="(p, index) in game.maxPlayers - game.enteredPlayers"
            :key="index"
          >
            <div
              class="launcher-room-players-item-avatar-empty"
              :class="`avatar-empty-0${game.maxPlayers}`"
            ></div>
          </div>
        </div>

        <div class="launcher-room-waiting fadeIn">
          <span
            v-if="game.enteredPlayers !== game.maxPlayers"
          >Waiting for players to join... {{ game.enteredPlayers }} / {{ game.maxPlayers }}</span>
          <span v-else>All players ready to play!</span>
        </div>

        <div class="launcher-room-chat">
          <div class="launcher-room-chat-list" id="chat" v-if="game && game.chat">
            <div
              class="launcher-room-chat-list-item"
              :class="chat && chat.id === $socket.id ? 'right' : 'left'"
              v-for="(chat, index) in game.chat"
              :key="index"
            >
              <img :src="`${domain}/${chat.avatar}`" alt />
              <p>{{ chat.message }}</p>
            </div>
          </div>

          <div class="launcher-room-chat-panel" id="panel">
            <form @submit.prevent="sendMessage">
              <input :placeholder="local.chat_area" v-model="message" />
              <button type="submit" class="send">
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        <div class="launcher-room-bottom">
          <!-- <div class="launcher-room-bottom-back">
            <button @click="leaveGame">Exit</button>
          </div>-->

          <div
            class="launcher-room-bottom-start"
            v-if="game.creator && game.creator.socket_id === $socket.id"
            :title="local.btn_begin"
          >
            <button :disabled="!readyToPlay" @click="startGame(game.id)">Start!</button>
          </div>
        </div>
      </section>
      <!-- end -->
    </div>

    <!-- game -->
    <!-- <m-game v-if="gameStart && game" :game="gameData" :pos_x="pos_x" :pos_y="pos_y" /> -->
    <div class="game fadeIn" v-if="gameStart && game">
      <m-panel :players="gameData.map.players" :land="gameData.map.land" v-if="gameData.map && gameData.map.players" />
      <!--<m-map
        :mapData="gameData.map.mapData"
        :player="currentPlayer"
        :fogs="gameData.map.fogs"
        :gameId="gameData.id"
      ></m-map>-->
      <div class="game-container" ref="map">
        <div class="row" v-for="(row, i) in gameMap" :key="i + rand">
          <div
            class="col"
            v-for="(col, j) in row"
            :key="j + rand"
            @click="activatePositions(col.x, col.y)"
          >
            <div class="obstacle" v-if="col.obstacle"></div>

            <div
              class="player selection"
              v-if="col.x === currentPlayer.x && col.y === currentPlayer.y"
            ></div>

            <div v-if="col.base && isFog(col)" :class="`base base_${col.color}`">{{ col.count }}</div>

            <div
              class="land"
              :class="[`land_${col.color}`]"
              v-if="!col.tower && col.owner && !col.base && isFog(col)"
            >
              <span class="land-count">{{ col.count }}</span>
            </div>

            <div
              class="available-points"
              v-if="availablePoints[`${col.x}:${col.y}`] && !col.obstacle"
              @click="moveHere(availablePoints[`${col.x}:${col.y}`])"
            >
              <div class="available-point"></div>
            </div>

            <div
              class="tower"
              v-if="col.tower && isFog(col)"
              :class="col.owner ? `tower_${col.color}` : ''"
            >{{ col.count }}</div>

            <div class="fog" v-if="!isFog(col)"></div>
          </div>
        </div>
      </div>
    </div>
    <m-modal
      :style="{ zIndex: !showModal ? -1 : 9999 }"
      :type="modalType"
      :error="modalError"
      :show="showModal"
      :userWallet="user ? user.wallet : ''"
      :local="local"
      @close="closeModal"
      @createGame="createGame"
      @mainMenu="handleMainMenu"
    />

    <audio id="soundStart" src="../assets/audio/startGame.wav" hidden="true"></audio>
    <audio id="soundMove" src="../assets/audio/move.wav" hidden="true"></audio>
    <audio id="soundLose" src="../assets/audio/youLose.wav" hidden="true"></audio>
    <audio id="captureGenerator" src="../assets/audio/captureGenerator.wav" hidden="true"></audio>
  </div>
</template>

<script>
import { domain, directions } from "../config";
import { GetLocal } from "../services/local.service";
import { Payment } from "../services/payment.service";
import smoothscroll from "smoothscroll-polyfill";

const qrCode = require("qrcode");

const stars = () => {
  var canvas = document.getElementById("stars");
  var c = canvas.getContext("2d");

  var innerWidth = window.innerWidth - 20,
    innerHeight = window.innerHeight - 20,
    radius = 1,
    starsIndex = 0,
    stars = [],
    TWO_PI = Math.PI * 2,
    centerX = innerWidth / 2,
    centerY = innerHeight / 2,
    focalLength = 50,
    starRadius = null,
    starX = null,
    starY = null,
    numStars = 100,
    mouse = {},
    starX_dir = 0,
    starY_dir = 0,
    x,
    y,
    z;

  canvas.width = innerWidth;
  canvas.height = innerHeight;

  // Function for create new start
  function star(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.radius = radius;
    this.color = "#fff";
    starsIndex++;
    stars[starsIndex] = this;
    this.id = starsIndex;

    // Animate Stars
    this.update = function() {
      starX = (this.x - centerX) * (focalLength / this.z);
      starX += centerX;

      starY = (this.y - centerY) * (focalLength / this.z);
      starY += centerY;

      starRadius = radius * (focalLength / this.z);

      starX += starX_dir;
      starY += starY_dir;

      this.z += -0.2;

      if (this.z <= 0) {
        this.z = parseInt(innerWidth);
      }

      this.draw();
    };

    // Function for draw star
    this.draw = function() {
      c.beginPath();
      c.arc(starX, starY, starRadius, TWO_PI, false);
      c.fillStyle = this.color;
      c.shadowColor = "#fff";
      c.shadowBlur = 10;
      c.fill();
      c.closePath();
    };
  }

  // X,Y,Z values
  var s;
  for (s = 0; s < numStars; s++) {
    x = Math.random() * innerWidth;
    y = Math.random() * innerHeight;
    z = Math.random() * innerWidth;
    new star(x, y, z);
  }

  // Function for animate canvas objects
  function animate() {
    requestAnimationFrame(animate);
    c.fillStyle = "#371536";
    c.fillRect(0, 0, innerWidth, innerHeight);

    for (var i in stars) {
      stars[i].update();
    }
  }

  animate();
};

export default {
  beforeRouteLeave(to, from, next) {
    this.$socket.emit("leaveGame", { game: this.game });
    next();
  },
  data: () => ({
    id: "",
    modalType: "",
    modalError: "",
    showModal: false,
    showRoom: false,
    games: [],
    user: {},
    game: {},
    pos_x: 0,
    pos_y: 0,
    gameStart: false,
    message: "",
    domain: domain(),
    local: {},
    currentLanguage: "",
    audio: "",
    sideBarShow: true,
    availablePoints: {}
  }),
  computed: {
    readyToPlay() {
      return this.game.enteredPlayers === this.game.maxPlayers;
    },
    playersLength() {
      return this.game.maxPlayers - this.game.players.length;
    },
    gameData() {
      return this.game;
    },
    currentPlayer() {
      let player = this.game.players[this.$socket.id];
      if (player && !player.alive) {
        this.$socket.emit("loseGame", {
          player,
          gameId: this.game.id
        });
        this.playAudio("soundLose");
      }
      return player;
    },
    rand() {
      return Math.random();
    },
    gameMap() {
      return this.game.map.mapData;
    }
  },
  methods: {
    toggleModal(type) {
      this.modalType = type;
      this.showModal = true;
      this.sideBarShow = false;
    },
    closeModal() {
      this.modalType = "";
      this.showModal = false;
      this.sideBarShow = true;
    },
    async createGame(params) {
      let valid = false;
      this.showModal = false;

      if (this.user.balance < params.coins) {
        this.modalError = "Not enough money";
        this.toggleModal("error");
      } else {
        valid = true;
      }

      if (valid) {
        await this.$socket.emit("createGame", {
          id: this.id,
          coins: params.coins,
          maxPlayers: params.players
        });
        setTimeout(() => {
          this.showRoom = true;
        });
      }
    },
    connectToGame(game) {
      if (this.user.balance < game.coins) {
        this.modalError = "Not enough money";
        this.toggleModal("error");
      } else {
        let userId = this.id;
        this.$socket.emit("connectToGame", { userId, gameId: game.id });
        this.showRoom = true;
      }
    },
    startGame(id) {
      this.$socket.emit("startGame", { id });
      this.playAudio("soundStart");
    },
    leaveGame() {
      this.showRoom = false;
      this.$socket.emit("leaveGame", { game: this.game });
    },
    handleMainMenu() {
      window.location.reload();
    },
    sendMessage() {
      if (this.message) {
        this.$socket.emit("reciveMessage", {
          game: this.game,
          user: this.user,
          message: this.message
        });
        this.message = "";
      }
    },
    toggleLanguage(language) {
      this.currentLanguage = language;
      localStorage.setItem("local", language);
      GetLocal(language)
        .then(data => {
          this.local = data.local;
        })
        .catch(err => {
          console.log(err);
        });
    },
    playAudio(src) {
      let audio = document.getElementById(src);
      audio.play();
    },
    isFog(col) {
      return this.gameData.map.fogs[`${col.x}:${col.y}`].isFog &&
        this.currentPlayer.fogs[`${col.x}:${col.y}`]
        ? true
        : false;
    },
    activatePositions(x, y) {
      this.availablePoints = {};
      console.log(x, y)
      if (this.currentPlayer.x === x && this.currentPlayer.y === y) {
        this.availablePoints[`${x - 1}:${y}`] = "up";
        this.availablePoints[`${x + 1}:${y}`] = "down";
        this.availablePoints[`${x}:${y - 1}`] = "left";
        this.availablePoints[`${x}:${y + 1}`] = "right";
      } else {
        this.$socket.emit("moveTo", {
          x,
          y,
          gameId: this.gameData.id,
          selection: true
        });
      }
    },
    moveHere(direction) {
      this.availablePoints = {};
      this.$socket.emit("move", { direction, gameId: this.gameData.id });
    }
  },
  mounted() {
    smoothscroll.polyfill();
    this.id = String(this.$route.params.id).replace("token=", "");

    this.$socket.emit("init", { id: this.id });

    this.$socket.on("user", async data => {
      if (!data.id) {
        let a = document.getElementById("tm");
        a.click();
        this.user = {};
      } else {
        this.user = data;
      }
    });

    this.$socket.on("update", async data => {
      try {
        this.games = await data.games;
      } catch (e) {
        console.log(e);
      }
    });

    this.$socket.on("gameInfo", async data => {
      try {
        setTimeout(() => {
          this.game = data;
        });
        if (data.map.towerSound) {
          alert("!!!!");
          this.playAudio("captureGenerator");
        }
      } catch (e) {
        console.log(e);
      }
    });

    this.$socket.on("start", async data => {
      try {
        this.pos_x = data.pos_x;
        this.pos_y = data.pos_y;
        this.gameStart = true;

        setTimeout(() => {
          let map = document.querySelector(".game-container");
          let current = this.game.map.players[this.$socket.id];
          console.log(this.currentPlayer);
          let st = (current.x - 5) * 60;
          let sl = (current.y - 5) * 60;
          map.scrollTop = st > 0 ? st : 0;
          map.scrollLeft = sl > 0 ? sl : 0;
        }, 1500);
      } catch (e) {
        console.log(e);
      }
    });

    this.$socket.on("lose", async data => {
      try {
        this.modalError = "You lose!";
        this.toggleModal("lose");
      } catch (e) {
        console.log(e);
      }
    });

    this.$socket.on("win", async data => {
      try {
        this.modalError = "You win!";
        this.toggleModal("win");
      } catch (e) {
        console.log(e);
      }
    });

    this.$socket.on("reloadLauncher", async () => {
      await window.location.reload();
    });

    this.$socket.on("sendMessage", data => {
      let area = document.getElementById("chat");

      setTimeout(() => {
        area.scrollTop = area.scrollHeight;
      }, 100);
    });

    // Get localization
    this.currentLanguage = localStorage.getItem("local");
    GetLocal(this.currentLanguage)
      .then(data => {
        this.local = data.local;
        console.log(this.local);
      })
      .catch(err => {
        console.log(err);
      });

    // Move event
    window.addEventListener("keyup", async e => {
      let direction = await directions[e.keyCode];
      try {
        let map = document.querySelector(".game-container");
        if (this.currentPlayer && this.currentPlayer.alive) {
          this.availablePoints = {};
          await this.$socket.emit("move", {
            direction,
            gameId: this.gameData.id
          });
          // this.playAudio('soundMove');
          let current = this.currentPlayer;

          let totalHeight = map.scrollHeight;
          let totalWidth = map.scrollWidth;

          let pointSize = 60;

          let currentHeight = (current.x + 1) * pointSize;
          let currentWidth = (current.y + 1) * pointSize;

          let centerPos = totalHeight / 2;
          let centerWidth = totalWidth / 2;

          if (direction === "down") {
            map.scrollTo({
              top: currentHeight - centerPos + currentHeight / 2,
              behavior: "smooth"
            });
          }

          if (direction === "up") {
            currentHeight = (current.x - 1) * pointSize;
            map.scrollTo({
              top: currentHeight - centerPos + currentHeight / 2,
              behavior: "smooth"
            });
          }

          if (direction === "right") {
            map.scrollTo({
              left: currentWidth - centerWidth + currentWidth / 2,
              behavior: "smooth"
            });
          }

          if (direction === "left") {
            currentWidth = (current.y - 1) * pointSize;
            map.scrollTo({
              left: currentWidth - centerWidth + currentWidth / 2,
              behavior: "smooth"
            });
          }
        }
      } catch (e) {
        console.log(e);
      }
    });
  }
};
</script>

<style lang="scss" scoped src="@/assets/scss/views/launcher.scss">
</style>