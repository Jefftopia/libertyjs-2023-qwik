import { component$, useContext } from "@builder.io/qwik";
import { ComponentsContext } from "~/root";
import Code from "../Code/code";

interface CompProps {
  uid: string;
}

export default component$((props: CompProps) => {
  const { uid } = props;
  const componentStore = useContext(ComponentsContext);
  const component = componentStore.components.find((el) => el.uid === uid);

  return (
    <div>
      {!component && <div>Component not found!</div>}
      {component && (
        <div>
          <h3>Source:</h3>
          <Code>{component.source}</Code>
          <br />
          <h3>Target Framework:</h3>
          <Code>{component.targetFramework}</Code>
          <br />
          <h3>Target:</h3>
          <Code>{component.target}</Code>
        </div>
      )}
    </div>
  );
});
