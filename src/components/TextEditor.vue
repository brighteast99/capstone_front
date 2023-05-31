<template>
  <v-defaults-provider :defaults="defaults">
    <!-- Menu area-->
    <div class="wysiwyg-menu" v-if="props.editMode">
      <v-spacer></v-spacer>

      <!-- Font -->
      <!-- Font size -->
      <custom-dropdown
        :items="fontSizes"
        v-model="fontSize"
        style="width: 8em"
        @update:dropdownState="menuMVs.fontSize = $event"
      >
        <template v-slot:prepend-inner>
          <v-icon icon="mdi-format-size" :size="MENU_SUB_BTN_SIZE"></v-icon>
        </template>
      </custom-dropdown>

      <v-spacer></v-spacer>
      <v-divider></v-divider>
      <v-spacer></v-spacer>

      <!-- Format -->
      <!-- Bold -->
      <custom-btn
        :active="editor?.isActive('bold')"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        <v-icon icon="mdi-format-bold" :size="MENU_BTN_SIZE"></v-icon>
      </custom-btn>

      <!-- Italic -->
      <custom-btn
        :active="editor?.isActive('italic')"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        <v-icon icon="mdi-format-italic" :size="MENU_BTN_SIZE"></v-icon>
      </custom-btn>

      <!-- Underline -->
      <custom-btn
        :active="editor?.isActive('underline')"
        @click="editor?.chain().focus().toggleUnderline().run()"
      >
        <v-icon icon="mdi-format-underline" :size="MENU_BTN_SIZE"></v-icon>
      </custom-btn>

      <!-- Strikthrough -->
      <custom-btn
        :active="editor?.isActive('strike')"
        @click="editor?.chain().focus().toggleStrike().run()"
      >
        <v-icon icon="mdi-format-strikethrough" :size="MENU_BTN_SIZE"></v-icon>
      </custom-btn>

      <!-- Superscript -->
      <custom-btn
        :active="editor?.isActive('superscript')"
        @click="
          editor?.chain().focus().unsetSubscript().toggleSuperscript().run()
        "
      >
        <v-icon icon="mdi-format-superscript" :size="MENU_BTN_SIZE"></v-icon>
      </custom-btn>

      <!-- Subscript -->
      <custom-btn
        :active="editor?.isActive('subscript')"
        @click="
          editor?.chain().focus().unsetSuperscript().toggleSubscript().run()
        "
      >
        <v-icon icon="mdi-format-subscript" :size="MENU_BTN_SIZE"></v-icon>
      </custom-btn>

      <v-spacer></v-spacer>
      <v-divider></v-divider>
      <v-spacer></v-spacer>

      <!-- TextStyle -->
      <!-- Color -->
      <custom-btn :active="editor?.isActive('textStyle', { color: fontColor })">
        <div class="wysiwyg-stacked-icon">
          <v-icon
            icon="mdi-format-color-text"
            :size="MENU_SUB_BTN_SIZE"
          ></v-icon>

          <v-sheet
            class="wysiwyg-color-sample"
            :color="
              editor?.isActive('textStyle', { color: fontColor })
                ? fontColor
                : '#000000'
            "
          ></v-sheet>
        </div>

        <v-menu activator="parent" @update:model-value="menuMVs.Color = $event">
          <v-color-picker
            v-model="fontColor"
            mode="hex"
            hide-canvas
            hide-sliders
            hide-inputs
            show-swatches
            :swatches="swatches"
          >
          </v-color-picker>
        </v-menu>
      </custom-btn>

      <!-- Highlight -->
      <custom-btn :active="editor?.isActive('highlight')">
        <div class="wysiwyg-stacked-icon">
          <v-icon
            icon="mdi-format-color-highlight"
            :size="MENU_SUB_BTN_SIZE"
          ></v-icon>

          <v-sheet
            class="wysiwyg-color-sample"
            :color="
              editor?.isActive('highlight', { color: highlightColor })
                ? highlightColor
                : 'disabled'
            "
          ></v-sheet>
        </div>

        <v-menu
          activator="parent"
          @update:model-value="menuMVs.Highlight = $event"
        >
          <v-color-picker
            v-model="highlightColor"
            mode="hex"
            hide-canvas
            hide-sliders
            hide-inputs
            show-swatches
            :swatches="swatches"
          >
          </v-color-picker>
        </v-menu>
      </custom-btn>

      <v-spacer></v-spacer>
      <v-divider></v-divider>
      <v-spacer></v-spacer>

      <!-- TextAlign & Lists -->
      <!-- Align -->
      <custom-btn>
        <v-icon :icon="alignIcon" :size="MENU_BTN_SIZE"> </v-icon>
        <v-menu
          activator="parent"
          location="bottom center"
          @update:model-value="menuMVs.Align = $event"
        >
          <v-sheet class="py-2">
            <!-- Left -->
            <custom-btn
              class="pb-2"
              @click="editor?.chain().focus().setTextAlign('left').run()"
            >
              <v-icon
                icon="mdi-format-align-left"
                :size="MENU_SUB_BTN_SIZE"
              ></v-icon>
            </custom-btn>

            <!-- Center -->
            <custom-btn
              class="pb-2"
              @click="editor?.chain().focus().setTextAlign('center').run()"
            >
              <v-icon
                icon="mdi-format-align-center"
                :size="MENU_SUB_BTN_SIZE"
              ></v-icon>
            </custom-btn>

            <!-- Right -->
            <custom-btn
              @click="editor?.chain().focus().setTextAlign('right').run()"
            >
              <v-icon
                icon="mdi-format-align-right"
                :size="MENU_SUB_BTN_SIZE"
              ></v-icon>
            </custom-btn>
          </v-sheet>
        </v-menu>
      </custom-btn>

      <!-- List -->
      <custom-btn
        :active="
          editor?.isActive('orderedList') || editor?.isActive('bulletList')
        "
      >
        <v-icon :icon="listIcon" :size="MENU_BTN_SIZE"> </v-icon>
        <v-menu
          activator="parent"
          location="bottom center"
          @update:model-value="menuMVs.List = $event"
        >
          <v-sheet class="py-2">
            <!-- Bulleted -->
            <custom-btn
              class="pb-2"
              @click="
                if (!editor?.isActive('bulletList'))
                  editor?.chain().focus().toggleBulletList().run();
              "
            >
              <v-icon
                icon="mdi-format-list-bulleted"
                :size="MENU_SUB_BTN_SIZE"
              ></v-icon>
            </custom-btn>

            <!-- Ordered -->
            <custom-btn
              class="pb-2"
              @click="
                if (!editor?.isActive('orderedList'))
                  editor?.chain().focus().toggleOrderedList().run();
              "
            >
              <v-icon
                icon="mdi-format-list-numbered"
                :size="MENU_SUB_BTN_SIZE"
              ></v-icon>
            </custom-btn>

            <!-- Remove -->
            <custom-btn
              @click="editor?.chain().focus().liftListItem('listItem').run()"
            >
              <v-icon icon="mdi-cancel" :size="MENU_SUB_BTN_SIZE"></v-icon>
            </custom-btn>
          </v-sheet>
        </v-menu>
      </custom-btn>

      <v-spacer></v-spacer>
      <v-divider></v-divider>
      <v-spacer></v-spacer>

      <!-- Elements -->
      <!-- Horizontal rules -->
      <custom-btn @click="editor?.chain().focus().setHorizontalRule().run()">
        <div class="wysiwyg-stacked-icon">
          <v-icon icon="mdi-minus" :size="MENU_BTN_SIZE"></v-icon>
          <span class="wysiwyg-icon-label">구분선</span>
        </div>
      </custom-btn>

      <!-- Block quote -->
      <custom-btn
        :active="editor?.isActive('blockquote')"
        @click="editor?.chain().focus().toggleBlockquote().run()"
      >
        <div class="wysiwyg-stacked-icon">
          <div class="wysiwyg-icon-area">
            <v-icon
              icon="mdi-format-quote-open"
              :size="MENU_BTN_SIZE - 5"
            ></v-icon>
          </div>
          <span class="wysiwyg-icon-label">인용문</span>
        </div>
      </custom-btn>

      <!-- Image -->
      <custom-btn
        class="image-included"
        @mouseenter="setTimer(0)"
        @mouseleave="clearTimer(0)"
      >
        <div class="wysiwyg-stacked-icon">
          <div class="wysiwyg-icon-area">
            <v-icon icon="mdi-image-area" :size="MENU_BTN_SIZE - 5"></v-icon>
          </div>
          <span class="wysiwyg-icon-label">이미지</span>
        </div>

        <v-menu
          activator="parent"
          location="bottom right"
          v-model="menuMVs.Image"
          :close-on-content-click="false"
          :open-on-hover="false"
          :open-on-click="false"
          no-click-animation
          offset="0"
        >
          <v-card
            style="width: 20rem"
            v-click-outside="{
              handler: () => (menuMVs.Image = false),
              include: imageInclude,
            }"
          >
            <v-form ref="imageForm" @submit.prevent>
              <v-card-text class="pt-3 pb-2">
                <v-slide-y-transition leave-absolute>
                  <v-text-field
                    v-if="imageFormData.sourceIsURL"
                    v-model="imageFormData.url"
                    label="이미지 URL"
                    variant="underlined"
                    density="compact"
                    color="primary"
                    hide-details
                  ></v-text-field>
                  <v-file-input
                    v-else
                    v-model="imageFormData.file"
                    label="로컬 파일 선택 (3MB 이하)"
                    variant="underlined"
                    density="comfortable"
                    color="primary"
                    hide-details="auto"
                    clearable
                    accept="image/png, image/jpg, image/jpeg, image/svg+xml"
                    show-size
                    :rules="imageFormData.rules"
                  ></v-file-input>
                </v-slide-y-transition>
              </v-card-text>

              <v-card-actions class="pb-3">
                <custom-btn
                  class="pl-0"
                  color="secondary"
                  size="small"
                  @click="
                    imageFormData.sourceIsURL = !imageFormData.sourceIsURL
                  "
                >
                  <v-fade-transition leave-absolute>
                    <p
                      v-if="imageFormData.sourceIsURL"
                      class="text-left"
                      style="width: 100px"
                    >
                      로컬 파일 선택
                    </p>
                    <p v-else class="text-left" style="width: 100px">
                      URL 입력
                    </p>
                  </v-fade-transition>
                </custom-btn>
                <v-spacer></v-spacer>
                <v-btn
                  size="small"
                  color="primary"
                  variant="flat"
                  @click="insertImage"
                >
                  추가
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card>
        </v-menu>
      </custom-btn>

      <!-- Link -->
      <custom-btn
        class="link-included"
        @mouseenter="setTimer(1)"
        @mouseleave="clearTimer(1)"
      >
        <div class="wysiwyg-stacked-icon">
          <div class="wysiwyg-icon-area">
            <v-icon icon="mdi-link-variant" :size="MENU_BTN_SIZE - 8"></v-icon>
          </div>
          <span class="wysiwyg-icon-label">링크</span>
        </div>

        <v-menu
          activator="parent"
          v-model="menuMVs.Link"
          location="bottom right"
          :close-on-content-click="false"
          :open-on-hover="false"
          :open-on-click="false"
          no-click-animation
          offset="0"
        >
          <v-card
            style="width: 20rem"
            v-click-outside="{
              handler: () => (menuMVs.Link = false),
              include: linkInclude,
            }"
          >
            <v-form ref="linkForm" @submit.prevent>
              <v-card-text class="pt-3 pb-2">
                <v-text-field
                  class="pb-2"
                  v-model="linkFormData.url"
                  label="링크 주소"
                  variant="underlined"
                  density="compact"
                  color="primary"
                  hide-details
                ></v-text-field>
                <v-expand-transition>
                  <v-text-field
                    v-if="linkFormData.specifyName"
                    v-model="linkFormData.name"
                    label="링크 이름"
                    variant="underlined"
                    density="compact"
                    color="primary"
                    hide-details="auto"
                  ></v-text-field>
                </v-expand-transition>
              </v-card-text>

              <v-card-actions class="pb-3">
                <v-switch
                  v-model="linkFormData.specifyName"
                  color="secondary"
                  density="compact"
                  hide-details
                >
                  <template v-slot:label>
                    <p style="font-size: 0.8em">링크 이름</p>
                  </template>
                </v-switch>
                <v-spacer></v-spacer>
                <v-btn
                  size="small"
                  color="primary"
                  variant="flat"
                  type="submit"
                  @click="insertLink"
                >
                  추가
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card>
        </v-menu>
      </custom-btn>

      <v-spacer></v-spacer>
    </div>

    <!-- Editor area -->
    <editor-content :editor="editor" :class="{ editing: props.editMode }" />
  </v-defaults-provider>
