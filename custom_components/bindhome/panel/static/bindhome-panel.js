(()=>{var Le=Object.defineProperty;var Pe=(i,t,e)=>t in i?Le(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var u=(i,t,e)=>Pe(i,typeof t!="symbol"?t+"":t,e);var ct=globalThis,ht=ct.ShadowRoot&&(ct.ShadyCSS===void 0||ct.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,wt=Symbol(),Jt=new WeakMap,B=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==wt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(ht&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=Jt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&Jt.set(e,t))}return t}toString(){return this.cssText}},Xt=i=>new B(typeof i=="string"?i:i+"",void 0,wt),m=(i,...t)=>{let e=i.length===1?i[0]:t.reduce((s,r,o)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+i[o+1],i[0]);return new B(e,i,wt)},Zt=(i,t)=>{if(ht)i.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),r=ct.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=e.cssText,i.appendChild(s)}},kt=ht?i=>i:i=>i instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return Xt(e)})(i):i;var{is:Me,defineProperty:Be,getOwnPropertyDescriptor:Oe,getOwnPropertyNames:Ue,getOwnPropertySymbols:qe,getPrototypeOf:je}=Object,pt=globalThis,Vt=pt.trustedTypes,Fe=Vt?Vt.emptyScript:"",We=pt.reactiveElementPolyfillSupport,O=(i,t)=>i,At={toAttribute(i,t){switch(t){case Boolean:i=i?Fe:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,t){let e=i;switch(t){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},ee=(i,t)=>!Me(i,t),te={attribute:!0,type:String,converter:At,reflect:!1,useDefault:!1,hasChanged:ee};Symbol.metadata??=Symbol("metadata"),pt.litPropertyMetadata??=new WeakMap;var k=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=te){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),r=this.getPropertyDescriptor(t,s,e);r!==void 0&&Be(this.prototype,t,r)}}static getPropertyDescriptor(t,e,s){let{get:r,set:o}=Oe(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:r,set(n){let d=r?.call(this);o?.call(this,n),this.requestUpdate(t,d,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??te}static _$Ei(){if(this.hasOwnProperty(O("elementProperties")))return;let t=je(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(O("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(O("properties"))){let e=this.properties,s=[...Ue(e),...qe(e)];for(let r of s)this.createProperty(r,e[r])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,r]of e)this.elementProperties.set(s,r)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let r=this._$Eu(e,s);r!==void 0&&this._$Eh.set(r,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let r of s)e.unshift(kt(r))}else t!==void 0&&e.push(kt(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Zt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,s);if(r!==void 0&&s.reflect===!0){let o=(s.converter?.toAttribute!==void 0?s.converter:At).toAttribute(e,s.type);this._$Em=t,o==null?this.removeAttribute(r):this.setAttribute(r,o),this._$Em=null}}_$AK(t,e){let s=this.constructor,r=s._$Eh.get(t);if(r!==void 0&&this._$Em!==r){let o=s.getPropertyOptions(r),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:At;this._$Em=r;let d=n.fromAttribute(e,o.type);this[r]=d??this._$Ej?.get(r)??d,this._$Em=null}}requestUpdate(t,e,s,r=!1,o){if(t!==void 0){let n=this.constructor;if(r===!1&&(o=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??ee)(o,e)||s.useDefault&&s.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:r,wrapped:o},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),o!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),r===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[r,o]of this._$Ep)this[r]=o;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[r,o]of s){let{wrapped:n}=o,d=this[r];n!==!0||this._$AL.has(r)||d===void 0||this.C(r,void 0,o,d)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};k.elementStyles=[],k.shadowRootOptions={mode:"open"},k[O("elementProperties")]=new Map,k[O("finalized")]=new Map,We?.({ReactiveElement:k}),(pt.reactiveElementVersions??=[]).push("2.1.2");var zt=globalThis,se=i=>i,ut=zt.trustedTypes,ie=ut?ut.createPolicy("lit-html",{createHTML:i=>i}):void 0,de="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,ce="?"+E,Ke=`<${ce}>`,D=document,q=()=>D.createComment(""),j=i=>i===null||typeof i!="object"&&typeof i!="function",Nt=Array.isArray,Ge=i=>Nt(i)||typeof i?.[Symbol.iterator]=="function",Et=`[ 	
\f\r]`,U=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,re=/-->/g,ae=/>/g,R=RegExp(`>|${Et}(?:([^\\s"'>=/]+)(${Et}*=${Et}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),oe=/'/g,ne=/"/g,he=/^(?:script|style|textarea|title)$/i,Tt=i=>(t,...e)=>({_$litType$:i,strings:t,values:e}),a=Tt(1),us=Tt(2),gs=Tt(3),z=Symbol.for("lit-noChange"),c=Symbol.for("lit-nothing"),le=new WeakMap,C=D.createTreeWalker(D,129);function pe(i,t){if(!Nt(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return ie!==void 0?ie.createHTML(t):t}var Qe=(i,t)=>{let e=i.length-1,s=[],r,o=t===2?"<svg>":t===3?"<math>":"",n=U;for(let d=0;d<e;d++){let l=i[d],p,_,h=-1,f=0;for(;f<l.length&&(n.lastIndex=f,_=n.exec(l),_!==null);)f=n.lastIndex,n===U?_[1]==="!--"?n=re:_[1]!==void 0?n=ae:_[2]!==void 0?(he.test(_[2])&&(r=RegExp("</"+_[2],"g")),n=R):_[3]!==void 0&&(n=R):n===R?_[0]===">"?(n=r??U,h=-1):_[1]===void 0?h=-2:(h=n.lastIndex-_[2].length,p=_[1],n=_[3]===void 0?R:_[3]==='"'?ne:oe):n===ne||n===oe?n=R:n===re||n===ae?n=U:(n=R,r=void 0);let b=n===R&&i[d+1].startsWith("/>")?" ":"";o+=n===U?l+Ke:h>=0?(s.push(p),l.slice(0,h)+de+l.slice(h)+E+b):l+E+(h===-2?d:b)}return[pe(i,o+(i[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},F=class i{constructor({strings:t,_$litType$:e},s){let r;this.parts=[];let o=0,n=0,d=t.length-1,l=this.parts,[p,_]=Qe(t,e);if(this.el=i.createElement(p,s),C.currentNode=this.el.content,e===2||e===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(r=C.nextNode())!==null&&l.length<d;){if(r.nodeType===1){if(r.hasAttributes())for(let h of r.getAttributeNames())if(h.endsWith(de)){let f=_[n++],b=r.getAttribute(h).split(E),y=/([.?@])?(.*)/.exec(f);l.push({type:1,index:o,name:y[2],strings:b,ctor:y[1]==="."?It:y[1]==="?"?Rt:y[1]==="@"?Ct:T}),r.removeAttribute(h)}else h.startsWith(E)&&(l.push({type:6,index:o}),r.removeAttribute(h));if(he.test(r.tagName)){let h=r.textContent.split(E),f=h.length-1;if(f>0){r.textContent=ut?ut.emptyScript:"";for(let b=0;b<f;b++)r.append(h[b],q()),C.nextNode(),l.push({type:2,index:++o});r.append(h[f],q())}}}else if(r.nodeType===8)if(r.data===ce)l.push({type:2,index:o});else{let h=-1;for(;(h=r.data.indexOf(E,h+1))!==-1;)l.push({type:7,index:o}),h+=E.length-1}o++}}static createElement(t,e){let s=D.createElement("template");return s.innerHTML=t,s}};function N(i,t,e=i,s){if(t===z)return t;let r=s!==void 0?e._$Co?.[s]:e._$Cl,o=j(t)?void 0:t._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),o===void 0?r=void 0:(r=new o(i),r._$AT(i,e,s)),s!==void 0?(e._$Co??=[])[s]=r:e._$Cl=r),r!==void 0&&(t=N(i,r._$AS(i,t.values),r,s)),t}var St=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,r=(t?.creationScope??D).importNode(e,!0);C.currentNode=r;let o=C.nextNode(),n=0,d=0,l=s[0];for(;l!==void 0;){if(n===l.index){let p;l.type===2?p=new W(o,o.nextSibling,this,t):l.type===1?p=new l.ctor(o,l.name,l.strings,this,t):l.type===6&&(p=new Dt(o,this,t)),this._$AV.push(p),l=s[++d]}n!==l?.index&&(o=C.nextNode(),n++)}return C.currentNode=D,r}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},W=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,r){this.type=2,this._$AH=c,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=N(this,t,e),j(t)?t===c||t==null||t===""?(this._$AH!==c&&this._$AR(),this._$AH=c):t!==this._$AH&&t!==z&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Ge(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==c&&j(this._$AH)?this._$AA.nextSibling.data=t:this.T(D.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,r=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=F.createElement(pe(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(e);else{let o=new St(r,this),n=o.u(this.options);o.p(e),this.T(n),this._$AH=o}}_$AC(t){let e=le.get(t.strings);return e===void 0&&le.set(t.strings,e=new F(t)),e}k(t){Nt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,r=0;for(let o of t)r===e.length?e.push(s=new i(this.O(q()),this.O(q()),this,this.options)):s=e[r],s._$AI(o),r++;r<e.length&&(this._$AR(s&&s._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=se(t).nextSibling;se(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},T=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,r,o){this.type=1,this._$AH=c,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=c}_$AI(t,e=this,s,r){let o=this.strings,n=!1;if(o===void 0)t=N(this,t,e,0),n=!j(t)||t!==this._$AH&&t!==z,n&&(this._$AH=t);else{let d=t,l,p;for(t=o[0],l=0;l<o.length-1;l++)p=N(this,d[s+l],e,l),p===z&&(p=this._$AH[l]),n||=!j(p)||p!==this._$AH[l],p===c?t=c:t!==c&&(t+=(p??"")+o[l+1]),this._$AH[l]=p}n&&!r&&this.j(t)}j(t){t===c?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},It=class extends T{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===c?void 0:t}},Rt=class extends T{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==c)}},Ct=class extends T{constructor(t,e,s,r,o){super(t,e,s,r,o),this.type=5}_$AI(t,e=this){if((t=N(this,t,e,0)??c)===z)return;let s=this._$AH,r=t===c&&s!==c||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==c&&(s===c||r);r&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Dt=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){N(this,t)}};var Ye=zt.litHtmlPolyfillSupport;Ye?.(F,W),(zt.litHtmlVersions??=[]).push("3.3.3");var ue=(i,t,e)=>{let s=e?.renderBefore??t,r=s._$litPart$;if(r===void 0){let o=e?.renderBefore??null;s._$litPart$=r=new W(t.insertBefore(q(),o),o,void 0,e??{})}return r._$AI(i),r};var Lt=globalThis,g=class extends k{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=ue(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return z}};g._$litElement$=!0,g.finalized=!0,Lt.litElementHydrateSupport?.({LitElement:g});var He=Lt.litElementPolyfillSupport;He?.({LitElement:g});(Lt.litElementVersions??=[]).push("4.2.2");function v(i){return{async getRegistry(){return i.callWS({type:"bindhome/registry/get"})},async listAssets(){return(await i.callWS({type:"bindhome/assets/list"})).assets??[]},async listPresets(){return(await i.callWS({type:"bindhome/presets/list"})).presets??[]},async listBindingStatuses(){return i.callWS({type:"bindhome/bindings/status"})},async setBinding({assetId:t,capability:e,entityId:s,role:r="primary"}){return i.callWS({type:"bindhome/bindings/set",asset_id:t,capability:e,entity_id:s,role:r})},async deleteBinding(t){return i.callWS({type:"bindhome/bindings/delete",binding_id:t})},async createRelation({sourceAssetId:t,relationType:e,targetAssetId:s}){return i.callWS({type:"bindhome/relations/create",source_asset_id:t,relation_type:e,target_asset_id:s})},async deleteRelation(t){return i.callWS({type:"bindhome/relations/delete",relation_id:t})},async createAssetsBulk(t){return i.callWS({type:"bindhome/assets/create_bulk",assets:t})},async updateAsset(t,e){return(await i.callWS({...e,type:"bindhome/assets/update",asset_id:t})).asset},async deleteAsset(t){return i.callWS({type:"bindhome/assets/delete",asset_id:t})}}}var gt="__bindhome_no_floor__";function ge(i){return{async listFloors(){return(await i.callWS({type:"config/floor_registry/list"})??[]).map(e=>({floor_id:e.floor_id,name:e.name,level:e.level??null,icon:e.icon??null}))},async listAreas(){return(await i.callWS({type:"config/area_registry/list"})??[]).map(e=>({area_id:e.area_id,name:e.name,floor_id:e.floor_id??null,icon:e.icon??null}))},async listEntityRegistry(){return i.callWS({type:"config/entity_registry/list"})},async listDeviceRegistry(){return i.callWS({type:"config/device_registry/list"})}}}function Pt(i,t){return t===gt?i.filter(e=>!e.floor_id):i.filter(e=>e.floor_id===t)}var Je="component.bindhome.common.panel_";async function Mt(i,t){let e=async o=>(await i.callWS({type:"frontend/get_translations",language:o,category:"common",integration:["bindhome"]}))?.resources??{},s=await e("en"),r=s;if(t!=="en")try{r=await e(t)}catch{r=s}return Bt(r,s)}function Bt(i={},t={}){return(e,s={})=>{let r=`${Je}${e.replaceAll(".","_")}`;return(i[r]??t[r]??e).replace(/\{(\w+)\}/g,(n,d)=>s[d]??n)}}function mt(i,t){return`${i}.${t===1?"one":"other"}`}function A(i,t){let e=`presets.${t.preset_id}.name`,s=i(e);return s===e?t.default_name:s}var $=m`
  :host {
    --bh-space-1: 4px;
    --bh-space-2: 8px;
    --bh-space-3: 12px;
    --bh-space-4: 16px;
    --bh-space-5: 24px;
    --bh-space-6: 32px;
    --bh-content: 1180px;
    --bh-reading: 760px;
    --bh-touch: 44px;
    --bh-radius: var(--ha-card-border-radius, 12px);
    color: var(--primary-text-color, #212121);
    font-family: var(
      --paper-font-body1_-_font-family,
      Roboto,
      Noto,
      sans-serif
    );
  }
  * {
    box-sizing: border-box;
  }
  button,
  input,
  select {
    color: inherit;
    font: inherit;
  }
  button {
    cursor: pointer;
  }
  button:focus-visible,
  input:focus-visible,
  select:focus-visible,
  summary:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: 2px;
  }
  h1,
  h2,
  h3,
  p,
  dl,
  dd {
    margin: 0;
  }
  .page {
    width: 100%;
    max-width: var(--bh-content);
    margin: 0 auto;
    padding: var(--bh-space-6) var(--bh-space-5) 56px;
  }
  .page-title {
    font-size: 26px;
    line-height: 34px;
    font-weight: 500;
  }
  .muted {
    color: var(--secondary-text-color, #727272);
  }
  .primary,
  .secondary,
  .text-button {
    min-height: var(--bh-touch);
    padding: 0 18px;
    border-radius: 8px;
    font-weight: 500;
  }
  .primary {
    border: 1px solid var(--primary-color);
    color: var(--text-primary-color, #fff);
    background: var(--primary-color);
  }
  .secondary {
    border: 1px solid var(--primary-color);
    color: var(--primary-color);
    background: transparent;
  }
  .text-button {
    border: 0;
    color: var(--primary-color);
    background: transparent;
  }
  .surface {
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: var(--bh-radius);
    background: var(--card-background-color, #fff);
    overflow: hidden;
  }
  .empty {
    padding: var(--bh-space-6);
    border: 1px dashed var(--divider-color);
    border-radius: var(--bh-radius);
    color: var(--secondary-text-color);
    text-align: center;
    line-height: 1.5;
  }
  .error {
    padding: var(--bh-space-3);
    border: 1px solid var(--error-color, #db4437);
    border-radius: 8px;
    color: var(--error-color, #db4437);
  }
  @media (max-width: 600px) {
    .page {
      padding: 20px 12px 40px;
    }
    .page-title {
      font-size: 24px;
    }
  }
`;var Xe={light_point:["mdi:lightbulb-outline","lighting"],socket:["mdi:power-socket-eu","electricity"],switch:["mdi:light-switch","electricity"],electrical_panel:["mdi:electric-switch","electricity"],circuit:["mdi:transmission-tower","electricity"],junction_box:["mdi:connection","electricity"],ethernet_outlet:["mdi:ethernet","network"],telephone_outlet:["mdi:phone-classic","network"],antenna_outlet:["mdi:television-classic","network"],wifi_access_point:["mdi:wifi","network"],radiator:["mdi:radiator","climate"],thermostat:["mdi:thermostat","climate"],fan:["mdi:fan","climate"],air_conditioning_unit:["mdi:air-conditioner","climate"],tap:["mdi:faucet","water"],shutoff_valve:["mdi:valve","water"],valve:["mdi:valve","water"],drain:["mdi:water-minus","water"],manifold:["mdi:pipe-valve","water"],door:["mdi:door","structure"],window:["mdi:window-closed","structure"],blind:["mdi:blinds","structure"],skylight:["mdi:window-open","structure"],boiler:["mdi:water-boiler","equipment"],water_heater:["mdi:water-boiler","equipment"],pump:["mdi:pump","equipment"],freezer:["mdi:fridge-outline","equipment"],appliance:["mdi:dishwasher","equipment"],machine:["mdi:cog-outline","equipment"]};function w(i,t){let e=Xe[t],s=`presets.${t}.name`,r=i(s);return{type:t,label:r===s?Ot(t):r,icon:e?.[0]??"mdi:cube-outline",category:e?.[1]??"other",known:!!e}}function Ot(i){let t=String(i||"").replaceAll("_"," ").trim();return t?t.charAt(0).toUpperCase()+t.slice(1):"\u2014"}var me=["lighting","electricity","water","climate","equipment","network","structure","other"];function _e(i,t){let e={lighting:"mdi:lightbulb-outline",electricity:"mdi:flash-outline",water:"mdi:water-outline",climate:"mdi:thermometer",equipment:"mdi:tools",network:"mdi:lan",structure:"mdi:home-outline",other:"mdi:dots-horizontal-circle-outline"};return{category:t,label:i(`categories.${t}`),icon:e[t]??e.other}}var S="__bindhome_no_area__",I="__bindhome_stale_area__";function fe(i,t,e){let s=new Map(t.map(l=>[l.area_id,l])),r=new Map;for(let l of e){let p=l.area_id?s.has(l.area_id)?l.area_id:I:S;r.set(p,[...r.get(p)??[],l])}let n=[...i].sort((l,p)=>(l.level??999)-(p.level??999)||l.name.localeCompare(p.name)).map(l=>({id:l.floor_id,name:l.name,icon:l.icon,areas:t.filter(p=>p.floor_id===l.floor_id).sort(K)})),d=t.filter(l=>!l.floor_id).sort(K);return d.length&&n.push({id:"__no_floor__",name:null,icon:null,areas:d}),{groups:n,assetsByArea:r,unassigned:r.get(S)??[],stale:r.get(I)??[]}}function K(i,t){return i.name.localeCompare(t.name,void 0,{sensitivity:"base"})}function be(i,t){let e=new Map;for(let s of t){let r=w(i,s.asset_type);e.set(r.category,[...e.get(r.category)??[],s])}return me.filter(s=>e.has(s)).map(s=>({category:s,assets:e.get(s).sort(K)}))}function ve(i,t,e,s,r){let o=new Map(e.map(l=>[l.area_id,l])),n=new Map(s.map(l=>[l.floor_id,l])),d=r.trim().toLocaleLowerCase();return d?t.map(l=>{let p=l.area_id?o.get(l.area_id):null,_=p?.floor_id?n.get(p.floor_id):null,h=w(i,l.asset_type),b=[l.name,l.code,h.label,l.asset_type,p?.name,_?.name].filter(Boolean).map(y=>String(y).toLocaleLowerCase()).reduce((y,M,$t)=>y+(M===d?100-$t:M.startsWith(d)?50-$t:M.includes(d)?10-$t:0),0);return{asset:l,area:p,floor:_,type:h,score:b}}).filter(l=>l.score>0).sort((l,p)=>p.score-l.score||K(l.asset,p.asset)).slice(0,30):t.slice().sort(K).slice(0,8)}var Ze={feeds:{outgoing:"relations.feeds.outgoing",incoming:"relations.feeds.incoming"},contains:{outgoing:"relations.contains.outgoing",incoming:"relations.contains.incoming"},controls:{outgoing:"relations.controls.outgoing",incoming:"relations.controls.incoming"},part_of:{outgoing:"relations.part_of.outgoing",incoming:"relations.part_of.incoming"}};function ye(i,t,e){let s=Ze[t]?.[e];return{type:t,direction:e,label:s?i(s):i("relations.unknown",{type:Ot(t)}),known:!!s,icon:t==="feeds"?"mdi:flash-outline":t==="controls"?"mdi:tune":t==="contains"||t==="part_of"?"mdi:folder-outline":"mdi:vector-link"}}function xe(i){return["socket","circuit","electrical_panel","light_point"].includes(i)?[{direction:"outgoing",relationType:"feeds",labelKey:i==="circuit"?"relations.actions.add_powered":"relations.actions.indicate_feeds"},{direction:"incoming",relationType:"feeds",labelKey:i==="circuit"?"relations.actions.panel_source":"relations.actions.power_source"}]:["shutoff_valve","valve"].includes(i)?[{direction:"outgoing",relationType:"controls",labelKey:"relations.actions.indicate_controls"}]:["electrical_panel","junction_box","manifold"].includes(i)?[{direction:"outgoing",relationType:"contains",labelKey:"relations.actions.add_content"}]:[]}function L(i=[],t){return{outgoing:i.filter(e=>e.source_asset_id===t),incoming:i.filter(e=>e.target_asset_id===t)}}function $e(i=[]){return[...new Set(i.map(t=>t.relation_type).filter(Boolean))].sort()}function Ut(i){return/^[a-z][a-z0-9_]*$/.test(String(i).trim())}function Ve(i,t,e="primary"){return`${i}:${t}:${e}`}function _t(i){let t=i?.records??[];return new Map(t.map(e=>[Ve(e.asset_id,e.capability,e.role),e]))}function qt(i){return[i?.message,i?.body?.message,i?.data?.message,i?.error].filter(t=>typeof t=="string")}function x(i,t=null){let e=qt(i).find(s=>s.trim())??t;return{code:i?.code??i?.body?.code??i?.data?.code??null,message:e}}function we(i,t=null){for(let s of qt(i))try{let r=JSON.parse(s);if(Number.isInteger(r?.index)&&r.index>=0&&typeof r?.field=="string"&&typeof r?.message=="string")return{structured:!0,index:r.index,field:r.field,message:r.message}}catch{}return{structured:!1,index:null,field:null,message:qt(i).find(s=>s.trim())??t}}function ts(i){return String(i??"").trim()}function P(i){return ts(i).toLocaleLowerCase()}function Ae(i,t){return P(i.name).localeCompare(P(t.name),void 0,{numeric:!0,sensitivity:"base"})||i.entityId.localeCompare(t.entityId)}function ke(i,t,e){let s=P(t);if(!s)return e&&i.areaId===e?0:1;let r=[i.name,i.entityId,i.areaName,i.deviceName,i.domain].map(P),o=r.some(l=>l===s),n=r.some(l=>l.startsWith(s)),d=e&&i.areaId===e?0:1;return(o?0:n?1:2)*2+d}function Ee({entityRegistry:i=[],deviceRegistry:t=[],states:e={},areas:s=[]}={}){let r=new Map(i.filter(l=>l?.entity_id).map(l=>[l.entity_id,l])),o=new Map(t.filter(l=>l?.id).map(l=>[l.id,l])),n=new Map(s.filter(l=>l?.area_id).map(l=>[l.area_id,l.name]));return[...new Set([...r.keys(),...Object.keys(e??{})])].map(l=>{let p=r.get(l)??null,_=e?.[l]??null,h=p?.device_id?o.get(p.device_id):null,[f]=l.split("."),b=p?.area_id??h?.area_id??null,y=_?.attributes?.friendly_name??p?.name??p?.original_name??l;return{entityId:l,domain:f,name:y,state:_?.state??null,registryEntry:p,deviceId:p?.device_id??null,deviceName:h?.name_by_user??h?.name??null,areaId:b,areaName:b?n.get(b)??null:null,disabled:!!p?.disabled_by,hidden:!!p?.hidden_by,isBindHome:p?.platform==="bindhome"}}).sort(Ae)}function Se(i,t="",e=null){let s=P(t);return[...i??[]].filter(r=>s?[r.name,r.entityId,r.areaName,r.deviceName,r.domain].some(o=>P(o).includes(s)):!0).sort((r,o)=>ke(r,s,e)-ke(o,s,e)||Ae(r,o))}var es=8,ss=20;function is(i,t){let e=`capabilities.${t}`,s=i(e);return s!==e?s:t.replaceAll("_"," ").replace(/\b\w/g,r=>r.toUpperCase())}var G=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.capability="",this.status=null,this.areas=[],this.entityRegistry=[],this.deviceRegistry=[],this.refreshBindingData=null,this._editing=!1,this._search="",this._selectedEntityId=null,this._saving=!1,this._error=null,this._confirmDisconnect=!1,this._selectionMode="search",this._bindingIdentity=null,this._operation=0,this._committedDisconnectId=null}_candidates(){return Ee({entityRegistry:this.entityRegistry,deviceRegistry:this.deviceRegistry,states:this.hass?.states,areas:this.areas})}willUpdate(){let t=this.asset?JSON.stringify([this.asset.id,this.capability,"primary"]):null;this._bindingIdentity!==null&&t!==this._bindingIdentity&&(this._editing=!1,this._selectedEntityId=null,this._search="",this._error=null,this._confirmDisconnect=!1,this._saving=!1,this._selectionMode="search",this._committedDisconnectId=null,this._operation+=1),this._bindingIdentity=t}_currentEntityId(){return this.status?.entity_id??this.status?.binding?.entity_id??null}_currentCandidate(){let t=this._currentEntityId();return this._candidates().find(e=>e.entityId===t)??null}_runtimeLabel(t){return t?t.state==="unavailable"?this.t("connection.unavailable"):t.state==="unknown"?this.t("connection.unknown"):t.state===null?this.t("connection.no_runtime"):this.t("connection.available"):this.t("connection.stale")}_configurationLabel(){return this.status?.status==="entity_not_found"||this.status?.config_valid!==!1?this.t("connection.configured"):this.t("connection.invalid_configuration")}_candidateStateLabel(t){return!t||t.state===null?this.t("connection.no_runtime"):t.state==="unavailable"?this.t("connection.unavailable"):t.state==="unknown"?this.t("connection.unknown"):t.state}_beginEdit(){this._saving||(this._editing=!0,this._selectedEntityId=this._currentEntityId(),this._search="",this._error=null,this._confirmDisconnect=!1,this._selectionMode="search")}_cancelEdit(){this._saving||(this._editing=!1,this._selectedEntityId=null,this._search="",this._error=null,this._confirmDisconnect=!1,this._selectionMode="search")}_select(t){this._saving||(this._selectedEntityId=t,this._error=null,this._selectionMode="selected")}_changeSelection(){this._saving||(this._selectionMode="search")}async _save(){if(this._saving||!this._selectedEntityId||!this.asset)return;this._saving=!0,this._error=null;let t=++this._operation,e=this._selectedEntityId;try{if(await v(this.hass).setBinding({assetId:this.asset.id,capability:this.capability,entityId:e,role:"primary"}),t!==this._operation)return;this._editing=!1,this._selectedEntityId=null,this._search="";try{this.refreshBindingData&&await this.refreshBindingData()}catch{this._error=this.t("connection.sync_warning")}}catch(s){if(t!==this._operation)return;let r=x(s,this.t("connection.save_error"));this._error=r.code==="binding_cycle"?this.t("connection.cycle_error"):r.message}finally{this._saving=!1}}async _disconnect(){let t=this.status?.binding;if(this._saving||!t||this._committedDisconnectId===t.id)return;this._saving=!0,this._error=null,this._editing=!1;let e=++this._operation;try{if(await v(this.hass).deleteBinding(t.id),e!==this._operation)return;this._committedDisconnectId=t.id,this._confirmDisconnect=!1;try{this.refreshBindingData&&await this.refreshBindingData()}catch{this._error=this.t("connection.sync_warning")}}catch(s){if(e!==this._operation)return;this._error=x(s,this.t("connection.disconnect_error")).message,this._confirmDisconnect=!0}finally{this._saving=!1}}_renderSummary(){let t=this.status?.binding,e=this._currentEntityId(),s=this._currentCandidate();return!t||this.status?.status==="binding_not_found"?a`<div class="summary">${this.t("connection.not_connected")}</div><div class="actions"><button class="primary" @click=${this._beginEdit}>${this.t("connection.connect")}</button></div>`:a`
      <div class="entity">${s?.name??e}</div>
      ${e?a`<div class="technical">${e}</div>`:c}
      ${s?.areaName||s?.deviceName?a`<div class="summary">${[s.areaName,s.deviceName].filter(Boolean).join(" \xB7 ")}</div>`:c}
      <div class="summary">${this._configurationLabel()} · ${this.status?.status==="entity_not_found"?this.t("connection.stale"):this._runtimeLabel(s)}</div>
      <div class="actions">
        <button class="primary" @click=${this._beginEdit}>${this.t("connection.change")}</button>
        <button class="danger" @click=${()=>this._confirmDisconnect=!0} ?disabled=${this._saving}>${this.t("connection.disconnect")}</button>
      </div>
      ${this._confirmDisconnect?a`<div class="confirm" role="alertdialog" aria-label=${this.t("connection.confirm_disconnect")}><span>${this.t("connection.confirm_disconnect")}</span><button @click=${()=>this._confirmDisconnect=!1} ?disabled=${this._saving}>${this.t("editor.cancel")}</button><button class="danger" @click=${this._disconnect} ?disabled=${this._saving}>${this.t("connection.disconnect")}</button></div>`:c}
    `}_renderEditor(){let t=Se(this._candidates(),this._search,this.asset?.area_id),e=t.slice(0,this._search?ss:es),s=this._currentEntityId(),r=this._candidates().find(n=>n.entityId===this._selectedEntityId),o=!!(s&&s===this._selectedEntityId);return a`
      <div class="picker">
        ${s?a`<div class="current"><strong>${this.t("connection.current")}</strong><div class="entity">${this._currentCandidate()?.name??s}</div><div class="technical">${s}</div></div>`:c}
        <label>${this.t("connection.search_label")}<input aria-label=${this.t("connection.search_label")} .value=${this._search} @input=${n=>{this._search=n.target.value,this._selectionMode="search"}} /></label>
        ${this._selectionMode==="selected"?a`<div class="selected-summary" aria-live="polite"><strong>${this.t("connection.selected")}</strong><div class="entity">✓ ${r?.name??this._selectedEntityId}</div><div class="technical">${r?.entityId??this._selectedEntityId}${r?.areaName?` \xB7 ${r.areaName}`:""}${r?` \xB7 ${this._candidateStateLabel(r)}`:` \xB7 ${this.t("connection.no_runtime")}`}</div><button @click=${this._changeSelection} ?disabled=${this._saving}>${this.t("connection.change_selection")}</button></div>`:a`
          ${!this._search&&e.length?a`<div class="suggestions-heading">${this.t("connection.suggestions")}</div>`:c}
          ${e.length?e.map(n=>a`<button class="candidate ${n.entityId===this._selectedEntityId?"selected":""}" aria-pressed=${n.entityId===this._selectedEntityId} @click=${()=>this._select(n.entityId)}><span class="entity">${n.name}</span><span class="candidate-meta">${n.entityId}${n.areaName?` \xB7 ${n.areaName}`:""}${n.deviceName?` \xB7 ${n.deviceName}`:""} · ${this._candidateStateLabel(n)}${n.disabled?` \xB7 ${this.t("connection.disabled")}`:""}${n.hidden?` \xB7 ${this.t("connection.hidden")}`:""}</span></button>`):a`<div class="muted">${this.t("connection.no_matches")}</div>`}
          ${t.length>e.length?a`<div class="muted result-count">${this.t("connection.showing_results",{shown:e.length,total:t.length})}</div>`:c}
        `}
        <div class="actions"><button @click=${this._cancelEdit} ?disabled=${this._saving}>${this.t("editor.cancel")}</button><button class="primary" @click=${this._save} ?disabled=${this._saving||!this._selectedEntityId||o}>${this._saving?this.t("connection.saving"):this.t("common.save")}</button></div>
      </div>
    `}render(){return this.asset?a`<article class="row"><strong>${is(this.t,this.capability)}</strong>${this._editing?this._renderEditor():this._renderSummary()}${this._error?a`<div class="error" role="alert">${this._error}</div>`:c}</article>`:c}};u(G,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},capability:{type:String},status:{attribute:!1},areas:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},refreshBindingData:{attribute:!1},_editing:{state:!0},_search:{state:!0},_selectedEntityId:{state:!0},_saving:{state:!0},_error:{state:!0},_confirmDisconnect:{state:!0},_selectionMode:{state:!0}}),u(G,"styles",m`
    :host { display: block; }
    .row { display: grid; gap: 8px; }
    .summary { color: var(--secondary-text-color); font-size: 13px; line-height: 19px; }
    .entity { font-weight: 500; overflow-wrap: anywhere; }
    .technical { color: var(--secondary-text-color); font-size: 12px; overflow-wrap: anywhere; }
    .actions, .confirm { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    button { min-height: 40px; padding: 7px 12px; border: 1px solid var(--divider-color); border-radius: 7px; background: var(--card-background-color); color: inherit; font: inherit; cursor: pointer; }
    button.primary { border-color: var(--primary-color); background: var(--primary-color); color: var(--text-primary-color, #fff); }
    button.danger { color: var(--error-color); }
    button:disabled { cursor: wait; opacity: .6; }
    input { width: 100%; min-height: 44px; box-sizing: border-box; padding: 8px 10px; border: 1px solid var(--divider-color); border-radius: 7px; background: var(--card-background-color); color: inherit; font: inherit; }
    .picker { display: grid; gap: 8px; margin-top: 10px; }
    .current, .selected-summary { display: grid; gap: 3px; padding: 10px; border: 1px solid var(--divider-color); border-radius: 7px; background: var(--secondary-background-color); }
    .suggestions-heading { color: var(--secondary-text-color); font-size: 13px; font-weight: 500; }
    .result-count { font-size: 12px; }
    .candidate { display: grid; gap: 2px; width: 100%; min-height: 52px; text-align: left; }
    .candidate.selected { outline: 2px solid var(--primary-color); outline-offset: -2px; }
    .candidate-meta { color: var(--secondary-text-color); font-size: 12px; overflow-wrap: anywhere; }
    .muted { color: var(--secondary-text-color); }
    .error { color: var(--error-color); line-height: 19px; }
  `);customElements.define("bindhome-primary-connection-editor",G);var Q=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.assets=[],this.areas=[],this.action=null,this.onRefresh=null,this._target="",this._query="",this._saving=!1,this._error=null,this._token=0}async _save(){if(this._saving||!this._target)return;let t=++this._token;this._saving=!0,this._error=null;let e=this.action.direction==="incoming";try{if(await v(this.hass).createRelation({sourceAssetId:e?this._target:this.asset.id,relationType:this.action.relationType,targetAssetId:e?this.asset.id:this._target}),t!==this._token)return;await this.onRefresh?.(),this.dispatchEvent(new CustomEvent("done",{bubbles:!0,composed:!0}))}catch(s){t===this._token&&(this._error=x(s,this.t("topology.create_error")).message)}finally{t===this._token&&(this._saving=!1)}}render(){let t=this._query.toLocaleLowerCase(),e=this.assets.filter(s=>s.id!==this.asset?.id&&(!t||[s.name,s.code,s.asset_type].filter(Boolean).some(r=>String(r).toLocaleLowerCase().includes(t)))).slice(0,20);return a`<label
        >${this.t("search.label")}<input
          class="search"
          .value=${this._query}
          @input=${s=>this._query=s.target.value}
      /></label>
      <div class="candidates">
        ${e.map(s=>a`<button
              class="candidate ${this._target===s.id?"selected":""}"
              aria-pressed=${this._target===s.id}
              @click=${()=>this._target=s.id}
            >
              <strong>${s.name}</strong
              ><small
                >${this.areas.find(r=>r.area_id===s.area_id)?.name??this.t("home.unassigned")}</small
              >
            </button>`)}
      </div>
      ${this._error?a`<div class="error" role="alert">${this._error}</div>`:null}
      <div class="actions">
        <button
          class="secondary"
          @click=${()=>this.dispatchEvent(new CustomEvent("cancel",{bubbles:!0,composed:!0}))}
        >
          ${this.t("common.cancel")}</button
        ><button
          class="primary"
          ?disabled=${this._saving||!this._target}
          @click=${this._save}
        >
          ${this._saving?this.t("add.saving"):this.t("common.save")}
        </button>
      </div>`}};u(Q,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},action:{attribute:!1},onRefresh:{attribute:!1},_target:{state:!0},_query:{state:!0},_saving:{state:!0},_error:{state:!0}}),u(Q,"styles",[$,m`
      :host {
        display: block;
        margin-top: 12px;
        padding: 14px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
      }
      .search {
        width: 100%;
        min-height: 44px;
        padding: 8px 10px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
      }
      .candidates {
        max-height: 220px;
        overflow: auto;
        margin-top: 8px;
      }
      .candidate {
        display: block;
        width: 100%;
        min-height: 46px;
        padding: 7px 9px;
        border: 0;
        border-bottom: 1px solid var(--divider-color);
        background: transparent;
        text-align: left;
      }
      .candidate.selected {
        background: var(--secondary-background-color);
        color: var(--primary-color);
      }
      small {
        display: block;
        color: var(--secondary-text-color);
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 10px;
      }
    `]);customElements.define("bindhome-contextual-relation-editor",Q);var Y=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.assets=[],this.areas=[],this.floors=[],this.registry={},this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this.refreshBindingData=null,this.refreshTopologyData=null,this._action=null,this._identity=null}willUpdate(){this.asset?.id!==this._identity&&(this._identity=this.asset?.id,this._action=null)}_area(){return this.areas.find(t=>t.area_id===this.asset?.area_id)??null}_asset(t){return this.assets.find(e=>e.id===t)??null}_relations(){let t=L(this.registry?.relations??[],this.asset?.id);return[...t.incoming.map(e=>({relation:e,direction:"incoming",other:this._asset(e.source_asset_id)})),...t.outgoing.map(e=>({relation:e,direction:"outgoing",other:this._asset(e.target_asset_id)}))]}_device(){let t=_t(this.bindingStatuses),e=this.asset?.capabilities?.[0],s=e?t.get(`${this.asset.id}:${e}:primary`):null;return{capability:e,status:s}}render(){if(!this.asset)return c;let t=w(this.t,this.asset.asset_type),e=this._area(),s=this._relations(),r=this._device(),o=(this.registry.representations??[]).filter(d=>d.asset_id===this.asset.id),n=xe(this.asset.asset_type);return a`<button
        class="back text-button"
        @click=${()=>this.dispatchEvent(new CustomEvent("back",{bubbles:!0,composed:!0}))}
      >
        <ha-icon icon="mdi:arrow-left"></ha-icon>${this.t("home.back_room")}
      </button>
      <article class="card surface">
        <header class="header">
          <div class="hero-icon"><ha-icon icon=${t.icon}></ha-icon></div>
          <div class="grow">
            <h2>${this.asset.name}</h2>
            <p class="location">
              ${e?.name??(this.asset.area_id?this.t("home.stale_area"):this.t("home.unassigned"))}
            </p>
            <p class="type">
              <ha-icon icon=${t.icon}></ha-icon>${t.label}
            </p>
          </div>
          <button
            class="text-button"
            @click=${()=>this.dispatchEvent(new CustomEvent("edit-asset",{detail:this.asset.id,bubbles:!0,composed:!0}))}
          >
            ${this.t("common.edit")}
          </button>
        </header>
        <section class="section">
          <h3>${this.t("detail.connections")}</h3>
          ${s.length?a`<div class="relations">
                ${s.map(({relation:d,direction:l,other:p})=>{let _=ye(this.t,d.relation_type,l);return a`<div class="relation">
                    <ha-icon icon=${_.icon}></ha-icon>
                    <div>
                      <small>${_.label}</small>${p?a`<button
                            @click=${()=>this.dispatchEvent(new CustomEvent("navigate-asset",{detail:p.id,bubbles:!0,composed:!0}))}
                          >
                            ${p.name}
                          </button>`:a`<strong
                            >${this.t("detail.missing_element")}</strong
                          >`}
                    </div>
                  </div>`})}
              </div>`:a`<p class="passive">
                ${this.t("detail.no_connections")}
              </p>`}${n.length?a`<div class="actions">
                ${n.map(d=>a`<button
                      class="secondary"
                      ?disabled=${!!this._action}
                      @click=${()=>this._action=d}
                    >
                      ${this.t(d.labelKey)}
                    </button>`)}
              </div>`:c}${this._action?a`<bindhome-contextual-relation-editor
                .hass=${this.hass}
                .t=${this.t}
                .asset=${this.asset}
                .assets=${this.assets}
                .areas=${this.areas}
                .action=${this._action}
                .onRefresh=${this.refreshTopologyData}
                @cancel=${()=>this._action=null}
                @done=${()=>this._action=null}
              ></bindhome-contextual-relation-editor>`:c}
        </section>
        <section class="section">
          <h3>
            ${this.t(this.asset.asset_type==="radiator"?"detail.control":"detail.device")}
          </h3>
          ${r.capability?a`<div class="device">
                <bindhome-primary-connection-editor
                  .hass=${this.hass}
                  .t=${this.t}
                  .asset=${this.asset}
                  .capability=${r.capability}
                  .status=${r.status}
                  .areas=${this.areas}
                  .entityRegistry=${this.entityRegistry}
                  .deviceRegistry=${this.deviceRegistry}
                  .refreshBindingData=${this.refreshBindingData}
                ></bindhome-primary-connection-editor>
              </div>`:a`<p class="passive">${this.t("detail.passive")}</p>`}
        </section>
        <section class="section">
          <details>
            <summary>
              <ha-icon icon="mdi:code-tags"></ha-icon>${this.t("detail.technical")}
            </summary>
            <dl>
              <dt>${this.t("fields.asset_type")}</dt>
              <dd class="raw">${this.asset.asset_type}</dd>
              <dt>${this.t("detail.asset_id")}</dt>
              <dd class="raw">${this.asset.id}</dd>
              <dt>${this.t("fields.code")}</dt>
              <dd>${this.asset.code||this.t("common.not_set")}</dd>
              <dt>${this.t("fields.capabilities")}</dt>
              <dd class="raw">
                ${this.asset.capabilities?.join(", ")||this.t("common.none")}
              </dd>
              <dt>${this.t("detail.representations")}</dt>
              <dd class="raw">
                ${o.length?o.map(d=>d.platform).join(", "):this.t("common.none")}
              </dd>
            </dl>
          </details>
        </section>
      </article>`}};u(Y,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},floors:{attribute:!1},registry:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},_action:{state:!0}}),u(Y,"styles",[$,m`
      :host {
        display: block;
        min-width: 0;
      }
      .back {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0;
      }
      .card {
        margin-top: 8px;
      }
      .header {
        display: flex;
        gap: 14px;
        align-items: flex-start;
        padding: 20px;
        border-bottom: 1px solid var(--divider-color);
      }
      .hero-icon {
        display: grid;
        place-items: center;
        flex: none;
        width: 52px;
        height: 52px;
        border-radius: 12px;
        color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 12%, transparent);
        --mdc-icon-size: 30px;
      }
      .grow {
        min-width: 0;
        flex: 1;
      }
      .header h2 {
        overflow-wrap: anywhere;
        font-size: 23px;
        line-height: 30px;
        font-weight: 500;
      }
      .location {
        margin-top: 3px;
        color: var(--secondary-text-color);
      }
      .type {
        display: flex;
        align-items: center;
        gap: 7px;
        margin-top: 10px;
      }
      .section {
        padding: 18px 20px;
        border-bottom: 1px solid var(--divider-color);
      }
      .section:last-child {
        border-bottom: 0;
      }
      .section h3 {
        margin-bottom: 12px;
        font-size: 17px;
        font-weight: 500;
      }
      .relations {
        display: grid;
        gap: 8px;
      }
      .relation {
        display: grid;
        grid-template-columns: 28px minmax(0, 1fr);
        gap: 10px;
        align-items: start;
        padding: 10px 0;
      }
      .relation ha-icon {
        color: var(--primary-color);
      }
      .relation button {
        display: block;
        padding: 0;
        border: 0;
        background: transparent;
        text-align: left;
        font-weight: 500;
      }
      .relation small {
        display: block;
        margin-top: 2px;
        color: var(--secondary-text-color);
      }
      .device {
        padding: 14px;
        border-radius: 8px;
        background: var(--secondary-background-color);
      }
      .passive {
        color: var(--secondary-text-color);
        line-height: 1.45;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }
      details {
        overflow: hidden;
      }
      summary {
        min-height: 52px;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-weight: 500;
      }
      dl {
        display: grid;
        grid-template-columns: 150px minmax(0, 1fr);
        gap: 10px 16px;
        padding-bottom: 16px;
      }
      dt {
        color: var(--secondary-text-color);
      }
      dd {
        overflow-wrap: anywhere;
      }
      .raw {
        font-family: var(--code-font-family, monospace);
        font-size: 12px;
      }
      @media (max-width: 600px) {
        .header {
          display: grid;
          grid-template-columns: 46px minmax(0, 1fr);
          padding: 16px 14px;
        }
        .header > .text-button {
          grid-column: 2;
          justify-self: start;
          padding: 0;
        }
        .section {
          padding: 16px 14px;
        }
        .hero-icon {
          width: 46px;
          height: 46px;
        }
        .header h2 {
          font-size: 21px;
          line-height: 27px;
        }
        dl {
          grid-template-columns: 1fr;
          gap: 3px;
        }
        dd {
          margin-bottom: 8px;
        }
      }
    `]);customElements.define("bindhome-element-detail",Y);var H=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.floors=[],this.areas=[],this.assets=[],this.registry={},this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this.refreshBindingData=null,this.refreshTopologyData=null,this.selectedAssetId=null,this.selectedAreaId=null,this._areaId=null,this._assetId=null}willUpdate(){this.selectedAssetId&&this.selectedAssetId!==this._assetId&&(this._assetId=this.selectedAssetId),this.selectedAreaId&&!this._areaId&&(this._areaId=this.selectedAreaId)}_areaAssets(t){return t===S?this.assets.filter(e=>!e.area_id):t===I?this.assets.filter(e=>e.area_id&&!this.areas.some(s=>s.area_id===e.area_id)):this.assets.filter(e=>e.area_id===t)}_selectArea(t){this._areaId=t,this._assetId=null,this.dispatchEvent(new CustomEvent("home-navigate",{detail:{areaId:t,assetId:null},bubbles:!0,composed:!0}))}_selectAsset(t){this._assetId=t,this.dispatchEvent(new CustomEvent("home-navigate",{detail:{areaId:this._areaId,assetId:t},bubbles:!0,composed:!0}))}_areaName(){return this._areaId===S?this.t("home.unassigned"):this._areaId===I?this.t("home.stale_area"):this.areas.find(t=>t.area_id===this._areaId)?.name??this.t("home.choose_room")}_renderTree(){let t=fe(this.floors,this.areas,this.assets);return a`<section
      class="tree surface ${this._areaId||this._assetId?"hidden-mobile":""}"
      aria-label=${this.t("home.navigation_label")}
    >
      ${t.groups.map(e=>a`<div>
            <div class="floor-title">
              <ha-icon icon=${e.icon||"mdi:layers-outline"}></ha-icon
              ><span class="grow"
                >${e.name??this.t("common.no_floor")}</span
              >
            </div>
            ${e.areas.map(s=>{let r=t.assetsByArea.get(s.area_id)?.length??0;return a`<button
                class="area-row ${this._areaId===s.area_id?"selected":""}"
                aria-current=${this._areaId===s.area_id?"location":"false"}
                @click=${()=>this._selectArea(s.area_id)}
              >
                <ha-icon icon=${s.icon||"mdi:floor-plan"}></ha-icon
                ><span class="grow">${s.name}</span
                ><span class="count">${r}</span
                ><ha-icon icon="mdi:chevron-right"></ha-icon>
              </button>`})}
          </div>`)}${t.unassigned.length||t.stale.length?a`<div class="specials">
            ${t.unassigned.length?a`<button
                  class="area-row special ${this._areaId===S?"selected":""}"
                  @click=${()=>this._selectArea(S)}
                >
                  <ha-icon icon="mdi:map-marker-off-outline"></ha-icon
                  ><span class="grow">${this.t("home.unassigned")}</span
                  ><span class="count">${t.unassigned.length}</span>
                </button>`:c}${t.stale.length?a`<button
                  class="area-row special ${this._areaId===I?"selected":""}"
                  @click=${()=>this._selectArea(I)}
                >
                  <ha-icon icon="mdi:map-marker-alert-outline"></ha-icon
                  ><span class="grow">${this.t("home.stale_area")}</span
                  ><span class="count">${t.stale.length}</span>
                </button>`:c}
          </div>`:c}
    </section>`}_renderRoom(){if(!this._areaId)return a`<div class="empty room">${this.t("home.choose_room")}</div>`;let t=this._areaAssets(this._areaId),e=be(this.t,t);return a`<section
      class="room surface ${this._assetId?"hidden-mobile":""}"
    >
      <button
        class="back text-button"
        @click=${()=>{this._areaId=null}}
      >
        <ha-icon icon="mdi:arrow-left"></ha-icon>${this.t("home.back_floors")}
      </button>
      <header class="room-head">
        <ha-icon icon="mdi:floor-plan"></ha-icon>
        <div class="grow">
          <h2>${this._areaName()}</h2>
          <span class="muted"
            >${this.t("home.element_count",{count:t.length})}</span
          >
        </div>
        ${[S,I].includes(this._areaId)?c:a`<button
              class="primary"
              @click=${()=>this.dispatchEvent(new CustomEvent("add-in-area",{detail:this._areaId,bubbles:!0,composed:!0}))}
            >
              <ha-icon icon="mdi:plus"></ha-icon
              ><span>${this.t("home.add_element")}</span>
            </button>`}
      </header>
      ${e.length?e.map(s=>{let r=_e(this.t,s.category);return a`<section>
              <div class="category-title">
                <ha-icon icon=${r.icon}></ha-icon
                ><span class="grow">${r.label}</span
                ><span class="count">${s.assets.length}</span>
              </div>
              ${s.assets.map(o=>{let n=w(this.t,o.asset_type);return a`<button
                  class="asset-row"
                  @click=${()=>this._selectAsset(o.id)}
                >
                  <ha-icon icon=${n.icon}></ha-icon
                  ><span class="grow"
                    ><strong>${o.name}</strong
                    ><span class="asset-meta">${n.label}</span></span
                  ><ha-icon icon="mdi:chevron-right"></ha-icon>
                </button>`})}
            </section>`}):a`<div class="empty">${this.t("home.room_empty")}</div>`}
    </section>`}render(){let t=this.assets.find(e=>e.id===this._assetId);return a`<div class="page">
      <h1 class="page-title">${this.t("nav.home")}</h1>
      <p class="intro muted">${this.t("home.intro")}</p>
      <div class="layout">
        ${this._renderTree()}
        <div class="room ${t?"hidden-mobile":""}">
          ${this._renderRoom()}
        </div>
        ${t?a`<bindhome-element-detail
              class="detail"
              .hass=${this.hass}
              .t=${this.t}
              .asset=${t}
              .assets=${this.assets}
              .areas=${this.areas}
              .floors=${this.floors}
              .registry=${this.registry}
              .bindingStatuses=${this.bindingStatuses}
              .entityRegistry=${this.entityRegistry}
              .deviceRegistry=${this.deviceRegistry}
              .refreshBindingData=${this.refreshBindingData}
              .refreshTopologyData=${this.refreshTopologyData}
              @back=${()=>{this._assetId=null}}
              @navigate-asset=${e=>this._selectAsset(e.detail)}
            ></bindhome-element-detail>`:c}
      </div>
    </div>`}};u(H,"properties",{hass:{attribute:!1},t:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},registry:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},selectedAssetId:{attribute:!1},selectedAreaId:{attribute:!1},_areaId:{state:!0},_assetId:{state:!0}}),u(H,"styles",[$,m`
      .layout {
        display: grid;
        grid-template-columns: minmax(260px, 360px) minmax(0, 1fr);
        gap: 18px;
        margin-top: 22px;
        align-items: start;
      }
      .floor-title,
      .area-row,
      .category-title,
      .asset-row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        min-height: 52px;
        padding: 8px 14px;
        border: 0;
        border-bottom: 1px solid var(--divider-color);
        background: transparent;
        text-align: left;
      }
      .floor-title {
        font-weight: 500;
        background: var(--secondary-background-color);
      }
      .floor-title ha-icon,
      .category-title ha-icon {
        color: var(--primary-color);
      }
      .area-row:hover,
      .asset-row:hover {
        background: var(--secondary-background-color);
      }
      .area-row.selected {
        border-left: 3px solid var(--primary-color);
        background: var(--secondary-background-color);
      }
      .grow {
        min-width: 0;
        flex: 1;
        overflow-wrap: anywhere;
      }
      .count {
        color: var(--secondary-text-color);
        font-size: 12px;
      }
      .room-head {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px;
        border-bottom: 1px solid var(--divider-color);
      }
      .room-head ha-icon {
        color: var(--primary-color);
        --mdc-icon-size: 30px;
      }
      .room-head .primary {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .category-title {
        font-weight: 500;
      }
      .asset-row {
        padding-left: 30px;
      }
      .asset-row ha-icon {
        color: var(--secondary-text-color);
      }
      .asset-meta {
        display: block;
        margin-top: 2px;
        color: var(--secondary-text-color);
        font-size: 12px;
      }
      .specials {
        margin-top: 16px;
      }
      .special {
        border-bottom: 1px solid var(--divider-color);
      }
      .special:last-child {
        border-bottom: 0;
      }
      .detail {
        min-width: 0;
      }
      .back {
        display: none;
      }
      .intro {
        margin-top: 4px;
      }
      .layout > .room.hidden-mobile {
        display: none;
      }
      @media (max-width: 760px) {
        .layout {
          display: block;
        }
        .tree.hidden-mobile,
        .room.hidden-mobile {
          display: none;
        }
        .detail .back,
        .room .back {
          display: inline-flex;
          margin-bottom: 8px;
        }
        .page {
          padding-top: 18px;
        }
        .room-head {
          align-items: flex-start;
        }
        .room-head .primary {
          padding: 0 12px;
        }
        .room-head .primary span {
          display: none;
        }
      }
    `]);customElements.define("bindhome-home-view",H);var rs=["light_point","socket","circuit","tap","shutoff_valve","window","door","appliance"],J=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.presets=[],this.areas=[],this.contextAreaId=null,this.onCreated=null,this._preset=null,this._name="",this._code="",this._areaId="",this._showAll=!1,this._saving=!1,this._error=null,this._identity=null}willUpdate(){this.contextAreaId!==this._identity&&(this._identity=this.contextAreaId,this._areaId=this.contextAreaId??this._areaId)}_choose(t){this._preset=t,this._name=A(this.t,t),this._code="",this._error=null}async _submit(t){if(t.preventDefault(),!(this._saving||!this._preset||!this._name.trim())){this._saving=!0,this._error=null;try{let e={name:this._name.trim(),asset_type:this._preset.asset_type,capabilities:[...this._preset.suggested_capabilities??[]]};this._code.trim()&&(e.code=this._code.trim()),this._areaId&&(e.area_id=this._areaId);let s=await v(this.hass).createAssetsBulk([e]),r=s?.assets?.[0]??s?.created?.[0]??null;this.onCreated&&await this.onCreated(r),this.dispatchEvent(new CustomEvent("asset-created",{detail:r,bubbles:!0,composed:!0}))}catch(e){this._error=x(e,this.t("add.create_error")).message}finally{this._saving=!1}}}render(){let t=this._showAll?this.presets:rs.map(e=>this.presets.find(s=>s.preset_id===e)).filter(Boolean);return a`<div class="page">
      <h1 class="page-title">${this.t("nav.add")}</h1>
      <p class="intro muted">${this.t("add.intro")}</p>
      ${this._preset?a`<form class="form surface" @submit=${this._submit}>
            <div class="form-head">
              <ha-icon
                icon=${w(this.t,this._preset.asset_type).icon}
              ></ha-icon>
              <h2>${A(this.t,this._preset)}</h2>
            </div>
            <div class="fields">
              <label
                >${this.t("fields.name")}<input
                  .value=${this._name}
                  @input=${e=>this._name=e.target.value}
                  required /></label
              ><label
                >${this.t("fields.code_optional")}<input
                  .value=${this._code}
                  @input=${e=>this._code=e.target.value} /></label
              ><label
                >${this.t("common.area")}<select
                  .value=${this._areaId}
                  @change=${e=>this._areaId=e.target.value}
                >
                  <option value="">${this.t("common.none")}</option>
                  ${this.areas.map(e=>a`<option value=${e.area_id}>${e.name}</option>`)}
                </select></label
              >
            </div>
            ${this._error?a`<div class="error" role="alert">${this._error}</div>`:c}
            <div class="actions">
              <button
                type="button"
                class="secondary"
                ?disabled=${this._saving}
                @click=${()=>{this._preset=null,this._error=null}}
              >
                ${this.t("common.cancel")}</button
              ><button
                class="primary"
                ?disabled=${this._saving||!this._name.trim()}
              >
                ${this._saving?this.t("add.saving"):this.t("common.add")}
              </button>
            </div>
          </form>`:a`<section class="picker">
            <h2>${this.t("add.what")}</h2>
            <div class="presets">
              ${t.map(e=>{let s=w(this.t,e.asset_type);return a`<button
                  class="preset"
                  @click=${()=>this._choose(e)}
                >
                  <ha-icon icon=${s.icon}></ha-icon
                  ><strong>${A(this.t,e)}</strong>
                </button>`})}
            </div>
            ${this._showAll?c:a`<button
                  class="more text-button"
                  @click=${()=>this._showAll=!0}
                >
                  ${this.t("add.show_all")}
                </button>`}
          </section>`}
    </div>`}};u(J,"properties",{hass:{attribute:!1},t:{attribute:!1},presets:{attribute:!1},areas:{attribute:!1},contextAreaId:{attribute:!1},onCreated:{attribute:!1},_preset:{state:!0},_name:{state:!0},_code:{state:!0},_areaId:{state:!0},_showAll:{state:!0},_saving:{state:!0},_error:{state:!0}}),u(J,"styles",[$,m`
      .intro {
        margin-top: 5px;
      }
      .picker {
        margin-top: 24px;
      }
      .picker h2,
      .form h2 {
        font-size: 19px;
        font-weight: 500;
      }
      .presets {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px;
        margin-top: 14px;
      }
      .preset {
        min-height: 92px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 9px;
        padding: 14px;
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        background: var(--card-background-color);
        text-align: left;
      }
      .preset:hover {
        border-color: var(--primary-color);
        background: var(--secondary-background-color);
      }
      .preset ha-icon {
        color: var(--primary-color);
        --mdc-icon-size: 27px;
      }
      .more {
        margin-top: 10px;
      }
      .form {
        max-width: 680px;
        margin-top: 24px;
        padding: 22px;
      }
      .form-head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      }
      .form-head ha-icon {
        color: var(--primary-color);
        --mdc-icon-size: 30px;
      }
      .fields {
        display: grid;
        gap: 16px;
      }
      label {
        display: block;
        font-weight: 500;
      }
      input,
      select {
        width: 100%;
        min-height: 46px;
        margin-top: 7px;
        padding: 9px 11px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 22px;
      }
      .success {
        margin-top: 16px;
        color: var(--success-color, var(--primary-color));
      }
      @media (max-width: 600px) {
        .presets {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .form {
          padding: 16px;
        }
        .actions > * {
          flex: 1;
        }
      }
    `]);customElements.define("bindhome-add-view",J);var X=class extends g{constructor(){super(),this.t=t=>t,this.assets=[],this.areas=[],this.floors=[],this._query=""}render(){let e=ve(this.t,this.assets,this.areas,this.floors,this._query).map(s=>s.asset?s:{asset:s,area:this.areas.find(r=>r.area_id===s.area_id),type:w(this.t,s.asset_type)});return a`<div class="page">
      <h1 class="page-title">${this.t("nav.search")}</h1>
      <div class="search">
        <ha-icon icon="mdi:magnify"></ha-icon
        ><input
          type="search"
          aria-label=${this.t("search.label")}
          placeholder=${this.t("search.placeholder")}
          .value=${this._query}
          @input=${s=>this._query=s.target.value}
        />
      </div>
      <p class="hint muted">
        ${this._query?this.t("search.results",{count:e.length}):this.t("search.suggestions")}
      </p>
      ${e.length?a`<div class="results surface">
            ${e.map(({asset:s,area:r,type:o})=>a`<button
                  class="result"
                  @click=${()=>this.dispatchEvent(new CustomEvent("open-asset",{detail:s.id,bubbles:!0,composed:!0}))}
                >
                  <ha-icon icon=${o.icon}></ha-icon
                  ><span
                    ><strong>${s.name}</strong
                    ><span class="meta"
                      >${o.label} ·
                      ${r?.name??this.t(s.area_id?"home.stale_area":"home.unassigned")}</span
                    ></span
                  ><ha-icon icon="mdi:chevron-right"></ha-icon>
                </button>`)}
          </div>`:a`<div class="empty">${this.t("search.empty")}</div>`}
    </div>`}};u(X,"properties",{t:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},floors:{attribute:!1},_query:{state:!0}}),u(X,"styles",[$,m`
      .search {
        position: relative;
        max-width: 720px;
        margin-top: 22px;
      }
      .search ha-icon {
        position: absolute;
        left: 14px;
        top: 12px;
        color: var(--secondary-text-color);
      }
      input {
        width: 100%;
        min-height: 50px;
        padding: 10px 14px 10px 48px;
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        background: var(--card-background-color);
        font-size: 16px;
      }
      .results {
        max-width: 820px;
        margin-top: 20px;
      }
      .result {
        width: 100%;
        min-height: 68px;
        display: grid;
        grid-template-columns: 36px minmax(0, 1fr) 24px;
        gap: 12px;
        align-items: center;
        padding: 10px 14px;
        border: 0;
        border-bottom: 1px solid var(--divider-color);
        background: transparent;
        text-align: left;
      }
      .result:hover {
        background: var(--secondary-background-color);
      }
      .result > ha-icon:first-child {
        color: var(--primary-color);
      }
      .meta {
        display: block;
        margin-top: 3px;
        color: var(--secondary-text-color);
        font-size: 13px;
      }
      .hint {
        margin-top: 10px;
      }
      .empty {
        max-width: 820px;
        margin-top: 20px;
      }
    `]);customElements.define("bindhome-search-view",X);function Ft(i,t){return(i?.name??"").localeCompare(t?.name??"",void 0,{sensitivity:"base",numeric:!0})}function jt(i){return[...i].sort(Ft)}function Wt(i,t,e){let s=new Map((i??[]).map(h=>[h.floor_id,h])),r=new Map((t??[]).map(h=>[h.area_id,h])),o=new Map;for(let h of e??[]){if(!h.area_id||!r.has(h.area_id))continue;let f=o.get(h.area_id)??[];f.push(h),o.set(h.area_id,f)}let n=(t??[]).map(h=>({area:h,assets:jt(o.get(h.area_id)??[])})).sort((h,f)=>Ft(h.area,f.area)),d=(i??[]).map(h=>({floor:h,areas:n.filter(({area:f})=>f.floor_id===h.floor_id)})).sort((h,f)=>{let b=h.floor.level,y=f.floor.level;return typeof b=="number"&&typeof y=="number"&&b!==y?b-y:Ft(h.floor,f.floor)}),l=n.filter(({area:h})=>!h.floor_id||!s.has(h.floor_id)),p=jt((e??[]).filter(h=>!h.area_id)),_=jt((e??[]).filter(h=>h.area_id&&!r.has(h.area_id)));return{floors:d,noFloorAreas:l,noAreaAssets:p,unknownAreaAssets:_}}function Z(i){return{asset_id:i.id,name:i.name,asset_type:i.asset_type,code:i.code??"",area_id:i.area_id??"",capabilities:[...i.capabilities??[]]}}function Ie(i){return i==null?null:String(i).trim()||null}function as(i,t){return i.length!==t.length?!1:i.every((e,s)=>e===t[s])}function Kt(i,t){if(t.asset_id!==i.id)throw new Error("Asset edit draft identity does not match the persisted Asset");let e={name:t.name,asset_type:t.asset_type,code:Ie(t.code),area_id:Ie(t.area_id),capabilities:[...t.capabilities??[]]},s={asset_id:i.id};e.name!==i.name&&(s.name=e.name),e.asset_type!==i.asset_type&&(s.asset_type=e.asset_type),e.code!==(i.code??null)&&(s.code=e.code),e.area_id!==(i.area_id??null)&&(s.area_id=e.area_id);let r=[...i.capabilities??[]];return as(e.capabilities,r)||(s.capabilities=e.capabilities),s}function Re(i,t){return Object.keys(Kt(i,t)).length>1}function Gt(i,t=[]){return t.find(e=>e.area_id===i?.area_id)?.name??null}function os(i,t=[]){return{asset:i,id:i.id,name:i.name,code:i.code??"",assetType:i.asset_type,areaId:i.area_id??null,areaName:Gt(i,t)}}function ft(i,t="",e=null,s=[]){let r=String(t).trim().toLocaleLowerCase(),o=i.map(d=>os(d,s));return(r?o.filter(d=>[d.name,d.code,d.assetType,d.areaName??""].join(" ").toLocaleLowerCase().includes(r)):o).sort((d,l)=>+!!(e&&l.areaId===e)-+!!(e&&d.areaId===e)||d.name.localeCompare(l.name)||d.id.localeCompare(l.id))}var V=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.assets=[],this.areas=[],this.registry={},this.onRefresh=null,this.onDone=null,this.onSyncWarning=null,this._direction="outgoing",this._type="",this._other="",this._search="",this._saving=!1,this._error=null,this._identity="",this._token=0}connectedCallback(){super.connectedCallback(),this._resetIdentity()}willUpdate(t){if(!t.has("asset"))return;let e=this.asset?.id??"";this._identity&&e!==this._identity&&this._resetIdentity(),this._identity=e}_resetIdentity(){this._token+=1,this._direction="outgoing",this._type="",this._other="",this._search="",this._error=null,this._saving=!1,this._identity=this.asset?.id??""}_isCurrent(t,e){return t===this._token&&this.asset?.id===e}_candidates(){let t=ft(this.assets.filter(s=>s.id!==this.asset?.id),this._search,this.asset?.area_id,this.areas),e=this._search.trim()?20:8;return{all:t,shown:t.slice(0,e)}}async _save(){if(this._saving||!this._other||!Ut(this._type))return;let t=++this._token,e=this.asset?.id,s=this._direction==="outgoing"?e:this._other,r=this._direction==="outgoing"?this._other:e;this._saving=!0,this._error=null;try{if(await v(this.hass).createRelation({sourceAssetId:s,relationType:this._type.trim(),targetAssetId:r}),!this._isCurrent(t,e))return;this._saving=!1,this.onDone?.();try{await this.onRefresh?.()}catch{if(!this._isCurrent(t,e))return;this.onSyncWarning?.(this.t("topology.sync_warning"))}}catch(o){if(!this._isCurrent(t,e))return;let n=x(o,this.t("topology.save_error"));this._error=n.code==="conflict"?this.t("topology.duplicate_relation"):n.message,this._saving=!1}}_cancel(){this.onDone?.()}render(){let{all:t,shown:e}=this._candidates();return a`
      <form
        class="editor"
        @submit=${s=>{s.preventDefault(),this._save()}}
      >
        <label>
          ${this.t("topology.direction")}

          <select
            .value=${this._direction}
            @change=${s=>{this._direction=s.target.value}}
          >
            <option value="outgoing">
              ${this.t("topology.outgoing_direction")}
            </option>

            <option value="incoming">
              ${this.t("topology.incoming_direction")}
            </option>
          </select>
        </label>

        <label>
          ${this.t("topology.relation_type")}

          <input
            .value=${this._type}
            @input=${s=>{this._type=s.target.value}}
            pattern="[a-z][a-z0-9_]*"
            required
            list="relation-types"
          />

          <datalist id="relation-types">
            ${$e(this.registry?.relations).map(s=>a`
                <option value=${s}></option>
              `)}
          </datalist>
        </label>

        <label>
          ${this.t("topology.other_asset")}

          <input
            .value=${this._search}
            @input=${s=>{this._search=s.target.value}}
            placeholder=${this.t("topology.search_assets")}
          />
        </label>

        <div class="candidates">
          ${e.length?e.map(s=>a`
                  <button
                    type="button"
                    class="candidate"
                    aria-pressed=${this._other===s.id?"true":"false"}
                    @click=${()=>{this._other=s.id,this._search=s.name}}
                  >
                    <strong>
                      ${s.name}
                    </strong>

                    <span>
                      ${s.code||s.assetType}${s.areaName?` \xB7 ${s.areaName}`:""}
                    </span>
                  </button>
                `):a`
                <p>
                  ${this.t("topology.no_matches")}
                </p>
              `}
        </div>

        ${t.length>e.length?a`
              <p class="count">
                ${this.t("topology.showing_results",{shown:e.length,total:t.length})}
              </p>
            `:c}

        ${this._error?a`
              <p
                class="error"
                role="alert"
              >
                ${this._error}
              </p>
            `:c}

        <div class="actions">
          <button
            type="button"
            @click=${this._cancel}
            ?disabled=${this._saving}
          >
            ${this.t("editor.cancel")}
          </button>

          <button
            type="submit"
            ?disabled=${this._saving||!this._other||!Ut(this._type)}
          >
            ${this.t("editor.save")}
          </button>
        </div>
      </form>
    `}};u(V,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},registry:{attribute:!1},onRefresh:{attribute:!1},onDone:{attribute:!1},onSyncWarning:{attribute:!1},_direction:{state:!0},_type:{state:!0},_other:{state:!0},_search:{state:!0},_saving:{state:!0},_error:{state:!0}}),u(V,"styles",m`
    :host {
      display: block;
    }

    .editor {
      display: grid;
      gap: 12px;
      padding: 12px 0;
    }

    label {
      display: grid;
      gap: 4px;
      font-size: 13px;
    }

    input,
    select {
      min-height: 40px;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      font: inherit;
    }

    .candidates {
      display: grid;
      gap: 6px;
    }

    .candidate {
      text-align: left;
      padding: 10px;
      border: 1px solid var(--divider-color);
      border-radius: 7px;
      background:
        var(--card-background-color);
      cursor: pointer;
    }

    .candidate span {
      display: block;
      color:
        var(--secondary-text-color);
      font-size: 12px;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .actions button {
      min-height: 40px;
      padding: 0 14px;
    }

    .error {
      color: var(--error-color);
    }

    .count {
      font-size: 12px;
      color:
        var(--secondary-text-color);
    }
  `);customElements.define("bindhome-relation-editor",V);var tt=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.assets=[],this.areas=[],this.registry={},this.onRefresh=null,this.onNavigate=null,this._editing=!1,this._deleting=null,this._error=null,this._sync=null,this._confirm=null,this._identity="",this._token=0}willUpdate(t){t.has("asset")&&this.asset&&this._identity&&this.asset.id!==this._identity&&(this._token+=1,this._deleting=null,this._confirm=null,this._error=null,this._sync=null),this.asset&&(this._identity=this.asset.id)}_asset(t){return this.assets.find(e=>e.id===t)??null}_area(t){return t?.area_id?this.areas.find(e=>e.area_id===t.area_id)?.name??null:null}async _delete(t){if(this._deleting)return;let e=++this._token,s=this.asset?.id;this._deleting=t.id,this._error=null;try{if(await v(this.hass).deleteRelation(t.id),e!==this._token||this.asset?.id!==s)return;this._deleting=null,this._confirm=null;try{await this.onRefresh?.()}catch{if(e!==this._token||this.asset?.id!==s)return;this._sync=this.t("topology.sync_warning")}}catch(r){if(e!==this._token||this.asset?.id!==s)return;this._deleting=null,this._error=x(r,this.t("topology.delete_error")).message}}_navigate(t){this._asset(t)&&(this.onNavigate?.(t),this.dispatchEvent(new CustomEvent("navigate-asset",{detail:t,bubbles:!0,composed:!0})))}_renderNeighbor(t,e){let s=e?t.target_asset_id:t.source_asset_id,r=this._asset(s);if(!r)return a`
        <div class="neighbor missing">
          <strong>${this.t("topology.missing_asset")}</strong>
          <span>${t.relation_type}</span>
        </div>
      `;let o=this._area(r);return a`
      <button
        class="neighbor"
        type="button"
        @click=${()=>this._navigate(r.id)}
      >
        <strong>${r.name}</strong>
        <span>
          ${t.relation_type}${o?` \xB7 ${o}`:""}
        </span>
      </button>
    `}_renderRelation(t,e){return a`
      <li>
        ${this._renderNeighbor(t,e)}

        ${this._confirm===t.id?a`
              <span
                class="confirm"
                role="alertdialog"
                aria-label=${this.t("topology.confirm_delete")}
              >
                <span>${this.t("topology.confirm_delete")}</span>

                <button
                  type="button"
                  @click=${()=>{this._confirm=null}}
                >
                  ${this.t("editor.cancel")}
                </button>

                <button
                  type="button"
                  @click=${()=>this._delete(t)}
                  ?disabled=${!!this._deleting}
                >
                  ${this.t("topology.delete")}
                </button>
              </span>
            `:a`
              <button
                class="delete"
                type="button"
                @click=${()=>{this._confirm=t.id}}
                ?disabled=${!!this._deleting}
              >
                ${this.t("topology.delete")}
              </button>
            `}
      </li>
    `}render(){let{outgoing:t,incoming:e}=L(this.registry?.relations??[],this.asset?.id);return a`
      <section class="topology">
        <header>
          <div>
            <h3>${this.t("topology.title")}</h3>
            <p>${this.t("topology.helper")}</p>
          </div>

          <button
            type="button"
            @click=${()=>{this._editing=!0}}
            ?disabled=${this._editing}
          >
            ${this.t("topology.add_relation")}
          </button>
        </header>

        ${this._editing?a`
              <bindhome-relation-editor
                .hass=${this.hass}
                .t=${this.t}
                .asset=${this.asset}
                .assets=${this.assets}
                .areas=${this.areas}
                .registry=${this.registry}
                .onRefresh=${this.onRefresh}
                .onDone=${()=>{this._editing=!1}}
                .onSyncWarning=${s=>{this._sync=s}}
              ></bindhome-relation-editor>
            `:c}

        ${this._sync?a`
              <p class="warning" role="alert">
                ${this._sync}
              </p>
            `:c}

        ${this._error?a`
              <p class="error" role="alert">
                ${this._error}
              </p>
            `:c}

        <div class="columns">
          <div>
            <h4>${this.t("topology.outgoing")}</h4>

            ${t.length?a`
                  <ul>
                    ${t.map(s=>this._renderRelation(s,!0))}
                  </ul>
                `:a`
                  <p class="muted">
                    ${this.t("topology.no_relations")}
                  </p>
                `}
          </div>

          <div>
            <h4>${this.t("topology.incoming")}</h4>

            ${e.length?a`
                  <ul>
                    ${e.map(s=>this._renderRelation(s,!1))}
                  </ul>
                `:a`
                  <p class="muted">
                    ${this.t("topology.no_relations")}
                  </p>
                `}
          </div>
        </div>
      </section>
    `}};u(tt,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},registry:{attribute:!1},onRefresh:{attribute:!1},onNavigate:{attribute:!1},_editing:{state:!0},_deleting:{state:!0},_error:{state:!0},_sync:{state:!0},_confirm:{state:!0}}),u(tt,"styles",m`
    :host {
      display: block;
    }

    .topology {
      padding: 16px;
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      background: var(--card-background-color);
    }

    header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: start;
    }

    h3,
    h4,
    p {
      margin: 0;
    }

    header p {
      color: var(--secondary-text-color);
      font-size: 13px;
      margin-top: 4px;
    }

    .columns {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
      margin-top: 16px;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 8px 0;
      display: grid;
      gap: 8px;
    }

    li {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      align-items: center;
    }

    .neighbor {
      min-width: 0;
      text-align: left;
      padding: 9px;
      border: 1px solid var(--divider-color);
      background: transparent;
      border-radius: 6px;
      overflow-wrap: anywhere;
    }

    button.neighbor {
      cursor: pointer;
    }

    .neighbor span {
      display: block;
      color: var(--secondary-text-color);
      font-size: 12px;
    }

    .neighbor.missing {
      cursor: default;
    }

    .delete {
      align-self: center;
      border: 0;
      background: transparent;
      color: var(--error-color);
      cursor: pointer;
      white-space: nowrap;
    }

    .confirm {
      grid-column: 1 / -1;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      padding-top: 4px;
    }

    .confirm > span {
      flex: 1 1 100%;
      color: var(--secondary-text-color);
      font-size: 12px;
    }

    .topology button {
      font: inherit;
    }

    .error {
      color: var(--error-color);
    }

    .warning {
      color: var(--warning-color);
    }

    .muted {
      color: var(--secondary-text-color);
    }

    @media (max-width: 600px) {
      .columns {
        grid-template-columns: 1fr;
      }

      header {
        flex-direction: column;
      }

      .delete {
        padding-inline: 4px;
      }
    }
  `);customElements.define("bindhome-asset-topology",tt);function bt(i){return{...i,capabilities:[...i.capabilities??[]]}}var et=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.assets=[],this.areas=[],this.floors=[],this.registry={},this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this.refreshBindingData=null,this.refreshTopologyData=null,this._editing=!1,this._draft=null,this._snapshot=null,this._saving=!1,this._error=null,this._saved=!1,this._newCapability=""}willUpdate(t){t.has("asset")&&this.asset&&!this._editing&&(this._snapshot=bt(this.asset),this._draft=Z(this.asset))}get _dirty(){return!this._editing||!this._snapshot||!this._draft?!1:Re(this._snapshot,this._draft)}_emitEditing(t){this.dispatchEvent(new CustomEvent("editing-changed",{detail:t,bubbles:!0,composed:!0}))}_startEdit(){this._snapshot=bt(this.asset),this._draft=Z(this.asset),this._editing=!0,this._error=null,this._saved=!1,this._newCapability="",this._emitEditing(!0)}_cancel(){this._draft=Z(this.asset),this._snapshot=bt(this.asset),this._editing=!1,this._error=null,this._newCapability="",this._emitEditing(!1)}_close(){this._editing||this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}_updateField(t,e){!this._draft||this._saving||(this._draft={...this._draft,[t]:e},this._error=null,this._saved=!1)}_removeCapability(t){this._updateField("capabilities",this._draft.capabilities.filter(e=>e!==t))}_addCapability(){let t=this._newCapability.trim();if(!t||this._draft.capabilities.includes(t)){this._newCapability="";return}this._updateField("capabilities",[...this._draft.capabilities,t]),this._newCapability=""}async _save(t=null){if(t?.preventDefault(),this._saving||!this._snapshot||!this._draft)return;let e=Kt(this._snapshot,this._draft);if(Object.keys(e).length===1){this._editing=!1,this._emitEditing(!1);return}let{asset_id:s,...r}=e;this._saving=!0,this._error=null,this._saved=!1;try{let n=await v(this.hass).updateAsset(s,r);this.asset=n,this._snapshot=bt(n),this._draft=Z(n),this._editing=!1,this._saved=!0,this._emitEditing(!1),this.dispatchEvent(new CustomEvent("asset-updated",{detail:n,bubbles:!0,composed:!0}))}catch(o){let n=x(o,this.t("editor.save_error"));this._error=n.message??this.t("editor.save_error")}finally{this._saving=!1}}_areaName(t){return t?this.areas.find(e=>e.area_id===t)?.name??this.t("infrastructure.unknown_area"):this.t("browser.no_area")}_assetName(t){return this.assets.find(e=>e.id===t)?.name??t}_entityName(t){return this.hass?.states?.[t]?.attributes?.friendly_name??t}_relations(){return(this.registry?.relations??[]).filter(t=>t.source_asset_id===this.asset.id||t.target_asset_id===this.asset.id)}_bindings(){return(this.registry?.bindings??[]).filter(t=>t.asset_id===this.asset.id)}_primaryStatus(t){let e=_t(this.bindingStatuses).get(`${this.asset.id}:${t}:primary`);if(e)return e;let s=this._bindings().find(r=>r.capability===t&&r.role==="primary");return s?{asset_id:this.asset.id,capability:t,role:"primary",status:"resolved",config_valid:!0,runtime_available:!0,entity_id:s.entity_id,binding:s}:null}_representation(){return(this.registry?.representations??[]).find(t=>t.asset_id===this.asset.id)}_renderAreaOptions(){let t=new Set(this.floors.map(o=>o.floor_id)),e=new Set(this.areas.map(o=>o.area_id)),s=this._draft?.area_id&&!e.has(this._draft.area_id)?this._draft.area_id:null,r=this.areas.filter(o=>!o.floor_id||!t.has(o.floor_id));return a`
      <option
        value=""
        ?selected=${!this._draft?.area_id}
      >
        ${this.t("browser.no_area")}
      </option>

      ${s?a`
            <option
              value=${s}
              ?selected=${this._draft?.area_id===s}
            >
              ${this.t("editor.unknown_area_option",{area_id:s})}
            </option>
          `:c}

      ${this.floors.map(o=>{let n=this.areas.filter(d=>d.floor_id===o.floor_id);return n.length?a`
            <optgroup
              label=${o.name}
            >
              ${n.map(d=>a`
                  <option
                    value=${d.area_id}
                    ?selected=${this._draft?.area_id===d.area_id}
                  >
                    ${d.name}
                  </option>
                `)}
            </optgroup>
          `:c})}

      ${r.length?a`
            <optgroup
              label=${this.t("common.no_floor")}
            >
              ${r.map(o=>a`
                  <option
                    value=${o.area_id}
                    ?selected=${this._draft?.area_id===o.area_id}
                  >
                    ${o.name}
                  </option>
                `)}
            </optgroup>
          `:c}
    `}_renderCapabilitiesReadOnly(){return this.asset.capabilities?.length?a`
      <div class="cap-list">
        ${this.asset.capabilities.map(t=>a`
            <span class="cap">
              ${t}
            </span>
          `)}
      </div>
    `:this.t("common.none")}_renderReadOnly(){return a`
      <section class="details">
        <h3>
          ${this.t("editor.details")}
        </h3>

        <dl>
          <dt>
            ${this.t("fields.asset_type")}
          </dt>
          <dd>
            ${this.asset.asset_type}
          </dd>

          <dt>
            ${this.t("fields.code")}
          </dt>
          <dd>
            ${this.asset.code||this.t("common.not_set")}
          </dd>

          <dt>
            ${this.t("common.area")}
          </dt>
          <dd>
            ${this._areaName(this.asset.area_id)}
          </dd>

          <dt>
            ${this.t("fields.capabilities")}
          </dt>
          <dd>
            ${this._renderCapabilitiesReadOnly()}
          </dd>
        </dl>
      </section>
    `}_renderForm(){return a`
      <form
        class="form"
        @submit=${this._save}
        aria-busy=${this._saving?"true":"false"}
      >
        <h3>
          ${this.t("editor.edit_title")}
        </h3>

        <p class="notice">
          ${this.t("editor.identity_note")}
        </p>

        ${this._error?a`
              <div
                class="error"
                role="alert"
              >
                ${this._error}
              </div>
            `:c}

        <div class="grid">
          <div class="field">
            <label>
              ${this.t("fields.name")}
              <input
                required
                .value=${this._draft.name}
                ?disabled=${this._saving}
                @input=${t=>this._updateField("name",t.target.value)}
              />
            </label>
          </div>

          <div class="field">
            <label>
              ${this.t("fields.asset_type")}
              <input
                required
                .value=${this._draft.asset_type}
                ?disabled=${this._saving}
                @input=${t=>this._updateField("asset_type",t.target.value)}
              />
            </label>
          </div>

          <div class="field">
            <label>
              ${this.t("fields.code_optional")}
              <input
                .value=${this._draft.code}
                ?disabled=${this._saving}
                @input=${t=>this._updateField("code",t.target.value)}
              />
            </label>
          </div>

          <div class="field">
            <label>
              ${this.t("common.area")}
              <select
                ?disabled=${this._saving}
                @change=${t=>this._updateField("area_id",t.target.value)}
              >
                ${this._renderAreaOptions()}
              </select>
            </label>
          </div>

          <div class="field full">
            <label>
              ${this.t("fields.capabilities")}
            </label>

            ${this._draft.capabilities.length?a`
                  <div
                    class="editable-caps"
                  >
                    ${this._draft.capabilities.map(t=>a`
                            <span
                              class="editable-cap"
                            >
                              ${t}

                              <button
                                type="button"
                                aria-label=${this.t("actions.remove_capability",{capability:t})}
                                ?disabled=${this._saving}
                                @click=${()=>this._removeCapability(t)}
                              >
                                <ha-icon
                                  icon="mdi:close"
                                ></ha-icon>
                              </button>
                            </span>
                          `)}
                  </div>
                `:a`
                  <p class="helper">
                    ${this.t("fields.no_capabilities")}
                  </p>
                `}

            <div class="add-capability">
              <label>
                ${this.t("fields.custom_capability")}
                <input
                  .value=${this._newCapability}
                  placeholder=${this.t("fields.capability_placeholder")}
                  ?disabled=${this._saving}
                  @input=${t=>this._newCapability=t.target.value}
                  @keydown=${t=>{t.key==="Enter"&&(t.preventDefault(),this._addCapability())}}
                />
              </label>

              <button
                type="button"
                class="button secondary"
                ?disabled=${this._saving}
                @click=${this._addCapability}
              >
                ${this.t("common.add")}
              </button>
            </div>
          </div>
        </div>

        <div class="actions">
          <button
            type="button"
            class="button text"
            ?disabled=${this._saving}
            @click=${this._cancel}
          >
            ${this.t("editor.cancel")}
          </button>

          <button
            type="submit"
            class="button primary"
            ?disabled=${this._saving||!this._dirty}
          >
            ${this._saving?this.t("editor.saving"):this.t("editor.save")}
          </button>
        </div>
      </form>
    `}_renderConnections(){let t=this._representation();return a`
      <section class="connections">
        <h3>
          ${this.t("editor.connections")}
        </h3>

        <div class="connection-grid">
          <article class="connection-card">
            <bindhome-asset-topology
              .hass=${this.hass}
              .t=${this.t}
              .asset=${this.asset}
              .assets=${this.assets}
              .areas=${this.areas}
              .registry=${this.registry}
              .onRefresh=${this.refreshTopologyData}
              @topology-sync-warning=${e=>{this._error=e.detail}}
            ></bindhome-asset-topology>
          </article>

          <article class="connection-card">
            <h4>
              ${this.t("editor.bindings")}
            </h4>
            <div class="connection-list">
              ${(this.asset.capabilities??[]).map(e=>a`
                  <bindhome-primary-connection-editor
                    .hass=${this.hass}
                    .t=${this.t}
                    .asset=${this.asset}
                    .capability=${e}
                    .status=${this._primaryStatus(e)}
                    .areas=${this.areas}
                    .entityRegistry=${this.entityRegistry}
                    .deviceRegistry=${this.deviceRegistry}
                    .refreshBindingData=${this.refreshBindingData}
                  ></bindhome-primary-connection-editor>
                `)}
            </div>
          </article>

          <article class="connection-card">
            <h4>
              ${this.t("editor.representation")}
            </h4>

            ${t?a`
                  <p>
                    ${this.t("editor.platform")}:
                    <strong>
                      ${t.platform}
                    </strong>
                  </p>
                `:a`
                  <p class="muted">
                    ${this.t("editor.no_representation")}
                  </p>
                `}
          </article>
        </div>
      </section>
    `}render(){return this.asset?a`
      <button
        class="back"
        ?disabled=${this._editing}
        @click=${this._close}
      >
        ←
        ${this.t("editor.back")}
      </button>

      <div class="header">
        <div class="title">
          <h2>${this.asset.name}</h2>

          <p class="subtitle">
            ${this.t("editor.subtitle")}
          </p>
        </div>

        ${this._editing?c:a`
              <button
                class="button secondary"
                @click=${this._startEdit}
              >
                ${this.t("editor.edit")}
              </button>
            `}
      </div>

      ${this._saved?a`
            <p
              class="saved"
              role="status"
            >
              ${this.t("editor.saved")}
            </p>
          `:c}

      ${this._editing?this._renderForm():this._renderReadOnly()}

      ${this._renderConnections()}

      <details class="advanced">
        <summary>
          ${this.t("infrastructure.advanced")}
        </summary>

        <dl>
          <dt>
            ${this.t("infrastructure.asset_id")}
          </dt>
          <dd>${this.asset.id}</dd>
        </dl>
      </details>
    `:c}};u(et,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},floors:{attribute:!1},registry:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},_editing:{state:!0},_draft:{state:!0},_snapshot:{state:!0},_saving:{state:!0},_error:{state:!0},_saved:{state:!0},_newCapability:{state:!0}}),u(et,"styles",m`
    :host {
      display: block;
      color: var(--primary-text-color);
    }

    * {
      box-sizing: border-box;
    }

    button,
    input,
    select {
      font: inherit;
      color: inherit;
    }

    button {
      cursor: pointer;
    }

    h2,
    h3,
    p,
    dl,
    dd {
      margin: 0;
    }

    .back {
      min-height: 44px;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--primary-color);
      font-weight: 500;
    }

    .back:disabled {
      opacity: .45;
      cursor: not-allowed;
    }

    .header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 16px;
      margin-top: 12px;
      padding-bottom: 18px;
      border-bottom: 1px solid
        var(--divider-color);
    }

    .title {
      min-width: 0;
    }

    .title h2 {
      overflow-wrap: anywhere;
      font-size: 22px;
      line-height: 30px;
      font-weight: 500;
    }

    .subtitle {
      margin-top: 4px;
      color: var(--secondary-text-color);
      line-height: 20px;
    }

    .button {
      min-height: 44px;
      padding: 0 18px;
      border: 1px solid transparent;
      border-radius: 8px;
      background: transparent;
      font-weight: 500;
    }

    .button.primary {
      color:
        var(--text-primary-color, #fff);
      background: var(--primary-color);
    }

    .button.secondary {
      color: var(--primary-color);
      border-color: var(--primary-color);
    }

    .button.text {
      color: var(--primary-color);
    }

    .button:disabled {
      opacity: .5;
      cursor: not-allowed;
    }

    button:focus-visible,
    input:focus-visible,
    select:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }

    .notice,
    .error {
      margin-top: 16px;
      padding: 13px 14px;
      border-radius: 8px;
      line-height: 20px;
    }

    .notice {
      border: 1px solid var(--divider-color);
      background:
        var(--secondary-background-color);
    }

    .error {
      border: 1px solid
        var(--error-color, #db4437);
      color:
        var(--error-color, #db4437);
    }

    .saved {
      margin-top: 14px;
      color:
        var(--success-color, var(--primary-color));
      font-size: 14px;
      font-weight: 500;
    }

    .details,
    .form,
    .connections {
      margin-top: 24px;
    }

    .details h3,
    .form h3,
    .connections h3 {
      margin-bottom: 14px;
      font-size: 17px;
      line-height: 24px;
      font-weight: 500;
    }

    dl {
      display: grid;
      grid-template-columns: 170px minmax(0, 1fr);
      gap: 12px 18px;
    }

    dt {
      color: var(--secondary-text-color);
    }

    dd {
      overflow-wrap: anywhere;
    }

    .cap-list {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
    }

    .cap {
      padding: 4px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 7px;
      background:
        var(--secondary-background-color);
      font-size: 13px;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }

    .field {
      min-width: 0;
    }

    .field.full {
      grid-column: 1 / -1;
    }

    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
    }

    input,
    select {
      width: 100%;
      min-height: 44px;
      margin-top: 7px;
      padding: 9px 11px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background:
        var(--card-background-color);
    }

    .helper {
      margin-top: 5px;
      color: var(--secondary-text-color);
      font-size: 12px;
      line-height: 18px;
    }

    .editable-caps {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .editable-cap {
      min-height: 38px;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding-left: 10px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background:
        var(--secondary-background-color);
    }

    .editable-cap button {
      width: 38px;
      height: 38px;
      padding: 0;
      border: 0;
      background: transparent;
    }

    .add-capability {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      align-items: end;
      margin-top: 10px;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 24px;
    }

    .connection-grid {
      display: grid;
      grid-template-columns:
        repeat(3, minmax(0, 1fr));
      gap: 14px;
      align-items: start;
    }

    .connection-card {
      min-width: 0;
      padding: 15px;
      border: 1px solid var(--divider-color);
      border-radius: 9px;
      background:
        var(--card-background-color);
    }

    .connection-card h4 {
      margin: 0 0 10px;
      font-size: 14px;
      font-weight: 500;
    }

    .connection-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .connection-list li {
      padding: 8px 0;
      border-top: 1px solid
        var(--divider-color);
      overflow-wrap: anywhere;
      font-size: 13px;
      line-height: 19px;
    }

    .connection-list li:first-child {
      border-top: 0;
      padding-top: 0;
    }

    .muted {
      color: var(--secondary-text-color);
    }

    .advanced {
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px solid var(--divider-color);
    }

    .advanced summary {
      min-height: 44px;
      display: flex;
      align-items: center;
      color: var(--secondary-text-color);
      cursor: pointer;
    }

    @media (max-width: 760px) {
      .header {
        align-items: stretch;
        flex-direction: column;
      }

      .header .button {
        align-self: start;
      }

      .grid {
        grid-template-columns: 1fr;
      }

      .field.full {
        grid-column: auto;
      }

      dl {
        grid-template-columns: 1fr;
        gap: 4px;
      }

      dd {
        margin-bottom: 9px;
      }

      .connection-grid {
        grid-template-columns: 1fr;
      }

      .add-capability {
        grid-template-columns: 1fr;
      }

      .add-capability .button {
        justify-self: start;
      }

      .actions {
        flex-direction: column-reverse;
      }

      .actions .button {
        width: 100%;
      }
    }
  `);customElements.define("bindhome-asset-detail-editor",et);var vt="__bindhome_no_area_assets__",yt="__bindhome_unknown_area_assets__",st=class extends g{constructor(){super(),this.hass=null,this.floors=[],this.areas=[],this.assets=[],this.presets=[],this.registry={},this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this.refreshBindingData=null,this.refreshTopologyData=null,this.t=t=>t,this._selectedKey="",this._selectedAssetId=null,this._editorLocked=!1}get _hierarchy(){return Wt(this.floors,this.areas,this.assets)}_countAssets(t){return this.t(mt("counts.asset",t),{count:t})}_allAreaNodes(t=this._hierarchy){return[...t.floors.flatMap(e=>e.areas),...t.noFloorAreas]}_areaNode(t,e=this._hierarchy){return this._allAreaNodes(e).find(({area:s})=>s.area_id===t)}_targetForKey(t,e=this._hierarchy){if(!t)return null;if(t===vt)return e.noAreaAssets.length?{kind:"no-area",title:this.t("browser.no_area"),description:this.t("browser.no_area_intro"),assets:e.noAreaAssets}:null;if(t===yt)return e.unknownAreaAssets.length?{kind:"unknown-area",title:this.t("browser.unknown_area"),description:this.t("browser.unknown_area_intro"),assets:e.unknownAreaAssets}:null;let s=this._areaNode(t,e);return s?{kind:"area",title:s.area.name,description:"",area:s.area,assets:s.assets}:null}willUpdate(t){if(this._selectedKey&&(t.has("floors")||t.has("areas")||t.has("assets"))){let e=Wt(this.floors,this.areas,this.assets);this._targetForKey(this._selectedKey,e)||(this._selectedKey=""),this._selectedAssetId&&!this.assets.some(s=>s.id===this._selectedAssetId)&&(this._selectedAssetId=null,this._editorLocked=!1)}}_select(t){this._editorLocked||(this._selectedAssetId=null,this._selectedKey=t)}_openAsset(t){this._selectedAssetId=t}_closeAsset(){this._editorLocked||(this._selectedAssetId=null)}_locationKeyForAsset(t){return t.area_id?this.areas.some(e=>e.area_id===t.area_id)?t.area_id:yt:vt}_handleEditingChanged(t){this._editorLocked=!!t.detail}_handleAssetUpdated(t){t.stopPropagation();let e=t.detail,s=this.assets.map(r=>r.id===e.id?e:r);this.assets=s,this._selectedKey=this._locationKeyForAsset(e),this._selectedAssetId=e.id,this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:s,bubbles:!0,composed:!0}))}_assetTypeLabel(t){let e=this.presets.find(s=>s.asset_type===t.asset_type);return e?A(this.t,e):t.asset_type}_renderAreaButton(t){let e=this._selectedKey===t.area.area_id;return a`
      <button
        class="area-button ${e?"selected":""}"
        aria-pressed=${e?"true":"false"}
        ?disabled=${this._editorLocked}
        @click=${()=>this._select(t.area.area_id)}
      >
        <span class="area-name">
          ${t.area.name}
        </span>
        <span class="count">
          ${this._countAssets(t.assets.length)}
        </span>
      </button>
    `}_renderFloor(t){return a`
      <section class="floor">
        <div class="floor-title">
          <ha-icon
            icon="mdi:layers-outline"
          ></ha-icon>
          <span>${t.floor.name}</span>
        </div>

        ${t.areas.length?t.areas.map(e=>this._renderAreaButton(e)):a`
              <p class="empty-floor">
                ${this.t("browser.floor_no_areas")}
              </p>
            `}
      </section>
    `}_renderNoFloor(t){return t.noFloorAreas.length?a`
      <section class="floor">
        <div class="floor-title">
          <ha-icon
            icon="mdi:layers-off-outline"
          ></ha-icon>
          <span>
            ${this.t("common.no_floor")}
          </span>
        </div>

        ${t.noFloorAreas.map(e=>this._renderAreaButton(e))}
      </section>
    `:c}_renderSpecials(t){if(!t.noAreaAssets.length&&!t.unknownAreaAssets.length)return c;let e=this._selectedKey===vt,s=this._selectedKey===yt;return a`
      <div class="specials">
        ${t.noAreaAssets.length?a`
              <button
                class="special-button ${e?"selected":""}"
                aria-pressed=${e?"true":"false"}
                ?disabled=${this._editorLocked}
                @click=${()=>this._select(vt)}
              >
                <span class="area-name">
                  ${this.t("browser.no_area")}
                </span>
                <span class="count">
                  ${this._countAssets(t.noAreaAssets.length)}
                </span>
              </button>
            `:c}

        ${t.unknownAreaAssets.length?a`
              <button
                class="special-button ${s?"selected":""}"
                aria-pressed=${s?"true":"false"}
                ?disabled=${this._editorLocked}
                @click=${()=>this._select(yt)}
              >
                <span class="area-name">
                  ${this.t("browser.unknown_area")}
                </span>
                <span class="count">
                  ${this._countAssets(t.unknownAreaAssets.length)}
                </span>
              </button>
            `:c}
      </div>
    `}_renderAsset(t,e){return a`
      <li class="asset">
        <div class="asset-main">
          <button
            class="asset-open"
            @click=${()=>this._openAsset(t.id)}
          >
            ${t.name}
          </button>
          <div class="asset-type">
            ${this._assetTypeLabel(t)}
          </div>
        </div>

        <div class="asset-meta">
          ${t.code?a`
                <span>
                  ${this.t("fields.code")}:
                  ${t.code}
                </span>
              `:c}

          ${t.capabilities?.length?a`
                <span>
                  ${this.t("fields.capabilities")}:
                  ${t.capabilities.join(", ")}
                </span>
              `:c}

          ${e.kind==="unknown-area"?a`
                <span class="stale">
                  ${this.t("browser.stale_area",{area_id:t.area_id})}
                </span>
              `:c}
        </div>
      </li>
    `}_renderResults(t){let e=this._targetForKey(this._selectedKey,t);if(!this.assets.length)return a`
        <div class="empty">
          ${this.t("browser.no_assets_home")}
        </div>
      `;let s=this.assets.find(r=>r.id===this._selectedAssetId);return s?a`
        <bindhome-asset-detail-editor
          .hass=${this.hass}
          .t=${this.t}
          .asset=${s}
          .assets=${this.assets}
          .areas=${this.areas}
          .floors=${this.floors}
          .registry=${this.registry}
          .bindingStatuses=${this.bindingStatuses}
          .entityRegistry=${this.entityRegistry}
          .deviceRegistry=${this.deviceRegistry}
          .refreshBindingData=${this.refreshBindingData}
          .refreshTopologyData=${this.refreshTopologyData}
          @close=${this._closeAsset}
          @editing-changed=${this._handleEditingChanged}
          @asset-updated=${this._handleAssetUpdated}
          @navigate-asset=${r=>this._openAsset(r.detail)}
        ></bindhome-asset-detail-editor>
      `:e?a`
      <div class="results-header">
        <div class="results-copy">
          <h2>${e.title}</h2>

          ${e.description?a`
                <p
                  class="results-description"
                >
                  ${e.description}
                </p>
              `:c}
        </div>

        <span class="results-count">
          ${this._countAssets(e.assets.length)}
        </span>
      </div>

      ${e.assets.length?a`
            <ul
              class="assets"
              aria-label=${this.t("browser.asset_list_label",{location:e.title})}
            >
              ${e.assets.map(r=>this._renderAsset(r,e))}
            </ul>
          `:a`
            <div class="empty">
              ${this.t("browser.no_assets_area")}
            </div>
          `}
    `:a`
        <div class="empty">
          ${this.t("browser.select_area")}
        </div>
      `}render(){let t=this._hierarchy;return a`
      <div class="content">
        <header>
          <h1>
            ${this.t("browser.title")}
          </h1>
          <p class="intro">
            ${this.t("browser.intro")}
          </p>
        </header>

        <div class="layout">
          <nav
            class="tree"
            aria-label=${this.t("browser.navigation_label")}
          >
            <div class="tree-heading">
              ${this.t("browser.navigation_label")}
            </div>

            ${t.floors.map(e=>this._renderFloor(e))}

            ${this._renderNoFloor(t)}

            ${this._renderSpecials(t)}
          </nav>

          <section
            class="results"
            aria-live="polite"
          >
            ${this._renderResults(t)}
          </section>
        </div>
      </div>
    `}};u(st,"properties",{hass:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},presets:{attribute:!1},registry:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},t:{attribute:!1},_selectedKey:{state:!0},_selectedAssetId:{state:!0},_editorLocked:{state:!0}}),u(st,"styles",m`
    :host {
      display: block;
      min-height: 100%;
      color: var(--primary-text-color);
    }

    * {
      box-sizing: border-box;
    }

    button {
      font: inherit;
      color: inherit;
    }

    h1,
    h2,
    h3,
    p {
      margin: 0;
    }

    h1 {
      font-size: 24px;
      line-height: 32px;
      font-weight: 500;
    }

    h2 {
      font-size: 18px;
      line-height: 26px;
      font-weight: 500;
    }

    h3 {
      font-size: 15px;
      line-height: 22px;
      font-weight: 500;
    }

    .content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 28px 24px 48px;
    }

    .intro {
      max-width: 760px;
      margin-top: 6px;
      color: var(--secondary-text-color);
      line-height: 22px;
    }

    .layout {
      display: grid;
      grid-template-columns: 330px minmax(0, 1fr);
      gap: 28px;
      margin-top: 28px;
      align-items: start;
    }

    .tree {
      overflow: hidden;
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      background: var(--card-background-color);
    }

    .tree-heading {
      padding: 14px 16px;
      border-bottom: 1px solid var(--divider-color);
      color: var(--secondary-text-color);
      font-size: 13px;
      font-weight: 500;
    }

    .floor {
      border-bottom: 1px solid var(--divider-color);
    }

    .floor:last-child {
      border-bottom: 0;
    }

    .floor-title {
      display: flex;
      align-items: center;
      gap: 9px;
      min-height: 48px;
      padding: 8px 14px;
      font-weight: 500;
      background: var(--secondary-background-color);
    }

    .floor-title ha-icon {
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
    }

    .empty-floor {
      padding: 12px 16px;
      color: var(--secondary-text-color);
      font-size: 13px;
      line-height: 19px;
    }

    .area-button,
    .special-button {
      width: 100%;
      min-height: 52px;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      align-items: center;
      padding: 8px 14px 8px 18px;
      border: 0;
      border-top: 1px solid var(--divider-color);
      border-left: 3px solid transparent;
      background: transparent;
      text-align: left;
      cursor: pointer;
    }

    .area-button:hover:not(:disabled),
    .special-button:hover:not(:disabled) {
      background: var(--secondary-background-color);
    }

    .area-button:disabled,
    .special-button:disabled {
      cursor: not-allowed;
      opacity: .6;
    }

    .area-button.selected,
    .special-button.selected {
      border-left-color: var(--primary-color);
      background: var(--secondary-background-color);
    }

    .area-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
    }

    .count {
      color: var(--secondary-text-color);
      font-size: 12px;
      white-space: nowrap;
    }

    button:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: -2px;
    }

    .specials {
      border-top: 1px solid var(--divider-color);
    }

    .special-button {
      border-top: 0;
      border-bottom: 1px solid var(--divider-color);
    }

    .special-button:last-child {
      border-bottom: 0;
    }

    .results {
      min-width: 0;
    }

    .results-header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--divider-color);
    }

    .results-copy {
      min-width: 0;
    }

    .results-description {
      margin-top: 5px;
      color: var(--secondary-text-color);
      line-height: 20px;
    }

    .results-count {
      flex: none;
      padding-top: 3px;
      color: var(--secondary-text-color);
      font-size: 13px;
    }

    .empty {
      min-height: 220px;
      display: grid;
      place-items: center;
      margin-top: 20px;
      padding: 28px;
      border: 1px dashed var(--divider-color);
      border-radius: 10px;
      color: var(--secondary-text-color);
      text-align: center;
      line-height: 22px;
    }

    .assets {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .asset {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(140px, 220px);
      gap: 18px;
      min-height: 72px;
      padding: 13px 4px;
      border-bottom: 1px solid var(--divider-color);
    }

    .asset-main {
      min-width: 0;
    }

    .asset-open {
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--primary-color);
      font-weight: 500;
      line-height: 22px;
      text-align: left;
      overflow-wrap: anywhere;
    }

    .asset-open:hover {
      text-decoration: underline;
    }

    .asset-type {
      margin-top: 3px;
      color: var(--secondary-text-color);
      font-size: 13px;
      line-height: 18px;
    }

    .asset-meta {
      min-width: 0;
      color: var(--secondary-text-color);
      font-size: 13px;
      line-height: 19px;
    }

    .asset-meta span {
      display: block;
      overflow-wrap: anywhere;
    }

    .stale {
      color: var(--warning-color, var(--secondary-text-color));
    }

    @media (max-width: 760px) {
      .content {
        padding: 20px 14px 36px;
      }

      .layout {
        grid-template-columns: 1fr;
        gap: 22px;
        margin-top: 22px;
      }

      .asset {
        grid-template-columns: 1fr;
        gap: 6px;
      }

      .results-header {
        align-items: end;
      }
    }
  `);customElements.define("bindhome-inventory-browser",st);function ns(i,t){return{key:`draft:${i.preset_id}:${t}`,presetId:i.preset_id,name:`${i.default_name} ${t}`,asset_type:i.asset_type,code:null,capabilities:[...i.suggested_capabilities??[]]}}function it(i=[]){return{presetOrder:i.map(t=>t.preset_id),presets:new Map(i.map(t=>[t.preset_id,t])),quantities:new Map(i.map(t=>[t.preset_id,0])),retained:new Map(i.map(t=>[t.preset_id,[]]))}}function Ce(i,t,e){let s=i.presets.get(t);if(!s)return i;let r=Math.max(0,Math.floor(Number(e)||0)),o=[...i.retained.get(t)??[]];for(;o.length<r;)o.push(ns(s,o.length+1));return{...i,quantities:new Map(i.quantities).set(t,r),retained:new Map(i.retained).set(t,o)}}function De(i,t,e){let s=new Map(i.retained);for(let[r,o]of s){let n=o.findIndex(l=>l.key===t);if(n===-1)continue;let d=[...o];d[n]={...d[n],...e},s.set(r,d);break}return{...i,retained:s}}function Ht(i){return i.presetOrder.flatMap(t=>{let e=i.quantities.get(t)??0;return(i.retained.get(t)??[]).slice(0,e)})}function ze(i,t){return Ht(i).map(e=>{let s={name:e.name,asset_type:e.asset_type,area_id:t,capabilities:[...e.capabilities]};return e.code?.trim()&&(s.code=e.code.trim()),s})}function Ne(i,t){return(i??[]).filter(e=>e.area_id===t)}function Te(i,t){let e=new Map(t.map(r=>[r.asset_type,r.group])),s=new Map;for(let r of i){let o=e.get(r.asset_type)??"other",n=s.get(o)??[];n.push(r),s.set(o,n)}return s}var xt=class{constructor(t,e=null){this.api=t,this.fallbackMessage=e,this.saving=!1}async save(t,e){if(this.saving)return{ok:!1,duplicate:!0};this.saving=!0;let s=ze(t,e),r;try{r=await this.api.createAssetsBulk(s)}catch(o){return this.saving=!1,{ok:!1,duplicate:!1,error:we(o,this.fallbackMessage)}}try{let o=await this.api.listAssets();return{ok:!0,created:r.assets??[],assets:o,payload:s,refreshError:null}}catch(o){return{ok:!0,created:r.assets??[],assets:null,payload:s,refreshError:o}}finally{this.saving=!1}}};var rt=class extends g{constructor(){super(),this.presets=[],this.t=t=>t,this.floors=[],this.areas=[],this.assets=[],this._step="select",this._floorId="",this._areaId="",this._draftState=it(),this._openGroups=new Set,this._openDrafts=new Set,this._saveError=null,this._saving=!1,this._success=null,this._confirmRoomChange=!1,this._controller=null}willUpdate(t){(t.has("presets")||t.has("t"))&&this.presets.length&&this._activeDrafts.length===0&&(this._draftState=it(this._localizedPresets()),this._openGroups=new Set([this.presets[0].group])),(t.has("hass")||t.has("t"))&&this.hass&&(this._controller=new xt(v(this.hass),this.t("errors.batch_fallback")))}get _selectedArea(){return this.areas.find(t=>t.area_id===this._areaId)}get _selectedFloor(){return this._floorId===gt?null:this.floors.find(t=>t.floor_id===this._floorId)}get _areaAssets(){return Ne(this.assets,this._areaId)}get _activeDrafts(){return Ht(this._draftState)}_localizedPresets(){return this.presets.map(t=>({...t,default_name:A(this.t,t)}))}_groupLabel(t){return this.t(`groups.${t}`)===`groups.${t}`?t:this.t(`groups.${t}`)}_count(t,e){return this.t(mt(t,e),{count:e})}_selectFloor(t){this._floorId=t.target.value,Pt(this.areas,this._floorId).some(s=>s.area_id===this._areaId)||(this._areaId="")}_continue(){this._areaId&&(this._step="quantity")}_changeQuantity(t,e){if(this._saving)return;let s=this._draftState.quantities.get(t)??0;this._draftState=Ce(this._draftState,t,s+e),this._saveError=null}_toggleGroup(t){let e=new Set(this._openGroups);e.has(t)?e.delete(t):e.add(t),this._openGroups=e}_toggleDraft(t){let e=new Set(this._openDrafts);e.has(t)?e.delete(t):e.add(t),this._openDrafts=e}_updateDraft(t,e){if(this._saving)return;let s=Object.keys(e),r=this._activeDrafts.findIndex(o=>o.key===t);this._draftState=De(this._draftState,t,e),(!this._saveError?.structured||this._saveError.index===r&&s.includes(this._saveError.field))&&(this._saveError=null)}_removeCapability(t,e){this._updateDraft(t.key,{capabilities:t.capabilities.filter(s=>s!==e)})}_addCapability(t,e){let s=e.value.trim();!s||t.capabilities.includes(s)||(this._updateDraft(t.key,{capabilities:[...t.capabilities,s]}),e.value="")}async _save(){if(this._saving||!this._controller||!this._activeDrafts.length)return;this._saving=!0,this._saveError=null;let t=await this._controller.save(this._draftState,this._areaId);if(this._saving=!1,t.duplicate)return;if(!t.ok){if(this._saveError=t.error,this._step="review",t.error.structured){let s=this._activeDrafts[t.error.index];if(s){this._openDrafts=new Set([...this._openDrafts,s.key]),await this.updateComplete;let r=this.renderRoot.querySelector(`#${CSS.escape(this._fieldId(s,t.error.field))}`)??this.renderRoot.querySelector(".alert");r?.classList.contains("alert")&&r.setAttribute("tabindex","-1"),r?.scrollIntoView({behavior:"smooth",block:"center"}),r?.focus({preventScroll:!0})}}return}let e=t.assets??[...this.assets,...t.created];this.assets=e,this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:e,bubbles:!0,composed:!0})),this._success={count:t.created.length,areaName:this._selectedArea?.name??this.t("inventory.selected_area")},this._draftState=it(this._localizedPresets()),this._openGroups=new Set([this.presets[0]?.group].filter(Boolean)),this._openDrafts=new Set,this._step="success"}_backToQuantities(){this._step="quantity"}_requestRoomChange(){if(this._activeDrafts.length){this._confirmRoomChange=!0;return}this._step="select"}_discardAndChangeRoom(){this._draftState=it(this._localizedPresets()),this._saveError=null,this._openDrafts=new Set,this._confirmRoomChange=!1,this._floorId="",this._areaId="",this._step="select"}_fieldId(t,e){return`${t.key.replaceAll(":","-")}-${e}`}_fieldError(t,e){return this._saveError?.structured&&this._saveError.index===t&&this._saveError.field===e}_renderContext(){return a`<div class="context"><div class="context-inner">
      <div class="context-values">
        <div class="context-item"><ha-icon icon="mdi:layers-outline"></ha-icon><span class="context-label">${this.t("common.floor")}</span><span class="context-value">${this._selectedFloor?.name??this.t("common.no_floor")}</span></div>
        <div class="context-item"><ha-icon icon="mdi:floor-plan"></ha-icon><span class="context-label">${this.t("common.area")}</span><span class="context-value">${this._selectedArea?.name}</span></div>
      </div>
      <button class="button text" @click=${this._requestRoomChange} ?disabled=${this._saving}>${this.t("inventory.change_room")}</button>
    </div></div>`}_renderSelection(){let t=[...this.floors,{floor_id:gt,name:this.t("common.no_floor")}],e=Pt(this.areas,this._floorId);return a`<div class="content selection">
      <h1>${this.t("inventory.title")}</h1><p class="muted intro">${this.t("inventory.selection_intro")}</p>
      <div class="field-block"><label for="floor">${this.t("common.floor")}</label><select id="floor" .value=${this._floorId} @change=${this._selectFloor}><option value="">${this.t("inventory.select_floor")}</option>${t.map(s=>a`<option value=${s.floor_id}>${s.name}</option>`)}</select><p class="muted helper">${this.t("inventory.no_floor_helper")}</p></div>
      <div class="field-block"><label for="area">${this.t("common.area")}</label><select id="area" .value=${this._areaId} @change=${s=>this._areaId=s.target.value} ?disabled=${!this._floorId}><option value="">${this.t("inventory.select_area")}</option>${e.map(s=>a`<option value=${s.area_id}>${s.name}</option>`)}</select>${this._floorId&&!e.length?a`<p class="muted helper">${this.t("inventory.no_areas")}</p>`:c}</div>
      <div class="actions"><button class="button primary" @click=${this._continue} ?disabled=${!this._areaId}>${this.t("inventory.continue")}</button></div>
    </div>`}_renderExisting(){let t=Te(this._areaAssets,this.presets);return this._areaAssets.length?a`<div class="existing-summary">${[...t].map(([e,s])=>a`<div class="existing-group"><div class="existing-heading"><strong>${this._groupLabel(e)}</strong><span class="muted">${s.length}</span></div><ul class="existing-list">${s.map(r=>a`<li>${r.name}</li>`)}</ul></div>`)}</div>`:a`<p class="muted helper">${this.t("inventory.no_existing")}</p>`}_renderQuantity(){let t=new Map;for(let e of this.presets)t.set(e.group,[...t.get(e.group)??[],e]);return a`${this._renderContext()}${this._renderRoomChangeConfirmation()}<div class="content layout"><section><h1>${this.t("inventory.quantity_title")}</h1><p class="muted intro">${this.t("inventory.quantity_intro")}</p>
      <details class="mobile-existing"><summary><strong>${this.t("inventory.existing")}</strong><span class="muted">${this._areaAssets.length}</span></summary>${this._renderExisting()}</details>
      <div class="groups">${[...t].map(([e,s])=>{let r=s.reduce((n,d)=>n+(this._draftState.quantities.get(d.preset_id)??0),0),o=this._openGroups.has(e);return a`<section class="group"><button class="group-toggle" @click=${()=>this._toggleGroup(e)} aria-expanded=${o} aria-label=${this.t(o?"actions.collapse_group":"actions.expand_group",{group:this._groupLabel(e)})}><span class="group-title"><ha-icon icon=${o?"mdi:chevron-down":"mdi:chevron-right"}></ha-icon>${this._groupLabel(e)}</span><span class="muted">${this._count("counts.selected",r)}</span></button>${o?s.map(n=>{let d=this._draftState.quantities.get(n.preset_id)??0,l=A(this.t,n);return a`<div class="quantity-row"><div><div class="preset-name">${l}</div>${n.suggested_capabilities?.length?a`<div class="suggestions">${this.t("inventory.suggested",{capabilities:n.suggested_capabilities.join(", ")})}</div>`:c}</div><div class="stepper"><button aria-label=${this.t("actions.decrease_quantity",{name:l})} @click=${()=>this._changeQuantity(n.preset_id,-1)} ?disabled=${d===0||this._saving}><ha-icon icon="mdi:minus"></ha-icon></button><output aria-live="polite">${d}</output><button aria-label=${this.t("actions.increase_quantity",{name:l})} @click=${()=>this._changeQuantity(n.preset_id,1)} ?disabled=${this._saving}><ha-icon icon="mdi:plus"></ha-icon></button></div></div>`}):c}</section>`})}</div></section><aside class="rail"><h2>${this.t("inventory.existing")}</h2><p class="muted helper">${this.t("inventory.existing_unchanged")}</p>${this._renderExisting()}<div class="draft-count"><span class="muted">${this.t("inventory.being_added")}</span><strong>${this._count("counts.asset",this._activeDrafts.length)}</strong><p class="muted helper">${this.t("inventory.not_saved_yet")}</p></div></aside></div>${this._renderBottom("quantity")}`}_renderDraft(t,e){let s=this._openDrafts.has(t.key)||["name","asset_type","code","capabilities"].some(o=>this._fieldError(e,o)),r=this._saveError?.structured&&this._saveError.index===e;return a`<article class="draft-row ${r?"error":""}" data-draft-index=${e}><div class="draft-summary"><span class="draft-number">${e+1}</span><div class="draft-title"><strong>${t.name}</strong><span>${t.asset_type}</span></div><button class="draft-toggle" aria-label=${this.t(s?"actions.collapse_draft":"actions.edit_draft",{name:t.name})} aria-expanded=${s} @click=${()=>this._toggleDraft(t.key)}><ha-icon icon=${s?"mdi:chevron-up":"mdi:chevron-down"}></ha-icon></button></div>${s?a`<div class="draft-fields">
      ${this._renderInput(t,e,"name",this.t("fields.name"),t.name)}
      ${this._renderInput(t,e,"asset_type",this.t("fields.asset_type"),t.asset_type)}
      ${this._renderInput(t,e,"code",this.t("fields.code_optional"),t.code??"")}
      <div class="capabilities"><label>${this.t("fields.capabilities")}</label><div class="capability-list">${t.capabilities.length?t.capabilities.map(o=>a`<span class="capability">${o}<button aria-label=${this.t("actions.remove_capability",{capability:o})} @click=${()=>this._removeCapability(t,o)} ?disabled=${this._saving}><ha-icon icon="mdi:close"></ha-icon></button></span>`):a`<span class="muted helper">${this.t("fields.no_capabilities")}</span>`}</div><div class="add-capability"><label>${this.t("fields.custom_capability")}<input id=${this._fieldId(t,"capabilities")} placeholder=${this.t("fields.capability_placeholder")} aria-invalid=${this._fieldError(e,"capabilities")} aria-describedby=${this._fieldError(e,"capabilities")?`${this._fieldId(t,"capabilities")}-error`:c} @keydown=${o=>{o.key==="Enter"&&(o.preventDefault(),this._addCapability(t,o.target))}}></label><button class="button secondary" @click=${o=>this._addCapability(t,o.currentTarget.previousElementSibling.querySelector("input"))} ?disabled=${this._saving}>${this.t("common.add")}</button></div>${this._fieldError(e,"capabilities")?a`<p class="field-error" id=${`${this._fieldId(t,"capabilities")}-error`}>${this._saveError.message}</p>`:c}</div>
    </div>`:c}</article>`}_renderInput(t,e,s,r,o){let n=this._fieldError(e,s),d=this._fieldId(t,s);return a`<label for=${d}>${r}<input id=${d} .value=${o} aria-invalid=${n} aria-describedby=${n?`${d}-error`:c} @input=${l=>this._updateDraft(t.key,{[s]:s==="code"?l.target.value||null:l.target.value})} ?disabled=${this._saving}>${n?a`<span class="field-error" id=${`${d}-error`}>${this._saveError.message}</span>`:c}</label>`}_renderReview(){return a`${this._renderContext()}${this._renderRoomChangeConfirmation()}<div class="content">${this._saveError?a`<div class="alert" role="alert"><ha-icon icon="mdi:alert-circle-outline"></ha-icon><div><h3>${this.t("errors.nothing_saved")}</h3><p class="muted helper">${this._saveError.structured?this.t("errors.correct_field"):this._saveError.message||this.t("errors.batch_fallback")} ${this.t("errors.drafts_preserved")}</p></div></div>`:c}<div class="review-header"><div><h1>${this._count("review.title",this._activeDrafts.length)}</h1><p class="muted intro">${this.t("review.intro")}</p></div></div><section class="existing-review"><div class="section-heading"><div><h2>${this.t("review.registered")}</h2><p class="muted helper">${this.t("review.registered_helper")}</p></div><strong>${this._areaAssets.length}</strong></div></section><section class="drafts"><div class="section-heading"><div><h2>${this.t("inventory.being_added")}</h2><p class="muted helper">${this.t("review.atomic_batch")}</p></div><strong>${this._activeDrafts.length}</strong></div><div>${this._activeDrafts.map((t,e)=>this._renderDraft(t,e))}</div></section></div>${this._renderBottom("review")}`}_renderRoomChangeConfirmation(){return this._confirmRoomChange?a`<div class="content"><section class="alert" role="alertdialog" aria-labelledby="change-room-title" aria-describedby="change-room-description"><ha-icon icon="mdi:alert-outline"></ha-icon><div><h3 id="change-room-title">${this.t("discard.title")}</h3><p class="muted helper" id="change-room-description">${this.t("discard.description")}</p><div class="actions"><button class="button secondary" @click=${()=>this._confirmRoomChange=!1}>${this.t("discard.stay")}</button><button class="button primary" @click=${this._discardAndChangeRoom}>${this.t("discard.confirm")}</button></div></div></section></div>`:c}_renderBottom(t){let e=this._activeDrafts.length;return a`<div class="bottom-bar" aria-busy=${this._saving}><div class="bottom-inner"><p class="muted bottom-copy">${t==="review"?this._count("review.save_explanation",e):this._count("review.before_save",e)}</p>${t==="review"?a`<div><button class="button secondary" @click=${this._backToQuantities} ?disabled=${this._saving}>${this.t("review.back_quantities")}</button> <button class="button primary" @click=${this._save} ?disabled=${this._saving||!e}>${this._saving?this.t("review.saving"):this._count("review.save",e)}</button></div>`:a`<button class="button primary" @click=${()=>this._step="review"} ?disabled=${!e}>${this._count("review.review_items",e)}</button>`}</div></div>`}_renderSuccess(){return a`${this._renderContext()}<div class="content success"><div><ha-icon icon="mdi:check-circle-outline"></ha-icon><h1>${this._count("success.created",this._success.count)}</h1><p class="intro">${this._success.areaName}</p><p class="muted intro">${this.t("success.explanation")}</p><div class="actions"><button class="button primary" @click=${()=>this._step="quantity"}>${this.t("success.back")}</button><button class="button secondary" @click=${()=>this.dispatchEvent(new CustomEvent("view-infrastructure",{bubbles:!0,composed:!0}))}>${this.t("success.view")}</button></div></div></div>`}render(){return!this.floors.length&&!this.areas.length?a`<div class="content selection"><h1>${this.t("inventory.title")}</h1><p class="muted intro">${this.t("inventory.no_floor_area")}</p></div>`:this._step==="select"?this._renderSelection():this._step==="quantity"?this._renderQuantity():this._step==="review"?this._renderReview():this._renderSuccess()}};u(rt,"properties",{hass:{attribute:!1},t:{attribute:!1},presets:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},_step:{state:!0},_floorId:{state:!0},_areaId:{state:!0},_draftState:{state:!0},_openGroups:{state:!0},_openDrafts:{state:!0},_saveError:{state:!0},_saving:{state:!0},_success:{state:!0},_confirmRoomChange:{state:!0}}),u(rt,"styles",m`
    :host { display: block; min-height: 100%; color: var(--primary-text-color); }
    * { box-sizing: border-box; }
    button, input, select { font: inherit; }
    button { color: inherit; }
    .content { max-width: 1200px; margin: 0 auto; padding: 28px 24px 104px; }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: 24px; line-height: 32px; font-weight: 500; }
    h2 { font-size: 20px; line-height: 28px; font-weight: 500; }
    h3 { font-size: 16px; line-height: 24px; font-weight: 500; }
    .muted { color: var(--secondary-text-color); }
    .intro { margin-top: 6px; line-height: 22px; }
    .context { position: sticky; top: 0; z-index: 4; background: var(--card-background-color); border-bottom: 1px solid var(--divider-color); }
    .context-inner { max-width: 1200px; min-height: 66px; margin: auto; padding: 10px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .context-values { display: flex; align-items: center; gap: 28px; }
    .context-item { display: grid; grid-template-columns: 24px auto; column-gap: 10px; align-items: center; }
    .context-item ha-icon { grid-row: 1 / 3; color: var(--secondary-text-color); }
    .context-label { font-size: 12px; color: var(--secondary-text-color); }
    .context-value { font-size: 15px; font-weight: 500; }
    .layout { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 32px; align-items: start; }
    .selection { max-width: 720px; }
    .field-block { padding: 24px 0; border-bottom: 1px solid var(--divider-color); }
    label { display: block; font-size: 14px; font-weight: 500; }
    input, select { width: 100%; min-height: 44px; margin-top: 8px; padding: 9px 12px; color: var(--primary-text-color); background: var(--card-background-color); border: 1px solid var(--divider-color); border-radius: 8px; }
    input:focus-visible, select:focus-visible, button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
    input[aria-invalid="true"] { border-color: var(--error-color, #db4437); outline: 2px solid var(--error-color, #db4437); }
    .helper, .field-error { margin-top: 6px; font-size: 13px; line-height: 18px; }
    .field-error { color: var(--error-color, #db4437); }
    .actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .button { min-height: 44px; padding: 0 18px; border-radius: 8px; border: 1px solid transparent; background: none; cursor: pointer; font-weight: 500; }
    .button.primary { color: var(--text-primary-color, #fff); background: var(--primary-color); }
    .button.secondary { color: var(--primary-color); border-color: var(--primary-color); }
    .button.text { color: var(--primary-color); }
    .button:disabled { cursor: not-allowed; opacity: .5; }
    .groups { margin-top: 26px; border-top: 1px solid var(--divider-color); }
    .group { border-bottom: 1px solid var(--divider-color); }
    .group-toggle { width: 100%; min-height: 56px; padding: 8px 4px; display: flex; align-items: center; gap: 10px; justify-content: space-between; border: 0; background: transparent; cursor: pointer; text-align: left; }
    .group-title { display: flex; align-items: center; gap: 8px; font-weight: 500; }
    .quantity-row { min-height: 68px; margin-left: 28px; padding: 10px 4px; display: flex; align-items: center; justify-content: space-between; gap: 16px; border-top: 1px solid var(--divider-color); }
    .preset-name { line-height: 22px; font-weight: 500; }
    .suggestions { margin-top: 2px; font-size: 12px; color: var(--secondary-text-color); }
    .stepper { height: 44px; display: grid; grid-template-columns: 44px 48px 44px; flex: none; border: 1px solid var(--divider-color); border-radius: 8px; overflow: hidden; background: var(--card-background-color); }
    .stepper button { border: 0; background: transparent; cursor: pointer; }
    .stepper button:hover { background: var(--secondary-background-color); }
    .stepper output { display: grid; place-items: center; border-inline: 1px solid var(--divider-color); font-weight: 500; }
    .rail { position: sticky; top: 92px; padding-left: 24px; border-left: 1px solid var(--divider-color); }
    .existing-summary { margin-top: 14px; border-block: 1px solid var(--divider-color); }
    .existing-group { padding: 13px 0; border-bottom: 1px solid var(--divider-color); }
    .existing-group:last-child { border-bottom: 0; }
    .existing-heading { display: flex; justify-content: space-between; gap: 12px; }
    .existing-list { margin: 6px 0 0; padding-left: 18px; color: var(--secondary-text-color); font-size: 13px; }
    .draft-count { margin-top: 20px; padding: 14px; border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color); }
    .draft-count strong { display: block; margin-top: 4px; font-size: 22px; font-weight: 500; }
    .bottom-bar { position: fixed; z-index: 6; left: var(--mdc-drawer-width, 0); right: 0; bottom: 0; padding: 10px 24px calc(10px + env(safe-area-inset-bottom)); border-top: 1px solid var(--divider-color); background: var(--card-background-color); box-shadow: 0 -2px 4px rgba(0,0,0,.08); }
    .bottom-inner { max-width: 1200px; margin: auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .review-header, .section-heading { display: flex; align-items: end; justify-content: space-between; gap: 16px; }
    .existing-review { margin-top: 24px; padding: 16px 0; border-block: 1px solid var(--divider-color); }
    .drafts { margin-top: 28px; }
    .draft-row { border-bottom: 1px solid var(--divider-color); scroll-margin-top: 92px; }
    .draft-row.error { margin: 8px 0; padding: 0 12px; border: 2px solid var(--error-color, #db4437); border-radius: 8px; }
    .draft-summary { min-height: 62px; display: grid; grid-template-columns: 34px minmax(0, 1fr) auto; align-items: center; gap: 12px; }
    .draft-number { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 8px; background: var(--secondary-background-color); color: var(--secondary-text-color); font-size: 13px; }
    .draft-title { overflow: hidden; }
    .draft-title strong, .draft-title span { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .draft-title span { margin-top: 2px; font-size: 12px; color: var(--secondary-text-color); }
    .draft-toggle { width: 44px; height: 44px; padding: 0; border: 0; background: transparent; cursor: pointer; }
    .draft-fields { padding: 0 0 20px 46px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .capabilities { grid-column: 1 / -1; }
    .capability-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .capability { min-height: 36px; display: inline-flex; align-items: center; gap: 4px; padding-left: 10px; border: 1px solid var(--divider-color); border-radius: 8px; background: var(--secondary-background-color); }
    .capability button { width: 36px; height: 36px; border: 0; background: transparent; cursor: pointer; }
    .add-capability { display: flex; align-items: end; gap: 8px; margin-top: 10px; }
    .add-capability label { flex: 1; }
    .alert { margin-bottom: 20px; padding: 15px; display: flex; gap: 12px; border: 1px solid var(--error-color, #db4437); border-radius: 8px; background: var(--card-background-color); }
    .alert ha-icon { color: var(--error-color, #db4437); }
    .success { min-height: 55vh; display: grid; place-items: center; text-align: center; }
    .success ha-icon { --mdc-icon-size: 52px; color: var(--success-color, var(--primary-color)); }
    .success h1 { margin-top: 14px; }
    .success .actions { justify-content: center; }
    .mobile-existing { display: none; }
    @media (max-width: 700px) {
      .content { padding: 20px 14px 104px; }
      .context-inner { padding: 8px 14px; min-height: 58px; }
      .context-values { gap: 14px; min-width: 0; }
      .context-item { grid-template-columns: auto; }
      .context-item ha-icon, .context-label { display: none; }
      .context-value { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .layout { display: block; }
      .rail { display: none; }
      .mobile-existing { display: block; margin-top: 20px; border-block: 1px solid var(--divider-color); }
      .mobile-existing summary { min-height: 52px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
      .mobile-existing .existing-summary { margin: 0 0 12px; border-top: 1px solid var(--divider-color); border-bottom: 0; }
      .quantity-row { min-height: 62px; margin-left: 0; gap: 8px; }
      .suggestions { display: none; }
      .stepper { grid-template-columns: 44px 40px 44px; }
      .bottom-bar { left: 0; padding-inline: 12px; }
      .bottom-copy { display: none; }
      .bottom-inner .button.primary { flex: 1; }
      .review-header { align-items: start; }
      .draft-fields { padding-left: 0; grid-template-columns: 1fr; }
      .capabilities { grid-column: auto; }
      .add-capability { align-items: stretch; flex-direction: column; }
      .add-capability .button { align-self: start; }
      .success .actions { flex-direction: column; }
      .success .button { width: 100%; }
    }
    @media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; } }
  `);customElements.define("bindhome-inventory-workflow",rt);var at=class extends g{constructor(){super(),this.t=t=>t,this.assets=[],this.areas=[],this.registry={},this.focalAssetId=null,this.onNavigate=null,this._search=""}_asset(t){return this.assets.find(e=>e.id===t)??null}_focal(){return this._asset(this.focalAssetId)??this.assets[0]??null}_neighbors(){let t=this._focal();return t?L(this.registry?.relations??[],t.id):{incoming:[],outgoing:[]}}_focus(t){let e=this._asset(t);e&&(this.focalAssetId=e.id,this._search="",this.onNavigate?.(e.id))}_renderNeighbor(t,e){let s=e?t.target_asset_id:t.source_asset_id,r=this._asset(s);if(!r)return a`
        <div class="neighbor missing">
          <strong>${this.t("topology.missing_asset")}</strong>
          <span>${t.relation_type}</span>
        </div>
      `;let o=Gt(r,this.areas);return a`
      <button
        class="neighbor"
        type="button"
        @click=${()=>this._focus(r.id)}
      >
        <strong>${r.name}</strong>
        <span>
          ${t.relation_type}${o?` \xB7 ${o}`:""}
        </span>
      </button>
    `}render(){let t=this._focal(),e=ft(this.assets,this._search,t?.area_id,this.areas),s=this._search.trim()?20:8,r=e.slice(0,s),{incoming:o,outgoing:n}=this._neighbors();return a`
      <section class="explorer">
        <h1>${this.t("topology.explorer")}</h1>

        <label>
          ${this.t("topology.search_assets")}
          <input
            .value=${this._search}
            @input=${d=>{this._search=d.target.value}}
          />
        </label>

        <div class="picker">
          ${r.length?r.map(d=>a`
                  <button
                    type="button"
                    aria-pressed=${t?.id===d.id?"true":"false"}
                    @click=${()=>this._focus(d.id)}
                  >
                    <strong>${d.name}</strong>
                    ${d.areaName?a`<span>${d.areaName}</span>`:c}
                  </button>
                `):a`
                <p class="muted">
                  ${this.t("topology.no_matches")}
                </p>
              `}
        </div>

        ${e.length>r.length?a`
              <p class="count">
                ${this.t("topology.showing_results",{shown:r.length,total:e.length})}
              </p>
            `:c}

        ${t?a`
              <h2>${t.name}</h2>

              <div class="columns">
                <div>
                  <h3>${this.t("topology.incoming")}</h3>

                  ${o.length?o.map(d=>this._renderNeighbor(d,!1)):a`
                        <p class="muted">
                          ${this.t("topology.no_relations")}
                        </p>
                      `}
                </div>

                <div>
                  <h3>${this.t("topology.outgoing")}</h3>

                  ${n.length?n.map(d=>this._renderNeighbor(d,!0)):a`
                        <p class="muted">
                          ${this.t("topology.no_relations")}
                        </p>
                      `}
                </div>
              </div>
            `:a`
              <p class="muted">
                ${this.t("topology.no_assets")}
              </p>
            `}
      </section>
    `}};u(at,"properties",{t:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},registry:{attribute:!1},focalAssetId:{attribute:!1},onNavigate:{attribute:!1},_search:{state:!0}}),u(at,"styles",m`
    :host {
      display: block;
    }

    .explorer {
      max-width: 1200px;
      margin: 0 auto;
      padding: 28px 24px;
    }

    .explorer label {
      display: grid;
      gap: 4px;
      margin: 16px 0;
    }

    .explorer input {
      min-height: 40px;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      font: inherit;
    }

    .picker {
      display: grid;
      gap: 6px;
      max-height: 280px;
      overflow: auto;
    }

    .picker button,
    .neighbor {
      text-align: left;
      padding: 10px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      border-radius: 6px;
      font: inherit;
    }

    .picker button {
      cursor: pointer;
    }

    .picker button span,
    .neighbor span {
      display: block;
      color: var(--secondary-text-color);
      font-size: 12px;
      margin-top: 2px;
    }

    .columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .columns > div {
      display: grid;
      gap: 8px;
      align-content: start;
    }

    button.neighbor {
      cursor: pointer;
    }

    .neighbor.missing {
      cursor: default;
    }

    .muted,
    .count {
      color: var(--secondary-text-color);
    }

    .count {
      font-size: 12px;
      margin-top: 8px;
    }

    @media (max-width: 600px) {
      .explorer {
        padding: 20px 14px;
      }

      .columns {
        grid-template-columns: 1fr;
      }
    }
  `);customElements.define("bindhome-topology-explorer",at);var ot=class extends g{constructor(){super(),this.hass=null,this.registry={},this.t=t=>t,this.presets=[],this.floors=[],this.areas=[],this.assets=[],this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this.refreshBindingData=null,this.refreshTopologyData=null,this._active="browse"}_show(t){this._active=t}_forwardAssetsRefreshed(t){t.stopPropagation(),this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:t.detail,bubbles:!0,composed:!0}))}_showBrowseFromWorkflow(t){t.stopPropagation(),this._active="browse"}render(){return a`
      <nav
        class="subnav"
        aria-label=${this.t("inventory.views.label")}
      >
        <button
          class=${this._active==="topology"?"active":""}
          aria-current=${this._active==="topology"?"page":"false"}
          @click=${()=>this._show("topology")}
        >${this.t("topology.explorer")}</button>

        <button
          class=${this._active==="browse"?"active":""}
          aria-current=${this._active==="browse"?"page":"false"}
          @click=${()=>this._show("browse")}
        >
          ${this.t("inventory.views.browse")}
        </button>

        <button
          class=${this._active==="room"?"active":""}
          aria-current=${this._active==="room"?"page":"false"}
          @click=${()=>this._show("room")}
        >
          ${this.t("inventory.views.room")}
        </button>
      </nav>

      <section
        class="view"
        ?hidden=${this._active!=="browse"}
      >
        <bindhome-inventory-browser
          .hass=${this.hass}
          .t=${this.t}
          .presets=${this.presets}
          .floors=${this.floors}
          .areas=${this.areas}
          .assets=${this.assets}
          .registry=${this.registry}
          .bindingStatuses=${this.bindingStatuses}
          .entityRegistry=${this.entityRegistry}
          .deviceRegistry=${this.deviceRegistry}
          .refreshBindingData=${this.refreshBindingData}
          .refreshTopologyData=${this.refreshTopologyData}
          @assets-refreshed=${this._forwardAssetsRefreshed}
        ></bindhome-inventory-browser>
      </section>

      <section class="view" ?hidden=${this._active!=="topology"}>
        <bindhome-topology-explorer
          .t=${this.t}
          .assets=${this.assets}
          .areas=${this.areas}
          .registry=${this.registry}
        ></bindhome-topology-explorer>
      </section>

      <section
        class="view"
        ?hidden=${this._active!=="room"}
      >
        <bindhome-inventory-workflow
          .hass=${this.hass}
          .t=${this.t}
          .presets=${this.presets}
          .floors=${this.floors}
          .areas=${this.areas}
          .assets=${this.assets}
          @assets-refreshed=${this._forwardAssetsRefreshed}
          @view-infrastructure=${this._showBrowseFromWorkflow}
        ></bindhome-inventory-workflow>
      </section>
    `}};u(ot,"properties",{hass:{attribute:!1},registry:{attribute:!1},t:{attribute:!1},presets:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},_active:{state:!0}}),u(ot,"styles",m`
    :host {
      display: block;
      min-height: 100%;
    }

    * {
      box-sizing: border-box;
    }

    .subnav {
      min-height: 48px;
      display: flex;
      gap: 4px;
      padding: 0 max(
        12px,
        calc(
          (100% - 1200px) / 2 + 24px
        )
      );
      border-bottom: 1px solid
        var(--divider-color);
      background:
        var(--card-background-color);
      overflow-x: auto;
    }

    .subnav button {
      min-height: 48px;
      padding: 0 14px;
      border: 0;
      border-bottom: 3px solid
        transparent;
      background: transparent;
      color:
        var(--secondary-text-color);
      font: inherit;
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      cursor: pointer;
    }

    .subnav button.active {
      color: var(--primary-color);
      border-bottom-color:
        var(--primary-color);
    }

    .subnav button:focus-visible {
      outline: 2px solid
        var(--primary-color);
      outline-offset: -3px;
    }

    .view[hidden] {
      display: none;
    }

    @media (max-width: 600px) {
      .subnav {
        padding-inline: 8px;
      }

      .subnav button {
        padding-inline: 12px;
      }
    }
  `);customElements.define("bindhome-inventory-section",ot);var nt=class extends g{constructor(){super(),this.registry={},this.areas=[],this.t=t=>t,this._tab="assets",this._selectedAssetId=null}_areaName(t){return this.areas.find(e=>e.area_id===t)?.name??this.t(t?"infrastructure.unknown_area":"infrastructure.no_area")}_assetName(t){return this.registry.assets?.find(e=>e.id===t)?.name??t}_renderAssets(){let t=this.registry.assets??[];if(!t.length)return a`<div class="empty">${this.t("infrastructure.no_assets")}</div>`;if(this._selectedAssetId){let e=t.find(s=>s.id===this._selectedAssetId);if(e)return a`<button class="link" @click=${()=>this._selectedAssetId=null}>← ${this.t("infrastructure.back_assets")}</button><section class="detail"><h2>${e.name}</h2><dl><dt>${this.t("fields.type")}</dt><dd>${e.asset_type}</dd><dt>${this.t("fields.code")}</dt><dd>${e.code||this.t("common.not_set")}</dd><dt>${this.t("common.area")}</dt><dd>${this._areaName(e.area_id)}</dd><dt>${this.t("fields.capabilities")}</dt><dd>${e.capabilities?.join(", ")||this.t("common.none")}</dd></dl><details class="advanced"><summary>${this.t("infrastructure.advanced")}</summary><dl><dt>${this.t("infrastructure.asset_id")}</dt><dd>${e.id}</dd><dt>${this.t("infrastructure.area_id")}</dt><dd>${e.area_id||this.t("common.none")}</dd></dl></details></section>`}return a`<div class="table-wrap"><table><thead><tr><th>${this.t("fields.name")}</th><th>${this.t("fields.type")}</th><th>${this.t("common.area")}</th><th>${this.t("fields.capabilities")}</th></tr></thead><tbody>${t.map(e=>a`<tr><td><button class="link" @click=${()=>this._selectedAssetId=e.id}>${e.name}</button></td><td>${e.asset_type}</td><td>${this._areaName(e.area_id)}</td><td>${e.capabilities?.join(", ")||"\u2014"}</td></tr>`)}</tbody></table></div>`}_renderRelations(){let t=this.registry.relations??[];return t.length?a`<div class="table-wrap"><table><thead><tr><th>${this.t("fields.source")}</th><th>${this.t("fields.relation")}</th><th>${this.t("fields.target")}</th></tr></thead><tbody>${t.map(e=>a`<tr><td>${this._assetName(e.source_asset_id)}</td><td>${e.relation_type}</td><td>${this._assetName(e.target_asset_id)}</td></tr>`)}</tbody></table></div>`:a`<div class="empty">${this.t("infrastructure.no_relations")}</div>`}_renderBindings(){let t=this.registry.bindings??[];return t.length?a`<div class="table-wrap"><table><thead><tr><th>${this.t("fields.asset")}</th><th>${this.t("fields.capability")}</th><th>${this.t("fields.role")}</th><th>${this.t("fields.ha_entity")}</th></tr></thead><tbody>${t.map(e=>a`<tr><td>${this._assetName(e.asset_id)}</td><td>${e.capability}</td><td>${e.role}</td><td>${e.entity_id}</td></tr>`)}</tbody></table></div>`:a`<div class="empty">${this.t("infrastructure.no_bindings")}</div>`}render(){return a`<div class="content"><h1>${this.t("nav.infrastructure")}</h1><p class="muted">${this.t("infrastructure.intro")}</p><nav class="tabs" aria-label=${this.t("infrastructure.views_label")}>${["assets","relations","bindings"].map(t=>a`<button class=${this._tab===t?"active":""} @click=${()=>{this._tab=t,this._selectedAssetId=null}}>${this.t(`infrastructure.tabs.${t}`)}</button>`)}</nav>${this._tab==="assets"?this._renderAssets():this._tab==="relations"?this._renderRelations():this._renderBindings()}</div>`}};u(nt,"properties",{registry:{attribute:!1},areas:{attribute:!1},t:{attribute:!1},_tab:{state:!0},_selectedAssetId:{state:!0}}),u(nt,"styles",m`
    :host{display:block}*{box-sizing:border-box}.content{max-width:1200px;margin:auto;padding:28px 24px}h1,h2,p{margin:0}h1{font-size:24px;font-weight:500}h2{font-size:20px;font-weight:500}.muted{color:var(--secondary-text-color)}.tabs{margin-top:20px;display:flex;border-bottom:1px solid var(--divider-color);overflow-x:auto}.tabs button{min-height:46px;padding:0 16px;border:0;border-bottom:3px solid transparent;color:var(--secondary-text-color);background:transparent;cursor:pointer;font:inherit}.tabs button.active{color:var(--primary-color);border-bottom-color:var(--primary-color)}.tabs button:focus-visible,.link:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}.table-wrap{margin-top:20px;overflow-x:auto;background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:8px}table{width:100%;border-collapse:collapse;text-align:left}th,td{padding:12px 14px;border-bottom:1px solid var(--divider-color);vertical-align:top}th{font-size:12px;color:var(--secondary-text-color);background:var(--secondary-background-color)}tr:last-child td{border-bottom:0}.link{padding:0;border:0;color:var(--primary-color);background:transparent;cursor:pointer;font:inherit;font-weight:500;text-align:left}.empty{margin-top:20px;padding:28px;border:1px dashed var(--divider-color);border-radius:8px;text-align:center;color:var(--secondary-text-color)}.detail{margin-top:20px;padding:20px;border:1px solid var(--divider-color);border-radius:8px;background:var(--card-background-color)}.detail dl{display:grid;grid-template-columns:180px 1fr;gap:12px}.detail dt{color:var(--secondary-text-color)}.detail dd{margin:0;overflow-wrap:anywhere}.advanced{margin-top:20px;border-top:1px solid var(--divider-color);padding-top:14px}@media(max-width:600px){.content{padding:20px 12px}th,td{padding:10px}.detail dl{grid-template-columns:1fr;gap:4px}.detail dd{margin-bottom:10px}}
  `);customElements.define("bindhome-infrastructure-inspector",nt);var lt=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.presets=[],this.floors=[],this.areas=[],this.assets=[],this.registry={},this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this._tab="inventory"}render(){return a`<div class="content-head">
        <h1 class="page-title">${this.t("nav.advanced")}</h1>
        <p class="intro muted">${this.t("advanced.intro")}</p>
        <nav class="tabs" aria-label=${this.t("advanced.views_label")}>
          <button
            class=${this._tab==="inventory"?"active":""}
            aria-current=${this._tab==="inventory"?"page":"false"}
            @click=${()=>this._tab="inventory"}
          >
            ${this.t("advanced.inventory")}</button
          ><button
            class=${this._tab==="infrastructure"?"active":""}
            aria-current=${this._tab==="infrastructure"?"page":"false"}
            @click=${()=>this._tab="infrastructure"}
          >
            ${this.t("nav.infrastructure")}
          </button>
        </nav>
      </div>
      <section class="view" ?hidden=${this._tab!=="inventory"}>
        <bindhome-inventory-section
          .hass=${this.hass}
          .t=${this.t}
          .presets=${this.presets}
          .floors=${this.floors}
          .areas=${this.areas}
          .assets=${this.assets}
          .registry=${this.registry}
          .bindingStatuses=${this.bindingStatuses}
          .entityRegistry=${this.entityRegistry}
          .deviceRegistry=${this.deviceRegistry}
          .refreshBindingData=${this.refreshBindingData}
          .refreshTopologyData=${this.refreshTopologyData}
          @assets-refreshed=${t=>this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:t.detail,bubbles:!0,composed:!0}))}
        ></bindhome-inventory-section>
      </section>
      <section class="view" ?hidden=${this._tab!=="infrastructure"}>
        <bindhome-infrastructure-inspector
          .t=${this.t}
          .registry=${this.registry}
          .areas=${this.areas}
        ></bindhome-infrastructure-inspector>
      </section>`}};u(lt,"properties",{hass:{attribute:!1},t:{attribute:!1},presets:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},registry:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},_tab:{state:!0}}),u(lt,"styles",[$,m`
      .intro {
        max-width: 760px;
        margin-top: 5px;
      }
      .tabs {
        display: flex;
        overflow-x: auto;
        margin-top: 18px;
        border-bottom: 1px solid var(--divider-color);
      }
      .tabs button {
        flex: none;
        min-height: 48px;
        padding: 0 15px;
        border: 0;
        border-bottom: 3px solid transparent;
        background: transparent;
        color: var(--secondary-text-color);
      }
      .tabs button.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }
      .view[hidden] {
        display: none;
      }
      .content-head {
        max-width: 1200px;
        margin: auto;
        padding: 28px 24px 0;
      }
      @media (max-width: 600px) {
        .content-head {
          padding: 20px 12px 0;
        }
        .tabs button {
          padding-inline: 12px;
        }
      }
    `]);customElements.define("bindhome-advanced-view",lt);var dt=class extends g{constructor(){super(),this.hass=null,this.narrow=!1,this.route=null,this.panel=null,this._view="home",this._loading=!0,this._error=null,this._refreshError=null,this._presets=[],this._floors=[],this._areas=[],this._assets=[],this._registry=null,this._bindingStatuses={records:[],summary:{}},this._entityRegistry=[],this._deviceRegistry=[],this._initialized=!1,this._loadPromise=null,this._translationLanguage=null,this._dataGeneration=0,this._t=Bt(),this._contextAreaId=null,this._selectedAssetId=null,this._selectedAreaId=null}updated(t){t.has("hass")&&this.hass&&!this._initialized&&!this._loadPromise?this._load(!0):t.has("hass")&&this.hass&&this._initialized&&(this.hass.language||"en")!==this._translationLanguage&&this._loadTranslations(this.hass.language||"en")}async _loadTranslations(t=this.hass?.language||"en"){let e=t||"en",s=await Mt(this.hass,e);(this.hass?.language||"en")===e&&(this._t=s,this._translationLanguage=e)}async _load(t=!1){if(!this.hass||this._loadPromise)return this._loadPromise;let e=++this._dataGeneration;t&&(this._loading=!0),this._error=null,this._refreshError=null;let s=this.hass,r=v(s),o=ge(s),n=s.language||"en";this._loadPromise=Promise.all([r.listPresets(),r.listAssets(),r.getRegistry(),r.listBindingStatuses(),o.listFloors(),o.listAreas(),o.listEntityRegistry(),o.listDeviceRegistry(),Mt(s,n)]);try{let[d,l,p,_,h,f,b,y,M]=await this._loadPromise;if(e!==this._dataGeneration)return;this._presets=d,this._assets=l,this._registry=p,this._bindingStatuses=_,this._floors=h,this._areas=f,this._entityRegistry=b,this._deviceRegistry=y,this._t=M,this._translationLanguage=n}catch(d){let l=d?.message||this._t("shell.load_error_detail");t||!this._initialized?this._error=l:this._refreshError=l}finally{this._initialized=!0,this._loading=!1,this._loadPromise=null}}async _refreshBindingData(){if(!this.hass)return;let t=++this._dataGeneration,e=v(this.hass),[s,r]=await Promise.all([e.getRegistry(),e.listBindingStatuses()]);t===this._dataGeneration&&(this._registry=s,this._assets=s.assets??this._assets,this._bindingStatuses=r)}async _refreshTopologyData(){if(!this.hass)return;let t=++this._dataGeneration,e=await v(this.hass).getRegistry();t===this._dataGeneration&&(this._registry=e,this._assets=e.assets??this._assets)}async _refreshAssets(){if(!this.hass)return;let t=++this._dataGeneration,e=await v(this.hass).listAssets();if(t===this._dataGeneration)return this._assets=e,this._registry&&(this._registry={...this._registry,assets:e}),e}_assetsRefreshed(t){this._assets=t.detail,this._registry&&(this._registry={...this._registry,assets:t.detail})}_navigate(t){this._view=t,t!=="add"&&(this._contextAreaId=null)}_homeNavigate(t){this._selectedAreaId=t.detail.areaId,this._selectedAssetId=t.detail.assetId}_openAsset(t){let e=this._assets.find(s=>s.id===t);this._selectedAssetId=t,this._selectedAreaId=e?.area_id??null,this._view="home"}_renderViews(){let t={hass:this.hass,t:this._t,floors:this._floors,areas:this._areas,assets:this._assets,registry:this._registry??{},bindingStatuses:this._bindingStatuses,entityRegistry:this._entityRegistry,deviceRegistry:this._deviceRegistry,refreshBindingData:()=>this._refreshBindingData(),refreshTopologyData:()=>this._refreshTopologyData()};return a`<section class="view" ?hidden=${this._view!=="home"}>
        <bindhome-home-view
          .hass=${t.hass}
          .t=${t.t}
          .floors=${t.floors}
          .areas=${t.areas}
          .assets=${t.assets}
          .registry=${t.registry}
          .bindingStatuses=${t.bindingStatuses}
          .entityRegistry=${t.entityRegistry}
          .deviceRegistry=${t.deviceRegistry}
          .refreshBindingData=${t.refreshBindingData}
          .refreshTopologyData=${t.refreshTopologyData}
          .selectedAssetId=${this._selectedAssetId}
          .selectedAreaId=${this._selectedAreaId}
          @home-navigate=${this._homeNavigate}
          @add-in-area=${e=>{this._contextAreaId=e.detail,this._view="add"}}
          @edit-asset=${()=>this._view="advanced"}
        ></bindhome-home-view>
      </section>
      <section class="view" ?hidden=${this._view!=="add"}>
        <bindhome-add-view
          .hass=${this.hass}
          .t=${this._t}
          .presets=${this._presets}
          .areas=${this._areas}
          .contextAreaId=${this._contextAreaId}
          .onCreated=${async e=>{let s=await this._refreshAssets(),r=e??s?.at(-1);r&&this._openAsset(r.id)}}
        ></bindhome-add-view>
      </section>
      <section class="view" ?hidden=${this._view!=="search"}>
        <bindhome-search-view
          .t=${this._t}
          .assets=${this._assets}
          .areas=${this._areas}
          .floors=${this._floors}
          @open-asset=${e=>this._openAsset(e.detail)}
        ></bindhome-search-view>
      </section>
      <section class="view" ?hidden=${this._view!=="advanced"}>
        <bindhome-advanced-view
          .hass=${t.hass}
          .t=${t.t}
          .presets=${this._presets}
          .floors=${t.floors}
          .areas=${t.areas}
          .assets=${t.assets}
          .registry=${t.registry}
          .bindingStatuses=${t.bindingStatuses}
          .entityRegistry=${t.entityRegistry}
          .deviceRegistry=${t.deviceRegistry}
          .refreshBindingData=${t.refreshBindingData}
          .refreshTopologyData=${t.refreshTopologyData}
          @assets-refreshed=${this._assetsRefreshed}
        ></bindhome-advanced-view>
      </section>`}render(){let t;return this._loading?t=a`<div class="state" aria-busy="true">
        <div>
          <div class="spinner"></div>
          <p>${this._t("shell.loading")}</p>
        </div>
      </div>`:this._error?t=a`<div class="state">
        <div class="state-content">
          <h2>${this._t("shell.load_error")}</h2>
          <p>${this._error}</p>
          <button class="retry" @click=${()=>this._load(!0)}>
            ${this._t("common.retry")}
          </button>
        </div>
      </div>`:t=this._renderViews(),a`<div class="shell">
      <header class="top">
        <div class="brand">
          <ha-icon icon="mdi:home-switch"></ha-icon>
          <h1>BindHome</h1>
        </div>
        <nav class="tabs" aria-label=${this._t("shell.sections_label")}>
          ${["home","add","search","advanced"].map(e=>a`<button
                class=${this._view===e?"active":""}
                aria-current=${this._view===e?"page":"false"}
                @click=${()=>this._navigate(e)}
              >
                ${this._t(`nav.${e}`)}
              </button>`)}
        </nav>
        <button
          class="refresh"
          aria-label=${this._t("shell.refresh_label")}
          @click=${()=>this._load(!1)}
          ?disabled=${this._loading||!!this._loadPromise}
        >
          <ha-icon icon="mdi:refresh"></ha-icon>
        </button>
      </header>
      ${this._refreshError?a`<div class="refresh-error" role="alert">
            ${this._t("shell.refresh_error")} ${this._refreshError}
          </div>`:null}
      <main>${t}</main>
    </div>`}};u(dt,"properties",{hass:{attribute:!1},narrow:{type:Boolean},route:{attribute:!1},panel:{attribute:!1},_view:{state:!0},_loading:{state:!0},_error:{state:!0},_presets:{state:!0},_floors:{state:!0},_areas:{state:!0},_assets:{state:!0},_registry:{state:!0},_bindingStatuses:{state:!0},_entityRegistry:{state:!0},_deviceRegistry:{state:!0},_refreshError:{state:!0},_t:{state:!0},_contextAreaId:{state:!0},_selectedAssetId:{state:!0},_selectedAreaId:{state:!0}}),u(dt,"styles",m`
    :host {
      display: block;
      height: 100%;
      min-height: 100vh;
      color: var(--primary-text-color, #212121);
      background: var(--primary-background-color, #fafafa);
      font-family: var(
        --paper-font-body1_-_font-family,
        Roboto,
        Noto,
        sans-serif
      );
    }
    * {
      box-sizing: border-box;
    }
    .shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .top {
      display: flex;
      align-items: center;
      min-height: 60px;
      padding: 0 20px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
      background: var(--card-background-color, #fff);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 9px;
      margin-right: 30px;
    }
    .brand ha-icon {
      color: var(--primary-color);
      --mdc-icon-size: 28px;
    }
    .brand h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    .tabs {
      align-self: stretch;
      display: flex;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .tabs::-webkit-scrollbar {
      display: none;
    }
    .tabs button {
      flex: none;
      min-width: 86px;
      min-height: 58px;
      padding: 0 16px;
      border: 0;
      border-bottom: 3px solid transparent;
      background: transparent;
      color: var(--secondary-text-color);
      font: inherit;
      font-size: 14px;
      font-weight: 500;
    }
    .tabs button.active {
      color: var(--primary-text-color);
      border-bottom-color: var(--primary-color);
    }
    button:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: -3px;
    }
    .refresh {
      width: 44px;
      height: 44px;
      margin-left: auto;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: var(--primary-color);
    }
    main {
      flex: 1;
      min-width: 0;
    }
    .view[hidden] {
      display: none;
    }
    .refresh-error {
      margin: 12px 24px 0;
      padding: 12px;
      border: 1px solid var(--error-color, #db4437);
      border-radius: 8px;
    }
    .state {
      min-height: 60vh;
      display: grid;
      place-items: center;
      padding: 24px;
      text-align: center;
    }
    .state-content {
      max-width: 520px;
    }
    .state h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 500;
    }
    .state p {
      color: var(--secondary-text-color);
      line-height: 22px;
    }
    .retry {
      min-height: 44px;
      padding: 0 18px;
      border: 0;
      border-radius: 8px;
      color: var(--text-primary-color, #fff);
      background: var(--primary-color);
      font: inherit;
      font-weight: 500;
    }
    .spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 16px;
      border: 4px solid var(--divider-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    @media (max-width: 650px) {
      .top {
        padding: 0 8px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 44px;
        grid-template-rows: 54px 50px;
      }
      .brand {
        margin: 0;
        padding-left: 6px;
      }
      .tabs {
        grid-column: 1/-1;
        grid-row: 2;
        order: 3;
        margin-inline: -8px;
        padding-inline: 4px;
        border-top: 1px solid var(--divider-color);
      }
      .tabs button {
        min-width: auto;
        flex: 1;
        min-height: 50px;
        padding-inline: 11px;
      }
      .refresh {
        grid-column: 2;
        grid-row: 1;
      }
      .refresh-error {
        margin-inline: 12px;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .spinner {
        animation: none;
      }
    }
  `);customElements.define("bindhome-panel",dt);})();
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
