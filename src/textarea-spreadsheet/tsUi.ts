import { TsEditor } from "./tsEditor";

export class TsUi extends HTMLElement {
  constructor(public tsEditor: TsEditor) {
    super();
  }
  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const textarea: HTMLTextAreaElement = <HTMLTextAreaElement>document.createElement('textarea');
    textarea.id = 'editing-textarea';
    textarea.style.width = '100%';
    textarea.rows = 20;
    textarea.spellcheck = false;
    textarea.autofocus = true;
    shadowRoot.appendChild(textarea);
    this.tsEditor = new TsEditor(textarea);
  }
}

customElements.define('textarea-spreadsheet-ui', TsUi);