</template>

<script setup>
import CustomDropdown from "@/components/CustomDropdown.vue";
import CustomBtn from "@/components/CustomBtn.vue";

import {
  ref,
  reactive,
  computed,
  defineProps,
  defineEmits,
  watch,
  watchEffect,
  onBeforeMount,
  onUnmounted,
} from "vue";

import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import FontSize from "@/modules/Tiptap/extension-font-size";
import { Underline } from "@tiptap/extension-underline";
import { Superscript } from "@tiptap/extension-superscript";
import { Subscript } from "@tiptap/extension-subscript";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { Image } from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

import { useTextEditor } from "@/store";

// Styles
const MENU_OPEN_DELAY = 50;
const MENU_CLOSE_DELAY = 250;
const defaults = {
  VCol: {
    cols: "auto",
  },
  VDivider: {
    vertical: true,
  },
  VSheet: {
    tile: true,
    border: true,
  },
  VMenu: {
    offset: "6px",
    openOnHover: true,
    openDelay: MENU_OPEN_DELAY,
    closeDelay: MENU_CLOSE_DELAY,
  },
};
const MENU_BTN_SIZE = 25;
const MENU_SUB_BTN_SIZE = 21;
const fontSizes = [11, 14, 16, 18, 20, 22, 24, 28, 30];
const swatches = [
  ["#00000000", "#ffffff", "#cccccc", "#888888", "#444444", "#000000"],
  ["#ffcdc0", "#ffad98", "#ff5f45", "#ff0010", "#ba0000", "#700001"],
  ["#ffe3c8", "#ffd1a4", "#ffa94f", "#ff9300", "#b85c00", "#823f00"],
  ["#fff8b2", "#fff593", "#ffef34", "#ffd300", "#ac9a00", "#6a5f00"],
  ["#e3fdc8", "#badf98", "#98d36c", "#54b800", "#36851e", "#245b12"],
  ["#c2f4db", "#3fcc9c", "#00b976", "#00a84b", "#007433", "#004e22"],
  ["#bdfbfa", "#15d0ca", "#00bfb5", "#009d91", "#00756a", "#00554c"],
  ["#b0f1ff", "#28e1ff", "#00cdff", "#00b3f2", "#007aa6", "#004e6a"],
  ["#9bdfff", "#5bc7ff", "#0095e9", "#0078cb", "#004e82", "#003960"],
  ["#fdd5f5", "#cd8bc0", "#bc61ab", "#aa1f91", "#740060", "#4f0041"],
];

