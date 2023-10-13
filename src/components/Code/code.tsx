import { Slot, component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./code.css?inline";

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <div>
      <pre class="rounded-sm">
        <Slot />
      </pre>
    </div>
  );
});
