import {
  ADD_IMAGES,
  FINISH_LOADING,
  LOADING,
  SORT,
  ERROR,
  CHECK,
  CANCEL_ALL,
  CHECK_ALL,
} from './actions';

export function getName(url) {
  const imgName = url.split('/').pop();
  return imgName.slice(0, imgName.lastIndexOf('.'));
}

let globalSort = 'По размеру';
let globalValue = '';

export function reducer(state, action) {
  switch (action.type) {
    case LOADING:
      return { ...state, loading: true, errorMessage: '', imagesHas: false };

    case ADD_IMAGES:
      return { ...state, originalArray: action.images, originalUrl: action.url, imagesHas: true };

    case FINISH_LOADING: {
      const images = setImages(sortImages(state.originalArray, globalSort));
      const formats = {};
      const allImages = state.originalArray.map((item, index) => {
        const format = item.size.format;
        if (!formats[format]) {
          formats[format] = [item];
        } else {
          formats[format].push(item);
        }
        item.name = getName(item.src);
        item.id = index + 1;
        return item;
      });

      let url = state.originalUrl;
      if (url.startsWith('http://')) url = url.replace('http://', '');
      else if (url.startsWith('https://')) url = url.replace('https://', '');

      if (state.checked.length) state.checked = [];

      return {
        ...state,
        formats,
        pageUrl: url,
        images,
        activeFormat: '',
        imagesHas: true,
        allImages,
        loading: false,
        photosPage: true,
      };
    }

    case SORT: {
      const { format, sort, value } = action;
      let images = [...state.allImages];
      if (sort) globalSort = sort;
      if (value !== undefined) globalValue = value;

      if (globalValue.length) {
        images = images.filter((item) =>
          String(item.size.width).startsWith(globalValue) ||
          String(item.size.height).startsWith(globalValue) ||
          item.name.startsWith(globalValue) ||
          item.size.format.startsWith(globalValue) ||
          item.src.startsWith(globalValue)
        );
      }

      if (format) {
        if (state.activeFormat === format) {
          state.activeFormat = '';
        } else {
          state.activeFormat = format;
          images = images.filter((item) => item.size.format === format);
        }
      } else if (state.activeFormat) {
        images = images.filter((item) => item.size.format === state.activeFormat);
      }

      sortImages(images, globalSort);
      state.images = setImages(images);
      return { ...state };
    }

    case CHECK: {
      const item = state.allImages.find((item) => item.id === action.id);
      if (item.check) {
        state.checked = state.checked.filter((it) => it.id !== item.id);
        item.check = false;
      } else {
        state.checked.push(item);
        item.check = true;
      }
      return { ...state };
    }

    case CANCEL_ALL: {
      state.checked.forEach((item) => { item.check = false; });
      state.checked = [];
      return { ...state };
    }

    case CHECK_ALL: {
      for (const item of state.allImages) {
        if (item.check) continue;
        item.check = true;
        state.checked.push(item);
      }
      return { ...state };
    }

    case ERROR:
      return { ...state, errorMessage: action.message, loading: false };

    default:
      return state;
  }
}

function setImages(images) {
  const result = [];
  const arrCount = Math.ceil(images.length / 48);
  let index = 0;
  for (let i = 0; i < arrCount; i++) {
    const array = i === arrCount - 1 ? images.slice(index) : images.slice(index, index + 48);
    index += 48;
    result.push(array);
  }
  return result;
}

function sortImages(images, value) {
  if (value === 'По имени') images.sort((a, b) => a.name.localeCompare(b.name));
  else if (value === 'По высоте') images.sort((a, b) => b.size.height - a.size.height);
  else if (value === 'По длине') images.sort((a, b) => b.size.width - a.size.width);
  else images.sort((a, b) => b.size.size - a.size.size);
  return images;
}