// Components
const imageForm = ref(null);
const linkForm = ref(null);

// Pinia storage
const store = useTextEditor();

// Data
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [],
      },
    }),
    Placeholder.configure({
      placeholder: "부적절한 게시물은 안내 없이 삭제 조치될 수 있습니다.",
    }),
    FontSize,
    Underline,
    Superscript,
    Subscript,
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
    }),
    TextAlign.configure({
      types: ["heading", "paragraph", "image"],
      alignments: ["left", "center", "right"],
      defaultAlignment: "left",
    }),
    Image.configure({
      inline: true,
    }),
    Link,
  ],
  content: props.modelValue,
  editable: false,
  onUpdate: ({ editor }) => {
    if (editor.isEditable) {
      emit("update:modelValue", editor.getJSON());
    }
  },
});

const fontSize = computed({
  get: () => {
    const size = editor.value?.getAttributes("textStyle").fontSize;
    if (!size) return fontSizes[1];
    return parseInt(size, 10);
  },
  set: (value) => {
    editor.value?.chain().focus().setFontSize(value).run();
  },
});

const fontColor = computed({
  get: () => {
    const color = editor.value?.getAttributes("textStyle").color;
    if (!color) return "#000000";
    return color;
  },
  set: (value) => {
    if (value === "#00000000") editor.value?.chain().focus().unsetColor().run();
    else editor.value?.chain().focus().setColor(value).run();
  },
});
const highlightColor = computed({
  get: () => editor.value?.getAttributes("highlight").color ?? "#00000000",
  set: (value) => {
    if (value === "#00000000")
      editor.value?.chain().focus().unsetHighlight().run();
    else editor.value?.chain().focus().setHighlight({ color: value }).run();
  },
});

