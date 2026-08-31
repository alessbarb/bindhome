(()=>{var H=globalThis,O=H.ShadowRoot&&(H.ShadyCSS===void 0||H.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,B=Symbol(),X=new WeakMap,S=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==B)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(O&&t===void 0){let i=e!==void 0&&e.length===1;i&&(t=X.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&X.set(e,t))}return t}toString(){return this.cssText}},Y=o=>new S(typeof o=="string"?o:o+"",void 0,B),z=(o,...t)=>{let e=o.length===1?o[0]:t.reduce((i,s,r)=>i+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+o[r+1],o[0]);return new S(e,o,B)},tt=(o,t)=>{if(O)o.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let i=document.createElement("style"),s=H.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=e.cssText,o.appendChild(i)}},I=O?o=>o:o=>o instanceof CSSStyleSheet?(t=>{let e="";for(let i of t.cssRules)e+=i.cssText;return Y(e)})(o):o;var{is:ft,defineProperty:_t,getOwnPropertyDescriptor:yt,getOwnPropertyNames:vt,getOwnPropertySymbols:mt,getPrototypeOf:$t}=Object,U=globalThis,et=U.trustedTypes,xt=et?et.emptyScript:"",At=U.reactiveElementPolyfillSupport,E=(o,t)=>o,L={toAttribute(o,t){switch(t){case Boolean:o=o?xt:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,t){let e=o;switch(t){case Boolean:e=o!==null;break;case Number:e=o===null?null:Number(o);break;case Object:case Array:try{e=JSON.parse(o)}catch{e=null}}return e}},it=(o,t)=>!ft(o,t),st={attribute:!0,type:String,converter:L,reflect:!1,useDefault:!1,hasChanged:it};Symbol.metadata??=Symbol("metadata"),U.litPropertyMetadata??=new WeakMap;var b=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=st){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let i=Symbol(),s=this.getPropertyDescriptor(t,i,e);s!==void 0&&_t(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){let{get:s,set:r}=yt(this.prototype,t)??{get(){return this[e]},set(a){this[e]=a}};return{get:s,set(a){let d=s?.call(this);r?.call(this,a),this.requestUpdate(t,d,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??st}static _$Ei(){if(this.hasOwnProperty(E("elementProperties")))return;let t=$t(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(E("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(E("properties"))){let e=this.properties,i=[...vt(e),...mt(e)];for(let s of i)this.createProperty(s,e[s])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[i,s]of e)this.elementProperties.set(i,s)}this._$Eh=new Map;for(let[e,i]of this.elementProperties){let s=this._$Eu(e,i);s!==void 0&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let i=new Set(t.flat(1/0).reverse());for(let s of i)e.unshift(I(s))}else t!==void 0&&e.push(I(t));return e}static _$Eu(t,e){let i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return tt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){let i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(s!==void 0&&i.reflect===!0){let r=(i.converter?.toAttribute!==void 0?i.converter:L).toAttribute(e,i.type);this._$Em=t,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){let i=this.constructor,s=i._$Eh.get(t);if(s!==void 0&&this._$Em!==s){let r=i.getPropertyOptions(s),a=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:L;this._$Em=s;let d=a.fromAttribute(e,r.type);this[s]=d??this._$Ej?.get(s)??d,this._$Em=null}}requestUpdate(t,e,i,s=!1,r){if(t!==void 0){let a=this.constructor;if(s===!1&&(r=this[t]),i??=a.getPropertyOptions(t),!((i.hasChanged??it)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(a._$Eu(t,i))))return;this.C(t,e,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},a){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,a??e??this[t]),r!==!0||a!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),s===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,r]of this._$Ep)this[s]=r;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[s,r]of i){let{wrapped:a}=r,d=this[s];a!==!0||this._$AL.has(s)||d===void 0||this.C(s,void 0,r,d)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(e)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[E("elementProperties")]=new Map,b[E("finalized")]=new Map,At?.({ReactiveElement:b}),(U.reactiveElementVersions??=[]).push("2.1.2");var Q=globalThis,rt=o=>o,M=Q.trustedTypes,at=M?M.createPolicy("lit-html",{createHTML:o=>o}):void 0,ht="$lit$",_=`lit$${Math.random().toFixed(9).slice(2)}$`,pt="?"+_,wt=`<${pt}>`,$=document,k=()=>$.createComment(""),R=o=>o===null||typeof o!="object"&&typeof o!="function",K=Array.isArray,St=o=>K(o)||typeof o?.[Symbol.iterator]=="function",D=`[
\f\r]`,C=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ot=/-->/g,nt=/>/g,v=RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^
\f\r"'\`<>=]|("|')|))|$)`,"g"),lt=/'/g,dt=/"/g,ut=/^(?:script|style|textarea|title)$/i,J=o=>(t,...e)=>({_$litType$:o,strings:t,values:e}),l=J(1),Ht=J(2),Ot=J(3),x=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),ct=new WeakMap,m=$.createTreeWalker($,129);function gt(o,t){if(!K(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return at!==void 0?at.createHTML(t):t}var Et=(o,t)=>{let e=o.length-1,i=[],s,r=t===2?"<svg>":t===3?"<math>":"",a=C;for(let d=0;d<e;d++){let n=o[d],h,u,c=-1,g=0;for(;g<n.length&&(a.lastIndex=g,u=a.exec(n),u!==null);)g=a.lastIndex,a===C?u[1]==="!--"?a=ot:u[1]!==void 0?a=nt:u[2]!==void 0?(ut.test(u[2])&&(s=RegExp("</"+u[2],"g")),a=v):u[3]!==void 0&&(a=v):a===v?u[0]===">"?(a=s??C,c=-1):u[1]===void 0?c=-2:(c=a.lastIndex-u[2].length,h=u[1],a=u[3]===void 0?v:u[3]==='"'?dt:lt):a===dt||a===lt?a=v:a===ot||a===nt?a=C:(a=v,s=void 0);let f=a===v&&o[d+1].startsWith("/>")?" ":"";r+=a===C?n+wt:c>=0?(i.push(h),n.slice(0,c)+ht+n.slice(c)+_+f):n+_+(c===-2?d:f)}return[gt(o,r+(o[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]},T=class o{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,a=0,d=t.length-1,n=this.parts,[h,u]=Et(t,e);if(this.el=o.createElement(h,i),m.currentNode=this.el.content,e===2||e===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(s=m.nextNode())!==null&&n.length<d;){if(s.nodeType===1){if(s.hasAttributes())for(let c of s.getAttributeNames())if(c.endsWith(ht)){let g=u[a++],f=s.getAttribute(c).split(_),P=/([.?@])?(.*)/.exec(g);n.push({type:1,index:r,name:P[2],strings:f,ctor:P[1]==="."?V:P[1]==="?"?W:P[1]==="@"?q:w}),s.removeAttribute(c)}else c.startsWith(_)&&(n.push({type:6,index:r}),s.removeAttribute(c));if(ut.test(s.tagName)){let c=s.textContent.split(_),g=c.length-1;if(g>0){s.textContent=M?M.emptyScript:"";for(let f=0;f<g;f++)s.append(c[f],k()),m.nextNode(),n.push({type:2,index:++r});s.append(c[g],k())}}}else if(s.nodeType===8)if(s.data===pt)n.push({type:2,index:r});else{let c=-1;for(;(c=s.data.indexOf(_,c+1))!==-1;)n.push({type:7,index:r}),c+=_.length-1}r++}}static createElement(t,e){let i=$.createElement("template");return i.innerHTML=t,i}};function A(o,t,e=o,i){if(t===x)return t;let s=i!==void 0?e._$Co?.[i]:e._$Cl,r=R(t)?void 0:t._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),r===void 0?s=void 0:(s=new r(o),s._$AT(o,e,i)),i!==void 0?(e._$Co??=[])[i]=s:e._$Cl=s),s!==void 0&&(t=A(o,s._$AS(o,t.values),s,i)),t}var j=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??$).importNode(e,!0);m.currentNode=s;let r=m.nextNode(),a=0,d=0,n=i[0];for(;n!==void 0;){if(a===n.index){let h;n.type===2?h=new N(r,r.nextSibling,this,t):n.type===1?h=new n.ctor(r,n.name,n.strings,this,t):n.type===6&&(h=new F(r,this,t)),this._$AV.push(h),n=i[++d]}a!==n?.index&&(r=m.nextNode(),a++)}return m.currentNode=$,s}p(t){let e=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}},N=class o{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=A(this,t,e),R(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==x&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):St(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==p&&R(this._$AH)?this._$AA.nextSibling.data=t:this.T($.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:i}=t,s=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=T.createElement(gt(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{let r=new j(s,this),a=r.u(this.options);r.p(e),this.T(a),this._$AH=r}}_$AC(t){let e=ct.get(t.strings);return e===void 0&&ct.set(t.strings,e=new T(t)),e}k(t){K(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,i,s=0;for(let r of t)s===e.length?e.push(i=new o(this.O(k()),this.O(k()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let i=rt(t).nextSibling;rt(t).remove(),t=i}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},w=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=p}_$AI(t,e=this,i,s){let r=this.strings,a=!1;if(r===void 0)t=A(this,t,e,0),a=!R(t)||t!==this._$AH&&t!==x,a&&(this._$AH=t);else{let d=t,n,h;for(t=r[0],n=0;n<r.length-1;n++)h=A(this,d[i+n],e,n),h===x&&(h=this._$AH[n]),a||=!R(h)||h!==this._$AH[n],h===p?t=p:t!==p&&(t+=(h??"")+r[n+1]),this._$AH[n]=h}a&&!s&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},V=class extends w{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}},W=class extends w{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==p)}},q=class extends w{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=A(this,t,e,0)??p)===x)return;let i=this._$AH,s=t===p&&i!==p||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==p&&(i===p||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},F=class{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){A(this,t)}};var Ct=Q.litHtmlPolyfillSupport;Ct?.(T,N),(Q.litHtmlVersions??=[]).push("3.3.3");var bt=(o,t,e)=>{let i=e?.renderBefore??t,s=i._$litPart$;if(s===void 0){let r=e?.renderBefore??null;i._$litPart$=s=new N(t.insertBefore(k(),r),r,void 0,e??{})}return s._$AI(o),s};var Z=globalThis,y=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=bt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return x}};y._$litElement$=!0,y.finalized=!0,Z.litElementHydrateSupport?.({LitElement:y});var kt=Z.litElementPolyfillSupport;kt?.({LitElement:y});(Z.litElementVersions??=[]).push("4.2.2");var G=class extends y{static get properties(){return{hass:{type:Object},narrow:{type:Boolean},route:{type:Object},panel:{type:Object},_loading:{type:Boolean},_error:{type:String},_registry:{type:Object},_currentView:{type:String},_selectedAssetId:{type:String},_filterQuery:{type:String},_filterType:{type:String}}}static get styles(){return z`
      :host {
        display: block;
        height: 100vh;
        background-color: var(--primary-background-color, #fafafa);
        color: var(--primary-text-color, #212121);
        font-family: var(--paper-font-body1_-_font-family, Roboto, Noto, sans-serif);
        box-sizing: border-box;
      }

      .panel-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }

      header {
        background-color: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #ffffff);
        padding: 12px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 4px rgba(0,0,0,0.14);
        z-index: 1;
      }

      .header-title {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-title h1 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }

      .badge-v0 {
        background: rgba(255, 255, 255, 0.2);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      nav {
        display: flex;
        gap: 4px;
        background: var(--card-background-color, #ffffff);
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        padding: 0 16px;
        overflow-x: auto;
      }

      nav button {
        background: none;
        border: none;
        border-bottom: 3px solid transparent;
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color, #727272);
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s ease;
      }

      nav button:hover {
        color: var(--primary-color, #03a9f4);
      }

      nav button.active {
        color: var(--primary-color, #03a9f4);
        border-bottom-color: var(--primary-color, #03a9f4);
      }

      main {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
        box-sizing: border-box;
      }

      @media (max-width: 600px) {
        main {
          padding: 12px;
        }
        header {
          padding: 12px 16px;
        }
      }

      /* Utility & Component Styles */
      .card {
        background: var(--card-background-color, #ffffff);
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        padding: 20px;
        margin-bottom: 20px;
      }

      .card h2 {
        margin-top: 0;
        font-size: 18px;
        color: var(--primary-text-color, #212121);
      }

      .grid-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat-card {
        background: var(--card-background-color, #ffffff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        padding: 16px;
        text-align: center;
      }

      .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: var(--primary-color, #03a9f4);
      }

      .stat-label {
        font-size: 14px;
        color: var(--secondary-text-color, #727272);
        margin-top: 4px;
      }

      .badge {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        margin-right: 4px;
        margin-bottom: 4px;
      }

      .badge-infra {
        background-color: var(--accent-color, #e3f2fd);
        color: var(--primary-color, #1565c0);
        border: 1px solid rgba(21, 101, 192, 0.3);
      }

      .badge-ha {
        background-color: #f3e5f5;
        color: #7b1fa2;
        border: 1px solid rgba(123, 31, 162, 0.3);
      }

      .badge-capability {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      .filter-bar {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }

      .filter-bar input, .filter-bar select {
        padding: 8px 12px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 4px;
        font-size: 14px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000);
      }

      .filter-bar input {
        flex: 1;
        min-width: 200px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }

      th, td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }

      th {
        background-color: var(--table-row-alternative-background-color, #f5f5f5);
        font-weight: 600;
        font-size: 13px;
        color: var(--secondary-text-color, #666);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      tr:hover {
        background-color: var(--table-row-hover-background-color, rgba(0,0,0,0.02));
      }

      .clickable-row {
        cursor: pointer;
      }

      /* State views */
      .center-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        text-align: center;
      }

      .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border-left-color: var(--primary-color, #03a9f4);
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .error-box {
        background-color: #ffebee;
        color: #c62828;
        border: 1px solid #ef9a9a;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        width: 100%;
        box-sizing: border-box;
      }

      .empty-box {
        background-color: #f5f5f5;
        color: #616161;
        border: 1px dashed #bdbdbd;
        padding: 32px;
        border-radius: 8px;
        width: 100%;
        box-sizing: border-box;
      }

      .btn {
        background-color: var(--primary-color, #03a9f4);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
      }

      .btn-secondary {
        background-color: transparent;
        color: var(--primary-color, #03a9f4);
        border: 1px solid var(--primary-color, #03a9f4);
      }

      .detail-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
      }

      .detail-property {
        margin-bottom: 12px;
      }

      .detail-property label {
        font-size: 12px;
        color: var(--secondary-text-color, #777);
        text-transform: uppercase;
        display: block;
        margin-bottom: 4px;
      }

      .detail-property span {
        font-size: 16px;
        font-weight: 500;
      }

      .arrow {
        color: var(--secondary-text-color, #999);
        margin: 0 8px;
      }

      .asset-link {
        color: var(--primary-color, #03a9f4);
        text-decoration: none;
        cursor: pointer;
        font-weight: 500;
      }

      .asset-link:hover {
        text-decoration: underline;
      }
    `}constructor(){super(),this._loading=!0,this._error=null,this._registry=null,this._currentView="overview",this._selectedAssetId=null,this._filterQuery="",this._filterType=""}connectedCallback(){super.connectedCallback(),this._fetchRegistry()}updated(t){t.has("hass")&&this.hass&&!this._registry&&!this._error&&this._loading&&this._fetchRegistry()}async _fetchRegistry(){if(this.hass){this._loading=!0,this._error=null;try{let t=await this.hass.callWS({type:"bindhome/registry/get"});this._registry=t,this._loading=!1}catch(t){this._loading=!1,this._error=t.message||"Failed to load BindHome registry via WebSocket."}}}_navigate(t,e=null){this._currentView=t,e&&(this._selectedAssetId=e)}render(){return l`
      <div class="panel-container">
        <header>
          <div class="header-title">
            <h1>BindHome Panel</h1>
            <span class="badge-v0">Read-First V0</span>
          </div>
          <div>
            <button class="btn btn-secondary" style="color: white; border-color: white;" @click=${this._fetchRegistry}>
              Refresh
            </button>
          </div>
        </header>

        <nav>
          <button
            class=${this._currentView==="overview"?"active":""}
            @click=${()=>this._navigate("overview")}
          >
            Overview
          </button>
          <button
            class=${this._currentView==="assets"||this._currentView==="asset_detail"?"active":""}
            @click=${()=>this._navigate("assets")}
          >
            Assets
          </button>
          <button
            class=${this._currentView==="relations"?"active":""}
            @click=${()=>this._navigate("relations")}
          >
            Relations
          </button>
          <button
            class=${this._currentView==="bindings"?"active":""}
            @click=${()=>this._navigate("bindings")}
          >
            Bindings
          </button>
        </nav>

        <main>
          ${this._renderContent()}
        </main>
      </div>
    `}_renderContent(){if(this._loading)return l`
        <div class="center-state">
          <div class="spinner"></div>
          <p>Connecting to BindHome WebSocket API...</p>
        </div>
      `;if(this._error)return l`
        <div class="center-state">
          <div class="error-box">
            <h3>WebSocket Connection Error</h3>
            <p>${this._error}</p>
          </div>
          <button class="btn" @click=${this._fetchRegistry}>Retry Connection</button>
        </div>
      `;if(!this._registry)return l`
        <div class="center-state">
          <div class="error-box">
            <p>No registry data available.</p>
          </div>
        </div>
      `;switch(this._currentView){case"overview":return this._renderOverview();case"assets":return this._renderAssets();case"asset_detail":return this._renderAssetDetail();case"relations":return this._renderRelations();case"bindings":return this._renderBindings();default:return this._renderOverview()}}_renderOverview(){let t=this._registry.assets?this._registry.assets.length:0,e=this._registry.relations?this._registry.relations.length:0,i=this._registry.bindings?this._registry.bindings.length:0;return l`
      <div class="grid-stats">
        <div class="stat-card">
          <div class="stat-value">${t}</div>
          <div class="stat-label">Infrastructure Assets</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${e}</div>
          <div class="stat-label">Topology Relations</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${i}</div>
          <div class="stat-label">Hardware Bindings</div>
        </div>
      </div>

      ${t===0&&e===0&&i===0?l`
            <div class="empty-box center-state">
              <h3>Empty Registry</h3>
              <p>No assets, relations, or bindings have been registered in BindHome yet.</p>
            </div>
          `:l`
            <div class="card">
              <h2>Architecture Principle</h2>
              <p>
                BindHome models <strong>stable physical home infrastructure</strong> independently from replaceable Home Assistant hardware entities.
              </p>
              <div style="margin-top: 16px;">
                <span class="badge badge-infra">Stable Infrastructure Identity</span>
                <span class="arrow">&rarr;</span>
                <span class="badge badge-capability">Capability & Role</span>
                <span class="arrow">&rarr;</span>
                <span class="badge badge-ha">Replaceable HA Hardware Entity</span>
              </div>
            </div>

            <div class="card">
              <h2>Recent Assets</h2>
              ${t===0?l`<p>No assets found.</p>`:l`
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Code</th>
                          <th>Type</th>
                          <th>Area</th>
                          <th>Capabilities</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${this._registry.assets.slice(0,5).map(r=>l`
                            <tr class="clickable-row" @click=${()=>this._navigate("asset_detail",r.id)}>
                              <td><strong>${r.name}</strong></td>
                              <td>${r.code||"-"}</td>
                              <td><span class="badge badge-infra">${r.asset_type}</span></td>
                              <td>${r.area_id||"-"}</td>
                              <td>
                                ${(r.capabilities||[]).map(a=>l`<span class="badge badge-capability">${a}</span>`)}
                              </td>
                            </tr>
                          `)}
                      </tbody>
                    </table>
                  `}
            </div>
          `}
    `}_renderAssets(){let t=this._registry.assets||[];if(t.length===0)return l`
        <div class="empty-box center-state">
          <h3>No Assets Registered</h3>
          <p>There are no stable infrastructure assets in the registry.</p>
        </div>
      `;let e=Array.from(new Set(t.map(s=>s.asset_type))),i=t.filter(s=>{let r=this._filterQuery.toLowerCase().trim(),a=!r||s.name.toLowerCase().includes(r)||s.code&&s.code.toLowerCase().includes(r)||s.asset_type.toLowerCase().includes(r),d=!this._filterType||s.asset_type===this._filterType;return a&&d});return l`
      <div class="card">
        <h2>Infrastructure Assets</h2>
        <div class="filter-bar">
          <input
            type="text"
            placeholder="Filter by name, code, or type..."
            .value=${this._filterQuery}
            @input=${s=>this._filterQuery=s.target.value}
          />
          <select
            .value=${this._filterType}
            @change=${s=>this._filterType=s.target.value}
          >
            <option value="">All Asset Types</option>
            ${e.map(s=>l`<option value=${s}>${s}</option>`)}
          </select>
        </div>

        ${i.length===0?l`<p>No assets match the current filter criteria.</p>`:l`
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Area ID</th>
                    <th>Capabilities</th>
                  </tr>
                </thead>
                <tbody>
                  ${i.map(s=>l`
                      <tr class="clickable-row" @click=${()=>this._navigate("asset_detail",s.id)}>
                        <td><strong>${s.name}</strong></td>
                        <td>${s.code||"-"}</td>
                        <td><span class="badge badge-infra">${s.asset_type}</span></td>
                        <td>${s.area_id||"-"}</td>
                        <td>
                          ${(s.capabilities||[]).map(r=>l`<span class="badge badge-capability">${r}</span>`)}
                        </td>
                      </tr>
                    `)}
                </tbody>
              </table>
            `}
      </div>
    `}_renderAssetDetail(){let t=this._registry.assets||[],e=t.find(a=>a.id===this._selectedAssetId);if(!e)return l`
        <div class="center-state">
          <div class="error-box">
            <h3>Asset Not Found</h3>
            <p>The requested asset ID "${this._selectedAssetId}" does not exist in the registry.</p>
          </div>
          <button class="btn" @click=${()=>this._navigate("assets")}>Back to Assets List</button>
        </div>
      `;let i=(this._registry.relations||[]).filter(a=>a.source_asset_id===e.id||a.target_asset_id===e.id),s=(this._registry.bindings||[]).filter(a=>a.asset_id===e.id),r=a=>{let d=t.find(n=>n.id===a);return d?d.name:a};return l`
      <div class="detail-header">
        <button class="btn btn-secondary" @click=${()=>this._navigate("assets")}>&larr; Back</button>
        <h2 style="margin: 0;">Asset: ${e.name}</h2>
      </div>

      <div class="card">
        <h2>Infrastructure Specification</h2>
        <div class="detail-property">
          <label>Stable Infrastructure ID</label>
          <span>${e.id}</span>
        </div>
        <div class="detail-property">
          <label>Asset Name</label>
          <span>${e.name}</span>
        </div>
        <div class="detail-property">
          <label>Human Code</label>
          <span>${e.code||"None"}</span>
        </div>
        <div class="detail-property">
          <label>Asset Type</label>
          <span><span class="badge badge-infra">${e.asset_type}</span></span>
        </div>
        <div class="detail-property">
          <label>Area ID</label>
          <span>${e.area_id||"None"}</span>
        </div>
        <div class="detail-property">
          <label>Capabilities</label>
          <div>
            ${(e.capabilities||[]).length===0?l`<span>None</span>`:e.capabilities.map(a=>l`<span class="badge badge-capability">${a}</span>`)}
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Topology Relations</h2>
        ${i.length===0?l`<p>No topology relations connected to this asset.</p>`:l`
              <table>
                <thead>
                  <tr>
                    <th>Direction</th>
                    <th>Relation Type</th>
                    <th>Connected Asset</th>
                  </tr>
                </thead>
                <tbody>
                  ${i.map(a=>{let d=a.source_asset_id===e.id,n=d?a.target_asset_id:a.source_asset_id;return l`
                      <tr>
                        <td>${d?"Outgoing (\u2192)":"Incoming (\u2190)"}</td>
                        <td><strong>${a.relation_type}</strong></td>
                        <td>
                          <span
                            class="asset-link"
                            @click=${()=>this._navigate("asset_detail",n)}
                          >
                            ${r(n)}
                          </span>
                        </td>
                      </tr>
                    `})}
                </tbody>
              </table>
            `}
      </div>

      <div class="card">
        <h2>Hardware Bindings</h2>
        ${s.length===0?l`<p>No hardware bindings set for this asset.</p>`:l`
              <table>
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th>Role</th>
                    <th>Bound HA Entity</th>
                  </tr>
                </thead>
                <tbody>
                  ${s.map(a=>l`
                      <tr>
                        <td><span class="badge badge-capability">${a.capability}</span></td>
                        <td>${a.role}</td>
                        <td><span class="badge badge-ha">${a.entity_id}</span></td>
                      </tr>
                    `)}
                </tbody>
              </table>
            `}
      </div>
    `}_renderRelations(){let t=this._registry.relations||[],e=this._registry.assets||[];if(t.length===0)return l`
        <div class="empty-box center-state">
          <h3>No Topology Relations</h3>
          <p>There are no directed relations connecting assets in the registry.</p>
        </div>
      `;let i=s=>{let r=e.find(a=>a.id===s);return r?r.name:s};return l`
      <div class="card">
        <h2>Topology Relations</h2>
        <table>
          <thead>
            <tr>
              <th>Source Asset</th>
              <th>Relation Type</th>
              <th>Target Asset</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(s=>l`
                <tr>
                  <td>
                    <span class="asset-link" @click=${()=>this._navigate("asset_detail",s.source_asset_id)}>
                      ${i(s.source_asset_id)}
                    </span>
                  </td>
                  <td><strong>${s.relation_type}</strong></td>
                  <td>
                    <span class="asset-link" @click=${()=>this._navigate("asset_detail",s.target_asset_id)}>
                      ${i(s.target_asset_id)}
                    </span>
                  </td>
                </tr>
              `)}
          </tbody>
        </table>
      </div>
    `}_renderBindings(){let t=this._registry.bindings||[],e=this._registry.assets||[];if(t.length===0)return l`
        <div class="empty-box center-state">
          <h3>No Hardware Bindings</h3>
          <p>No Home Assistant entities have been bound to asset capabilities.</p>
        </div>
      `;let i=s=>{let r=e.find(a=>a.id===s);return r?r.name:s};return l`
      <div class="card">
        <h2>Hardware Bindings</h2>
        <p style="font-size: 14px; color: var(--secondary-text-color, #666); margin-bottom: 16px;">
          Bindings map generic asset capabilities to specific, replaceable Home Assistant entities.
        </p>
        <table>
          <thead>
            <tr>
              <th>Infrastructure Asset</th>
              <th>Capability</th>
              <th>Role</th>
              <th>Bound Home Assistant Entity</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(s=>l`
                <tr>
                  <td>
                    <span class="asset-link" @click=${()=>this._navigate("asset_detail",s.asset_id)}>
                      ${i(s.asset_id)}
                    </span>
                  </td>
                  <td><span class="badge badge-capability">${s.capability}</span></td>
                  <td>${s.role}</td>
                  <td><span class="badge badge-ha">${s.entity_id}</span></td>
                </tr>
              `)}
          </tbody>
        </table>
      </div>
    `}};customElements.define("bindhome-panel",G);})();
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
