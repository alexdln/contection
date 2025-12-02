"use client";

import { createStore } from "contection";

import { initialData, options } from "./data";

export const AppStore = createStore(initialData, options);