const alignIcon = computed(() => {
  let align = "left";
  if (editor.value?.isActive({ textAlign: "center" })) align = "center";
  if (editor.value?.isActive({ textAlign: "right" })) align = "right";

  return `mdi-format-align-${align}`;
});
const listIcon = computed(() =>
  editor.value?.isActive("orderedList")
    ? "mdi-format-list-numbered"
    : "mdi-format-list-bulleted"
);

const imageFormData = reactive({
  sourceIsURL: true,
  url: "",
  file: [],
  rules: [
    (v) => {
      if (imageFormData.sourceIsURL || !v) return true;
      for (const file of v)
        if (file.size > 3 * 1024 * 1024)
          return "3MB 이하 이미지만 첨부 가능합니다.";
      return true;
    },
  ],
});
const linkFormData = reactive({
  specifyName: false,
  url: "",
  name: "",
});

const timers = reactive({ image: null, link: null });
const menuMVs = reactive({
  FontSize: false,
  Color: false,
  Highlight: false,
  Align: false,
  List: false,
  Image: false,
  Link: false,
});
const floatMenu = computed(() =>
  Object.values(menuMVs).reduce((accum, value) => accum | value, false)
);

// Props & Emits
const props = defineProps({
  modelValue: Object,
  editMode: Boolean,
});
const emit = defineEmits(["update:modelValue"]);

