# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react";

export default tseslint.config({
  // Set the react version
  settings: { react: { version: "18.3" } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
  },
});
```

Here's quick documentation about frontend part of this project

...

you sure you want to know?<br>
╱ ╱▔▔▔▔▔▔▔╲<br>
 ╱         ╲<br>
 ▏      ╭  ▕<br>
▕╭━╮╮╭━╮┣╯ ▕<br>
▕┃▕▋┊┃▕▋╰╮  ▏<br>
▕╰━╭╮╰━╯ ╰┈ ▏<br>
▕▂╮┗┛ ╭┳┳┳╯▕<br>
^v^ ┳┳┳┳┳┫╰┃▂╱<br>
^v^▕╋╋╋╋┫┃▕╯<br>
^v^▕┻┻┻┻┻╯▕<br>
^v^▕▂▂▂▂▂▂╱<br>

ok then<br>

┊▕▔╲┊┊┊▇◣▂◢▇▔▏┊<br>
┊╱┈┈▔▔▔▇▇▇▇▇┈╲┊<br>
╱┈┈┈┈┈┈▇◤▔◥▇┈┈╲<br>
▏┈┈┈┈┈┈┈┈┈┈┈┈┈▕<br>
▏╱┈┈▇┈┈┈┈┈▇┈┈╲▕<br>
╲╱┈┈┈┈┈▅┈┈┈┈┈╲╱<br>
┊╱╲▂▂▂▂▂▂▂▂▂╱╲┊<br>

So basically people who worked on front end is:

---

Nibras: Login and signup, Moods, zones <br>
Alex: Energy analysis, Devices<br>
Vir: Home, settings <br>

---

if you have any doubts, contact any member of our team (not only frontend team) to clarify any moments

A\_\_\_\_A<br>
|・ㅅ・| Meow<br>
|っ　ｃ|<br>
|　　　|<br>
|　　　|<br>
|　　　|<br>
|　　　|<br>
|　　　|<br>
|　　　| I Hope<br>
|　　　| You have<br>
|　　　| A nice Weekend! :3<br>
U ￣ ￣ U<br>
