import { createContext } from "react";

const LanguageContext = createContext({
  lang: "da",
  setLang: () => {},
});

export default LanguageContext;
