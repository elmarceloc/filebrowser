<template>
  <div
    class="item"
    role="button"
    tabindex="0"
    :draggable="isDraggable"
    @dragstart="dragStart"
    @dragover="dragOver"
    @drop="drop"
    @click="itemClick"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
    @touchmove="handleTouchMove"
    :data-dir="isDir"
    :data-type="type"
    :aria-label="name"
    :aria-selected="isSelected"
    :data-ext="getExtension(name).toLowerCase()"
    @contextmenu="contextMenu"
  >
    <div>
      <img
        v-if="!readOnly && type === 'image' && isThumbsEnabled"
        v-lazy="thumbnailUrl"
      />
      <template v-else>
        <iconify-icon
          v-if="isDir"
          icon="vscode-icons:default-folder"
          width="32"
          height="32"
          class="folder-icon"
        ></iconify-icon>
        <iconify-icon
          v-else-if="getExtensionIcon(name)"
          :icon="getExtensionIcon(name)"
          width="96"
          height="96"
        ></iconify-icon>
        <template v-else>
          <i v-if="type === 'video'" class="material-icons video-icon">video_library</i>
          <i v-else-if="type === 'audio'" class="material-icons audio-icon">audiotrack</i>
          <i v-else-if="type === 'pdf'" class="material-icons pdf-icon">picture_as_pdf</i>
          <i v-else-if="type === 'image'" class="material-icons image-icon">image</i>
          <i v-else-if="['text', 'textImmutable'].includes(type)" class="material-icons text-icon">description</i>
          <i v-else class="material-icons file-icon">insert_drive_file</i>
        </template>
      </template>
    </div>

    <div>
      <p class="name">{{ name }}</p>

      <p v-if="isDir" class="size" data-order="-1">&mdash;</p>
      <p v-else class="size" :data-order="humanSize()">{{ humanSize() }}</p>

      <p class="modified">
        <time :datetime="modified">{{ humanTime() }}</time>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { useFileStore } from "@/stores/file";
import { useLayoutStore } from "@/stores/layout";

