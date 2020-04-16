<template>
  <div class="modal" :class="show ? 'show' : 'hide'" v-if="type === 'game' || type === 'error' || type === 'balance' || type === 'rules'">
    <div class="modal-overlay" @click="close"></div>

    <div class="modal-content" v-if="type === 'game'">
      <div class="modal-content-close" @click="close">
        <img src="../assets/icons/close_btn.svg" alt="">
      </div>

      <div class="modal-content-title">Create new game</div>

      <div class="modal-content-peoples">
        <section>
          <h1>{{ local.players_number }}:</h1>
        </section>
        <div class="modal-content-peoples-select">
          <div class="modal-content-peoples-select-left" @click="lowPlayer">
            <img src="../assets/icons/left_white.svg">
          </div>
          <div class="modal-content-peoples-select-count">
            <span></span>
            <span>{{ playerCount }}</span>
          </div>
          <div class="modal-content-peoples-select-right" @click="hidePlayer">
            <img src="../assets/icons/right_white.svg">
          </div>
        </div>
      </div>

      <div class="modal-content-peoples peoples-secondary">
        <section>
          <img src="../assets/icons/coin.png" alt="">
          <h1 class="orange">{{ local.game_rate }}:</h1>
        </section>
        <div class="modal-content-peoples-select">
          <div class="modal-content-peoples-select-left" @click="lowCoin">
            <img src="../assets/icons/left_orange.svg">
          </div>
          <div class="modal-content-peoples-select-count">
            <span class="coin">{{ coinCount }}</span>
          </div>
          <div class="modal-content-peoples-select-right" @click="hideCoin">
            <img src="../assets/icons/right_orange.svg">
          </div>
        </div>
      </div>
      
      <div class="modal-content-start">
        <m-button :title="local.btn_begin" @click="handleCreateGame" />
      </div>
    </div>

    <div class="modal-content" v-if="type === 'error'">
      <div class="modal-content-close" @click="close">
        <img src="../assets/icons/close_btn.svg" alt="">
      </div>
      <h1 class="modal-content-error">{{ error }}</h1>
    </div>

    <div class="modal-content balance" v-if="type === 'balance'">
      <div class="modal-content-close" @click="close">
        <img src="../assets/icons/close_btn.svg" alt="">
      </div>
      <h1 class="modal-content-error">SHOP</h1>
      <div class="modal-content-tabs">
        <div class="modal-content-tabs-item" :class="{ active: currentTab === 'minter' }" @click="toggleTab('minter')">minter</div>
        <!-- <div class="modal-content-tabs-item" :class="{ active: currentTab === 'bitcoin' }" @click="toggleTab('bitcoin')">bitcoin</div> -->
        <div class="modal-content-tabs-item" :class="{ active: currentTab === 'money' }" @click="toggleTab('money')">money</div>
      </div>

      <div class="modal-content-tabs-current fadeIn" v-if="currentTab === 'minter'">
        <div class="payment">
          <canvas id="qr-code"></canvas>
          <p>To refill your accoun send <span>SPACE</span> or any other Minter coins to this address:</p>
        </div>
        <div class="buffer">
          <input id="buffer-text" type="text" :value="userWallet">
          <img src="../assets/icons/copy.svg" @click="copyToClipboard">
        </div>
      </div>

      <!-- Money Payment -->
      <div class="modal-content-tabs-current money fadeIn" v-if="currentTab === 'money'">
        <section class="money-title">
          <span>Choose currency</span>
        </section>
        <section class="money-currency">
          <div :class="{ active: activeCurrency === 'uah' }" @click="selectCurrency('uah')">UAH</div>
          <div :class="{ active: activeCurrency === 'rub' }" @click="selectCurrency('rub')">RUB</div>
          <div :class="{ active: activeCurrency === 'usd' }" @click="selectCurrency('usd')">USD</div>
        </section>
        <section class="money-title">
          <span>Choose payment provider</span>
        </section>
        <section class="money-providers fadeIn" v-if="providers.length">
          <div v-for="(provider, index) in providers" :key="index" @click="selectProvider(provider)" :class="{ active: activeProvider === provider.name }">
            <img class="fadeIn" :src="provider.icon">
            <span>{{ provider.name }}</span>
          </div>
        </section>
        <section class="money-coins fadeIn" v-if="buyCoinForm">
          <div>
            <input type="text" v-model="buyCoin.amount">
            <span class="space"><i>SPACE</i> ≈ {{ buyCoin.amount }} {{ activeCurrency.toUpperCase() }}</span>
          </div>
          <div>
            <span>You can choose an amount from {{ min }} to {{ max }}</span>
          </div>
          <div class="fadeIn" v-if="buyCoin.amount >= 1">
            <button @click="buyCoins" v-if="!process">
              <span>BUY {{ buyCoin.amount }} SPACE FOR {{ buyCoin.amount }} {{ activeCurrency.toUpperCase() }}</span>
            </button>
            <button v-else>
              <span>Proccessing...</span>
              <div class="payment-loader"></div>
            </button>
            <a id="activatePaymentUrl" :href="activatePaymentUrl" target="blank" hidden></a>
          </div>
        </section>
      </div>

    </div>

    <div class="modal-content rules" v-if="type === 'rules'">
      <!-- <div class="modal-content-close" @click="close">
        <img src="../assets/icons/close_btn.svg" alt="">
      </div> -->
      <div class="modal-content-rules">
        <div class="modal-content-rules-container" v-html="local.rules">
        </div>
      </div>
    </div>

  </div>
  <div class="modal" :class="show ? 'show' : 'hide'" v-else>
    <div class="modal-overlay"></div>
    <div class="modal-content" v-if="type === 'lose'">
      <h1 class="modal-content-error">{{ error }}</h1>
      <div class="button-content">
        <m-button title="в меню" @click="handleMainMenu" />
      </div>
    </div>
    <div class="modal-content win" v-if="type === 'win'">
      <h1 class="modal-content-error">{{ error }}</h1>
      <div class="image-content">
        <img src="../assets/icons/win.svg">
      </div>
      <div class="button-content">
        <m-button title="в меню" @click="handleMainMenu" />
      </div>
    </div>
  </div>
