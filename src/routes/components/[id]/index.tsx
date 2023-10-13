import { component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import ResultDisplay from "../../../components/result-display/result-display";

export default component$(() => {
  const { params } = useLocation();
  const { id } = params;
  return <ResultDisplay uid={id}></ResultDisplay>;
});
