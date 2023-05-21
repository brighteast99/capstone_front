import { reactive } from "vue";
import { defineStore } from "pinia";

// enums
const modalActions = {
  OK: { label: "확인", response: "OK" },
  Cancel: { label: "취소", color: "error", response: "Cancel" },
  Yes: { label: "예", response: "Yes" },
  No: { label: "아니요", color: "black", response: "No" },
};
Object.freeze(modalActions);
const modalPresets = {
  OK: [modalActions.OK],
  Yes: [modalActions.Yes],
  YesNo: [modalActions.Yes, modalActions.No],
  YesNoCancel: [modalActions.Yes, modalActions.No, modalActions.Cancel],
  OKCancel: [modalActions.OK, modalActions.Cancel],
};
Object.freeze(modalPresets);
const modalResponses = {
  Yes: "Yes",
  OK: "OK",
  No: "No",
  Cancel: "Cancel",
};
Object.freeze(modalResponses);

const useModalStore = defineStore("modal", () => {
  // States
  const modalState = reactive({
    display: false,
  });
  const modalData = reactive({
    title: null,
    content: null,
    response: null,
  });
  const modalOptions = reactive({
    persistent: false,
    actions: modalPresets.YesNo,
  });

  // Actions
  /**
   * @param {string} title - title of the modal
   * @param {string} content - content of the modal
   * @param {{persistent:{Type: Boolean, default: true}, actions:{Type: [{label:string,  response?:string, color?:string}], default:modalActions.YesNo} }} options - Persistency, actions of the modal
   * @param {modalActions} [actions=modalActions.YesNo] - Possible Actions of the modal
   * @returns Modal response proxy
   */
  const openModal = async (content, title, options) => {
    return new Promise((resolve, reject) => {
      modalData.content = content;
      modalData.title = title;

      if (!validOption(options)) {
        reject("Invalid modal option");
      } else {
        modalOptions.persistent = options.persistent ?? false;
        modalOptions.actions = options.actions ?? modalPresets.YesNo;

        modalState.display = true;

        let target = {};
        modalData.response = new Proxy(target, {
          set(target, prop, val) {
            resolve(val);
            target[prop] = val;
            return true;
          },
        });
      }
    });
  };
  const closeModal = (response) => {
    modalState.display = false;
    modalData.response.value = response;
  };

  // Internal function
  const validOption = (option) => {
    if (!option) return true;

    // Persistent must be boolean value
    if (
      Object.prototype.hasOwnProperty.call(option, "persistent") &&
      typeof option.persistent != "boolean"
    )
      return false;

    if (Object.prototype.hasOwnProperty.call(option, "actions")) {
      if (typeof option.actions != "object") return false;
      if (option.actions?.length == 0) return false;
      // Action must have label property, which is not empty
      for (const action of option.actions) {
        if (!Object.prototype.hasOwnProperty.call(action, "label"))
          return false;
        if (action.label.length == 0) return false;
      }
    }

    return true;
  };

  return {
    modalState,
    modalData,
    modalOptions,
    openModal,
    closeModal,
  };
});

export { useModalStore, modalActions, modalPresets, modalResponses };
