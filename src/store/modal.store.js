import { reactive, computed } from "vue";
import { defineStore } from "pinia";

const _actions = {
  OK: { label: "확인", response: "OK" },
  Cancel: { label: "취소", color: "error", response: "Cancel" },
  Yes: { label: "예", response: "Yes" },
  No: { label: "아니요", color: "black", response: "No" },
};
const modalActions = {
  OK: [_actions.OK],
  Yes: [_actions.Yes],
  YesNo: [_actions.Yes, _actions.No],
  YesNoCancel: [_actions.Yes, _actions.No, _actions.Cancel],
  OKCancel: [_actions.OK, _actions.Cancel],
};
Object.freeze(modalActions);
const modalResponses = {
  Yes: "Yes",
  OK: "OK",
  No: "No",
  Cancel: "Cancel",
};
Object.freeze(modalResponses);

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
      if (!Object.prototype.hasOwnProperty.call(action, "label")) return false;
      if (action.label.length == 0) return false;
    }
  }

  return true;
};

const useModal = defineStore("modal", () => {
  const _modalState = reactive({
    display: false,
  });

  const _modalData = reactive({
    title: null,
    content: null,
    response: null,
  });

  const _modalOptions = reactive({
    persistent: false,
    actions: modalActions.YesNo,
  });

  const modalState = computed(() => _modalState);
  const modalData = computed(() => _modalData);
  const modalOptions = computed(() => _modalOptions);

  /**
   * @param {string} title - title of the modal
   * @param {string} content - content of the modal
   * @param {{persistent:{Type: Boolean, default: false}, actions:{Type: [{label:string,  response?:string, color?:string}], default:modalActions.YesNo} }} options - Persistency of the modal
   * @param {modalActions} [actions=modalActions.YesNo] - Possible Actions of the modal
   * @returns Modal response proxy
   */
  const openModal = (content, title, options) => {
    return new Promise((resolve, reject) => {
      _modalData.content = content;
      _modalData.title = title;

      if (!validOption(options)) reject("Invalid modal option");
      else {
        _modalOptions.persistent = options.persistent ?? false;
        _modalOptions.actions = options.actions ?? modalActions.YesNo;

        _modalState.display = true;

        let target = {};
        _modalData.response = new Proxy(target, {
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
    _modalState.display = false;
    _modalData.response.value = response;
  };

  return {
    modalState,
    modalData,
    modalOptions,
    openModal,
    closeModal,
  };
});

export { useModal, modalActions, modalResponses };
