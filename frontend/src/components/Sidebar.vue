<template>
  <div v-show="active" @click="closeHovers" class="overlay"></div>
  <nav :class="{ active }">
    <template v-if="isLoggedIn">
      <div class="new-button-container" v-if="user.perm.create">
        <button @click="showHover('newDir')" class="action new-button">
          <i class="material-icons">add</i>
          <span>Crear carpeta</span>
        </button>
      </div>

      <button
        class="action nav-item"
        :class="{ active: $route.path === '/files/' || $route.path === '/files' }"
        @click="toRoot"
      >
        <i class="material-icons">folder</i>
        <span>{{ $t("sidebar.myFiles") }}</span>
      </button>

      <div v-if="user.perm.admin">
        <button
          class="action nav-item"
          :class="{ active: $route.path.startsWith('/settings') }"
          @click="toGlobalSettings"
        >
          <i class="material-icons">settings</i>
          <span>{{ $t("sidebar.settings") }}</span>
        </button>
      </div>

      <button @click="toAccountSettings" class="action nav-item">
        <i class="material-icons">account_circle</i>
        <span>{{ user.username }}</span>
      </button>

      <button
        v-if="canLogout"
        @click="logout"
        class="action nav-item"
        id="logout"
      >
        <i class="material-icons">logout</i>
        <span>{{ $t("sidebar.logout") }}</span>
      </button>
    </template>
    <template v-else>
      <router-link
        v-if="!hideLoginButton"
        class="action"
        to="/login"
        :aria-label="$t('sidebar.login')"
        :title="$t('sidebar.login')"
      >
        <i class="material-icons">exit_to_app</i>
        <span>{{ $t("sidebar.login") }}</span>
      </router-link>

      <router-link
        v-if="signup"
        class="action"
        to="/login"
        :aria-label="$t('sidebar.signup')"
        :title="$t('sidebar.signup')"
      >
        <i class="material-icons">person_add</i>
        <span>{{ $t("sidebar.signup") }}</span>
      </router-link>
    </template>

    <div
      class="credits"
      v-if="isFiles && !disableUsedPercentage"
      style="width: 90%; margin: 2em 2.5em 3em 2.5em"
    >
      <progress-bar :val="usage.usedPercentage" size="small"></progress-bar>
      <br />
      {{ usage.used }} of {{ usage.total }} used
    </div>

    <p class="credits">
      <span>
        <span v-if="disableExternal">File Browser</span>
        <a
          v-else
          rel="noopener noreferrer"
          target="_blank"
          href="https://github.com/filebrowser/filebrowser"
          >File Browser</a
        >
        <span> {{ " " }} {{ version }}</span>
      </span>
      <span>
        <a @click="help">{{ $t("sidebar.help") }}</a>
      </span>
    </p>
  </nav>
</template>

<script>
import { reactive } from "vue";
import { mapActions, mapState } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useFileStore } from "@/stores/file";
import { useLayoutStore } from "@/stores/layout";

import * as auth from "@/utils/auth";
import {
  version,
  signup,
  hideLoginButton,
  disableExternal,
  disableUsedPercentage,
  noAuth,
  logoutPage,
  loginPage,
} from "@/utils/constants";
import { files as api } from "@/api";
import ProgressBar from "@/components/ProgressBar.vue";
import prettyBytes from "pretty-bytes";

const USAGE_DEFAULT = { used: "0 B", total: "0 B", usedPercentage: 0 };

export default {
  name: "sidebar",
  setup() {
    const usage = reactive(USAGE_DEFAULT);
    return { usage, usageAbortController: new AbortController() };
  },
  components: {
    ProgressBar,
  },
  inject: ["$showError"],
  computed: {
    ...mapState(useAuthStore, ["user", "isLoggedIn"]),
    ...mapState(useFileStore, ["isFiles", "reload"]),
    ...mapState(useLayoutStore, ["currentPromptName"]),
    active() {
      return this.currentPromptName === "sidebar";
    },
    signup: () => signup,
    hideLoginButton: () => hideLoginButton,
    version: () => version,
    disableExternal: () => disableExternal,
    disableUsedPercentage: () => disableUsedPercentage,
    canLogout: () => !noAuth && (loginPage || logoutPage !== "/login"),
  },
  methods: {
    ...mapActions(useLayoutStore, ["closeHovers", "showHover"]),
    abortOngoingFetchUsage() {
      this.usageAbortController.abort();
    },
    async fetchUsage() {
      const path = this.$route.path.endsWith("/")
        ? this.$route.path
        : this.$route.path + "/";
      let usageStats = USAGE_DEFAULT;
      if (this.disableUsedPercentage) {
        return Object.assign(this.usage, usageStats);
      }
      try {
        this.abortOngoingFetchUsage();
        this.usageAbortController = new AbortController();
        const usage = await api.usage(path, this.usageAbortController.signal);
        usageStats = {
          used: prettyBytes(usage.used, { binary: true }),
          total: prettyBytes(usage.total, { binary: true }),
          usedPercentage: Math.round((usage.used / usage.total) * 100),
        };
      } finally {
        return Object.assign(this.usage, usageStats);
      }
    },
    toRoot() {
      this.$router.push({ path: "/files" });
      this.closeHovers();
    },
    toAccountSettings() {
      this.$router.push({ path: "/settings/profile" });
      this.closeHovers();
    },
    toGlobalSettings() {
      this.$router.push({ path: "/settings/global" });
      this.closeHovers();
    },
    help() {
      this.showHover("help");
    },
    logout: auth.logout,
  },
  watch: {
    $route: {
      handler(to) {
        if (to.path.includes("/files")) {
          this.fetchUsage();
        }
      },
      immediate: true,
    },
  },
  unmounted() {
    this.abortOngoingFetchUsage();
  },
};
</script>
<style scoped>
nav {
  padding: 8px !important;
}

.new-button-container {
  padding: 8px 0px 16px 8px;
}

.new-button {
  background: var(--surfacePrimary) !important;
  color: var(--textSecondary) !important;
  border-radius: 16px !important;
  padding: 12px 24px 12px 16px !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3),
    0 1px 3px 1px rgba(0, 0, 0, 0.15) !important;
  display: flex !important;
  align-items: center !important;
  width: auto !important;
  transition: box-shadow 0.2s, background-color 0.2s !important;
  border: 1px solid var(--divider) !important;
}

.new-button:hover {
  background-color: var(--hover) !important;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3),
    0 4px 8px 3px rgba(0, 0, 0, 0.15) !important;
}

.new-button i {
  font-size: 32px;
  margin-right: 12px;
}

.new-button span {
  font-family: "Google Sans", Roboto, Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.25px;
}

.nav-item {
  margin: 0 !important;
  border-radius: 0 24px 24px 0 !important;
  padding: 0 12px 0 24px !important;
  height: 40px !important;
  display: flex !important;
  align-items: center !important;
  width: calc(100% - 8px) !important;
  color: var(--textPrimary) !important;
  font-size: 14px !important;
}

.nav-item i {
  margin-right: 12px;
  font-size: 20px;
}

.nav-item:hover {
  background-color: var(--hover) !important;
}

.nav-item.active {
  background-color: var(--item-selected) !important;
  color: var(--blue) !important;
}

.nav-item.active i {
  color: var(--blue) !important;
}

.credits {
  margin-top: auto !important;
  padding: 16px !important;
  font-size: 12px !important;
}
</style>
