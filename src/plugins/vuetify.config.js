import colors from "vuetify/lib/util/colors";

const customTheme = {
  dark: false,
  colors: {
    background: colors.grey.lighten4,
    primary_accent: colors.indigo.accent4,
    primary: colors.indigo.darken1,
    primary_variant: colors.indigo.darken4,
    secondary_accent: colors.teal.accent4,
    secondary: colors.teal.darken1,
    secondary_variant: colors.teal.darken4,
    warning: colors.yellow.darken4,
    error: colors.red.darken4,
  },
};

const themes = { customTheme };

const aliases = {};

const defaults = {
  global: {
    ripple: false,
  },
};

export { themes, aliases, defaults };
