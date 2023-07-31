import { TsUi } from "../textarea-spreadsheet/tsUi";
import { genLink } from "./genLink";
import { MsEditor } from "./msEditor";

export class MsUi extends HTMLElement {
  constructor(public msEditor: MsEditor) {
    super();
  }
  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const tsUi = <TsUi>document.createElement('textarea-spreadsheet-ui');
    shadowRoot.appendChild(tsUi);
    const div = <HTMLDivElement>document.createElement('div');
    div.innerHTML = html;
    shadowRoot.appendChild(div);
    const iframe = <HTMLIFrameElement>shadowRoot.getElementById('sheet-music-iframe');
    this.msEditor = new MsEditor(tsUi.tsEditor);
    tsUi.tsEditor.onRender(() => {
      iframe.src = genLink(tsUi.tsEditor.textTable);
      // console.log(iframe.src)
    });
  }
}

const html = `
<iframe id="sheet-music-iframe"
    title="Sheet Music"
    width="100%"
    height="450">
</iframe>
`
customElements.define('music-spreadsheet-ui', MsUi);