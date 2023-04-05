import { reactive } from "vue";
import { defineStore } from "pinia";

export const useTextEditor = defineStore("textEditor", () => {
  const images = reactive([]);

  const getUsedImages = (doc) => {
    return images.filter((v) => doc.includes(v.url));
  };

  const register = (image) => {
    const exists = images.find((image) => image.image == image);
    if (exists) return exists.url;
    else {
      const url = window.URL.createObjectURL(image);
      images.push({ image: image, url: url });
      return url;
    }
  };
  const removeImage = (image) => {
    const idx = images.indexOf((v) => v.image == image);
    if (idx == -1) return -1;
    images.splice(idx, 1);
  };
  const clearImages = () => {
    images.splice(0, images.length);
  };

  return { images, getUsedImages, register, removeImage, clearImages };
});