// watches
watch(
  () => props.editMode,
  (value) => {
    editor.value?.setEditable(value);
  }
);
watch(
  () => props.modelValue,
  (value) => {
    const isSame =
      JSON.stringify(editor.value?.getJSON()) === JSON.stringify(value);

    if (isSame) {
      return;
    }

    editor.value?.commands.setContent(value, false);
  }
);
watchEffect(() => {
  if (props.editMode) editor.value?.setEditable(!floatMenu.value);

  if (!menuMVs.Image) imageForm.value?.reset();

  if (!menuMVs.Link) {
    const specifyName_old = linkFormData.specifyName;
    linkForm.value?.reset();
    linkFormData.specifyName = specifyName_old;
  }
});

// Hook
onBeforeMount(() => {
  editor.value?.commands.setContent(props.modelValue);
});
onUnmounted(() => {
  editor.value.destroy();
});

// Methods
const setTimer = (timer) => {
  if (timer == 0)
    timers.image = setTimeout(() => (menuMVs.Image = true), MENU_OPEN_DELAY);
  else timers.link = setTimeout(() => (menuMVs.Link = true), MENU_OPEN_DELAY);
};
const clearTimer = (timer) => {
  clearTimeout(timer == 0 ? timers.image : timers.link);
};
const imageInclude = () => {
  return [document.querySelector(".image-included")];
};
const linkInclude = () => {
  return [document.querySelector(".link-included")];
};

const insertImage = async () => {
  let url;

  if (imageFormData.sourceIsURL) {
    if (!imageFormData.url?.trim()) {
      menuMVs.Image = false;
      return;
    }
    url = imageFormData.url.trim();
  } else {
    const valid = (await imageForm.value?.validate()).valid;
    if (!valid) {
      menuMVs.Image = false;
      return;
    }
    url = store.register(imageFormData.file[0]);
  }

  editor.value?.commands.setImage({ src: url });
  menuMVs.Image = false;
};
const insertLink = () => {
  const url = linkFormData.url;
  if (!url?.trim()) {
    menuMVs.Link = false;
    return;
  }

  let name = linkFormData.name;
  const { from, to } = editor.value?.state.selection;
  if (!linkFormData.name) {
    name =
      from == to
        ? linkFormData.url
        : editor.value?.state.doc.textBetween(from, to);
  }

  editor.value
    ?.chain()
    .focus()
    .insertContent(
      `<a target="_blank" rel="noopener noreferrer nofollow" href="${url}">${name}</a>`
    )
    .run();

  menuMVs.Link = false;
};
</script>

<style lang="scss">
.editing {
  min-height: 30dvh;
  max-height: 50dvh;
  overflow-y: scroll;

  border: 1px solid lightgrey;
  border-radius: 0 0 3px 3px;
}

.ProseMirror {
  min-height: 30dvh;
  outline: 0px solid transparent;
  padding: 16px;

  ul,
  ol {
    padding-left: 1.5em;
  }
  hr {
    margin: 1.25em 0 1.25em 0;
    border: 0.75px solid lightgrey;
  }
  blockquote {
    padding-left: 1rem;
    border-left: 1.5px solid lightgrey;
  }
  img {
    max-width: 100%;
    height: auto;

    &.ProseMirror-selectednode {
      outline: 1.5px solid #68cef8;
    }
  }
  hr {
    &.ProseMirror-selectednode {
      border: 1px solid #68cef8;
    }
  }
  a {
    transition: color 0.1s;
    color: #1e88e5;
    font-weight: 500;
    text-decoration-line: none;
  }
  a:hover {
    color: #64b5f6;
  }
}
.ProseMirror p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.wysiwyg-menu {
  border: 1px solid lightgrey;
  border-bottom: 0px solid transparent;
  border-radius: 3px 3px 0 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: fit-content;
}

.wysiwyg-stacked-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-items: center;
}
.wysiwyg-color-sample {
  height: 3px;
  width: 20px;
}
.wysiwyg-icon-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
}
.wysiwyg-icon-label {
  font-size: 0.8em;
  line-height: 0.75;
  padding-bottom: 0.4em;
}
</style>
