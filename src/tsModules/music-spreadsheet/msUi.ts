import { TsUi } from "../textarea-spreadsheet/tsUi";
import { MsEditor } from "./msEditor";

export class MsUi extends HTMLElement {
  constructor(public msEditor: MsEditor) {
    super();
  }
  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const tsUi = <TsUi>document.createElement('textarea-spreadsheet-ui');
    shadowRoot.appendChild(tsUi);
    this.msEditor = new MsEditor(tsUi.tsEditor);
  }
}

customElements.define('music-spreadsheet-ui', MsUi);