import { enableThumbs } from "@/utils/constants";
import { filesize } from "@/utils";
import dayjs from "dayjs";
import { files as api } from "@/api";
import * as upload from "@/utils/upload";
import { computed, inject, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const touches = ref<number>(0);

const longPressTimer = ref<number | null>(null);
const longPressTriggered = ref<boolean>(false);
const longPressDelay = ref<number>(500);
const startPosition = ref<{ x: number; y: number } | null>(null);
const moveThreshold = ref<number>(10);

const $showError = inject<IToastError>("$showError")!;
const router = useRouter();

const props = defineProps<{
  name: string;
  isDir: boolean;
  url: string;
  type: string;
  size: number;
  modified: string;
  index: number;
  readOnly?: boolean;
  path?: string;
}>();

const authStore = useAuthStore();
const fileStore = useFileStore();
const layoutStore = useLayoutStore();

const singleClick = computed(
  () => !props.readOnly && authStore.user?.singleClick
);
const isSelected = computed(
  () => fileStore.selected.indexOf(props.index) !== -1
);
const isDraggable = computed(
  () => !props.readOnly && authStore.user?.perm.rename
);

const canDrop = computed(() => {
  if (!props.isDir || props.readOnly) return false;

  for (const i of fileStore.selected) {
    if (fileStore.req?.items[i].url === props.url) {
      return false;
    }
  }

  return true;
});

const thumbnailUrl = computed(() => {
  const file = {
    path: props.path,
    modified: props.modified,
  };

  return api.getPreviewURL(file as Resource, "thumb");
});

const isThumbsEnabled = computed(() => {
  return enableThumbs;
});

const humanSize = () => {
  return props.type == "invalid_link" ? "invalid link" : filesize(props.size);
};

const getExtension = (filename: string) => {
  if (filename.startsWith(".")) {
    return "";
  }
  return filename.split(".").pop() || "";
};

const extensionIcons: Record<string, string> = {
  json: "vscode-icons:file-type-json",
  go: "vscode-icons:file-type-go",
  js: "vscode-icons:file-type-js-official",
  ts: "vscode-icons:file-type-typescript-official",
  py: "vscode-icons:file-type-python",
  html: "vscode-icons:file-type-html",
  css: "vscode-icons:file-type-css",
  pdf: "vscode-icons:file-type-pdf2",
  zip: "vscode-icons:file-type-zip",
  rar: "vscode-icons:file-type-zip",
  "7z": "vscode-icons:file-type-zip",
  png: "vscode-icons:file-type-image",
  jpg: "vscode-icons:file-type-image",
  jpeg: "vscode-icons:file-type-image",
  gif: "vscode-icons:file-type-image",
  svg: "vscode-icons:file-type-svg",
  mp4: "vscode-icons:file-type-video",
  mkv: "vscode-icons:file-type-video",
  mp3: "vscode-icons:file-type-audio",
  wav: "vscode-icons:file-type-audio",
  md: "vscode-icons:file-type-markdown",
  php: "vscode-icons:file-type-php",
  cpp: "vscode-icons:file-type-cpp",
  c: "vscode-icons:file-type-c",
  txt: "vscode-icons:file-type-text",
  sh: "vscode-icons:file-type-shell",
  yml: "vscode-icons:file-type-yaml",
  yaml: "vscode-icons:file-type-yaml",
  dockerfile: "vscode-icons:file-type-docker2",
  ai: "vscode-icons:file-type-ai",
  psd: "vscode-icons:file-type-photoshop",
  xls: "vscode-icons:file-type-excel",
  xlsx: "vscode-icons:file-type-excel",
  doc: "vscode-icons:file-type-word",
  docx: "vscode-icons:file-type-word",
  ppt: "vscode-icons:file-type-powerpoint",
  pptx: "vscode-icons:file-type-powerpoint",
  vue: "vscode-icons:file-type-vue",
  sass: "vscode-icons:file-type-sass",
  scss: "vscode-icons:file-type-scss",
  less: "vscode-icons:file-type-less",
  sql: "vscode-icons:file-type-sql",
  db: "vscode-icons:file-type-sql",
  exe: "vscode-icons:file-type-binary",
  dll: "vscode-icons:file-type-binary",
};

const getExtensionIcon = (filename: string) => {
  const ext = getExtension(filename).toLowerCase();
  return extensionIcons[ext] || null;
};

const humanTime = () => {
  if (!props.readOnly && authStore.user?.dateFormat) {
    return dayjs(props.modified).format("L LT");
  }
  return dayjs(props.modified).fromNow();
};

const dragStart = () => {
  if (fileStore.selectedCount === 0) {
    fileStore.selected.push(props.index);
    return;
  }

  if (!isSelected.value) {
    fileStore.selected = [];
    fileStore.selected.push(props.index);
  }
};

const dragOver = (event: Event) => {
  if (!canDrop.value) return;

  event.preventDefault();
  let el = event.target as HTMLElement | null;
  if (el !== null) {
    for (let i = 0; i < 5; i++) {
      if (!el?.classList.contains("item")) {
        el = el?.parentElement ?? null;
      }
    }

    if (el !== null) el.style.opacity = "1";
  }
};

const drop = async (event: Event) => {
  if (!canDrop.value) return;
  event.preventDefault();

  if (fileStore.selectedCount === 0) return;

  let el = event.target as HTMLElement | null;
  for (let i = 0; i < 5; i++) {
    if (el !== null && !el.classList.contains("item")) {
      el = el.parentElement;
    }
  }

  const items: any[] = [];

  for (const i of fileStore.selected) {
    if (fileStore.req) {
      items.push({
        from: fileStore.req?.items[i].url,
        to: props.url + encodeURIComponent(fileStore.req?.items[i].name),
        name: fileStore.req?.items[i].name,
        size: fileStore.req?.items[i].size,
        modified: fileStore.req?.items[i].modified,
        overwrite: false,
        rename: false,
      });
    }
  }

  // Get url from ListingItem instance
  if (el === null) {
    return;
  }
  const path = el.__vue__.url;
  const baseItems = (await api.fetch(path)).items;

  const action = (overwrite?: boolean, rename?: boolean) => {
    const action =
      (event as KeyboardEvent).ctrlKey || (event as KeyboardEvent).metaKey
        ? api.copy
        : api.move;
    action(items, overwrite, rename)
      .then(() => {
        fileStore.reload = true;
      })
      .catch($showError);
  };

  const conflict = upload.checkConflict(items, baseItems);

  if (conflict.length > 0) {
    layoutStore.showHover({
      prompt: "resolve-conflict",
      props: {
        conflict: conflict,
      },
      confirm: (event: Event, result: Array<ConflictingResource>) => {
        event.preventDefault();
        layoutStore.closeHovers();
        for (let i = result.length - 1; i >= 0; i--) {
          const item = result[i];
          if (item.checked.length == 2) {
            items[item.index].rename = true;
          } else if (item.checked.length == 1 && item.checked[0] == "origin") {
            items[item.index].overwrite = true;
          } else {
            items.splice(item.index, 1);
          }
        }
        if (items.length > 0) {
          action();
        }
      },
    });

    return;
  }

  action(false, false);
};

const itemClick = (event: Event | KeyboardEvent) => {
  // If long press was triggered, prevent normal click behavior
  if (longPressTriggered.value) {
    longPressTriggered.value = false;
    return;
  }

  if (
    singleClick.value &&
    !(event as KeyboardEvent).ctrlKey &&
    !(event as KeyboardEvent).metaKey &&
    !(event as KeyboardEvent).shiftKey &&
    !fileStore.multiple
  )
    open();
  else click(event);
};

const contextMenu = (event: MouseEvent) => {
  event.preventDefault();
  if (
    fileStore.selected.length === 0 ||
    event.ctrlKey ||
    fileStore.selected.indexOf(props.index) === -1
  ) {
    click(event);
  }
};

const click = (event: Event | KeyboardEvent) => {
  if (!singleClick.value && fileStore.selectedCount !== 0)
    event.preventDefault();

  setTimeout(() => {
    touches.value = 0;
  }, 300);

  touches.value++;
  if (touches.value > 1) {
    open();
  }

  if (fileStore.selected.indexOf(props.index) !== -1) {
    if (
      (event as KeyboardEvent).ctrlKey ||
      (event as KeyboardEvent).metaKey ||
      fileStore.multiple
    ) {
      fileStore.removeSelected(props.index);
    } else {
      fileStore.selected = [props.index];
    }
    return;
  }

  if ((event as KeyboardEvent).shiftKey && fileStore.selected.length > 0) {
    let fi = 0;
    let la = 0;

    if (props.index > fileStore.selected[0]) {
      fi = fileStore.selected[0] + 1;
      la = props.index;
    } else {
      fi = props.index;
      la = fileStore.selected[0] - 1;
    }

    for (; fi <= la; fi++) {
      if (fileStore.selected.indexOf(fi) == -1) {
        fileStore.selected.push(fi);
      }
    }

    return;
  }

  if (
    !(event as KeyboardEvent).ctrlKey &&
    !(event as KeyboardEvent).metaKey &&
    !fileStore.multiple
  ) {
    fileStore.selected = [];
  }
  fileStore.selected.push(props.index);
};

const open = () => {
  router.push({ path: props.url });
};


// Long-press helper functions
const startLongPress = (clientX: number, clientY: number) => {
  startPosition.value = { x: clientX, y: clientY };
  longPressTimer.value = window.setTimeout(() => {
    handleLongPress();
  }, longPressDelay.value);
};

const cancelLongPress = () => {
  if (longPressTimer.value !== null) {
    window.clearTimeout(longPressTimer.value);
    longPressTimer.value = null;
  }
  startPosition.value = null;
};

const handleLongPress = () => {
  if (singleClick.value) {
    longPressTriggered.value = true;
    click(new Event("longpress"));
  }
  cancelLongPress();
};

const checkMovement = (clientX: number, clientY: number): boolean => {
  if (!startPosition.value) return false;

  const deltaX = Math.abs(clientX - startPosition.value.x);
  const deltaY = Math.abs(clientY - startPosition.value.y);

  return deltaX > moveThreshold.value || deltaY > moveThreshold.value;
};

// Event handlers
const handleMouseDown = (event: MouseEvent) => {
  if (event.button === 0) {
    startLongPress(event.clientX, event.clientY);
  }
};

const handleMouseUp = () => {
  cancelLongPress();
};

const handleMouseLeave = () => {
  cancelLongPress();
};

const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length === 1) {
    const touch = event.touches[0];
    startLongPress(touch.clientX, touch.clientY);
  }
};

const handleTouchEnd = () => {
  cancelLongPress();
};

const handleTouchCancel = () => {
  cancelLongPress();
};

const handleTouchMove = (event: TouchEvent) => {
  if (event.touches.length === 1 && startPosition.value) {
    const touch = event.touches[0];
    if (checkMovement(touch.clientX, touch.clientY)) {
      cancelLongPress();
    }
  }
};
</script>
