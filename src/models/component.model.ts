import { type QRL } from "@builder.io/qwik";

export interface ComponentDef {
  source: string; // source code of the component
  target: string; // target code of the component
  targetFramework: FrameworkValues|undefined; // target framework of the component
  uid: string; // unique id of component
}

export interface ComponentStore {
  components: ComponentDef[];
  addComponent: QRL<(this: ComponentStore, comp: ComponentDef) => void>;
}

type FrameworkValues = 'angular'|'vue'|'react'|'svelte'|'stenciljs'|'lit';
