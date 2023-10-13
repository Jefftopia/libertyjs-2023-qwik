import { $, QRL, component$, useContext, useTask$ } from "@builder.io/qwik";
import { Link, routeLoader$ } from "@builder.io/qwik-city";
import {
  InitialValues,
  SubmitHandler,
  formAction$,
  getValue,
  useForm,
  valiForm$,
} from "@modular-forms/qwik";
import OpenAI from "openai";
import { object, enumType, string, minLength, maxLength, Input } from "valibot";
import Code from "~/components/Code/code";
import { ComponentDef } from "~/models/component.model";
import { ComponentsContext } from "~/root";

function getUUID() {
  const a = new Uint8Array(24);
  window.crypto.getRandomValues(a);
  return btoa(String.fromCharCode.apply(null, a as unknown as number[]));
}

const EditorFormSchema = object({
  framework: enumType(
    ["angular", "react", "vue", "svelte", "stenciljs", "lit"],
    "Hey, you did not pick a framework!",
  ),
  componentDefinition: string([
    minLength(1, "Hey, thats not a component"),
    maxLength(500, "Hey, this component is a bit much, dont you think?"),
  ]),
});

export const useformLoader = routeLoader$<InitialValues<EditorForm>>(() => ({
  framework: "angular",
  componentDefinition: `
  @Component({
  selector: 'my-app',
  template: \`
    <h1>Hello from {{name}}!</h1>
    <a target="_blank" href="https://angular.io/start">
      Learn more about Angular 
    </a>
  \`,
})
export class App {
  name = 'Angular';
}
  `,
}));

export const useFormAction = formAction$<
  EditorForm,
  OpenAI.Chat.ChatCompletion.Choice
>(async (values, requestEvent) => {
  // runs on server
  console.log("[useFormAction ]", values);

  const client = new OpenAI({ apiKey: requestEvent.env.get("OPEN_API_KEY") });

  try {
    const completion = await client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `translate the following code into the ${values.framework} javascript framework, responding with code only: ${values.componentDefinition}`,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    console.log("completion: ", completion.choices[0]);

    return {
      data: completion.choices[0],
      status: "success",
      message: "success",
    };
  } catch (err) {
    return {
      data: undefined,
      status: "error",
      message: "error",
    };
  }
}, valiForm$(EditorFormSchema));

type EditorForm = Input<typeof EditorFormSchema>;

export default component$(() => {
  const componentStore = useContext(ComponentsContext);

  const [editorForm, { Form, Field }] = useForm<
    EditorForm,
    OpenAI.Chat.ChatCompletion.Choice
  >({
    loader: useformLoader(),
    validate: valiForm$(EditorFormSchema),
    action: useFormAction(),
  });

  const handleSubmit: QRL<SubmitHandler<EditorForm>> = $((values: any) => {
    console.log("I run on the client!", values);
  });

  useTask$(({ track }) => {
    // useEffect
    track(() => editorForm.response.data);

    if (editorForm.response.data?.message.content) {
      const frameworkValue = getValue(editorForm, "framework");
      const componentDef = getValue(editorForm, "componentDefinition");

      console.log("use task running...");

      const entry: ComponentDef = {
        source: componentDef!,
        target: editorForm.response.data.message.content,
        targetFramework: frameworkValue,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        uid: crypto.randomUUID ? crypto.randomUUID() : getUUID(),
      };

      componentStore.addComponent(entry);
    }
  });

  return (
    <section class="max-w mx-4 bg-white">
      <div class="grid grid-cols-2 gap-4">
        <Form onSubmit$={handleSubmit}>
          <Field name="framework">
            {(field, props) => (
              <div class="mb-3 flex flex-col">
                <select {...props} class="rounded-sm border-2 p-2">
                  {[
                    { label: "Angular", value: "angular" },
                    { label: "Vue", value: "vue" },
                    { label: "React", value: "react" },
                    { label: "Svelte", value: "svelte" },
                    { label: "Stencil", value: "stenciljs" },
                    { label: "lit", value: "lit" },
                  ].map(({ label, value }) => (
                    <option
                      key={value}
                      label={value}
                      value={value}
                      selected={field.value === value}
                    >
                      {label}
                    </option>
                  ))}
                </select>
                {field.error && <div>{field.error}</div>}
              </div>
            )}
          </Field>
          <Field name="componentDefinition">
            {(field, props) => (
              <div class="mb-3 flex flex-col">
                <label for="textarea-1" class="m-2">
                  Enter details
                </label>
                <textarea
                  {...props}
                  id="textarea-1"
                  rows={25}
                  value={field.value}
                  class="rounded-sm border-2 p-2"
                />
                {field.error && <div>{field.error}</div>}
              </div>
            )}
          </Field>
          <button type="submit" class="rounded-lg border-2 p-4">
            Translate!
          </button>
        </Form>
        <div>
          <div>
            <h3 class="mb-3">
              {editorForm.submitting ? "Loading..." : "Result:"}
            </h3>

            {componentStore.components[0]?.uid && (
              <Link
                class="text-blue-600 underline visited:text-purple-600 hover:text-blue-800"
                href={`/components/${componentStore.components[0]?.uid}`}
              >
                View Result
              </Link>
            )}

            <Code>
              {editorForm.response.data &&
                editorForm.response.data.message.content}
            </Code>
          </div>
        </div>
      </div>
    </section>
  );
});
