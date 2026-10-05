import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // بنستخدم useEffect بشكل متعمد لجلب البيانات عند التحميل، ومزامنة
      // sessionStorage، وتوليد قيم عشوائية بعد الـ mount لتفادي hydration
      // mismatch — كلها أنماط سليمة ومقصودة، فبنخفف القاعدة دي لتحذير فقط.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
