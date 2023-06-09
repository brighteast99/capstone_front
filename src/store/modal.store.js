import { reactive } from "vue";
import { defineStore } from "pinia";
import { createToggle } from "@/modules/utility";

// enums
const modalResponses = {
  Yes: "Yes",
  OK: "OK",
  No: "No",
  Cancel: "Cancel",
  Delete: "Delete",
};
Object.freeze(modalResponses);
const modalActions = {
  OK: { label: "확인", response: modalResponses.OK },
  Cancel: { label: "취소", color: "error", response: modalResponses.Cancel },
  SafeCancel: {
    label: "취소",
    color: "black",
    response: modalResponses.Cancel,
  },
  Yes: { label: "예", response: modalResponses.Yes },
  No: { label: "아니요", color: "black", response: modalResponses.No },
  Delete: { label: "삭제", color: "error", response: modalResponses.Delete },
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

const useModalStore = defineStore("modal", () => {
  // States
  const { value: displayModal, toggle: toggleModal } = createToggle(false);
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
   * @returns {Proxy} Modal response proxy
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

        toggleModal(true);

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
    toggleModal(false);
    modalData.response.value = response;
  };
  const showErrorMessage = (message) => {
    if (message instanceof Error) message = message.message;
    return openModal(
      `${
        message || "오류가 발생했습니다."
      }\n나중에 다시 시도하거나 관리자에게 문의 바랍니다.`,
      null,
      { actions: modalPresets.OK }
    );
  };
  const showNoPermissionMessage = () =>
    openModal("권한이 없습니다!", null, {
      actions: [{ label: "OK" }],
    });
  const showNeedLoginMessage = () =>
    openModal("로그인이 필요합니다.", null, {
      actions: [
        { label: "로그인", response: "Login" },
        modalActions.SafeCancel,
      ],
    });

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
      if (!option.actions?.length) return false;
      // Action must have label property, which is not empty
      for (const action of option.actions) {
        if (!Object.prototype.hasOwnProperty.call(action, "label"))
          return false;
        if (!action.label.length) return false;
      }
    }

    return true;
  };

  return {
    displayModal,
    toggleModal,
    modalData,
    modalOptions,
    openModal,
    closeModal,
    showErrorMessage,
    showNoPermissionMessage,
    showNeedLoginMessage,
  };
});

export { useModalStore, modalActions, modalPresets, modalResponses };