</template>

<script>
const qrCode = require('qrcode');
import { AuthenticateKuna, GetProviderList, MakeDeposite, CheckPayment, SendCoins } from '../services/payment.service';

export default {
  props: {
    type: {
      type: String,
      default: ''
    },
    error: {
      type: String,
      default: ''
    },  
    show: {
      type: Boolean,
      default: false
    },
    userWallet: {
      type: String
    },
    local: {
      type: Object
    }
  },
  data: () => ({
    playerCount: 2,
    coinCount: 1,
    currentTab: 'minter',
    activeCurrency: '',
    activeProvider: '',
    activeCode: '',
    providers: [],
    buyCoinForm: false,
    buyCoin: {
      amount: 10
    },
    min: 0,
    max: 0,
    activatePaymentUrl: '',
    process: false
  }),
  methods: {
    close () {
      this.$emit('close');
    },
    lowPlayer () {
      this.playerCount--;
      if (this.playerCount < 2) this.playerCount = 2;
    },
    hidePlayer () {
      this.playerCount++;
      if (this.playerCount > 8) this.playerCount = 8;
    },
    lowCoin () {
      this.coinCount--;
      if (this.coinCount < 1) this.coinCount = 1;
    },
    hideCoin () {
      this.coinCount++;
      if (this.coinCount > 20) this.coinCount = 20;
    },
    handleCreateGame () {
      this.$emit('createGame', { coins: this.coinCount, players: this.playerCount })
    },
    handleMainMenu () {
      this.$emit('mainMenu');
    },
    copyToClipboard () {
      var copyText = document.getElementById("buffer-text");
      copyText.select();
      document.execCommand("copy");
    },
    toggleTab (type) {
      this.currentTab = type;
      if (type === 'minter') {
        setTimeout(() => {
          let canvas = document.getElementById('qr-code');
          qrCode.toCanvas(canvas, this.userWallet, function (error) {
            if (error) console.error(error)
          });
        });
      }

      if (type === 'money') {
        AuthenticateKuna().then((data) => {
          localStorage.setItem('uah', data.public_keys.deposit_sdk_uah_public_key);
          localStorage.setItem('rub', data.public_keys.deposit_sdk_rub_public_key);
          localStorage.setItem('usd', data.public_keys.deposit_sdk_usd_public_key);

          this.selectCurrency('uah');
        });
      }
    },

    // Payment
    selectCurrency (currency) {
      this.activeCurrency = currency;
      this.buyCoinForm = false;
      this.activeProvider = '';
      GetProviderList(currency)
        .then((data) => {
          let providers = [];
          for (let key in data.services) {
            let provider = {};
            let service = data.services[key];
            let method = data.methods[service.method];
            
            if (method.code !== 'qiwi') {
              provider.name = method.name[localStorage.getItem('local')];
              provider.icon = method.icon;
              provider.amount_min = service.amount_min;
              provider.amount_max = service.amount_max;
              provider.code = service.code;
              providers.push(provider);
            }
          }
          this.providers = providers;
        }).catch((err) => {
          console.log(err);
        });
    },
    selectProvider (provider) {
      this.activeCode = provider.code;
      this.activeProvider = provider.name;
      this.buyCoinForm = true;
      this.min = provider.amount_min;
      this.max = provider.amount_max;
    },
    buyCoins () {
      this.process = true;
      MakeDeposite(this.activeCurrency, this.buyCoin.amount, this.activeCode)
        .then((data) => {
          this.activatePaymentUrl = data.active_payment.payload.action;

          let newWindow = window.open("", "_blank");
          setTimeout(() => {
            newWindow.document.location = this.activatePaymentUrl;
          }, 200);

          let count = 20;
          let checkInterval = setInterval(() => {
            CheckPayment(data.reference_id)
            .then((data) => {
              count--;
              if (data.status === 'done') {
                clearInterval(checkInterval);
                SendCoins(this.buyCoin.amount, this.userWallet).then(() => {
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                });
              }
              if (count <= 0) {
                clearInterval(checkInterval);
                window.location.reload();
              }
            }).catch((err) => {
              console.log(err);
            });
          }, 5000);
        }).catch((err) => {
          console.log(err);
        });
    }
  },
  watch: {
    show (value) {
      if (value && this.type === 'balance') {
        setTimeout(() => {
          let canvas = document.getElementById('qr-code');
          qrCode.toCanvas(canvas, this.userWallet, function (error) {
            if (error) console.error(error)
          });
        }, 200);
      }
      if (!value) {
        this.buyCoinForm = false;
        this.activeProvider = '';
      }
    }
  }
}
</script>

<style lang="scss" scoped src="@/assets/scss/components/modal.scss">
</style>