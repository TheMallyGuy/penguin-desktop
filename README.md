# PenguinDesktop

This is an experimental unofficial offline desktop app for [Penguinmod](http://studio.penguinmod.com/editor.html).

This project works by building the penguinmod editor and pack it using Tauri. To improve user experience I've injected compiled typescript into the built penguinmod editor at runtime, Thereforce modify the editor for QoL features.

# Contributing

Please follow [Tauri's prerequisites](https://tauri.app/start/prerequisites/) before contributing.

The injection code is at `/src-tauri/src/typescript/` fyi, please declare if your PR's code is AI generated. Thanks. 