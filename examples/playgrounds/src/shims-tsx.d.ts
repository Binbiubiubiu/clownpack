import Vue, { VNode } from "vue";

declare global {
  namespace JSX {
    // rome-ignore lint/suspicious/noEmptyInterface: <explanation>
    interface Element extends VNode {}
    // rome-ignore lint/suspicious/noEmptyInterface: <explanation>
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}
