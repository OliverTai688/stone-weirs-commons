import { lang as rootLang } from "next/root-params";
import { notFound } from "next/navigation";
import { dictionaries } from "./dictionaries";
import { isLang, type Lang } from "./config";

/** Current language from the [lang] root segment (Server Components only). */
export async function getLang(): Promise<Lang> {
  const l = await rootLang();
  if (!isLang(l)) notFound();
  return l;
}

export async function getDict() {
  const lang = await getLang();
  return { lang, t: dictionaries[lang] };
}
