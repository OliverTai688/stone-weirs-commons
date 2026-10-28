import "server-only";
import type { Lang } from "@/i18n/config";

const M = {
  en: {
    noEncryption: "The server hasn't configured APP_ENCRYPTION_KEY yet, so keys can't be saved.",
    badKey: "That doesn't look like a valid key",
    pickModel: "Please choose a model",
    modelNotAllowed: "This key can't use the selected model",
    rejected: "The provider rejected this key",
    unreachable: "Couldn't reach the AI provider, please try again later",
    enterKey: "Please enter a key first",
  },
  zh: {
    noEncryption: "伺服器尚未設定 APP_ENCRYPTION_KEY，暫時無法儲存金鑰。",
    badKey: "金鑰格式不正確",
    pickModel: "請選擇模型",
    modelNotAllowed: "這把金鑰無法使用所選的模型",
    rejected: "金鑰無效，供應商拒絕了這把金鑰",
    unreachable: "暫時無法連線到 AI 供應商，請稍後再試",
    enterKey: "請先輸入金鑰",
  },
};
export const msg = (lang: Lang) => M[lang];
