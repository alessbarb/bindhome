(()=>{var Ts=Object.defineProperty;var Os=(i,t,e)=>t in i?Ts(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var h=(i,t,e)=>Os(i,typeof t!="symbol"?t+"":t,e);function _(i,t,e=customElements){let s=e.get(i);return s||(e.define(i,t),t)}var It=globalThis,Et=It.ShadowRoot&&(It.ShadyCSS===void 0||It.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,jt=Symbol(),Re=new WeakMap,F=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==jt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(Et&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=Re.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&Re.set(e,t))}return t}toString(){return this.cssText}},Ce=i=>new F(typeof i=="string"?i:i+"",void 0,jt),g=(i,...t)=>{let e=i.length===1?i[0]:t.reduce((s,r,o)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+i[o+1],i[0]);return new F(e,i,jt)},Pe=(i,t)=>{if(Et)i.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),r=It.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=e.cssText,i.appendChild(s)}},Wt=Et?i=>i:i=>i instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return Ce(e)})(i):i;var{is:Ms,defineProperty:Us,getOwnPropertyDescriptor:qs,getOwnPropertyNames:Fs,getOwnPropertySymbols:js,getPrototypeOf:Ws}=Object,St=globalThis,De=St.trustedTypes,Ks=De?De.emptyScript:"",Gs=St.reactiveElementPolyfillSupport,j=(i,t)=>i,Kt={toAttribute(i,t){switch(t){case Boolean:i=i?Ks:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,t){let e=i;switch(t){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},Be=(i,t)=>!Ms(i,t),ze={attribute:!0,type:String,converter:Kt,reflect:!1,useDefault:!1,hasChanged:Be};Symbol.metadata??=Symbol("metadata"),St.litPropertyMetadata??=new WeakMap;var R=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=ze){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),r=this.getPropertyDescriptor(t,s,e);r!==void 0&&Us(this.prototype,t,r)}}static getPropertyDescriptor(t,e,s){let{get:r,set:o}=qs(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:r,set(n){let c=r?.call(this);o?.call(this,n),this.requestUpdate(t,c,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ze}static _$Ei(){if(this.hasOwnProperty(j("elementProperties")))return;let t=Ws(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(j("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(j("properties"))){let e=this.properties,s=[...Fs(e),...js(e)];for(let r of s)this.createProperty(r,e[r])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,r]of e)this.elementProperties.set(s,r)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let r=this._$Eu(e,s);r!==void 0&&this._$Eh.set(r,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let r of s)e.unshift(Wt(r))}else t!==void 0&&e.push(Wt(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Pe(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,s);if(r!==void 0&&s.reflect===!0){let o=(s.converter?.toAttribute!==void 0?s.converter:Kt).toAttribute(e,s.type);this._$Em=t,o==null?this.removeAttribute(r):this.setAttribute(r,o),this._$Em=null}}_$AK(t,e){let s=this.constructor,r=s._$Eh.get(t);if(r!==void 0&&this._$Em!==r){let o=s.getPropertyOptions(r),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:Kt;this._$Em=r;let c=n.fromAttribute(e,o.type);this[r]=c??this._$Ej?.get(r)??c,this._$Em=null}}requestUpdate(t,e,s,r=!1,o){if(t!==void 0){let n=this.constructor;if(r===!1&&(o=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??Be)(o,e)||s.useDefault&&s.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:r,wrapped:o},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),o!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),r===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[r,o]of this._$Ep)this[r]=o;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[r,o]of s){let{wrapped:n}=o,c=this[r];n!==!0||this._$AL.has(r)||c===void 0||this.C(r,void 0,o,c)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};R.elementStyles=[],R.shadowRootOptions={mode:"open"},R[j("elementProperties")]=new Map,R[j("finalized")]=new Map,Gs?.({ReactiveElement:R}),(St.reactiveElementVersions??=[]).push("2.1.2");var Xt=globalThis,Ne=i=>i,Rt=Xt.trustedTypes,Le=Rt?Rt.createPolicy("lit-html",{createHTML:i=>i}):void 0,Fe="$lit$",P=`lit$${Math.random().toFixed(9).slice(2)}$`,je="?"+P,Hs=`<${je}>`,N=document,K=()=>N.createComment(""),G=i=>i===null||typeof i!="object"&&typeof i!="function",Zt=Array.isArray,Qs=i=>Zt(i)||typeof i?.[Symbol.iterator]=="function",Gt=`[ 	
\f\r]`,W=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Te=/-->/g,Oe=/>/g,z=RegExp(`>|${Gt}(?:([^\\s"'>=/]+)(${Gt}*=${Gt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Me=/'/g,Ue=/"/g,We=/^(?:script|style|textarea|title)$/i,te=i=>(t,...e)=>({_$litType$:i,strings:t,values:e}),a=te(1),Ci=te(2),Pi=te(3),L=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),qe=new WeakMap,B=N.createTreeWalker(N,129);function Ke(i,t){if(!Zt(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return Le!==void 0?Le.createHTML(t):t}var Vs=(i,t)=>{let e=i.length-1,s=[],r,o=t===2?"<svg>":t===3?"<math>":"",n=W;for(let c=0;c<e;c++){let l=i[c],u,b,p=-1,v=0;for(;v<l.length&&(n.lastIndex=v,b=n.exec(l),b!==null);)v=n.lastIndex,n===W?b[1]==="!--"?n=Te:b[1]!==void 0?n=Oe:b[2]!==void 0?(We.test(b[2])&&(r=RegExp("</"+b[2],"g")),n=z):b[3]!==void 0&&(n=z):n===z?b[0]===">"?(n=r??W,p=-1):b[1]===void 0?p=-2:(p=n.lastIndex-b[2].length,u=b[1],n=b[3]===void 0?z:b[3]==='"'?Ue:Me):n===Ue||n===Me?n=z:n===Te||n===Oe?n=W:(n=z,r=void 0);let x=n===z&&i[c+1].startsWith("/>")?" ":"";o+=n===W?l+Hs:p>=0?(s.push(u),l.slice(0,p)+Fe+l.slice(p)+P+x):l+P+(p===-2?c:x)}return[Ke(i,o+(i[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},H=class i{constructor({strings:t,_$litType$:e},s){let r;this.parts=[];let o=0,n=0,c=t.length-1,l=this.parts,[u,b]=Vs(t,e);if(this.el=i.createElement(u,s),B.currentNode=this.el.content,e===2||e===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(r=B.nextNode())!==null&&l.length<c;){if(r.nodeType===1){if(r.hasAttributes())for(let p of r.getAttributeNames())if(p.endsWith(Fe)){let v=b[n++],x=r.getAttribute(p).split(P),w=/([.?@])?(.*)/.exec(v);l.push({type:1,index:o,name:w[2],strings:x,ctor:w[1]==="."?Qt:w[1]==="?"?Vt:w[1]==="@"?Yt:O}),r.removeAttribute(p)}else p.startsWith(P)&&(l.push({type:6,index:o}),r.removeAttribute(p));if(We.test(r.tagName)){let p=r.textContent.split(P),v=p.length-1;if(v>0){r.textContent=Rt?Rt.emptyScript:"";for(let x=0;x<v;x++)r.append(p[x],K()),B.nextNode(),l.push({type:2,index:++o});r.append(p[v],K())}}}else if(r.nodeType===8)if(r.data===je)l.push({type:2,index:o});else{let p=-1;for(;(p=r.data.indexOf(P,p+1))!==-1;)l.push({type:7,index:o}),p+=P.length-1}o++}}static createElement(t,e){let s=N.createElement("template");return s.innerHTML=t,s}};function T(i,t,e=i,s){if(t===L)return t;let r=s!==void 0?e._$Co?.[s]:e._$Cl,o=G(t)?void 0:t._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),o===void 0?r=void 0:(r=new o(i),r._$AT(i,e,s)),s!==void 0?(e._$Co??=[])[s]=r:e._$Cl=r),r!==void 0&&(t=T(i,r._$AS(i,t.values),r,s)),t}var Ht=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,r=(t?.creationScope??N).importNode(e,!0);B.currentNode=r;let o=B.nextNode(),n=0,c=0,l=s[0];for(;l!==void 0;){if(n===l.index){let u;l.type===2?u=new Q(o,o.nextSibling,this,t):l.type===1?u=new l.ctor(o,l.name,l.strings,this,t):l.type===6&&(u=new Jt(o,this,t)),this._$AV.push(u),l=s[++c]}n!==l?.index&&(o=B.nextNode(),n++)}return B.currentNode=N,r}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},Q=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,r){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=T(this,t,e),G(t)?t===d||t==null||t===""?(this._$AH!==d&&this._$AR(),this._$AH=d):t!==this._$AH&&t!==L&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Qs(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==d&&G(this._$AH)?this._$AA.nextSibling.data=t:this.T(N.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,r=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=H.createElement(Ke(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(e);else{let o=new Ht(r,this),n=o.u(this.options);o.p(e),this.T(n),this._$AH=o}}_$AC(t){let e=qe.get(t.strings);return e===void 0&&qe.set(t.strings,e=new H(t)),e}k(t){Zt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,r=0;for(let o of t)r===e.length?e.push(s=new i(this.O(K()),this.O(K()),this,this.options)):s=e[r],s._$AI(o),r++;r<e.length&&(this._$AR(s&&s._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=Ne(t).nextSibling;Ne(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},O=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,r,o){this.type=1,this._$AH=d,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=d}_$AI(t,e=this,s,r){let o=this.strings,n=!1;if(o===void 0)t=T(this,t,e,0),n=!G(t)||t!==this._$AH&&t!==L,n&&(this._$AH=t);else{let c=t,l,u;for(t=o[0],l=0;l<o.length-1;l++)u=T(this,c[s+l],e,l),u===L&&(u=this._$AH[l]),n||=!G(u)||u!==this._$AH[l],u===d?t=d:t!==d&&(t+=(u??"")+o[l+1]),this._$AH[l]=u}n&&!r&&this.j(t)}j(t){t===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Qt=class extends O{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===d?void 0:t}},Vt=class extends O{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==d)}},Yt=class extends O{constructor(t,e,s,r,o){super(t,e,s,r,o),this.type=5}_$AI(t,e=this){if((t=T(this,t,e,0)??d)===L)return;let s=this._$AH,r=t===d&&s!==d||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==d&&(s===d||r);r&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Jt=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){T(this,t)}};var Ys=Xt.litHtmlPolyfillSupport;Ys?.(H,Q),(Xt.litHtmlVersions??=[]).push("3.3.3");var Ge=(i,t,e)=>{let s=e?.renderBefore??t,r=s._$litPart$;if(r===void 0){let o=e?.renderBefore??null;s._$litPart$=r=new Q(t.insertBefore(K(),o),o,void 0,e??{})}return r._$AI(i),r};var ee=globalThis,m=class extends R{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Ge(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return L}};m._$litElement$=!0,m.finalized=!0,ee.litElementHydrateSupport?.({LitElement:m});var Js=ee.litElementPolyfillSupport;Js?.({LitElement:m});(ee.litElementVersions??=[]).push("4.2.2");var He=new WeakMap;function Qe(i){let t=i?.connection??i;if(typeof t!="object"&&typeof t!="function"||t===null)throw new TypeError("BindHome API requires a Home Assistant connection");let e=He.get(t);return e||(e={revision:null,conflictListeners:new Set},He.set(t,e)),e}function D(i,t){Number.isInteger(t)&&t>=0&&(i.revision=t)}function Xs(i){return i?.code??i?.body?.code??i?.data?.code??null}function Ve(i,t){if(Xs(t)==="conflict")for(let e of i.conflictListeners)e(t)}async function E(i,t,e){let s={...e};t.revision!==null&&(s.based_on_revision=t.revision);try{let r=await i.callWS(s);return D(t,r?.revision),r}catch(r){throw Ve(t,r),r}}async function Ct(i,t,e,s){try{let r=await i.callWS({...e,based_on_revision:s});return D(t,r?.revision),r}catch(r){throw Ve(t,r),r}}function Ye(i,t){let e=Qe(i);return e.conflictListeners.add(t),()=>e.conflictListeners.delete(t)}function f(i){let t=Qe(i);return{async getRegistry(){let e=await i.callWS({type:"bindhome/registry/get"});return D(t,e?.revision),e},async subscribeRegistryChanges(e){return i.connection.subscribeMessage(e,{type:"bindhome/registry/subscribe"})},async listAssets(){return(await i.callWS({type:"bindhome/assets/list"})).assets??[]},async listPresets(){return(await i.callWS({type:"bindhome/presets/list"})).presets??[]},async listBindingStatuses(){return i.callWS({type:"bindhome/bindings/status"})},async setBinding({assetId:e,capability:s,entityId:r,role:o="primary"}){return E(i,t,{type:"bindhome/bindings/set",asset_id:e,capability:s,entity_id:r,role:o})},async getReplacementCandidates({assetId:e,capability:s,role:r="primary"}){let o=await i.callWS({type:"bindhome/replacement/candidates",asset_id:e,capability:s,role:r});return D(t,o?.revision),o},async commitReplacement({assetId:e,capability:s,entityId:r,revision:o,role:n="primary"}){return Ct(i,t,{type:"bindhome/replacement/commit",asset_id:e,capability:s,entity_id:r,role:n},o)},async deleteBinding(e){return E(i,t,{type:"bindhome/bindings/delete",binding_id:e})},async setRepresentation({assetId:e,platform:s}){return E(i,t,{type:"bindhome/representations/set",asset_id:e,platform:s})},async deleteRepresentation(e){return E(i,t,{type:"bindhome/representations/delete",asset_id:e})},async createRelation({sourceAssetId:e,relationType:s,targetAssetId:r}){return E(i,t,{type:"bindhome/relations/create",source_asset_id:e,relation_type:s,target_asset_id:r})},async deleteRelation(e){return E(i,t,{type:"bindhome/relations/delete",relation_id:e})},async createAssetsBulk(e){return E(i,t,{type:"bindhome/assets/create_bulk",assets:e})},async updateAsset(e,s){return(await E(i,t,{...s,type:"bindhome/assets/update",asset_id:e})).asset},async deleteAsset(e){return E(i,t,{type:"bindhome/assets/delete",asset_id:e})},async getDeleteImpact(e){let s=await i.callWS({type:"bindhome/assets/delete_impact",asset_id:e});return D(t,s?.revision),s},async deleteAssetWithDependencies(e){return E(i,t,{type:"bindhome/assets/delete_with_dependencies",asset_id:e})},async discoverImport(e=null){let s=await i.callWS({type:"bindhome/import/discover",...e?{area_id:e}:{}});return D(t,s?.revision),s},async commitImport({areaId:e=null,revision:s,decisions:r}){return Ct(i,t,{type:"bindhome/import/commit",decisions:r,...e?{area_id:e}:{}},s)},async exportInventoryCsv(){return i.callWS({type:"bindhome/csv/export"})},async validateInventoryCsv(e){let s=await i.callWS({type:"bindhome/csv/validate",csv:e});return D(t,s?.revision),s},async importInventoryCsv({csv:e,revision:s}){return Ct(i,t,{type:"bindhome/csv/import",csv:e},s)},async exportRegistryBackup(){return i.callWS({type:"bindhome/backup/export"})},async getBackupRecoveryStatus(){return i.callWS({type:"bindhome/backup/recovery_status"})},async restoreRegistryBackup({backup:e,revision:s=null}){if(Number.isInteger(s))return Ct(i,t,{type:"bindhome/backup/restore",backup:e},s);let r=await i.callWS({type:"bindhome/backup/restore",backup:e});return D(t,r?.revision),r}}}var Pt="__bindhome_no_floor__";function Dt(i){return{async listFloors(){return(await i.callWS({type:"config/floor_registry/list"})??[]).map(e=>({floor_id:e.floor_id,name:e.name,level:e.level??null,icon:e.icon??null}))},async listAreas(){return(await i.callWS({type:"config/area_registry/list"})??[]).map(e=>({area_id:e.area_id,name:e.name,floor_id:e.floor_id??null,icon:e.icon??null}))},async listEntityRegistry(){return i.callWS({type:"config/entity_registry/list"})},async listDeviceRegistry(){return i.callWS({type:"config/device_registry/list"})}}}function se(i,t){return t===Pt?i.filter(e=>!e.floor_id):i.filter(e=>e.floor_id===t)}var ie="bindhome.advanced-pinned",re="bindhome.onboarding.v1",ae="bindhome.home-collapsed-floors",oe="bindhome.backup.last-exported-at";function Xe(i){let t=i?.connection;return t&&typeof t.sendMessagePromise=="function"?t:null}async function zt(i,t){let e=Xe(i);if(!e)return{available:!1,value:null};try{return{available:!0,value:(await e.sendMessagePromise({type:"frontend/get_user_data",key:t}))?.value??null}}catch{return{available:!1,value:null}}}async function C(i,t,e){let s=Xe(i);if(!s)return!1;try{return await s.sendMessagePromise({type:"frontend/set_user_data",key:t,value:e}),!0}catch{return!1}}function Ze(i){try{return window.localStorage.getItem(i)}catch{return null}}function ts(i){try{window.localStorage.removeItem(i)}catch{}}async function ne(i,t,e,s=!1){let r=await zt(i,t);if(r.available&&r.value!==null)return typeof r.value=="boolean"?r.value:s;let o=Ze(e);if(o===null)return s;let n=o==="true"?!0:o==="false"?!1:s;return r.available&&await C(i,t,n)&&ts(e),n}function Je(i){return Array.isArray(i)?[...new Set(i.filter(t=>typeof t=="string"))].sort():[]}async function es(i,t,e){let s=await zt(i,t);if(s.available&&s.value!==null)return Je(s.value);let r=Ze(e);if(r===null)return[];let o=[];try{o=Je(JSON.parse(r))}catch{o=[]}return s.available&&await C(i,t,o)&&ts(e),o}var Zs="component.bindhome.common.panel_";async function le(i,t){let e=async o=>(await i.callWS({type:"frontend/get_translations",language:o,category:"common",integration:["bindhome"]}))?.resources??{},s=await e("en"),r=s;if(t!=="en")try{r=await e(t)}catch{r=s}return de(r,s)}function de(i={},t={}){return(e,s={})=>{let r=`${Zs}${e.replaceAll(".","_")}`;return(i[r]??t[r]??e).replace(/\{(\w+)\}/g,(n,c)=>s[c]??n)}}function Bt(i,t){return`${i}.${t===1?"one":"other"}`}function S(i,t){let e=`presets.${t.preset_id}.name`,s=i(e);return s===e?t.default_name:s}var ti={light_point:["mdi:lightbulb-outline","lighting"],socket:["mdi:power-socket-eu","electricity"],switch:["mdi:light-switch","electricity"],electrical_panel:["mdi:electric-switch","electricity"],circuit:["mdi:transmission-tower","electricity"],junction_box:["mdi:connection","electricity"],ethernet_outlet:["mdi:ethernet","network"],telephone_outlet:["mdi:phone-classic","network"],antenna_outlet:["mdi:television-classic","network"],wifi_access_point:["mdi:wifi","network"],radiator:["mdi:radiator","climate"],thermostat:["mdi:thermostat","climate"],fan:["mdi:fan","climate"],air_conditioning_unit:["mdi:air-conditioner","climate"],tap:["mdi:faucet","water"],shutoff_valve:["mdi:valve","water"],valve:["mdi:valve","water"],drain:["mdi:water-minus","water"],manifold:["mdi:pipe-valve","water"],door:["mdi:door","structure"],window:["mdi:window-closed","structure"],blind:["mdi:blinds","structure"],skylight:["mdi:window-open","structure"],boiler:["mdi:water-boiler","equipment"],water_heater:["mdi:water-boiler","equipment"],pump:["mdi:pump","equipment"],freezer:["mdi:fridge-outline","equipment"],appliance:["mdi:dishwasher","equipment"],machine:["mdi:cog-outline","equipment"]};function k(i,t){let e=ti[t],s=`presets.${t}.name`,r=i(s);return{type:t,label:r===s?ce(t):r,icon:e?.[0]??"mdi:cube-outline",category:e?.[1]??"other",known:!!e}}function ce(i){let t=String(i||"").replaceAll("_"," ").trim();return t?t.charAt(0).toUpperCase()+t.slice(1):"\u2014"}var Nt=["lighting","electricity","water","climate","equipment","network","structure","other"];function Lt(i,t){let e={lighting:"mdi:lightbulb-outline",electricity:"mdi:flash-outline",water:"mdi:water-outline",climate:"mdi:thermometer",equipment:"mdi:tools",network:"mdi:lan",structure:"mdi:home-outline",other:"mdi:dots-horizontal-circle-outline"};return{category:t,label:i(`categories.${t}`),icon:e[t]??e.other}}var A="__bindhome_no_area__",I="__bindhome_stale_area__";function ss(i,t,e){let s=new Map(t.map(l=>[l.area_id,l])),r=new Map;for(let l of e){let u=l.area_id?s.has(l.area_id)?l.area_id:I:A;r.set(u,[...r.get(u)??[],l])}let n=[...i].sort((l,u)=>(l.level??999)-(u.level??999)||l.name.localeCompare(u.name)).map(l=>({id:l.floor_id,name:l.name,icon:l.icon,level:l.level,areas:t.filter(u=>u.floor_id===l.floor_id).sort(V)})),c=t.filter(l=>!l.floor_id).sort(V);return c.length&&n.push({id:"__no_floor__",name:null,icon:null,level:null,areas:c}),{groups:n,assetsByArea:r,unassigned:r.get(A)??[],stale:r.get(I)??[]}}function V(i,t){return i.name.localeCompare(t.name,void 0,{sensitivity:"base"})}function is(i,t){let e=new Map;for(let s of t){let r=k(i,s.asset_type);e.set(r.category,[...e.get(r.category)??[],s])}return Nt.filter(s=>e.has(s)).map(s=>({category:s,assets:e.get(s).sort(V)}))}function rs(i,t,e,s,r){let o=new Map(e.map(l=>[l.area_id,l])),n=new Map(s.map(l=>[l.floor_id,l])),c=r.trim().toLocaleLowerCase();return c?t.map(l=>{let u=l.area_id?o.get(l.area_id):null,b=u?.floor_id?n.get(u.floor_id):null,p=k(i,l.asset_type),x=[l.name,l.code,p.label,l.asset_type,u?.name,b?.name].filter(Boolean).map(w=>String(w).toLocaleLowerCase()).reduce((w,q,Ft)=>w+(q===c?100-Ft:q.startsWith(c)?50-Ft:q.includes(c)?10-Ft:0),0);return{asset:l,area:u,floor:b,type:p,score:x}}).filter(l=>l.score>0).sort((l,u)=>u.score-l.score||V(l.asset,u.asset)).slice(0,30):t.slice().sort(V).slice(0,8)}var as="/bindhome";function ue(){return{view:"home",areaId:null,assetId:null,query:"",contextAreaId:null,advancedAssetId:null}}function he(i){if(!i)return null;try{return decodeURIComponent(i)}catch{return null}}function ei(i){let t=typeof i=="string"&&i?i:as,e=t.startsWith("/")?t:`/${t}`;return e.length>1?e.replace(/\/+$/,""):e}function os(i,t=""){let e=ue(),r=(typeof i?.path=="string"?i.path:"").split("/").filter(Boolean),o=new URLSearchParams(t.startsWith("?")?t.slice(1):t);if(r.length===0)return e;if(r[0]==="home"){if(r.length>3)return e;let n=r.length>=2?he(r[1]):null,c=r.length>=3?he(r[2]):null;return r.length>=2&&n===null||r.length>=3&&c===null?e:{...e,areaId:n,assetId:c}}if(r[0]==="add"&&r.length===1){let n=o.get("area");return{...e,view:"add",contextAreaId:n||null}}if(r[0]==="search"&&r.length===1)return{...e,view:"search",query:o.get("q")??""};if(r[0]==="advanced"){if(r.length>2)return e;let n=r.length===2?he(r[1]):null;return r.length===2&&n===null?e:{...e,view:"advanced",advancedAssetId:n}}return e}function pe(i){return encodeURIComponent(i)}function me(i,t=as){let e=ei(t);if(i.view==="add"){let r=new URLSearchParams;i.contextAreaId&&r.set("area",i.contextAreaId);let o=r.toString();return`${e}/add${o?`?${o}`:""}`}if(i.view==="search"){let r=new URLSearchParams;i.query&&r.set("q",i.query);let o=r.toString();return`${e}/search${o?`?${o}`:""}`}if(i.view==="advanced")return i.advancedAssetId?`${e}/advanced/${pe(i.advancedAssetId)}`:`${e}/advanced`;let s=`${e}/home`;return i.areaId&&(s+=`/${pe(i.areaId)}`),i.areaId&&i.assetId&&(s+=`/${pe(i.assetId)}`),s}function ge(i,t={}){let e=t.window??window,s=t.replace===!0,r=`${e.location.pathname}${e.location.search}`;if(r===i)return!1;let o=e.history.state??{};if(s){let c={};o?.root&&(c.root=!0),o?.from!==void 0&&(c.from=o.from),e.history.replaceState(Object.keys(c).length?c:null,"",i)}else e.history.pushState({from:r},"",i);let n=e.document.createEvent("CustomEvent");return n.initCustomEvent("location-changed",!1,!1,{replace:s}),e.dispatchEvent(n),!0}var $=g`
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
`;var si={feeds:{outgoing:"relations.feeds.outgoing",incoming:"relations.feeds.incoming"},contains:{outgoing:"relations.contains.outgoing",incoming:"relations.contains.incoming"},controls:{outgoing:"relations.controls.outgoing",incoming:"relations.controls.incoming"},part_of:{outgoing:"relations.part_of.outgoing",incoming:"relations.part_of.incoming"}};function ns(i,t,e){let s=si[t]?.[e];return{type:t,direction:e,label:s?i(s):i("relations.unknown",{type:ce(t)}),known:!!s,icon:t==="feeds"?"mdi:flash-outline":t==="controls"?"mdi:tune":t==="contains"||t==="part_of"?"mdi:folder-outline":"mdi:vector-link"}}function ls(i){return{socket:[{direction:"outgoing",relationType:"feeds",labelKey:"relations.actions.indicate_feeds"},{direction:"incoming",relationType:"feeds",labelKey:"relations.actions.power_source"}],circuit:[{direction:"outgoing",relationType:"feeds",labelKey:"relations.actions.add_powered"},{direction:"incoming",relationType:"feeds",labelKey:"relations.actions.panel_source"}],electrical_panel:[{direction:"outgoing",relationType:"feeds",labelKey:"relations.actions.add_powered"},{direction:"outgoing",relationType:"contains",labelKey:"relations.actions.add_content"}],junction_box:[{direction:"outgoing",relationType:"contains",labelKey:"relations.actions.add_content"}],manifold:[{direction:"outgoing",relationType:"contains",labelKey:"relations.actions.add_content"}],shutoff_valve:[{direction:"outgoing",relationType:"controls",labelKey:"relations.actions.indicate_controls"}],valve:[{direction:"outgoing",relationType:"controls",labelKey:"relations.actions.indicate_controls"}],light_point:[{direction:"incoming",relationType:"feeds",labelKey:"relations.actions.power_source"}]}[i]??[]}function M(i=[],t){return{outgoing:i.filter(e=>e.source_asset_id===t),incoming:i.filter(e=>e.target_asset_id===t)}}function ds(i=[]){return[...new Set(i.map(t=>t.relation_type).filter(Boolean))].sort()}function _e(i){return/^[a-z][a-z0-9_]*$/.test(String(i).trim())}function fe(i){return[i?.message,i?.body?.message,i?.data?.message,i?.error].filter(t=>typeof t=="string")}function y(i,t=null){let e=fe(i).find(s=>s.trim())??t;return{code:i?.code??i?.body?.code??i?.data?.code??null,message:e}}function cs(i,t=null){for(let s of fe(i))try{let r=JSON.parse(s);if(Number.isInteger(r?.index)&&r.index>=0&&typeof r?.field=="string"&&typeof r?.message=="string")return{structured:!0,index:r.index,field:r.field,message:r.message}}catch{}return{structured:!1,index:null,field:null,message:fe(i).find(s=>s.trim())??t}}function ii(i){return String(i??"").trim()}function U(i){return ii(i).toLocaleLowerCase()}function ps(i,t){return U(i.name).localeCompare(U(t.name),void 0,{numeric:!0,sensitivity:"base"})||i.entityId.localeCompare(t.entityId)}function hs(i,t,e){let s=U(t);if(!s)return e&&i.areaId===e?0:1;let r=[i.name,i.entityId,i.areaName,i.deviceName,i.domain].map(U),o=r.some(l=>l===s),n=r.some(l=>l.startsWith(s)),c=e&&i.areaId===e?0:1;return(o?0:n?1:2)*2+c}function be({entityRegistry:i=[],deviceRegistry:t=[],states:e={},areas:s=[]}={}){let r=new Map(i.filter(l=>l?.entity_id).map(l=>[l.entity_id,l])),o=new Map(t.filter(l=>l?.id).map(l=>[l.id,l])),n=new Map(s.filter(l=>l?.area_id).map(l=>[l.area_id,l.name]));return[...new Set([...r.keys(),...Object.keys(e??{})])].map(l=>{let u=r.get(l)??null,b=e?.[l]??null,p=u?.device_id?o.get(u.device_id):null,[v]=l.split("."),x=u?.area_id??p?.area_id??null,w=b?.attributes?.friendly_name??u?.name??u?.original_name??l;return{entityId:l,domain:v,name:w,state:b?.state??null,registryEntry:u,deviceId:u?.device_id??null,deviceName:p?.name_by_user??p?.name??null,areaId:x,areaName:x?n.get(x)??null:null,disabled:!!u?.disabled_by,hidden:!!u?.hidden_by,isBindHome:u?.platform==="bindhome"}}).sort(ps)}function us(i,t="",e=null){let s=U(t);return[...i??[]].filter(r=>s?[r.name,r.entityId,r.areaName,r.deviceName,r.domain].some(o=>U(o).includes(s)):!0).sort((r,o)=>hs(r,s,e)-hs(o,s,e)||ps(r,o))}var ri=8,ai=20;function oi(i,t){let e=`capabilities.${t}`,s=i(e);return s!==e?s:t.replaceAll("_"," ").replace(/\b\w/g,r=>r.toUpperCase())}var Y=class extends m{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.capability="",this.status=null,this.areas=[],this.entityRegistry=[],this.deviceRegistry=[],this.showEntityId=!0,this.refreshBindingData=null,this._editing=!1,this._search="",this._selectedEntityId=null,this._saving=!1,this._error=null,this._confirmDisconnect=!1,this._selectionMode="search",this._replacementPlan=null,this._replacementLoading=!1,this._confirmReplacement=!1,this._replacementSuccess=null,this._bindingIdentity=null,this._operation=0,this._committedDisconnectId=null}_replacementMode(){return!!(this.status?.binding&&this.status?.status!=="binding_not_found")}_replacementCandidates(){if(!this._replacementPlan)return null;let t=new Map((this.areas??[]).map(s=>[s.area_id,s.name])),e=new Map((this.deviceRegistry??[]).map(s=>[s.id,s.name_by_user||s.name]));return(this._replacementPlan.candidates??[]).map(s=>({entityId:s.entity_id,entityRegistryId:s.entity_registry_id,name:s.name,domain:s.domain,areaId:s.area_id,areaName:t.get(s.area_id)??null,deviceId:s.device_id,deviceName:e.get(s.device_id)??null,state:s.state,disabled:!1,hidden:!1,reasons:s.reasons??[]}))}_candidates(){let t=this._replacementCandidates();return t||be({entityRegistry:this.entityRegistry,deviceRegistry:this.deviceRegistry,states:this.hass?.states,areas:this.areas})}willUpdate(){let t=this.asset?JSON.stringify([this.asset.id,this.capability,"primary"]):null;this._bindingIdentity!==null&&t!==this._bindingIdentity&&(this._editing=!1,this._selectedEntityId=null,this._search="",this._error=null,this._confirmDisconnect=!1,this._saving=!1,this._selectionMode="search",this._replacementPlan=null,this._replacementLoading=!1,this._confirmReplacement=!1,this._replacementSuccess=null,this._committedDisconnectId=null,this._operation+=1),this._bindingIdentity=t}_currentEntityId(){return this.status?.entity_id??this.status?.binding?.entity_id??null}_currentCandidate(){let t=this._currentEntityId();return be({entityRegistry:this.entityRegistry,deviceRegistry:this.deviceRegistry,states:this.hass?.states,areas:this.areas}).find(e=>e.entityId===t)??null}_runtimeLabel(t){return t?t.state==="unavailable"?this.t("connection.unavailable"):t.state==="unknown"?this.t("connection.unknown"):t.state===null?this.t("connection.no_runtime"):this.t("connection.available"):this.t("connection.stale")}_configurationLabel(){return this.status?.status==="entity_not_found"||this.status?.config_valid!==!1?this.t("connection.configured"):this.t("connection.invalid_configuration")}_candidateStateLabel(t){return!t||t.state===null?this.t("connection.no_runtime"):t.state==="unavailable"?this.t("connection.unavailable"):t.state==="unknown"?this.t("connection.unknown"):t.state}_displayName(t,e){return t?.name&&(this.showEntityId||t.name!==e)?t.name:t?.deviceName??(this.showEntityId?e:this.t("connection.configured"))}_candidateMeta(t){return[this.showEntityId?t?.entityId:null,t?.areaName,t?.deviceName,t?this._candidateStateLabel(t):null].filter(Boolean).join(" \xB7 ")}async _beginEdit(){if(this._saving||this._replacementLoading||(this._editing=!0,this._selectedEntityId=this._replacementMode()?null:this._currentEntityId(),this._search="",this._error=null,this._confirmDisconnect=!1,this._confirmReplacement=!1,this._replacementSuccess=null,this._selectionMode="search",!this._replacementMode()))return;let t=++this._operation;this._replacementLoading=!0;try{let e=await f(this.hass).getReplacementCandidates({assetId:this.asset.id,capability:this.capability,role:"primary"});if(t!==this._operation)return;this._replacementPlan=e}catch(e){if(t!==this._operation)return;this._error=y(e,this.t("connection.replacement_load_error")).message}finally{t===this._operation&&(this._replacementLoading=!1)}}_cancelEdit(){this._saving||(this._editing=!1,this._selectedEntityId=null,this._search="",this._error=null,this._confirmDisconnect=!1,this._confirmReplacement=!1,this._replacementPlan=null,this._replacementLoading=!1,this._selectionMode="search")}_select(t){this._saving||(this._selectedEntityId=t,this._error=null,this._confirmReplacement=!1,this._selectionMode="selected")}_changeSelection(){this._saving||(this._selectionMode="search",this._confirmReplacement=!1)}async _save(){if(this._saving||!this._selectedEntityId||!this.asset)return;if(this._replacementMode()&&!this._confirmReplacement){this._confirmReplacement=!0;return}this._saving=!0,this._error=null;let t=++this._operation,e=this._selectedEntityId;try{let s;if(this._replacementMode()){if(!this._replacementPlan||!Number.isInteger(this._replacementPlan.revision))throw new Error(this.t("connection.replacement_load_error"));s=await f(this.hass).commitReplacement({assetId:this.asset.id,capability:this.capability,entityId:e,revision:this._replacementPlan.revision,role:"primary"})}else s=await f(this.hass).setBinding({assetId:this.asset.id,capability:this.capability,entityId:e,role:"primary"});if(t!==this._operation)return;this._replacementSuccess=this._replacementMode()?s?.resolution?.entity_id??e:null,this._editing=!1,this._selectedEntityId=null,this._search="",this._confirmReplacement=!1,this._replacementPlan=null;try{this.refreshBindingData&&await this.refreshBindingData()}catch{this._error=this.t("connection.sync_warning")}}catch(s){if(t!==this._operation)return;let r=y(s,this.t("connection.save_error"));this._error=r.code==="binding_cycle"?this.t("connection.cycle_error"):r.message}finally{this._saving=!1}}async _disconnect(){let t=this.status?.binding;if(this._saving||!t||this._committedDisconnectId===t.id)return;this._saving=!0,this._error=null,this._editing=!1;let e=++this._operation;try{if(await f(this.hass).deleteBinding(t.id),e!==this._operation)return;this._committedDisconnectId=t.id,this._confirmDisconnect=!1;try{this.refreshBindingData&&await this.refreshBindingData()}catch{this._error=this.t("connection.sync_warning")}}catch(s){if(e!==this._operation)return;this._error=y(s,this.t("connection.disconnect_error")).message,this._confirmDisconnect=!0}finally{this._saving=!1}}_renderSummary(){let t=this.status?.binding,e=this._currentEntityId(),s=this._currentCandidate();return!t||this.status?.status==="binding_not_found"?a`<div class="summary">${this.t("connection.not_connected")}</div><div class="actions"><button class="primary" @click=${this._beginEdit}>${this.t("connection.connect")}</button></div>`:a`
      <div class="entity">${this._displayName(s,e)}</div>
      ${e&&this.showEntityId?a`<div class="technical">${e}</div>`:d}
      ${s?.areaName||s?.deviceName?a`<div class="summary">${[s.areaName,s.deviceName].filter(Boolean).join(" \xB7 ")}</div>`:d}
      <div class="summary">${this._configurationLabel()} · ${this.status?.status==="entity_not_found"?this.t("connection.stale"):this._runtimeLabel(s)}</div>
      <div class="actions">
        <button class="primary" @click=${this._beginEdit}>${this.t("connection.replace_hardware")}</button>
        <button class="danger" @click=${()=>this._confirmDisconnect=!0} ?disabled=${this._saving}>${this.t("connection.disconnect")}</button>
      </div>
      ${this._confirmDisconnect?a`<div class="confirm" role="alertdialog" aria-label=${this.t("connection.confirm_disconnect")}><span>${this.t("connection.confirm_disconnect")}</span><button @click=${()=>this._confirmDisconnect=!1} ?disabled=${this._saving}>${this.t("editor.cancel")}</button><button class="danger" @click=${this._disconnect} ?disabled=${this._saving}>${this.t("connection.disconnect")}</button></div>`:d}
    `}_renderEditor(){if(this._replacementLoading)return a`<div class="picker"><div class="muted">${this.t("connection.replacement_loading")}</div><div class="actions"><button @click=${this._cancelEdit}>${this.t("editor.cancel")}</button></div></div>`;let t=us(this._candidates(),this._search,this.asset?.area_id),e=t.slice(0,this._search?ai:ri),s=this._currentEntityId(),r=this._candidates().find(n=>n.entityId===this._selectedEntityId),o=!!(s&&s===this._selectedEntityId);return a`
      <div class="picker">
        ${s?a`<div class="current"><strong>${this.t("connection.current")}</strong><div class="entity">${this._displayName(this._currentCandidate(),s)}</div>${this.showEntityId?a`<div class="technical">${s}</div>`:d}</div>`:d}
        <label>${this.t("connection.search_label")}<input aria-label=${this.t("connection.search_label")} .value=${this._search} @input=${n=>{this._search=n.target.value,this._selectionMode="search"}} /></label>
        ${this._selectionMode==="selected"?a`<div class="selected-summary" aria-live="polite"><strong>${this.t("connection.selected")}</strong><div class="entity">✓ ${this._displayName(r,this._selectedEntityId)}</div><div class="technical">${r?this._candidateMeta(r):this.showEntityId?`${this._selectedEntityId} \xB7 ${this.t("connection.no_runtime")}`:this.t("connection.no_runtime")}</div><button @click=${this._changeSelection} ?disabled=${this._saving}>${this.t("connection.change_selection")}</button></div>`:a`
          ${!this._search&&e.length?a`<div class="suggestions-heading">${this.t("connection.suggestions")}</div>`:d}
          ${e.length?e.map(n=>a`<button class="candidate ${n.entityId===this._selectedEntityId?"selected":""}" aria-pressed=${n.entityId===this._selectedEntityId} @click=${()=>this._select(n.entityId)}><span class="entity">${this._displayName(n,n.entityId)}</span><span class="candidate-meta">${this._candidateMeta(n)}${n.disabled?` \xB7 ${this.t("connection.disabled")}`:""}${n.hidden?` \xB7 ${this.t("connection.hidden")}`:""}</span></button>`):a`<div class="muted">${this.t("connection.no_matches")}</div>`}
          ${t.length>e.length?a`<div class="muted result-count">${this.t("connection.showing_results",{shown:e.length,total:t.length})}</div>`:d}
        `}
        ${this._confirmReplacement&&r?a`
          <div class="current" role="alertdialog" aria-label=${this.t("connection.confirm_replacement")}>
            <strong>${this.t("connection.confirm_replacement")}</strong>
            <div class="summary">${this.t("connection.current")}: ${this._displayName(this._currentCandidate(),s)}</div>
            <div class="summary">${this.t("connection.replacement_new")}: ${this._displayName(r,this._selectedEntityId)}</div>
            <div class="summary">${this.t("connection.replacement_identity_preserved")}</div>
          </div>
        `:d}
        <div class="actions"><button @click=${this._cancelEdit} ?disabled=${this._saving}>${this.t("editor.cancel")}</button><button class="primary" @click=${this._save} ?disabled=${this._saving||!this._selectedEntityId||o}>${this._saving?this.t("connection.saving"):this._replacementMode()?this._confirmReplacement?this.t("connection.confirm_replacement_action"):this.t("connection.review_replacement"):this.t("common.save")}</button></div>
      </div>
    `}render(){return this.asset?a`<article class="row"><strong>${oi(this.t,this.capability)}</strong>${this._replacementSuccess?a`<div class="summary" role="status">${this.t("connection.replacement_success",{entity:this._replacementSuccess})}</div>`:d}${this._editing?this._renderEditor():this._renderSummary()}${this._error?a`<div class="error" role="alert">${this._error}</div>`:d}</article>`:d}};h(Y,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},capability:{type:String},status:{attribute:!1},areas:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},showEntityId:{type:Boolean,attribute:"show-entity-id"},refreshBindingData:{attribute:!1},_editing:{state:!0},_search:{state:!0},_selectedEntityId:{state:!0},_saving:{state:!0},_error:{state:!0},_confirmDisconnect:{state:!0},_selectionMode:{state:!0},_replacementPlan:{state:!0},_replacementLoading:{state:!0},_confirmReplacement:{state:!0},_replacementSuccess:{state:!0}}),h(Y,"styles",g`
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
  `);_("bindhome-primary-connection-editor",Y);var J=class extends m{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.assets=[],this.areas=[],this.action=null,this.onRefresh=null,this._target="",this._query="",this._saving=!1,this._error=null,this._token=0,this._identity="",this._committed=!1}connectedCallback(){super.connectedCallback(),this._resetIdentity()}willUpdate(){let t=this._currentIdentity();this._identity&&t!==this._identity&&this._resetIdentity(),this._identity=t}_currentIdentity(){return`${this.asset?.id??""}:${this.action?.direction??""}:${this.action?.relationType??""}`}_resetIdentity(){this._token+=1,this._target="",this._query="",this._saving=!1,this._error=null,this._committed=!1,this._identity=this._currentIdentity()}_isCurrent(t,e){return t===this._token&&e===this._currentIdentity()}async _save(){if(this._saving||this._committed||!this._target||!this.asset||!this.action)return;let t=++this._token,e=this._currentIdentity();this._saving=!0,this._error=null;let s=this.action.direction==="incoming";try{if(await f(this.hass).createRelation({sourceAssetId:s?this._target:this.asset.id,relationType:this.action.relationType,targetAssetId:s?this.asset.id:this._target}),!this._isCurrent(t,e))return;this._committed=!0,this._saving=!1;try{await this.onRefresh?.()}catch{if(!this._isCurrent(t,e))return;this.dispatchEvent(new CustomEvent("sync-warning",{detail:this.t("topology.sync_warning"),bubbles:!0,composed:!0}))}if(!this._isCurrent(t,e))return;this.dispatchEvent(new CustomEvent("done",{bubbles:!0,composed:!0}))}catch(r){if(!this._isCurrent(t,e))return;let o=y(r,this.t("topology.create_error"));this._error=o.code==="conflict"?this.t("topology.duplicate_relation"):o.message}finally{this._isCurrent(t,e)&&!this._committed&&(this._saving=!1)}}render(){let t=this._query.toLocaleLowerCase(),e=this.assets.filter(s=>s.id!==this.asset?.id&&(!t||[s.name,s.code,s.asset_type].filter(Boolean).some(r=>String(r).toLocaleLowerCase().includes(t)))).slice(0,20);return a`<label
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
          ?disabled=${this._saving||this._committed||!this._target}
          @click=${this._save}
        >
          ${this._saving?this.t("add.saving"):this.t("common.save")}
        </button>
      </div>`}};h(J,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},action:{attribute:!1},onRefresh:{attribute:!1},_target:{state:!0},_query:{state:!0},_saving:{state:!0},_error:{state:!0}}),h(J,"styles",[$,g`
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
    `]);_("bindhome-contextual-relation-editor",J);var X=class extends m{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.areas=[],this.refreshAssets=null,this._name="",this._code="",this._areaId="",this._saving=!1,this._error=null,this._identity=null,this._operation=0,this._committed=!1}willUpdate(){this.asset?.id!==this._identity&&(this._identity=this.asset?.id??null,this._operation+=1,this._name=this.asset?.name??"",this._code=this.asset?.code??"",this._areaId=this.asset?.area_id??"",this._saving=!1,this._error=null,this._committed=!1)}async _save(t){if(t?.preventDefault(),this._saving||this._committed||!this.asset||!this._name.trim())return;let e={};if(this._name.trim()!==this.asset.name&&(e.name=this._name.trim()),(this._code.trim()||null)!==(this.asset.code||null)&&(e.code=this._code.trim()||null),(this._areaId||null)!==(this.asset.area_id||null)&&(e.area_id=this._areaId||null),!Object.keys(e).length){this.dispatchEvent(new CustomEvent("done",{bubbles:!0,composed:!0}));return}this._saving=!0,this._error=null;let s=++this._operation,r=this.asset.id;try{let o=await f(this.hass).updateAsset(r,e);if(s!==this._operation||r!==this.asset?.id)return;this._committed=!0,this.dispatchEvent(new CustomEvent("asset-committed",{detail:o,bubbles:!0,composed:!0}));try{this.refreshAssets&&await this.refreshAssets()}catch{if(s!==this._operation||r!==this.asset?.id)return;this.dispatchEvent(new CustomEvent("sync-warning",{detail:this.t("editor.sync_warning"),bubbles:!0,composed:!0}))}s===this._operation&&r===this.asset?.id&&this.dispatchEvent(new CustomEvent("done",{bubbles:!0,composed:!0}))}catch(o){if(s!==this._operation||r!==this.asset?.id)return;let n=y(o,this.t("editor.save_error"));this._error=n.code==="conflict"?this.t("editor.save_error"):n.message}finally{s===this._operation&&(this._saving=!1)}}render(){if(!this.asset)return d;let t=k(this.t,this.asset.asset_type);return a`<form class="surface" @submit=${this._save}>
      <div class="head"><ha-icon icon=${t.icon}></ha-icon><div><h2>${this.t("editor.human_title")}</h2><div class="type">${t.label}</div></div></div>
      <div class="fields">
        <label>${this.t("fields.name")}<input .value=${this._name} @input=${e=>this._name=e.target.value} required></label>
        <label>${this.t("fields.code_optional")}<input .value=${this._code} @input=${e=>this._code=e.target.value}></label>
        <label>${this.t("add.room")}<select .value=${this._areaId} @change=${e=>this._areaId=e.target.value}><option value="" ?selected=${!this._areaId}>${this.t("add.no_room")}</option>${this.areas.map(e=>a`<option value=${e.area_id} ?selected=${e.area_id===this._areaId}>${e.name}</option>`)}</select></label>
      </div>
      ${this._error?a`<div class="error" role="alert">${this._error}</div>`:d}
      <div class="actions"><button type="button" class="secondary" ?disabled=${this._saving} @click=${()=>this.dispatchEvent(new CustomEvent("cancel",{bubbles:!0,composed:!0}))}>${this.t("common.cancel")}</button><button class="primary" ?disabled=${this._saving||this._committed||!this._name.trim()}>${this._saving?this.t("editor.saving"):this.t("common.save")}</button></div>
    </form>`}};h(X,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},areas:{attribute:!1},refreshAssets:{attribute:!1},_name:{state:!0},_code:{state:!0},_areaId:{state:!0},_saving:{state:!0},_error:{state:!0}}),h(X,"styles",[$,g`
    :host { display:block; }
    form { padding:20px; }
    .head { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
    .head ha-icon { color:var(--primary-color); --mdc-icon-size:30px; }
    h2 { font-size:21px; font-weight:500; }
    .type { color:var(--secondary-text-color); margin-top:3px; }
    .fields { display:grid; gap:16px; }
    label { display:block; font-weight:500; }
    input, select { width:100%; min-height:46px; margin-top:7px; padding:9px 11px; border:1px solid var(--divider-color); border-radius:8px; background:var(--card-background-color); }
    .actions { display:flex; justify-content:flex-end; gap:8px; margin-top:22px; }
    @media (max-width:600px) { form { padding:16px; } .actions > * { flex:1; } }
  `]);_("bindhome-human-asset-editor",X);var Z=class extends m{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.refreshBindingData=null,this.refreshTopologyData=null,this.refreshAssets=null,this._impact=null,this._loading=!1,this._deleting=!1,this._error=null,this._identity=null}willUpdate(){this.asset?.id!==this._identity&&(this._identity=this.asset?.id,this._impact=null,this._loading=!1,this._deleting=!1,this._error=null)}async _prepare(){if(!(!this.hass||!this.asset||this._loading||this._deleting)){this._loading=!0,this._error=null;try{this._impact=await f(this.hass).getDeleteImpact(this.asset.id)}catch(t){this._error=y(t,this.t("delete.error")).message}finally{this._loading=!1}}}async _delete(){if(!(!this.hass||!this.asset||!this._impact||this._deleting)){this._deleting=!0,this._error=null;try{await f(this.hass).deleteAssetWithDependencies(this.asset.id),await Promise.allSettled([this.refreshBindingData?.(),this.refreshTopologyData?.(),this.refreshAssets?.()]),this.dispatchEvent(new CustomEvent("asset-deleted",{detail:this.asset.id,bubbles:!0,composed:!0}))}catch(t){this._error=y(t,this.t("delete.error")).message,this._deleting=!1}}}render(){if(!this.asset)return d;let t=this._impact,e=t?.relations?.length??0,s=t?.owned_bindings?.length??0,r=t?.dependent_bindings?.length??0;return a`<div class="danger">
      <h3>${this.t("delete.title")}</h3>
      ${t?a`<p>${this.t("delete.impact",{relations:e,bindings:s,dependent:r})}</p>
            <p class="muted">${this.t("delete.hardware_safe")}</p>
            ${t.logical_entity_id?a`<p class="warning">${this.t("delete.logical_warning",{entity_id:t.logical_entity_id})}</p>`:d}
            <div class="actions">
              <button class="secondary" ?disabled=${this._deleting} @click=${()=>this._impact=null}>
                ${this.t("common.cancel")}
              </button>
              <button class="danger-button" ?disabled=${this._deleting} @click=${this._delete}>
                ${this._deleting?this.t("delete.deleting"):this.t("delete.confirm")}
              </button>
            </div>`:a`<p class="muted">${this.t("delete.prepare_body")}</p>
            <div class="actions">
              <button class="danger-button" ?disabled=${this._loading} @click=${this._prepare}>
                ${this._loading?this.t("delete.loading"):this.t("delete.prepare")}
              </button>
            </div>`}
      ${this._error?a`<div class="error" role="alert">${this._error}</div>`:d}
    </div>`}};h(Z,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},refreshAssets:{attribute:!1},_impact:{state:!0},_loading:{state:!0},_deleting:{state:!0},_error:{state:!0}}),h(Z,"styles",g`
    :host { display:block; }
    .danger { padding:14px; border:1px solid var(--error-color, #db4437); border-radius:10px; }
    .danger h3 { margin:0 0 8px; color:var(--error-color, #db4437); font-size:17px; font-weight:500; }
    .danger p { margin:8px 0 0; line-height:1.45; }
    .muted { color:var(--secondary-text-color); }
    .warning { padding:10px 12px; background:var(--secondary-background-color); border-left:3px solid var(--warning-color, #f9a825); overflow-wrap:anywhere; }
    .actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }
    button { min-height:40px; padding:0 14px; border-radius:8px; font:inherit; font-weight:500; }
    .danger-button { border:1px solid var(--error-color, #db4437); background:var(--error-color, #db4437); color:#fff; }
    .secondary { border:1px solid var(--divider-color); background:var(--card-background-color); color:var(--primary-text-color); }
    button:disabled { opacity:.55; cursor:not-allowed; }
    .error { margin-top:10px; color:var(--error-color, #db4437); }
  `);_("bindhome-asset-delete-control",Z);var ms="light",ni="on_off",li="primary",tt=class extends m{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.registry={},this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.readOnly=!1,this.refreshBindingData=null,this._entityRegistrySnapshot=[],this._committedRepresentation=null,this._removed=!1,this._busy=!1,this._confirmRemove=!1,this._error=null,this._syncWarning=null,this._identity=null}willUpdate(t){t.has("entityRegistry")&&(this._entityRegistrySnapshot=this.entityRegistry??[]),this.asset?.id!==this._identity&&(this._identity=this.asset?.id??null,this._committedRepresentation=null,this._removed=!1,this._busy=!1,this._confirmRemove=!1,this._error=null,this._syncWarning=null)}_persistedRepresentation(){return this.asset?(this.registry?.representations??[]).find(t=>t.asset_id===this.asset.id)??null:null}_representation(){return this._removed?null:this._committedRepresentation??this._persistedRepresentation()}_requiredStatus(){return this.asset?(this.bindingStatuses?.records??[]).find(t=>t.asset_id===this.asset.id&&t.capability===ni&&t.role===li)??null:null}_hasRequiredBinding(){let t=this._requiredStatus();return!!(t&&t.status!=="binding_not_found"&&(t.binding||t.entity_id))}_logicalEntityId(){if(!this.asset||!this._representation())return null;let t=`bindhome_${this.asset.id}`;return this._entityRegistrySnapshot.find(e=>e.platform==="bindhome"&&e.unique_id===t&&e.entity_id?.startsWith("light."))?.entity_id??null}_backingEntityId(){let t=this._requiredStatus();return t?.binding?.entity_id??t?.entity_id??null}_isBackingLight(){return this._backingEntityId()?.startsWith("light.")??!1}async _refreshEntityRegistry(){this.hass&&(this._entityRegistrySnapshot=await Dt(this.hass).listEntityRegistry())}async _refreshAfterMutation(){let t=[this._refreshEntityRegistry()];this.refreshBindingData&&t.push(Promise.resolve(this.refreshBindingData())),(await Promise.allSettled(t)).some(s=>s.status==="rejected")?this._syncWarning=this.t("representation.sync_warning"):this._syncWarning=null}async _createRepresentation(){if(!this.hass||!this.asset||!this._hasRequiredBinding()||this._busy)return;let t=this.asset.id;this._busy=!0,this._error=null,this._syncWarning=null;try{let e=await f(this.hass).setRepresentation({assetId:t,platform:ms});if(this.asset?.id!==t)return;this._committedRepresentation=e?.representation??{asset_id:t,platform:ms},this._removed=!1,await this._refreshAfterMutation()}catch(e){this.asset?.id===t&&(this._error=e instanceof Error?e.message:String(e))}finally{this.asset?.id===t&&(this._busy=!1)}}async _removeRepresentation(){if(!this.hass||!this.asset||!this._representation()||this._busy||!this._confirmRemove)return;let t=this.asset.id;this._busy=!0,this._error=null,this._syncWarning=null;try{if(await f(this.hass).deleteRepresentation(t),this.asset?.id!==t)return;this._removed=!0,this._committedRepresentation=null,this._confirmRemove=!1,await this._refreshAfterMutation()}catch(e){this.asset?.id===t&&(this._error=e instanceof Error?e.message:String(e))}finally{this.asset?.id===t&&(this._busy=!1)}}render(){if(!this.asset)return d;let t=this._representation(),e=this._requiredStatus(),s=this._hasRequiredBinding(),r=this._logicalEntityId();return a`<div class="box">
      <h4>${this.t("representation.title")}</h4>
      ${t?a`
            <p>${this.t("representation.exposed_as",{platform:t.platform})}</p>
            <p class=${r?"logical":"muted"}>${r??this.t("representation.entity_pending",{name:this.asset.name})}</p>
          `:a`<p class="muted">${this.t("representation.not_exposed")}</p>`}

      <div class="contract">
        <strong>${this.t("representation.contract_title")}</strong>
        <p>${this.t("representation.contract_light")}</p>
        ${e?.status==="entity_not_found"?a`<p class="warning">${this.t("representation.stale_binding_warning")}</p>`:s&&!this._isBackingLight()?a`<p class="warning">${this.t("representation.onoff_only_warning")}</p>`:s?a`<p class="muted">${this.t("representation.light_fidelity")}</p>`:a`<p class="warning">${this.t("representation.binding_required")}</p>`}
      </div>

      ${this.readOnly?d:t?a`<div class="actions">
              ${this._confirmRemove?a`
                    <button class="danger" ?disabled=${this._busy} @click=${this._removeRepresentation}>${this.t("representation.confirm_remove")}</button>
                    <button class="secondary" ?disabled=${this._busy} @click=${()=>this._confirmRemove=!1}>${this.t("common.cancel")}</button>
                  `:a`<button class="secondary" ?disabled=${this._busy} @click=${()=>this._confirmRemove=!0}>${this.t("representation.remove")}</button>`}
            </div>`:a`<div class="actions">
              <button class="primary" ?disabled=${this._busy||!s} @click=${this._createRepresentation}>${this.t("representation.create")}</button>
            </div>`}

      ${this._syncWarning?a`<p class="warning" role="status">${this._syncWarning}</p>`:d}
      ${this._error?a`<p class="error" role="alert">${this.t("representation.write_error",{error:this._error})}</p>`:d}
    </div>`}};h(tt,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},registry:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},readOnly:{type:Boolean,attribute:!1},refreshBindingData:{attribute:!1},_entityRegistrySnapshot:{state:!0},_committedRepresentation:{state:!0},_removed:{state:!0},_busy:{state:!0},_confirmRemove:{state:!0},_error:{state:!0},_syncWarning:{state:!0}}),h(tt,"styles",g`
    :host { display: block; }
    .box { padding: 14px; border-radius: 8px; background: var(--secondary-background-color); }
    h4 { margin: 0 0 7px; font-size: 15px; font-weight: 500; }
    p { margin: 6px 0 0; line-height: 1.45; }
    .muted { color: var(--secondary-text-color); }
    .logical { overflow-wrap: anywhere; font-family: var(--code-font-family, monospace); }
    .contract { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--divider-color); }
    .warning { color: var(--warning-color); }
    .error { color: var(--error-color); }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    button { min-height: 40px; }
    @media (max-width: 600px) { .actions button { flex: 1 1 100%; } }
  `);_("bindhome-representation-manager",tt);var et=class extends m{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.assets=[],this.areas=[],this.floors=[],this.registry={},this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this.advancedEnabled=!1,this.readOnly=!1,this.refreshBindingData=null,this.refreshTopologyData=null,this.refreshAssets=null,this._action=null,this._sync=null,this._editingAsset=!1,this._identity=null}willUpdate(){this.asset?.id!==this._identity&&(this._identity=this.asset?.id,this._action=null,this._sync=null,this._editingAsset=!1)}_area(){return this.areas.find(t=>t.area_id===this.asset?.area_id)??null}_asset(t){return this.assets.find(e=>e.id===t)??null}_relations(){let t=M(this.registry?.relations??[],this.asset?.id);return[...t.incoming.map(e=>({relation:e,direction:"incoming",other:this._asset(e.source_asset_id)})),...t.outgoing.map(e=>({relation:e,direction:"outgoing",other:this._asset(e.target_asset_id)}))]}_devices(){let t=this.asset?.capabilities??[],e=(this.bindingStatuses?.records??[]).filter(o=>o.asset_id===this.asset?.id&&o.role==="primary"&&!!(o.binding||o.entity_id)).map(o=>({capability:o.capability,status:o})),s=e.length?e:t.length?[{capability:t[0],status:null}]:[],r=new Set;return s.filter(({capability:o,status:n})=>{let c=n?.binding?.entity_id??n?.entity_id,l=this.entityRegistry.find(b=>b.entity_id===c)?.device_id,u=l?`device:${l}`:c?`entity:${c}`:`capability:${o}`;return r.has(u)?!1:(r.add(u),!0)})}_forwardDeleted(t){t.stopPropagation(),this.dispatchEvent(new CustomEvent("asset-deleted",{detail:t.detail,bubbles:!0,composed:!0}))}render(){if(!this.asset)return d;if(this._editingAsset)return a`<bindhome-human-asset-editor
      .hass=${this.hass} .t=${this.t} .asset=${this.asset} .areas=${this.areas}
      .refreshAssets=${this.refreshAssets}
      @cancel=${()=>this._editingAsset=!1}
      @done=${()=>this._editingAsset=!1}
      @sync-warning=${c=>this._sync=c.detail}
    ></bindhome-human-asset-editor>`;let t=k(this.t,this.asset.asset_type),e=this._area(),s=this._relations(),r=this._devices(),o=(this.registry.representations??[]).filter(c=>c.asset_id===this.asset.id),n=ls(this.asset.asset_type);return a`<button class="back text-button" @click=${()=>this.dispatchEvent(new CustomEvent("back",{bubbles:!0,composed:!0}))}>
        <ha-icon icon="mdi:arrow-left"></ha-icon>${this.t("home.back_room")}
      </button>
      <article class="card surface">
        <header class="header">
          <div class="hero-icon"><ha-icon icon=${t.icon}></ha-icon></div>
          <div class="grow">
            <h2>${this.asset.name}</h2>
            <p class="location">${e?.name??(this.asset.area_id?this.t("home.stale_area"):this.t("home.unassigned"))}</p>
            <p class="type"><ha-icon icon=${t.icon}></ha-icon>${t.label}</p>
          </div>
          ${this.readOnly?d:a`<button class="text-button" @click=${()=>this._editingAsset=!0}>${this.t("common.edit")}</button>`}
        </header>
        <section class="section">
          <h3>${this.t("detail.connections")}</h3>
          ${s.length?a`<div class="relations">${s.map(({relation:c,direction:l,other:u})=>{let b=ns(this.t,c.relation_type,l);return a`<div class="relation"><ha-icon icon=${b.icon}></ha-icon><div><small>${b.label}</small>${u?a`<button @click=${()=>this.dispatchEvent(new CustomEvent("navigate-asset",{detail:u.id,bubbles:!0,composed:!0}))}>${u.name}</button>`:a`<strong>${this.t("detail.missing_element")}</strong>`}</div></div>`})}</div>`:a`<p class="passive">${this.t("detail.no_connections")}</p>`}
          ${!this.readOnly&&n.length?a`<div class="actions">${n.map(c=>a`<button class="secondary" ?disabled=${!!this._action} @click=${()=>this._action=c}>${this.t(c.labelKey)}</button>`)}</div>`:d}
          ${!this.readOnly&&this._action?a`<bindhome-contextual-relation-editor .hass=${this.hass} .t=${this.t} .asset=${this.asset} .assets=${this.assets} .areas=${this.areas} .action=${this._action} .onRefresh=${this.refreshTopologyData} @cancel=${()=>this._action=null} @done=${()=>this._action=null} @sync-warning=${c=>this._sync=c.detail}></bindhome-contextual-relation-editor>`:d}
          ${this._sync?a`<div class="error" role="alert">${this._sync}</div>`:d}
        </section>
        <section class="section">
          <h3>${this.t(this.asset.asset_type==="radiator"?"detail.control":"detail.device")}</h3>
          ${r.length?r.map(c=>a`<div class="device">${this.readOnly?a`<strong>${c.capability}</strong><p class="raw">${c.status?.entity_id||this.t("common.not_set")}</p>${c.status?.status?a`<p class="passive">${c.status.status}</p>`:d}`:a`<bindhome-primary-connection-editor .hass=${this.hass} .t=${this.t} .asset=${this.asset} .capability=${c.capability} .status=${c.status} .areas=${this.areas} .entityRegistry=${this.entityRegistry} .deviceRegistry=${this.deviceRegistry} .refreshBindingData=${this.refreshBindingData} .showEntityId=${!1}></bindhome-primary-connection-editor>`}</div>`):a`<p class="passive">${this.t("detail.passive")}</p>`}
        </section>
        <section class="section">
          <h3>${this.t("representation.section_title")}</h3>
          <bindhome-representation-manager
            .hass=${this.hass}
            .t=${this.t}
            .asset=${this.asset}
            .registry=${this.registry}
            .bindingStatuses=${this.bindingStatuses}
            .entityRegistry=${this.entityRegistry}
            .readOnly=${this.readOnly}
            .refreshBindingData=${this.refreshBindingData}
          ></bindhome-representation-manager>
        </section>
        <section class="section">
          <details>
            <summary><ha-icon icon="mdi:code-tags"></ha-icon>${this.t("detail.technical")}</summary>
            <dl>
              <dt>${this.t("fields.asset_type")}</dt><dd class="raw">${this.asset.asset_type}</dd>
              <dt>${this.t("detail.asset_id")}</dt><dd class="raw">${this.asset.id}</dd>
              <dt>${this.t("fields.code")}</dt><dd>${this.asset.code||this.t("common.not_set")}</dd>
              <dt>${this.t("fields.capabilities")}</dt><dd class="raw">${this.asset.capabilities?.join(", ")||this.t("common.none")}</dd>
              <dt>${this.t("detail.representations")}</dt><dd class="raw">${o.length?o.map(c=>c.platform).join(", "):this.t("common.none")}</dd>
            </dl>
            ${!this.readOnly&&this.advancedEnabled?a`<button class="secondary open-advanced" @click=${()=>this.dispatchEvent(new CustomEvent("open-advanced",{detail:this.asset.id,bubbles:!0,composed:!0}))}>${this.t("detail.open_advanced")}</button>`:d}
          </details>
        </section>
        ${this.readOnly?d:a`<section class="section">
              <bindhome-asset-delete-control
                .hass=${this.hass}
                .t=${this.t}
                .asset=${this.asset}
                .refreshBindingData=${this.refreshBindingData}
                .refreshTopologyData=${this.refreshTopologyData}
                .refreshAssets=${this.refreshAssets}
                @asset-deleted=${this._forwardDeleted}
              ></bindhome-asset-delete-control>
            </section>`}
      </article>`}};h(et,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},floors:{attribute:!1},registry:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},advancedEnabled:{type:Boolean,attribute:!1},readOnly:{type:Boolean,attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},refreshAssets:{attribute:!1},_action:{state:!0},_sync:{state:!0},_editingAsset:{state:!0}}),h(et,"styles",[$,g`
      :host { display: block; min-width: 0; }
      .back { display: inline-flex; align-items: center; gap: 6px; padding: 0; }
      .card { margin-top: 8px; }
      .header { display: flex; gap: 14px; align-items: flex-start; padding: 20px; border-bottom: 1px solid var(--divider-color); }
      .hero-icon { display: grid; place-items: center; flex: none; width: 52px; height: 52px; border-radius: 12px; color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 12%, transparent); --mdc-icon-size: 30px; }
      .grow { min-width: 0; flex: 1; }
      .header h2 { overflow-wrap: anywhere; font-size: 23px; line-height: 30px; font-weight: 500; }
      .location { margin-top: 3px; color: var(--secondary-text-color); }
      .type { display: flex; align-items: center; gap: 7px; margin-top: 10px; }
      .section { padding: 18px 20px; border-bottom: 1px solid var(--divider-color); }
      .section:last-child { border-bottom: 0; }
      .section h3 { margin-bottom: 12px; font-size: 17px; font-weight: 500; }
      .relations { display: grid; gap: 8px; }
      .relation { display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 10px; align-items: start; padding: 10px 0; }
      .relation ha-icon { color: var(--primary-color); }
      .relation button { display: block; padding: 0; border: 0; background: transparent; text-align: left; font-weight: 500; }
      .relation small { display: block; margin-top: 2px; color: var(--secondary-text-color); }
      .device { padding: 14px; border-radius: 8px; background: var(--secondary-background-color); }
      .passive { color: var(--secondary-text-color); line-height: 1.45; }
      .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
      details { overflow: hidden; }
      summary { min-height: 52px; display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 500; }
      dl { display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 10px 16px; padding-bottom: 16px; }
      dt { color: var(--secondary-text-color); }
      dd { overflow-wrap: anywhere; }
      .raw { font-family: var(--code-font-family, monospace); font-size: 12px; }
      @media (max-width: 600px) {
        .header { display: grid; grid-template-columns: 46px minmax(0, 1fr); padding: 16px 14px; }
        .header > .text-button { grid-column: 2; justify-self: start; padding: 0; }
        .section { padding: 16px 14px; }
        .hero-icon { width: 46px; height: 46px; }
        .header h2 { font-size: 21px; line-height: 27px; }
        dl { grid-template-columns: 1fr; gap: 3px; }
        dd { margin-bottom: 8px; }
      }
    `]);_("bindhome-element-detail",et);var st=class extends m{constructor(){super(),this.hass=null,this.t=t=>t,this.floors=[],this.areas=[],this.assets=[],this.registry={},this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this.advancedEnabled=!1,this.readOnly=!1,this.refreshBindingData=null,this.refreshTopologyData=null,this.refreshAssets=null,this.selectedAssetId=null,this.selectedAreaId=null,this._collapsedFloorIds=new Set,this._collapsedPreferenceIdentity=null,this._collapsedPreferenceGeneration=0}updated(t){t.has("hass")&&this._restoreCollapsedFloors()}_legacyCollapsedPreferenceKey(){return`bindhome.home-collapsed-floors.${this.hass?.user?.id??"browser"}`}async _restoreCollapsedFloors(){let t=this.hass?.user?.id??"browser";if(t===this._collapsedPreferenceIdentity)return;this._collapsedPreferenceIdentity=t;let e=++this._collapsedPreferenceGeneration,s=await es(this.hass,ae,this._legacyCollapsedPreferenceKey());e!==this._collapsedPreferenceGeneration||t!==this._collapsedPreferenceIdentity||(this._collapsedFloorIds=new Set(s))}_persistCollapsedFloors(){this._collapsedPreferenceIdentity=this.hass?.user?.id??"browser",this._collapsedPreferenceGeneration+=1,C(this.hass,ae,[...this._collapsedFloorIds].sort())}_areaAssets(t){return t===A?this.assets.filter(e=>!e.area_id):t===I?this.assets.filter(e=>e.area_id&&!this.areas.some(s=>s.area_id===e.area_id)):this.assets.filter(e=>e.area_id===t)}_selectArea(t){this.dispatchEvent(new CustomEvent("home-navigate",{detail:{areaId:t,assetId:null},bubbles:!0,composed:!0}))}_selectAsset(t){let e=this.assets.find(r=>r.id===t);if(!e)return;let s=e.area_id?this.areas.some(r=>r.area_id===e.area_id)?e.area_id:I:A;this.dispatchEvent(new CustomEvent("home-navigate",{detail:{areaId:s,assetId:t},bubbles:!0,composed:!0}))}_toggleFloor(t){let e=new Set(this._collapsedFloorIds);e.has(t)?e.delete(t):e.add(t),this._collapsedFloorIds=e,this._persistCollapsedFloors()}_floorIcon(t){return t.icon?t.icon:t.level===-1?"mdi:home-floor-negative-1":Number.isInteger(t.level)&&t.level>=0&&t.level<=3?`mdi:home-floor-${t.level}`:"mdi:floor-plan"}_roomCountLabel(t){return this.t(t===1?"home.room_count_one":"home.room_count_other",{count:t})}_selectedArea(){return this.areas.find(t=>t.area_id===this.selectedAreaId)??null}_areaName(){return this.selectedAreaId===A?this.t("home.unassigned"):this.selectedAreaId===I?this.t("home.stale_area"):this._selectedArea()?.name??this.t("home.choose_room")}_areaIcon(){return this.selectedAreaId===A?"mdi:map-marker-off-outline":this.selectedAreaId===I?"mdi:map-marker-alert-outline":this._selectedArea()?.icon||"mdi:floor-plan"}_addInSelectedArea(){!this.selectedAreaId||[A,I].includes(this.selectedAreaId)||this.dispatchEvent(new CustomEvent("add-in-area",{detail:this.selectedAreaId,bubbles:!0,composed:!0}))}_renderTree(){let t=ss(this.floors,this.areas,this.assets);return a`<section
      class="tree surface ${this.selectedAreaId||this.selectedAssetId?"hidden-mobile":""}"
      aria-label=${this.t("home.navigation_label")}
    >
      ${t.groups.map(e=>{let s=this._collapsedFloorIds.has(e.id);return a`<div>
          <button class="floor-title" aria-expanded=${!s} @click=${()=>this._toggleFloor(e.id)}>
            <ha-icon icon=${this._floorIcon(e)}></ha-icon>
            <span class="grow">${e.name??this.t("common.no_floor")}</span>
            <span class="count">${this._roomCountLabel(e.areas.length)}</span>
            <ha-icon class="collapse-icon" icon=${s?"mdi:chevron-down":"mdi:chevron-up"}></ha-icon>
          </button>
          ${s?d:e.areas.map(r=>{let o=t.assetsByArea.get(r.area_id)?.length??0,n=this.selectedAreaId===r.area_id;return a`<button
                  class="area-row ${n?"selected":""}"
                  aria-current=${n?"location":"false"}
                  aria-pressed=${n?"true":"false"}
                  @click=${()=>this._selectArea(r.area_id)}
                >
                  <ha-icon icon=${r.icon||"mdi:floor-plan"}></ha-icon>
                  <span class="grow">${r.name}</span>
                  <span class="count">${o}</span>
                  <ha-icon icon="mdi:chevron-right"></ha-icon>
                </button>`})}
        </div>`})}
      ${t.unassigned.length||t.stale.length?a`<div class="specials">
            ${t.unassigned.length?a`<button class="area-row special ${this.selectedAreaId===A?"selected":""}" aria-current=${this.selectedAreaId===A?"location":"false"} @click=${()=>this._selectArea(A)}>
                  <ha-icon icon="mdi:map-marker-off-outline"></ha-icon><span class="grow">${this.t("home.unassigned")}</span><span class="count">${t.unassigned.length}</span>
                </button>`:d}
            ${t.stale.length?a`<button class="area-row special ${this.selectedAreaId===I?"selected":""}" aria-current=${this.selectedAreaId===I?"location":"false"} @click=${()=>this._selectArea(I)}>
                  <ha-icon icon="mdi:map-marker-alert-outline"></ha-icon><span class="grow">${this.t("home.stale_area")}</span><span class="count">${t.stale.length}</span>
                </button>`:d}
          </div>`:d}
    </section>`}_renderRoom(){if(!this.selectedAreaId)return a`<div class="empty room">${this.t("home.choose_room")}</div>`;let t=this._areaAssets(this.selectedAreaId),e=is(this.t,t),s=!this.readOnly&&![A,I].includes(this.selectedAreaId);return a`<section class="room surface ${this.selectedAssetId?"hidden-mobile":""}">
      <button class="back text-button" @click=${()=>this._selectArea(null)}><ha-icon icon="mdi:arrow-left"></ha-icon>${this.t("home.back_floors")}</button>
      <header class="room-head">
        <ha-icon icon=${this._areaIcon()}></ha-icon>
        <div class="grow"><h2>${this._areaName()}</h2><span class="muted">${this.t("home.element_count",{count:t.length})}</span></div>
        ${s?a`<button class="primary" @click=${this._addInSelectedArea}>
              <ha-icon icon="mdi:plus"></ha-icon><span>${this.t("home.add_element")}</span>
            </button>`:d}
      </header>
      ${e.length?e.map(r=>{let o=Lt(this.t,r.category);return a`<section>
              <div class="category-title"><ha-icon icon=${o.icon}></ha-icon><span class="grow">${o.label}</span><span class="count">${r.assets.length}</span></div>
              ${r.assets.map(n=>{let c=k(this.t,n.asset_type);return a`<button class="asset-row" @click=${()=>this._selectAsset(n.id)}>
                  <ha-icon icon=${c.icon}></ha-icon><span class="grow"><strong>${n.name}</strong><span class="asset-meta">${c.label}</span></span><ha-icon icon="mdi:chevron-right"></ha-icon>
                </button>`})}
            </section>`}):a`<div class="empty empty-room">
            <span>${this.t("home.room_empty")}</span>
            ${s?a`<button class="primary" @click=${this._addInSelectedArea}><ha-icon icon="mdi:plus"></ha-icon>${this.t("home.add_first_element")}</button>`:d}
          </div>`}
    </section>`}render(){let t=this.assets.find(e=>e.id===this.selectedAssetId);return a`<div class="page">
      <h1 class="page-title">${this.t("nav.home")}</h1>
      <p class="intro muted">${this.t("home.intro")}</p>
      <div class="layout">
        ${this._renderTree()}
        <div class="room ${t?"hidden-mobile":""}">${this._renderRoom()}</div>
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
              .advancedEnabled=${this.advancedEnabled}
              .readOnly=${this.readOnly}
              .refreshBindingData=${this.refreshBindingData}
              .refreshTopologyData=${this.refreshTopologyData}
              .refreshAssets=${this.refreshAssets}
              @back=${()=>this.dispatchEvent(new CustomEvent("home-navigate",{detail:{areaId:this.selectedAreaId,assetId:null},bubbles:!0,composed:!0}))}
              @navigate-asset=${e=>this._selectAsset(e.detail)}
              @asset-deleted=${()=>this._selectArea(this.selectedAreaId)}
            ></bindhome-element-detail>`:d}
      </div>
    </div>`}};h(st,"properties",{hass:{attribute:!1},t:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},registry:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},advancedEnabled:{type:Boolean,attribute:!1},readOnly:{type:Boolean,attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},refreshAssets:{attribute:!1},selectedAssetId:{attribute:!1},selectedAreaId:{attribute:!1},_collapsedFloorIds:{state:!0}}),h(st,"styles",[$,g`
      .layout { display: grid; grid-template-columns: minmax(260px, 360px) minmax(0, 1fr); gap: 18px; margin-top: 22px; align-items: start; }
      .floor-title, .area-row, .category-title, .asset-row { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 52px; padding: 8px 14px; border: 0; border-bottom: 1px solid var(--divider-color); background: transparent; text-align: left; }
      .floor-title { font:inherit; color:inherit; font-weight: 500; background: var(--secondary-background-color); cursor:pointer; }
      .floor-title ha-icon, .category-title ha-icon { color: var(--primary-color); }
      .floor-title .collapse-icon { color:var(--secondary-text-color); }
      .area-row:hover, .asset-row:hover { background: var(--secondary-background-color); }
      .area-row.selected { border-left: 3px solid var(--primary-color); background: var(--secondary-background-color); font-weight: 500; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary-color) 18%, transparent); }
      .grow { min-width: 0; flex: 1; overflow-wrap: anywhere; }
      .count { color: var(--secondary-text-color); font-size: 12px; white-space: nowrap; }
      .room-head { display: flex; align-items: center; gap: 14px; padding: 16px; border-bottom: 1px solid var(--divider-color); }
      .room-head > ha-icon { color: var(--primary-color); --mdc-icon-size: 30px; }
      .room-head .primary { margin-left: auto; display: flex; align-items: center; gap: 8px; }
      .room-head .primary ha-icon { color: var(--text-primary-color, #fff); }
      .category-title { font-weight: 500; }
      .asset-row { padding-left: 30px; }
      .asset-row ha-icon { color: var(--secondary-text-color); }
      .asset-meta { display: block; margin-top: 2px; color: var(--secondary-text-color); font-size: 12px; }
      .specials { margin-top: 16px; }
      .special { border-bottom: 1px solid var(--divider-color); }
      .special:last-child { border-bottom: 0; }
      .detail { min-width: 0; }
      .back { display: none; }
      .intro { margin-top: 4px; }
      .layout > .room.hidden-mobile { display: none; }
      .empty-room { display: grid; justify-items: center; gap: 12px; }
      .empty-room .primary { min-height: 42px; display: inline-flex; align-items: center; gap: 8px; }
      @media (max-width: 760px) {
        .layout { display: block; }
        .tree.hidden-mobile, .room.hidden-mobile { display: none; }
        .detail .back, .room .back { display: inline-flex; margin-bottom: 8px; }
        .page { padding-top: 18px; }
        .room-head { align-items: flex-start; }
        .room-head .primary { padding: 0 12px; }
        .room-head .primary span { display: none; }
      }
    `]);_("bindhome-home-view",st);var di=["light_point","socket","circuit","tap","shutoff_valve","window","door","appliance"];function gs(i,t,e=""){let s=e.trim().toLocaleLowerCase(),r=t.map(n=>({preset:n,name:S(i,n),presentation:k(i,n.asset_type)})).filter(({preset:n,name:c})=>!s||[c,n.asset_type].some(l=>l.toLocaleLowerCase().includes(s))).sort((n,c)=>n.name.localeCompare(c.name,void 0,{sensitivity:"base",numeric:!0})),o=new Map;for(let n of r){let c=n.presentation.category;o.has(c)||o.set(c,[]),o.get(c).push(n)}return{featured:s?[]:di.map(n=>r.find(({preset:c})=>c.preset_id===n)).filter(Boolean),groups:Nt.filter(n=>o.has(n)).map(n=>({category:n,items:o.get(n)})),count:r.length}}function ci(i,t){return{key:`draft:${i.preset_id}:${t}`,presetId:i.preset_id,name:`${i.default_name} ${t}`,asset_type:i.asset_type,code:null,capabilities:[...i.suggested_capabilities??[]]}}function it(i=[]){return{presetOrder:i.map(t=>t.preset_id),presets:new Map(i.map(t=>[t.preset_id,t])),quantities:new Map(i.map(t=>[t.preset_id,0])),retained:new Map(i.map(t=>[t.preset_id,[]]))}}function _s(i,t,e){let s=i.presets.get(t);if(!s)return i;let r=Math.max(0,Math.floor(Number(e)||0)),o=[...i.retained.get(t)??[]];for(;o.length<r;)o.push(ci(s,o.length+1));return{...i,quantities:new Map(i.quantities).set(t,r),retained:new Map(i.retained).set(t,o)}}function fs(i,t,e){let s=new Map(i.retained);for(let[r,o]of s){let n=o.findIndex(l=>l.key===t);if(n===-1)continue;let c=[...o];c[n]={...c[n],...e},s.set(r,c);break}return{...i,retained:s}}function ye(i){return i.presetOrder.flatMap(t=>{let e=i.quantities.get(t)??0;return(i.retained.get(t)??[]).slice(0,e)})}function bs(i,t){return ye(i).map(e=>{let s={name:e.name,asset_type:e.asset_type,area_id:t,capabilities:[...e.capabilities]};return e.code?.trim()&&(s.code=e.code.trim()),s})}function ys(i,t){return(i??[]).filter(e=>e.area_id===t)}function vs(i,t){let e=new Map(t.map(r=>[r.asset_type,r.group])),s=new Map;for(let r of i){let o=e.get(r.asset_type)??"other",n=s.get(o)??[];n.push(r),s.set(o,n)}return s}var Tt=class{constructor(t,e=null){this.api=t,this.fallbackMessage=e,this.saving=!1}async save(t,e){if(this.saving)return{ok:!1,duplicate:!0};this.saving=!0;let s=bs(t,e),r;try{r=await this.api.createAssetsBulk(s)}catch(o){return this.saving=!1,{ok:!1,duplicate:!1,error:cs(o,this.fallbackMessage)}}try{let o=await this.api.listAssets();return{ok:!0,created:r.assets??[],assets:o,payload:s,refreshError:null}}catch(o){return{ok:!0,created:r.assets??[],assets:null,payload:s,refreshError:o}}finally{this.saving=!1}}};var rt=class extends m{constructor(){super(),this.hass=null,this.presets=[],this.t=t=>t,this.floors=[],this.areas=[],this.assets=[],this._step="select",this._floorId="",this._areaId="",this._draftState=it(),this._openGroups=new Set,this._openDrafts=new Set,this._saveError=null,this._saving=!1,this._success=null,this._confirmRoomChange=!1,this._controller=null}willUpdate(t){(t.has("presets")||t.has("t"))&&this.presets.length&&this._activeDrafts.length===0&&(this._draftState=it(this._localizedPresets()),this._openGroups=new Set([this.presets[0].group])),(t.has("hass")||t.has("t"))&&this.hass&&(this._controller=new Tt(f(this.hass),this.t("errors.batch_fallback")))}get _selectedArea(){return this.areas.find(t=>t.area_id===this._areaId)}get _selectedFloor(){return this._floorId===Pt?null:this.floors.find(t=>t.floor_id===this._floorId)}get _areaAssets(){return ys(this.assets,this._areaId)}get _activeDrafts(){return ye(this._draftState)}_localizedPresets(){return this.presets.map(t=>({...t,default_name:S(this.t,t)}))}_groupLabel(t){return this.t(`groups.${t}`)===`groups.${t}`?t:this.t(`groups.${t}`)}_count(t,e){return this.t(Bt(t,e),{count:e})}_selectFloor(t){this._floorId=t.target.value,se(this.areas,this._floorId).some(s=>s.area_id===this._areaId)||(this._areaId="")}_continue(){this._areaId&&(this._step="quantity")}_changeQuantity(t,e){if(this._saving)return;let s=this._draftState.quantities.get(t)??0;this._draftState=_s(this._draftState,t,s+e),this._saveError=null}_toggleGroup(t){let e=new Set(this._openGroups);e.has(t)?e.delete(t):e.add(t),this._openGroups=e}_toggleDraft(t){let e=new Set(this._openDrafts);e.has(t)?e.delete(t):e.add(t),this._openDrafts=e}_updateDraft(t,e){if(this._saving)return;let s=Object.keys(e),r=this._activeDrafts.findIndex(o=>o.key===t);this._draftState=fs(this._draftState,t,e),(!this._saveError?.structured||this._saveError.index===r&&s.includes(this._saveError.field))&&(this._saveError=null)}_removeCapability(t,e){this._updateDraft(t.key,{capabilities:t.capabilities.filter(s=>s!==e)})}_addCapability(t,e){let s=e.value.trim();!s||t.capabilities.includes(s)||(this._updateDraft(t.key,{capabilities:[...t.capabilities,s]}),e.value="")}async _save(){if(this._saving||!this._controller||!this._activeDrafts.length)return;this._saving=!0,this._saveError=null;let t=await this._controller.save(this._draftState,this._areaId);if(this._saving=!1,t.duplicate)return;if(!t.ok){if(this._saveError=t.error,this._step="review",t.error.structured){let s=this._activeDrafts[t.error.index];if(s){this._openDrafts=new Set([...this._openDrafts,s.key]),await this.updateComplete;let r=this.renderRoot.querySelector(`#${CSS.escape(this._fieldId(s,t.error.field))}`)??this.renderRoot.querySelector(".alert");r?.classList.contains("alert")&&r.setAttribute("tabindex","-1"),r?.scrollIntoView({behavior:"smooth",block:"center"}),r instanceof HTMLElement&&r.focus({preventScroll:!0})}}return}let e=t.assets??[...this.assets,...t.created];this.assets=e,this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:e,bubbles:!0,composed:!0})),this._success={count:t.created.length,areaName:this._selectedArea?.name??this.t("inventory.selected_area")},this._draftState=it(this._localizedPresets()),this._openGroups=new Set([this.presets[0]?.group].filter(Boolean)),this._openDrafts=new Set,this._step="success"}_backToQuantities(){this._step="quantity"}_requestRoomChange(){if(this._activeDrafts.length){this._confirmRoomChange=!0;return}this._step="select"}_discardAndChangeRoom(){this._draftState=it(this._localizedPresets()),this._saveError=null,this._openDrafts=new Set,this._confirmRoomChange=!1,this._floorId="",this._areaId="",this._step="select"}_fieldId(t,e){return`${t.key.replaceAll(":","-")}-${e}`}_fieldError(t,e){return this._saveError?.structured&&this._saveError.index===t&&this._saveError.field===e}_renderContext(){return a`<div class="context"><div class="context-inner">
      <div class="context-values">
        <div class="context-item"><ha-icon icon="mdi:layers-outline"></ha-icon><span class="context-label">${this.t("common.floor")}</span><span class="context-value">${this._selectedFloor?.name??this.t("common.no_floor")}</span></div>
        <div class="context-item"><ha-icon icon="mdi:floor-plan"></ha-icon><span class="context-label">${this.t("common.area")}</span><span class="context-value">${this._selectedArea?.name}</span></div>
      </div>
      <button class="button text" @click=${this._requestRoomChange} ?disabled=${this._saving}>${this.t("inventory.change_room")}</button>
    </div></div>`}_renderSelection(){let t=[...this.floors,{floor_id:Pt,name:this.t("common.no_floor")}],e=se(this.areas,this._floorId);return a`<div class="content selection">
      <h1>${this.t("inventory.title")}</h1><p class="muted intro">${this.t("inventory.selection_intro")}</p>
      <div class="field-block"><label for="floor">${this.t("common.floor")}</label><select id="floor" .value=${this._floorId} @change=${this._selectFloor}><option value="">${this.t("inventory.select_floor")}</option>${t.map(s=>a`<option value=${s.floor_id}>${s.name}</option>`)}</select><p class="muted helper">${this.t("inventory.no_floor_helper")}</p></div>
      <div class="field-block"><label for="area">${this.t("common.area")}</label><select id="area" .value=${this._areaId} @change=${s=>this._areaId=s.target.value} ?disabled=${!this._floorId}><option value="">${this.t("inventory.select_area")}</option>${e.map(s=>a`<option value=${s.area_id}>${s.name}</option>`)}</select>${this._floorId&&!e.length?a`<p class="muted helper">${this.t("inventory.no_areas")}</p>`:d}</div>
      <div class="actions"><button class="button primary" @click=${this._continue} ?disabled=${!this._areaId}>${this.t("inventory.continue")}</button></div>
    </div>`}_renderExisting(){let t=vs(this._areaAssets,this.presets);return this._areaAssets.length?a`<div class="existing-summary">${[...t].map(([e,s])=>a`<div class="existing-group"><div class="existing-heading"><strong>${this._groupLabel(e)}</strong><span class="muted">${s.length}</span></div><ul class="existing-list">${s.map(r=>a`<li>${r.name}</li>`)}</ul></div>`)}</div>`:a`<p class="muted helper">${this.t("inventory.no_existing")}</p>`}_renderQuantity(){let t=new Map;for(let e of this.presets)t.set(e.group,[...t.get(e.group)??[],e]);return a`${this._renderContext()}${this._renderRoomChangeConfirmation()}<div class="content layout"><section><h1>${this.t("inventory.quantity_title")}</h1><p class="muted intro">${this.t("inventory.quantity_intro")}</p>
      <details class="mobile-existing"><summary><strong>${this.t("inventory.existing")}</strong><span class="muted">${this._areaAssets.length}</span></summary>${this._renderExisting()}</details>
      <div class="groups">${[...t].map(([e,s])=>{let r=s.reduce((n,c)=>n+(this._draftState.quantities.get(c.preset_id)??0),0),o=this._openGroups.has(e);return a`<section class="group"><button class="group-toggle" @click=${()=>this._toggleGroup(e)} aria-expanded=${o} aria-label=${this.t(o?"actions.collapse_group":"actions.expand_group",{group:this._groupLabel(e)})}><span class="group-title"><ha-icon icon=${o?"mdi:chevron-down":"mdi:chevron-right"}></ha-icon>${this._groupLabel(e)}</span><span class="muted">${this._count("counts.selected",r)}</span></button>${o?s.map(n=>{let c=this._draftState.quantities.get(n.preset_id)??0,l=S(this.t,n);return a`<div class="quantity-row"><div><div class="preset-name">${l}</div>${n.suggested_capabilities?.length?a`<div class="suggestions">${this.t("inventory.suggested",{capabilities:n.suggested_capabilities.join(", ")})}</div>`:d}</div><div class="stepper"><button aria-label=${this.t("actions.decrease_quantity",{name:l})} @click=${()=>this._changeQuantity(n.preset_id,-1)} ?disabled=${c===0||this._saving}><ha-icon icon="mdi:minus"></ha-icon></button><output aria-live="polite">${c}</output><button aria-label=${this.t("actions.increase_quantity",{name:l})} @click=${()=>this._changeQuantity(n.preset_id,1)} ?disabled=${this._saving}><ha-icon icon="mdi:plus"></ha-icon></button></div></div>`}):d}</section>`})}</div></section><aside class="rail"><h2>${this.t("inventory.existing")}</h2><p class="muted helper">${this.t("inventory.existing_unchanged")}</p>${this._renderExisting()}<div class="draft-count"><span class="muted">${this.t("inventory.being_added")}</span><strong>${this._count("counts.asset",this._activeDrafts.length)}</strong><p class="muted helper">${this.t("inventory.not_saved_yet")}</p></div></aside></div>${this._renderBottom("quantity")}`}_renderDraft(t,e){let s=this._openDrafts.has(t.key)||["name","asset_type","code","capabilities"].some(o=>this._fieldError(e,o)),r=this._saveError?.structured&&this._saveError.index===e;return a`<article class="draft-row ${r?"error":""}" data-draft-index=${e}><div class="draft-summary"><span class="draft-number">${e+1}</span><div class="draft-title"><strong>${t.name}</strong><span>${t.asset_type}</span></div><button class="draft-toggle" aria-label=${this.t(s?"actions.collapse_draft":"actions.edit_draft",{name:t.name})} aria-expanded=${s} @click=${()=>this._toggleDraft(t.key)}><ha-icon icon=${s?"mdi:chevron-up":"mdi:chevron-down"}></ha-icon></button></div>${s?a`<div class="draft-fields">
      ${this._renderInput(t,e,"name",this.t("fields.name"),t.name)}
      ${this._renderInput(t,e,"asset_type",this.t("fields.asset_type"),t.asset_type)}
      ${this._renderInput(t,e,"code",this.t("fields.code_optional"),t.code??"")}
      <div class="capabilities"><label>${this.t("fields.capabilities")}</label><div class="capability-list">${t.capabilities.length?t.capabilities.map(o=>a`<span class="capability">${o}<button aria-label=${this.t("actions.remove_capability",{capability:o})} @click=${()=>this._removeCapability(t,o)} ?disabled=${this._saving}><ha-icon icon="mdi:close"></ha-icon></button></span>`):a`<span class="muted helper">${this.t("fields.no_capabilities")}</span>`}</div><div class="add-capability"><label>${this.t("fields.custom_capability")}<input id=${this._fieldId(t,"capabilities")} placeholder=${this.t("fields.capability_placeholder")} aria-invalid=${this._fieldError(e,"capabilities")} aria-describedby=${this._fieldError(e,"capabilities")?`${this._fieldId(t,"capabilities")}-error`:d} @keydown=${o=>{o.key==="Enter"&&(o.preventDefault(),this._addCapability(t,o.target))}}></label><button class="button secondary" @click=${o=>this._addCapability(t,o.currentTarget.previousElementSibling.querySelector("input"))} ?disabled=${this._saving}>${this.t("common.add")}</button></div>${this._fieldError(e,"capabilities")?a`<p class="field-error" id=${`${this._fieldId(t,"capabilities")}-error`}>${this._saveError.message}</p>`:d}</div>
    </div>`:d}</article>`}_renderInput(t,e,s,r,o){let n=this._fieldError(e,s),c=this._fieldId(t,s);return a`<label for=${c}>${r}<input id=${c} .value=${o} aria-invalid=${n} aria-describedby=${n?`${c}-error`:d} @input=${l=>this._updateDraft(t.key,{[s]:s==="code"?l.target.value||null:l.target.value})} ?disabled=${this._saving}>${n?a`<span class="field-error" id=${`${c}-error`}>${this._saveError.message}</span>`:d}</label>`}_renderReview(){return a`${this._renderContext()}${this._renderRoomChangeConfirmation()}<div class="content">${this._saveError?a`<div class="alert" role="alert"><ha-icon icon="mdi:alert-circle-outline"></ha-icon><div><h3>${this.t("errors.nothing_saved")}</h3><p class="muted helper">${this._saveError.structured?this.t("errors.correct_field"):this._saveError.message||this.t("errors.batch_fallback")} ${this.t("errors.drafts_preserved")}</p></div></div>`:d}<div class="review-header"><div><h1>${this._count("review.title",this._activeDrafts.length)}</h1><p class="muted intro">${this.t("review.intro")}</p></div></div><section class="existing-review"><div class="section-heading"><div><h2>${this.t("review.registered")}</h2><p class="muted helper">${this.t("review.registered_helper")}</p></div><strong>${this._areaAssets.length}</strong></div></section><section class="drafts"><div class="section-heading"><div><h2>${this.t("inventory.being_added")}</h2><p class="muted helper">${this.t("review.atomic_batch")}</p></div><strong>${this._activeDrafts.length}</strong></div><div>${this._activeDrafts.map((t,e)=>this._renderDraft(t,e))}</div></section></div>${this._renderBottom("review")}`}_renderRoomChangeConfirmation(){return this._confirmRoomChange?a`<div class="content"><section class="alert" role="alertdialog" aria-labelledby="change-room-title" aria-describedby="change-room-description"><ha-icon icon="mdi:alert-outline"></ha-icon><div><h3 id="change-room-title">${this.t("discard.title")}</h3><p class="muted helper" id="change-room-description">${this.t("discard.description")}</p><div class="actions"><button class="button secondary" @click=${()=>this._confirmRoomChange=!1}>${this.t("discard.stay")}</button><button class="button primary" @click=${this._discardAndChangeRoom}>${this.t("discard.confirm")}</button></div></div></section></div>`:d}_renderBottom(t){let e=this._activeDrafts.length;return a`<div class="bottom-bar" aria-busy=${this._saving}><div class="bottom-inner"><p class="muted bottom-copy">${t==="review"?this._count("review.save_explanation",e):this._count("review.before_save",e)}</p>${t==="review"?a`<div><button class="button secondary" @click=${this._backToQuantities} ?disabled=${this._saving}>${this.t("review.back_quantities")}</button> <button class="button primary" @click=${this._save} ?disabled=${this._saving||!e}>${this._saving?this.t("review.saving"):this._count("review.save",e)}</button></div>`:a`<button class="button primary" @click=${()=>this._step="review"} ?disabled=${!e}>${this._count("review.review_items",e)}</button>`}</div></div>`}_renderSuccess(){return a`${this._renderContext()}<div class="content success"><div><ha-icon icon="mdi:check-circle-outline"></ha-icon><h1>${this._count("success.created",this._success.count)}</h1><p class="intro">${this._success.areaName}</p><p class="muted intro">${this.t("success.explanation")}</p><div class="actions"><button class="button primary" @click=${()=>this._step="quantity"}>${this.t("success.back")}</button><button class="button secondary" @click=${()=>this.dispatchEvent(new CustomEvent("view-infrastructure",{bubbles:!0,composed:!0}))}>${this.t("success.view")}</button></div></div></div>`}render(){return!this.floors.length&&!this.areas.length?a`<div class="content selection"><h1>${this.t("inventory.title")}</h1><p class="muted intro">${this.t("inventory.no_floor_area")}</p></div>`:this._step==="select"?this._renderSelection():this._step==="quantity"?this._renderQuantity():this._step==="review"?this._renderReview():this._renderSuccess()}};h(rt,"properties",{hass:{attribute:!1},t:{attribute:!1},presets:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},_step:{state:!0},_floorId:{state:!0},_areaId:{state:!0},_draftState:{state:!0},_openGroups:{state:!0},_openDrafts:{state:!0},_saveError:{state:!0},_saving:{state:!0},_success:{state:!0},_confirmRoomChange:{state:!0}}),h(rt,"styles",g`
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
  `);_("bindhome-inventory-workflow",rt);function at(i){let t=i.entity_registry_id?`registry:${i.entity_registry_id}`:`entity:${i.entity_id}`;return`${i.capability}:${i.role??"primary"}:${t}`}function xs(i){return{revision:i.revision,scope:i.scope,reviews:(i.proposals??[]).map(t=>({proposal:t,action:null,asset:{name:t.asset.name,asset_type:t.asset.asset_type,area_id:t.asset.area_id??"",capabilities:[...t.asset.capabilities??[]]},targetAssetId:"",selectedBindings:new Set((t.bindings??[]).map(e=>at(e)))}))}}function Ot(i,t,e){return{...i,reviews:i.reviews.map(s=>s.proposal.proposal_id===t?e(s):s)}}function $s(i,t,e){return Ot(i,t,s=>({...s,action:e,targetAssetId:e==="merge"?s.targetAssetId:""}))}function ve(i,t,e){return Ot(i,t,s=>({...s,asset:{...s.asset,...e}}))}function ws(i,t,e){return Ot(i,t,s=>({...s,targetAssetId:e}))}function ks(i,t,e){return Ot(i,t,s=>{let r=new Set(s.selectedBindings),o=at(e);return r.has(o)?r.delete(o):r.add(o),{...s,selectedBindings:r}})}function As(i,t,e){let s=[...new Set(e.split(",").map(r=>r.trim()).filter(Boolean))];return ve(i,t,{capabilities:s})}function hi(i){return i.action?i.action==="skip"?!0:i.action==="merge"?!!i.targetAssetId:!!(i.asset.name.trim()&&i.asset.asset_type.trim()):!1}function xe(i){return!!i?.reviews?.length&&i.reviews.every(hi)}function pi(i){return(i.proposal.bindings??[]).filter(t=>i.selectedBindings.has(at(t))).map(t=>({capability:t.capability,role:t.role??"primary",entity_id:t.entity_id,...t.entity_registry_id?{entity_registry_id:t.entity_registry_id}:{}}))}function Is(i){return i.reviews.map(t=>{let e={proposal_id:t.proposal.proposal_id,action:t.action};if(t.action==="skip")return e;let s=pi(t);return t.action==="merge"?{...e,target_asset_id:t.targetAssetId,bindings:s}:{...e,asset:{name:t.asset.name.trim(),asset_type:t.asset.asset_type.trim(),capabilities:[...t.asset.capabilities],...t.asset.area_id?{area_id:t.asset.area_id}:{}},bindings:s}})}function Es(i){return`import.status.${i??"new"}`}function Ss(i,t){let e=new Set(t.merge_candidate_asset_ids??[]);return[...i].sort((s,r)=>{let o=e.has(s.id)?0:1,n=e.has(r.id)?0:1;return o!==n?o-n:String(s.name??s.id).localeCompare(String(r.name??r.id))})}var ot=class extends m{constructor(){super(),this.hass=null,this.t=t=>t,this.areas=[],this.assets=[],this.contextAreaId=null,this._scope="all",this._areaId="",this._reviewState=null,this._loading=!1,this._saving=!1,this._error=null,this._success=null,this._initializedContext=!1}willUpdate(t){!this._initializedContext&&t.has("contextAreaId")&&(this._initializedContext=!0,this.contextAreaId&&(this._scope="area",this._areaId=this.contextAreaId))}get _selectedAreaId(){return this._scope==="area"&&this._areaId||null}async _discover(){if(!(this._loading||this._scope==="area"&&!this._areaId)){this._loading=!0,this._error=null,this._success=null;try{let t=await f(this.hass).discoverImport(this._selectedAreaId);this._reviewState=xs(t)}catch(t){let e=y(t,this.t("import.discover_error"));this._error=e.message}finally{this._loading=!1}}}_setAction(t,e){this._reviewState=$s(this._reviewState,t,e),this._error=null}_updateAsset(t,e){this._reviewState=ve(this._reviewState,t,e),this._error=null}_toggleBinding(t,e){this._reviewState=ks(this._reviewState,t,e)}async _commit(){if(!(this._saving||!xe(this._reviewState))){this._saving=!0,this._error=null;try{let t=await f(this.hass).commitImport({areaId:this._reviewState.scope?.area_id??null,revision:this._reviewState.revision,decisions:Is(this._reviewState)});this._success=t,this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:t,bubbles:!0,composed:!0}))}catch(t){let e=y(t,this.t("import.commit_error"));this._error=e.message}finally{this._saving=!1}}}_startOver(){this._reviewState=null,this._error=null,this._success=null}_areaFor(t){return this.areas.find(e=>e.area_id===t.asset.area_id)??null}render(){return this._success?this._renderSuccess():this._reviewState?this._renderReview():this._renderScope()}_renderScope(){return a`
      <section>
        <h2>${this.t("import.title")}</h2>
        <p class="intro">${this.t("import.intro")}</p>
        <div class="scope surface">
          <div class="scope-grid">
            <label>
              ${this.t("import.scope")}
              <select
                .value=${this._scope}
                @change=${t=>{this._scope=t.target.value,this._error=null}}
              >
                <option value="all">${this.t("import.scope_all")}</option>
                <option value="area">${this.t("import.scope_area")}</option>
              </select>
            </label>
            ${this._scope==="area"?a`<label>
                  ${this.t("common.area")}
                  <select
                    .value=${this._areaId}
                    @change=${t=>this._areaId=t.target.value}
                  >
                    <option value="">${this.t("import.choose_area")}</option>
                    ${this.areas.map(t=>a`<option value=${t.area_id}>${t.name}</option>`)}
                  </select>
                </label>`:d}
          </div>
          ${this._error?this._renderError():d}
          <div class="actions">
            <button
              class="button primary"
              ?disabled=${this._loading||this._scope==="area"&&!this._areaId}
              @click=${this._discover}
            >
              ${this._loading?this.t("import.discovering"):this.t("import.discover")}
            </button>
          </div>
        </div>
      </section>
    `}_renderReview(){let t=this._reviewState;return a`
      <section>
        <div class="review-head">
          <div>
            <h2>${this.t("import.review_title",{count:t.reviews.length})}</h2>
            <p class="review-copy">${this.t("import.review_intro")}</p>
          </div>
          <button class="button text" ?disabled=${this._saving} @click=${this._startOver}>
            ${this.t("import.change_scope")}
          </button>
        </div>
        ${t.reviews.length===0?a`<div class="scope surface"><p>${this.t("import.empty")}</p></div>`:a`<div class="proposal-list">
              ${t.reviews.map(e=>this._renderProposal(e))}
            </div>`}
        ${this._error?this._renderError():d}
        ${t.reviews.length?a`<div class="commit">
              <div class="commit-copy">${this.t("import.atomic")}</div>
              <button
                class="button primary"
                ?disabled=${this._saving||!xe(t)}
                @click=${this._commit}
              >
                ${this._saving?this.t("import.committing"):this.t("import.commit")}
              </button>
            </div>`:d}
      </section>
    `}_renderProposal(t){let e=t.proposal,s=e.source?.entity_ids??[],r=e.duplicate_status??"new",o=this._areaFor(e);return a`
      <article class="proposal surface" data-proposal-id=${e.proposal_id}>
        <div class="proposal-head">
          <div class="proposal-title">
            <h3>${e.asset.name}</h3>
            <div class="source">
              <div>${this.t("import.source_entities")}: ${s.length?s.join(", "):this.t("common.not_set")}</div>
              ${e.source?.device_id?a`<div>${this.t("import.source_device")}: ${e.source.device_id}</div>`:d}
              <div class="source-line">
                ${o?.icon?a`<ha-icon icon=${o.icon}></ha-icon>`:d}
                <span>${this.t("import.proposed_area")}: ${o?.name??e.asset.area_id??this.t("common.none")}</span>
              </div>
            </div>
          </div>
          <span class="status ${r}">${this.t(Es(r))}</span>
        </div>
        ${(e.bindings??[]).length?a`<div class="candidate-bindings">
              <strong>${this.t("import.candidate_bindings")}</strong>
              ${(e.bindings??[]).map(n=>a`<span>${n.entity_id} → ${n.capability} · ${n.role??"primary"}</span>`)}
            </div>`:d}
        ${r!=="new"?a`<div class="warning">${this.t(`import.status_help.${r}`)}</div>`:d}
        <div class="decision" role="group" aria-label=${this.t("import.action_label")}>
          ${["create","merge","skip"].map(n=>a`<button
              class=${t.action===n?"active":""}
              aria-pressed=${t.action===n}
              @click=${()=>this._setAction(e.proposal_id,n)}
            >${this.t(`import.action.${n}`)}</button>`)}
        </div>
        ${t.action==="create"?this._renderCreateEditor(t):d}
        ${t.action==="merge"?this._renderMergeEditor(t):d}
      </article>
    `}_renderCreateEditor(t){let e=t.proposal.proposal_id;return a`<div class="editor">
      <div class="editor-grid">
        <label>${this.t("fields.name")}<input
          .value=${t.asset.name}
          @input=${s=>this._updateAsset(e,{name:s.target.value})}
        /></label>
        <label>${this.t("fields.asset_type")}<input
          .value=${t.asset.asset_type}
          @input=${s=>this._updateAsset(e,{asset_type:s.target.value})}
        /></label>
        <label>${this.t("common.area")}<select
          .value=${t.asset.area_id}
          @change=${s=>this._updateAsset(e,{area_id:s.target.value})}
        >
          <option value="">${this.t("common.none")}</option>
          ${this.areas.map(s=>a`<option value=${s.area_id}>${s.name}</option>`)}
        </select></label>
        <label>${this.t("fields.capabilities")}<input
          .value=${t.asset.capabilities.join(", ")}
          @change=${s=>{this._reviewState=As(this._reviewState,e,s.target.value)}}
        /></label>
      </div>
      ${this._renderBindings(t)}
    </div>`}_renderMergeEditor(t){let e=t.proposal.proposal_id,s=Ss(this.assets,t.proposal);return a`<div class="editor">
      <label>${this.t("import.merge_target")}<select
        .value=${t.targetAssetId}
        @change=${r=>{this._reviewState=ws(this._reviewState,e,r.target.value),this._error=null}}
      >
        <option value="">${this.t("import.choose_asset")}</option>
        ${s.map(r=>a`<option value=${r.id}>${r.name}</option>`)}
      </select></label>
      ${this._renderBindings(t)}
    </div>`}_renderBindings(t){let e=t.proposal.bindings??[];return e.length?a`<div class="bindings">
      <h4>${this.t("import.bindings")}</h4>
      ${e.map(s=>{let r=t.selectedBindings.has(at(s));return a`<label class="binding">
          <input
            type="checkbox"
            .checked=${r}
            @change=${()=>this._toggleBinding(t.proposal.proposal_id,s)}
          />
          <span>
            <strong>${s.capability} · ${s.role??"primary"}</strong>
            <span>${s.entity_id}</span>
          </span>
        </label>`})}
    </div>`:d}_renderError(){return a`<div class="alert" role="alert">
      <strong>${this.t("errors.nothing_saved")}</strong>
      <span>${this._error}</span><br />
      <span>${this.t("import.review_preserved")}</span>
    </div>`}_renderSuccess(){let t=this._success;return a`<section class="success surface">
      <ha-icon icon="mdi:check-circle-outline"></ha-icon>
      <h2>${this.t("import.success")}</h2>
      <p>${this.t("import.success_detail",{created:t.created??0,merged:t.merged??0,skipped:t.skipped??0})}</p>
      <div class="actions">
        <button class="button secondary" @click=${this._startOver}>
          ${this.t("import.run_again")}
        </button>
      </div>
    </section>`}};h(ot,"properties",{hass:{attribute:!1},t:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},contextAreaId:{attribute:!1},_scope:{state:!0},_areaId:{state:!0},_reviewState:{state:!0},_loading:{state:!0},_saving:{state:!0},_error:{state:!0},_success:{state:!0}}),h(ot,"styles",g`
    :host { display:block; margin-top:24px; }
    * { box-sizing:border-box; }
    h2, h3, p { margin:0; }
    button, input, select { font:inherit; color:inherit; }
    .surface { border:1px solid var(--divider-color); border-radius:12px; background:var(--card-background-color); }
    .intro { max-width:760px; color:var(--secondary-text-color); line-height:1.5; }
    .scope { max-width:760px; margin-top:20px; padding:20px; }
    .scope-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    label { display:block; font-size:14px; font-weight:500; }
    input, select { width:100%; min-height:44px; margin-top:7px; padding:8px 11px; border:1px solid var(--divider-color); border-radius:8px; background:var(--card-background-color); }
    input:focus-visible, select:focus-visible, button:focus-visible { outline:2px solid var(--primary-color); outline-offset:2px; }
    .actions { display:flex; justify-content:flex-end; gap:10px; margin-top:18px; }
    .button { min-height:42px; padding:0 16px; border:1px solid transparent; border-radius:8px; background:transparent; cursor:pointer; font-weight:500; }
    .button.primary { background:var(--primary-color); color:var(--text-primary-color, #fff); }
    .button.secondary { border-color:var(--primary-color); color:var(--primary-color); }
    .button.text { color:var(--primary-color); }
    .button:disabled { opacity:.5; cursor:not-allowed; }
    .review-head { margin-top:20px; display:flex; align-items:start; justify-content:space-between; gap:16px; }
    .review-copy { color:var(--secondary-text-color); margin-top:5px; }
    .proposal-list { display:grid; gap:14px; margin-top:18px; }
    .proposal { padding:18px; }
    .proposal-head { display:flex; justify-content:space-between; gap:16px; align-items:start; }
    .proposal-title { min-width:0; }
    .proposal-title h3 { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .source { margin-top:5px; color:var(--secondary-text-color); font-size:12px; line-height:1.45; overflow-wrap:anywhere; }
    .source-line { display:flex; align-items:center; gap:5px; margin-top:3px; }
    .source-line ha-icon { --mdc-icon-size:16px; }
    .status { flex:none; padding:4px 8px; border-radius:999px; background:var(--secondary-background-color); font-size:12px; font-weight:600; }
    .status.already_bound, .status.ambiguous { color:var(--warning-color, var(--primary-color)); }
    .candidate-bindings { margin-top:12px; display:grid; gap:4px; color:var(--secondary-text-color); font-size:12px; }
    .candidate-bindings strong { color:var(--primary-text-color); font-size:13px; }
    .warning { margin-top:14px; padding:11px 12px; border-left:3px solid var(--warning-color, var(--primary-color)); background:var(--secondary-background-color); font-size:13px; line-height:1.45; }
    .decision { margin-top:16px; display:flex; flex-wrap:wrap; gap:8px; }
    .decision button { min-height:38px; padding:0 13px; border:1px solid var(--divider-color); border-radius:8px; background:transparent; cursor:pointer; }
    .decision button.active { border-color:var(--primary-color); background:var(--primary-color); color:var(--text-primary-color, #fff); }
    .editor { margin-top:16px; padding-top:16px; border-top:1px solid var(--divider-color); }
    .editor-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .bindings { margin-top:16px; }
    .bindings h4 { margin:0 0 8px; font-size:14px; }
    .binding { display:grid; grid-template-columns:auto minmax(0, 1fr); align-items:start; gap:10px; padding:9px 0; border-top:1px solid var(--divider-color); }
    .binding input { width:auto; min-height:auto; margin:3px 0 0; }
    .binding strong, .binding span { display:block; }
    .binding span { color:var(--secondary-text-color); font-size:12px; overflow-wrap:anywhere; }
    .alert { margin-top:16px; padding:14px; border:1px solid var(--error-color, #db4437); border-radius:8px; color:var(--primary-text-color); }
    .alert strong { display:block; margin-bottom:4px; color:var(--error-color, #db4437); }
    .commit { position:sticky; bottom:0; margin-top:18px; padding:12px 0; background:var(--primary-background-color, var(--card-background-color)); border-top:1px solid var(--divider-color); display:flex; align-items:center; justify-content:space-between; gap:16px; }
    .commit-copy { color:var(--secondary-text-color); font-size:13px; }
    .success { margin-top:24px; padding:28px; text-align:center; }
    .success ha-icon { color:var(--success-color, var(--primary-color)); --mdc-icon-size:48px; }
    .success h2 { margin-top:12px; }
    .success p { margin-top:6px; color:var(--secondary-text-color); }
    .success .actions { justify-content:center; }
    @media (max-width:700px) {
      .scope { padding:15px; }
      .scope-grid, .editor-grid { grid-template-columns:1fr; }
      .review-head, .proposal-head, .commit { align-items:stretch; flex-direction:column; }
      .proposal { padding:14px; }
      .status { align-self:flex-start; }
      .decision { display:grid; grid-template-columns:repeat(3, 1fr); }
      .decision button { padding-inline:6px; }
      .commit .button { width:100%; }
    }
  `);_("bindhome-assisted-import-workflow",ot);var nt=class extends m{constructor(){super(),this.hass=null,this.t=t=>t,this.presets=[],this.floors=[],this.areas=[],this.assets=[],this.contextAreaId=null,this.sessionId=0,this.onCreated=null,this._mode="single",this._preset=null,this._name="",this._code="",this._areaId="",this._search="",this._saving=!1,this._error=null,this._sync=null,this._committed=!1,this._identity=null,this._operation=0}willUpdate(){this.sessionId!==this._identity&&(this._identity=this.sessionId,this._mode="single",this._preset=null,this._name="",this._code="",this._areaId=this.contextAreaId??"",this._search="",this._operation+=1,this._saving=!1,this._error=null,this._sync=null,this._committed=!1)}_choose(t){this._preset=t,this._name=S(this.t,t),this._code="",this._error=null,this._sync=null,this._committed=!1}_forwardAssetsRefreshed(t){t.stopPropagation(),this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:t.detail,bubbles:!0,composed:!0}))}_goHome(t){t?.stopPropagation?.(),this.dispatchEvent(new CustomEvent("go-home",{bubbles:!0,composed:!0}))}async _submit(t){if(t.preventDefault(),this._saving||this._committed||!this._preset||!this._name.trim())return;let e=++this._operation,s=this.sessionId;this._saving=!0,this._error=null,this._sync=null;try{let r={name:this._name.trim(),asset_type:this._preset.asset_type,capabilities:[...this._preset.suggested_capabilities??[]]};this._code.trim()&&(r.code=this._code.trim()),this._areaId&&(r.area_id=this._areaId);let o=await f(this.hass).createAssetsBulk([r]),n=o?.assets?.[0]??o?.created?.[0]??null;if(e!==this._operation||s!==this.sessionId)return;this._committed=!0,this._saving=!1;try{this.onCreated&&await this.onCreated(n)}catch{if(e!==this._operation||s!==this.sessionId)return;this._sync=this.t("shell.refresh_error")}e===this._operation&&s===this.sessionId&&this.dispatchEvent(new CustomEvent("asset-created",{detail:n,bubbles:!0,composed:!0}))}catch(r){if(e!==this._operation||s!==this.sessionId)return;let o=y(r,this.t("add.create_error"));this._error=o.code==="conflict"?this.t("add.create_error"):o.message}finally{e===this._operation&&s===this.sessionId&&(this._saving=!1)}}render(){let t=gs(this.t,this.presets,this._search);return a`<div class="page">
      <h1 class="page-title">${this.t("nav.add")}</h1>
      <p class="intro muted">${this.t("add.intro")}</p>
      <div class="mode-switch" role="tablist" aria-label=${this.t("add.mode_label")}>
        <button class=${this._mode==="single"?"active":""} role="tab" aria-selected=${this._mode==="single"} @click=${()=>this._mode="single"}>${this.t("add.single_mode")}</button>
        <button class=${this._mode==="bulk"?"active":""} role="tab" aria-selected=${this._mode==="bulk"} @click=${()=>{this._mode="bulk",this._preset=null}}>${this.t("add.bulk_mode")}</button>
        <button class=${this._mode==="import"?"active":""} role="tab" aria-selected=${this._mode==="import"} @click=${()=>{this._mode="import",this._preset=null}}>${this.t("add.import_mode")}</button>
      </div>
      ${this._mode==="bulk"?a`<bindhome-inventory-workflow
            .hass=${this.hass}
            .t=${this.t}
            .presets=${this.presets}
            .floors=${this.floors}
            .areas=${this.areas}
            .assets=${this.assets}
            @assets-refreshed=${this._forwardAssetsRefreshed}
            @view-infrastructure=${this._goHome}
          ></bindhome-inventory-workflow>`:this._mode==="import"?a`<bindhome-assisted-import-workflow
              .hass=${this.hass}
              .t=${this.t}
              .areas=${this.areas}
              .assets=${this.assets}
              .contextAreaId=${this.contextAreaId}
              @assets-refreshed=${this._forwardAssetsRefreshed}
            ></bindhome-assisted-import-workflow>`:this._preset?a`<form class="form surface" @submit=${this._submit}>
              <div class="form-head"><ha-icon icon=${k(this.t,this._preset.asset_type).icon}></ha-icon><h2>${S(this.t,this._preset)}</h2></div>
              <div class="fields">
                <label>${this.t("fields.name")}<input .value=${this._name} @input=${e=>this._name=e.target.value} required /></label>
                <label>${this.t("fields.code_optional")}<input .value=${this._code} @input=${e=>this._code=e.target.value} /></label>
                <label>${this.t("add.room")}<select .value=${this._areaId} @change=${e=>this._areaId=e.target.value}>
                  <option value="" ?selected=${!this._areaId}>${this.t("add.no_room")}</option>
                  ${this.areas.map(e=>a`<option value=${e.area_id} ?selected=${e.area_id===this._areaId}>${e.name}</option>`)}
                </select></label>
              </div>
              ${this._error?a`<div class="error" role="alert">${this._error}</div>`:d}
              ${this._sync?a`<div class="success" role="status">${this._sync}</div>`:d}
              <div class="actions">
                <button type="button" class="secondary" ?disabled=${this._saving} @click=${()=>{this._preset=null,this._error=null,this._sync=null,this._committed=!1}}>${this.t("common.cancel")}</button>
                <button class="primary" ?disabled=${this._saving||this._committed||!this._name.trim()}>${this._saving?this.t("add.saving"):this.t("common.add")}</button>
              </div>
            </form>`:a`<section class="picker">
              <h2>${this.t("add.what")}</h2>
              <label class="search">${this.t("add.search_label")}<input type="search" .value=${this._search} placeholder=${this.t("add.search_placeholder")} @input=${e=>this._search=e.target.value}></label>
              ${t.featured.length?a`<section class="catalogue-section"><h3>${this.t("add.frequent")}</h3><div class="presets">${t.featured.map(e=>this._renderPreset(e))}</div></section>`:d}
              <section class="catalogue"><h3>${this.t("add.all_types")}</h3>
                ${t.groups.length?t.groups.map(e=>{let s=Lt(this.t,e.category);return a`<details class="category" ?open=${!!this._search}><summary><ha-icon icon=${s.icon}></ha-icon><span>${s.label}</span><span class="count">${e.items.length}</span></summary><div class="presets">${e.items.map(r=>this._renderPreset(r))}</div></details>`}):a`<div class="empty">${this.t("add.no_matches")}</div>`}
              </section>
            </section>`}
    </div>`}_renderPreset(t){return a`<button class="preset" @click=${()=>this._choose(t.preset)}><ha-icon icon=${t.presentation.icon}></ha-icon><strong>${t.name}</strong></button>`}};h(nt,"properties",{hass:{attribute:!1},t:{attribute:!1},presets:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},contextAreaId:{attribute:!1},sessionId:{attribute:!1},onCreated:{attribute:!1},_mode:{state:!0},_preset:{state:!0},_name:{state:!0},_code:{state:!0},_areaId:{state:!0},_search:{state:!0},_saving:{state:!0},_error:{state:!0},_sync:{state:!0},_committed:{state:!0}}),h(nt,"styles",[$,g`
      .intro { margin-top: 5px; }
      .mode-switch { display:flex; width:fit-content; margin-top:20px; padding:3px; gap:3px; border:1px solid var(--divider-color); border-radius:10px; background:var(--card-background-color); }
      .mode-switch button { min-height:40px; padding:0 14px; border:0; border-radius:7px; background:transparent; color:var(--secondary-text-color); font:inherit; font-weight:500; cursor:pointer; }
      .mode-switch button.active { background:var(--primary-color); color:var(--text-primary-color, #fff); }
      .picker { margin-top: 24px; }
      .picker h2, .form h2, .picker h3 { font-size: 19px; font-weight: 500; }
      .search { display:block; max-width:680px; margin-top:16px; font-weight:500; }
      .search input { width:100%; min-height:46px; margin-top:7px; padding:9px 11px; border:1px solid var(--divider-color); border-radius:8px; background:var(--card-background-color); }
      .catalogue-section, .catalogue { margin-top:24px; }
      .category { margin-top:10px; border:1px solid var(--divider-color); border-radius:10px; background:var(--card-background-color); overflow:hidden; }
      .category summary { display:flex; align-items:center; gap:10px; min-height:52px; padding:8px 14px; font-weight:500; }
      .category summary ha-icon { color:var(--primary-color); }
      .category .count { margin-left:auto; color:var(--secondary-text-color); font-size:12px; }
      .category .presets { margin:0; padding:0 12px 12px; }
      .presets { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 14px; }
      .preset { min-height: 92px; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 9px; padding: 14px; border: 1px solid var(--divider-color); border-radius: 10px; background: var(--card-background-color); text-align: left; }
      .preset:hover { border-color: var(--primary-color); background: var(--secondary-background-color); }
      .preset ha-icon { color: var(--primary-color); --mdc-icon-size: 27px; }
      .form { max-width: 680px; margin-top: 24px; padding: 22px; }
      .form-head { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
      .form-head ha-icon { color: var(--primary-color); --mdc-icon-size: 30px; }
      .fields { display: grid; gap: 16px; }
      label { display: block; font-weight: 500; }
      input, select { width: 100%; min-height: 46px; margin-top: 7px; padding: 9px 11px; border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color); }
      .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 22px; }
      .success { margin-top: 16px; color: var(--success-color, var(--primary-color)); }
      @media (max-width: 700px) {
        .mode-switch { width:100%; }
        .mode-switch button { flex:1; padding-inline:7px; font-size:13px; }
        .presets { grid-template-columns:1fr; }
        .preset { min-height:56px; flex-direction:row; align-items:center; justify-content:flex-start; }
        .catalogue-section, .catalogue { margin-top:20px; }
        .form { padding: 16px; }
        .actions > * { flex: 1; }
      }
    `]);_("bindhome-add-view",nt);var lt=class extends m{constructor(){super(),this.t=t=>t,this.assets=[],this.areas=[],this.floors=[],this.query=""}render(){let e=rs(this.t,this.assets,this.areas,this.floors,this.query).map(s=>s.asset?s:{asset:s,area:this.areas.find(r=>r.area_id===s.area_id),type:k(this.t,s.asset_type)});return a`<div class="page">
      <h1 class="page-title">${this.t("nav.search")}</h1>
      <div class="search">
        <ha-icon icon="mdi:magnify"></ha-icon
        ><input
          type="search"
          aria-label=${this.t("search.label")}
          placeholder=${this.t("search.placeholder")}
          .value=${this.query}
          @input=${s=>{this.query=s.target.value,this.dispatchEvent(new CustomEvent("search-query-changed",{detail:this.query,bubbles:!0,composed:!0}))}}
        />
      </div>
      <p class="hint muted">
        ${this.query?this.t("search.results",{count:e.length}):this.t("search.suggestions")}
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
    </div>`}};h(lt,"properties",{t:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},floors:{attribute:!1},query:{type:String}}),h(lt,"styles",[$,g`
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
    `]);_("bindhome-search-view",lt);function we(i,t){return(i?.name??"").localeCompare(t?.name??"",void 0,{sensitivity:"base",numeric:!0})}function $e(i){return[...i].sort(we)}function ke(i,t,e){let s=new Map((i??[]).map(p=>[p.floor_id,p])),r=new Map((t??[]).map(p=>[p.area_id,p])),o=new Map;for(let p of e??[]){if(!p.area_id||!r.has(p.area_id))continue;let v=o.get(p.area_id)??[];v.push(p),o.set(p.area_id,v)}let n=(t??[]).map(p=>({area:p,assets:$e(o.get(p.area_id)??[])})).sort((p,v)=>we(p.area,v.area)),c=(i??[]).map(p=>({floor:p,areas:n.filter(({area:v})=>v.floor_id===p.floor_id)})).sort((p,v)=>{let x=p.floor.level,w=v.floor.level;return typeof x=="number"&&typeof w=="number"&&x!==w?x-w:we(p.floor,v.floor)}),l=n.filter(({area:p})=>!p.floor_id||!s.has(p.floor_id)),u=$e((e??[]).filter(p=>!p.area_id)),b=$e((e??[]).filter(p=>p.area_id&&!r.has(p.area_id)));return{floors:c,noFloorAreas:l,noAreaAssets:u,unknownAreaAssets:b}}function dt(i){return{asset_id:i.id,name:i.name,asset_type:i.asset_type,code:i.code??"",area_id:i.area_id??"",capabilities:[...i.capabilities??[]]}}function Rs(i){return i==null?null:String(i).trim()||null}function ui(i,t){return i.length!==t.length?!1:i.every((e,s)=>e===t[s])}function Ae(i,t){if(t.asset_id!==i.id)throw new Error("Asset edit draft identity does not match the persisted Asset");let e={name:t.name,asset_type:t.asset_type,code:Rs(t.code),area_id:Rs(t.area_id),capabilities:[...t.capabilities??[]]},s={asset_id:i.id};e.name!==i.name&&(s.name=e.name),e.asset_type!==i.asset_type&&(s.asset_type=e.asset_type),e.code!==(i.code??null)&&(s.code=e.code),e.area_id!==(i.area_id??null)&&(s.area_id=e.area_id);let r=[...i.capabilities??[]];return ui(e.capabilities,r)||(s.capabilities=e.capabilities),s}function Cs(i,t){return Object.keys(Ae(i,t)).length>1}var ct="__bindhome_no_area_assets__",ht="__bindhome_unknown_area_assets__";function Ps(i,t,e){if(!i)return null;if(i===ct)return t.noAreaAssets.length?{kind:"no-area",title:e("browser.no_area"),description:e("browser.no_area_intro"),assets:t.noAreaAssets}:null;if(i===ht)return t.unknownAreaAssets.length?{kind:"unknown-area",title:e("browser.unknown_area"),description:e("browser.unknown_area_intro"),assets:t.unknownAreaAssets}:null;let r=[...t.floors.flatMap(o=>o.areas),...t.noFloorAreas].find(({area:o})=>o.area_id===i);return r?{kind:"area",title:r.area.name,description:"",area:r.area,assets:r.assets}:null}function Ds(i,t){return i.area_id?t.some(e=>e.area_id===i.area_id)?i.area_id:ht:ct}function zs(i,t){return i.map(e=>e.id===t.id?t:e)}function mi(i,t,e="primary"){return`${i}:${t}:${e}`}function Bs(i){let t=i?.records??[];return new Map(t.map(e=>[mi(e.asset_id,e.capability,e.role),e]))}function Ie(i,t=[]){return t.find(e=>e.area_id===i?.area_id)?.name??null}function gi(i,t=[]){return{asset:i,id:i.id,name:i.name,code:i.code??"",assetType:i.asset_type,areaId:i.area_id??null,areaName:Ie(i,t)}}function Mt(i,t="",e=null,s=[]){let r=String(t).trim().toLocaleLowerCase(),o=i.map(c=>gi(c,s));return(r?o.filter(c=>[c.name,c.code,c.assetType,c.areaName??""].join(" ").toLocaleLowerCase().includes(r)):o).sort((c,l)=>+!!(e&&l.areaId===e)-+!!(e&&c.areaId===e)||c.name.localeCompare(l.name)||c.id.localeCompare(l.id))}var pt=class extends m{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.assets=[],this.areas=[],this.registry={},this.onRefresh=null,this.onDone=null,this.onSyncWarning=null,this._direction="outgoing",this._type="",this._other="",this._search="",this._saving=!1,this._error=null,this._identity="",this._token=0}connectedCallback(){super.connectedCallback(),this._resetIdentity()}willUpdate(t){if(!t.has("asset"))return;let e=this.asset?.id??"";this._identity&&e!==this._identity&&this._resetIdentity(),this._identity=e}_resetIdentity(){this._token+=1,this._direction="outgoing",this._type="",this._other="",this._search="",this._error=null,this._saving=!1,this._identity=this.asset?.id??""}_isCurrent(t,e){return t===this._token&&this.asset?.id===e}_candidates(){let t=Mt(this.assets.filter(s=>s.id!==this.asset?.id),this._search,this.asset?.area_id,this.areas),e=this._search.trim()?20:8;return{all:t,shown:t.slice(0,e)}}async _save(){if(this._saving||!this._other||!_e(this._type))return;let t=++this._token,e=this.asset?.id,s=this._direction==="outgoing"?e:this._other,r=this._direction==="outgoing"?this._other:e;this._saving=!0,this._error=null;try{if(await f(this.hass).createRelation({sourceAssetId:s,relationType:this._type.trim(),targetAssetId:r}),!this._isCurrent(t,e))return;this._saving=!1,this.onDone?.();try{await this.onRefresh?.()}catch{if(!this._isCurrent(t,e))return;this.onSyncWarning?.(this.t("topology.sync_warning"))}}catch(o){if(!this._isCurrent(t,e))return;let n=y(o,this.t("topology.save_error"));this._error=n.code==="conflict"?this.t("topology.duplicate_relation"):n.message,this._saving=!1}}_cancel(){this.onDone?.()}render(){let{all:t,shown:e}=this._candidates();return a`
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
            ${ds(this.registry?.relations).map(s=>a`
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
            `:d}

        ${this._error?a`
              <p
                class="error"
                role="alert"
              >
                ${this._error}
              </p>
            `:d}

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
            ?disabled=${this._saving||!this._other||!_e(this._type)}
          >
            ${this.t("editor.save")}
          </button>
        </div>
      </form>
    `}};h(pt,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},registry:{attribute:!1},onRefresh:{attribute:!1},onDone:{attribute:!1},onSyncWarning:{attribute:!1},_direction:{state:!0},_type:{state:!0},_other:{state:!0},_search:{state:!0},_saving:{state:!0},_error:{state:!0}}),h(pt,"styles",g`
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
  `);_("bindhome-relation-editor",pt);var ut=class extends m{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.assets=[],this.areas=[],this.registry={},this.onRefresh=null,this.onNavigate=null,this._editing=!1,this._deleting=null,this._error=null,this._sync=null,this._confirm=null,this._identity="",this._token=0}willUpdate(t){t.has("asset")&&this.asset&&this._identity&&this.asset.id!==this._identity&&(this._token+=1,this._deleting=null,this._confirm=null,this._error=null,this._sync=null),this.asset&&(this._identity=this.asset.id)}_asset(t){return this.assets.find(e=>e.id===t)??null}_area(t){return t?.area_id?this.areas.find(e=>e.area_id===t.area_id)?.name??null:null}async _delete(t){if(this._deleting)return;let e=++this._token,s=this.asset?.id;this._deleting=t.id,this._error=null;try{if(await f(this.hass).deleteRelation(t.id),e!==this._token||this.asset?.id!==s)return;this._deleting=null,this._confirm=null;try{await this.onRefresh?.()}catch{if(e!==this._token||this.asset?.id!==s)return;this._sync=this.t("topology.sync_warning")}}catch(r){if(e!==this._token||this.asset?.id!==s)return;this._deleting=null,this._error=y(r,this.t("topology.delete_error")).message}}_navigate(t){this._asset(t)&&(this.onNavigate?.(t),this.dispatchEvent(new CustomEvent("navigate-asset",{detail:t,bubbles:!0,composed:!0})))}_renderNeighbor(t,e){let s=e?t.target_asset_id:t.source_asset_id,r=this._asset(s);if(!r)return a`
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
    `}render(){let{outgoing:t,incoming:e}=M(this.registry?.relations??[],this.asset?.id);return a`
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
            `:d}

        ${this._sync?a`
              <p class="warning" role="alert">
                ${this._sync}
              </p>
            `:d}

        ${this._error?a`
              <p class="error" role="alert">
                ${this._error}
              </p>
            `:d}

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
    `}};h(ut,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},registry:{attribute:!1},onRefresh:{attribute:!1},onNavigate:{attribute:!1},_editing:{state:!0},_deleting:{state:!0},_error:{state:!0},_sync:{state:!0},_confirm:{state:!0}}),h(ut,"styles",g`
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
  `);_("bindhome-asset-topology",ut);var mt=class extends m{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.assets=[],this.areas=[],this.registry={},this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this.refreshBindingData=null,this.refreshTopologyData=null}_bindings(){return this.asset?(this.registry?.bindings??[]).filter(t=>t.asset_id===this.asset.id):[]}_primaryStatus(t){if(!this.asset)return null;let e=Bs(this.bindingStatuses).get(`${this.asset.id}:${t}:primary`);if(e)return e;let s=this._bindings().find(r=>r.capability===t&&r.role==="primary");return s?{asset_id:this.asset.id,capability:t,role:"primary",status:"resolved",config_valid:!0,runtime_available:!0,entity_id:s.entity_id,binding:s}:null}_representation(){return this.asset?(this.registry?.representations??[]).find(t=>t.asset_id===this.asset.id):null}_forwardTopologyWarning(t){t.stopPropagation(),this.dispatchEvent(new CustomEvent("topology-sync-warning",{detail:t.detail,bubbles:!0,composed:!0}))}render(){if(!this.asset)return d;let t=this._representation();return a`
      <section class="connections">
        <h3>${this.t("editor.connections")}</h3>
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
              @topology-sync-warning=${this._forwardTopologyWarning}
            ></bindhome-asset-topology>
          </article>

          <article class="connection-card">
            <h4>${this.t("editor.bindings")}</h4>
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
            <h4>${this.t("editor.representation")}</h4>
            ${t?a`<p>${this.t("editor.platform")}: <strong>${t.platform}</strong></p>`:a`<p class="muted">${this.t("editor.no_representation")}</p>`}
          </article>
        </div>
      </section>
    `}};h(mt,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},registry:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1}}),h(mt,"styles",g`
    :host { display: block; }
    .connections { margin-top: 24px; }
    .connections h3 {
      margin: 0 0 14px;
      font-size: 17px;
      line-height: 24px;
      font-weight: 500;
    }
    .connection-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      align-items: start;
    }
    .connection-card {
      min-width: 0;
      padding: 15px;
      border: 1px solid var(--divider-color);
      border-radius: 9px;
      background: var(--card-background-color);
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
    .muted { color: var(--secondary-text-color); }
    @media (max-width: 760px) {
      .connection-grid { grid-template-columns: 1fr; }
    }
  `);_("bindhome-asset-connections",mt);function Ut(i){return{...i,capabilities:[...i.capabilities??[]]}}var gt=class extends m{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.assets=[],this.areas=[],this.floors=[],this.registry={},this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this.refreshBindingData=null,this.refreshTopologyData=null,this._editing=!1,this._draft=null,this._snapshot=null,this._saving=!1,this._error=null,this._saved=!1,this._newCapability=""}willUpdate(t){t.has("asset")&&this.asset&&!this._editing&&(this._snapshot=Ut(this.asset),this._draft=dt(this.asset))}get _dirty(){return!this._editing||!this._snapshot||!this._draft?!1:Cs(this._snapshot,this._draft)}_emitEditing(t){this.dispatchEvent(new CustomEvent("editing-changed",{detail:t,bubbles:!0,composed:!0}))}_startEdit(){this._snapshot=Ut(this.asset),this._draft=dt(this.asset),this._editing=!0,this._error=null,this._saved=!1,this._newCapability="",this._emitEditing(!0)}_cancel(){this._draft=dt(this.asset),this._snapshot=Ut(this.asset),this._editing=!1,this._error=null,this._newCapability="",this._emitEditing(!1)}_close(){this._editing||this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}_updateField(t,e){!this._draft||this._saving||(this._draft={...this._draft,[t]:e},this._error=null,this._saved=!1)}_removeCapability(t){this._updateField("capabilities",this._draft.capabilities.filter(e=>e!==t))}_addCapability(){let t=this._newCapability.trim();if(!t||this._draft.capabilities.includes(t)){this._newCapability="";return}this._updateField("capabilities",[...this._draft.capabilities,t]),this._newCapability=""}async _save(t=null){if(t?.preventDefault(),this._saving||!this._snapshot||!this._draft)return;let e=Ae(this._snapshot,this._draft);if(Object.keys(e).length===1){this._editing=!1,this._emitEditing(!1);return}let{asset_id:s,...r}=e;this._saving=!0,this._error=null,this._saved=!1;try{let n=await f(this.hass).updateAsset(s,r);this.asset=n,this._snapshot=Ut(n),this._draft=dt(n),this._editing=!1,this._saved=!0,this._emitEditing(!1),this.dispatchEvent(new CustomEvent("asset-updated",{detail:n,bubbles:!0,composed:!0}))}catch(o){let n=y(o,this.t("editor.save_error"));this._error=n.message??this.t("editor.save_error")}finally{this._saving=!1}}_areaName(t){return t?this.areas.find(e=>e.area_id===t)?.name??this.t("infrastructure.unknown_area"):this.t("browser.no_area")}_renderAreaOptions(){let t=new Set(this.floors.map(o=>o.floor_id)),e=new Set(this.areas.map(o=>o.area_id)),s=this._draft?.area_id&&!e.has(this._draft.area_id)?this._draft.area_id:null,r=this.areas.filter(o=>!o.floor_id||!t.has(o.floor_id));return a`
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
          `:d}

      ${this.floors.map(o=>{let n=this.areas.filter(c=>c.floor_id===o.floor_id);return n.length?a`
            <optgroup
              label=${o.name}
            >
              ${n.map(c=>a`
                  <option
                    value=${c.area_id}
                    ?selected=${this._draft?.area_id===c.area_id}
                  >
                    ${c.name}
                  </option>
                `)}
            </optgroup>
          `:d})}

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
          `:d}
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
            `:d}

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
    `}_renderConnections(){return a`
    <bindhome-asset-connections
      .hass=${this.hass}
      .t=${this.t}
      .asset=${this.asset}
      .assets=${this.assets}
      .areas=${this.areas}
      .registry=${this.registry}
      .bindingStatuses=${this.bindingStatuses}
      .entityRegistry=${this.entityRegistry}
      .deviceRegistry=${this.deviceRegistry}
      .refreshBindingData=${this.refreshBindingData}
      .refreshTopologyData=${this.refreshTopologyData}
      @topology-sync-warning=${t=>{this._error=t.detail}}
    ></bindhome-asset-connections>
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

        ${this._editing?d:a`
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
          `:d}

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
    `:d}};h(gt,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},floors:{attribute:!1},registry:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},_editing:{state:!0},_draft:{state:!0},_snapshot:{state:!0},_saving:{state:!0},_error:{state:!0},_saved:{state:!0},_newCapability:{state:!0}}),h(gt,"styles",g`
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
  `);_("bindhome-asset-detail-editor",gt);var _t=class extends m{constructor(){super(),this.hass=null,this.floors=[],this.areas=[],this.assets=[],this.presets=[],this.registry={},this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this.refreshBindingData=null,this.refreshTopologyData=null,this.selectedAssetId=null,this.t=t=>t,this._selectedKey="",this._selectedAssetId=null,this._editorLocked=!1}get _hierarchy(){return ke(this.floors,this.areas,this.assets)}_countAssets(t){return this.t(Bt("counts.asset",t),{count:t})}_targetForKey(t,e=this._hierarchy){return Ps(t,e,this.t)}willUpdate(t){if(t.has("selectedAssetId")&&this.selectedAssetId){let e=this.assets.find(s=>s.id===this.selectedAssetId);e&&(this._selectedKey=this._locationKeyForAsset(e),this._selectedAssetId=e.id)}if(this._selectedKey&&(t.has("floors")||t.has("areas")||t.has("assets"))){let e=ke(this.floors,this.areas,this.assets);this._targetForKey(this._selectedKey,e)||(this._selectedKey=""),this._selectedAssetId&&!this.assets.some(s=>s.id===this._selectedAssetId)&&(this._selectedAssetId=null,this._editorLocked=!1)}}_select(t){this._editorLocked||(this._selectedAssetId=null,this._selectedKey=t)}_openAsset(t){this._selectedAssetId=t}_closeAsset(){this._editorLocked||(this._selectedAssetId=null)}_locationKeyForAsset(t){return Ds(t,this.areas)}_handleEditingChanged(t){this._editorLocked=!!t.detail}_handleAssetUpdated(t){t.stopPropagation();let e=t.detail,s=zs(this.assets,e);this.assets=s,this._selectedKey=this._locationKeyForAsset(e),this._selectedAssetId=e.id,this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:s,bubbles:!0,composed:!0}))}_assetTypeLabel(t){let e=this.presets.find(s=>s.asset_type===t.asset_type);return e?S(this.t,e):t.asset_type}_renderAreaButton(t){let e=this._selectedKey===t.area.area_id;return a`
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
    `:d}_renderSpecials(t){if(!t.noAreaAssets.length&&!t.unknownAreaAssets.length)return d;let e=this._selectedKey===ct,s=this._selectedKey===ht;return a`
      <div class="specials">
        ${t.noAreaAssets.length?a`
              <button
                class="special-button ${e?"selected":""}"
                aria-pressed=${e?"true":"false"}
                ?disabled=${this._editorLocked}
                @click=${()=>this._select(ct)}
              >
                <span class="area-name">
                  ${this.t("browser.no_area")}
                </span>
                <span class="count">
                  ${this._countAssets(t.noAreaAssets.length)}
                </span>
              </button>
            `:d}

        ${t.unknownAreaAssets.length?a`
              <button
                class="special-button ${s?"selected":""}"
                aria-pressed=${s?"true":"false"}
                ?disabled=${this._editorLocked}
                @click=${()=>this._select(ht)}
              >
                <span class="area-name">
                  ${this.t("browser.unknown_area")}
                </span>
                <span class="count">
                  ${this._countAssets(t.unknownAreaAssets.length)}
                </span>
              </button>
            `:d}
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
              `:d}

          ${t.capabilities?.length?a`
                <span>
                  ${this.t("fields.capabilities")}:
                  ${t.capabilities.join(", ")}
                </span>
              `:d}

          ${e.kind==="unknown-area"?a`
                <span class="stale">
                  ${this.t("browser.stale_area",{area_id:t.area_id})}
                </span>
              `:d}
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
              `:d}
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
    `}};h(_t,"properties",{hass:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},presets:{attribute:!1},registry:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},selectedAssetId:{attribute:!1},t:{attribute:!1},_selectedKey:{state:!0},_selectedAssetId:{state:!0},_editorLocked:{state:!0}}),h(_t,"styles",g`
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
  `);_("bindhome-inventory-browser",_t);var ft=class extends m{constructor(){super(),this.t=t=>t,this.assets=[],this.areas=[],this.registry={},this.focalAssetId=null,this.onNavigate=null,this._search=""}_asset(t){return this.assets.find(e=>e.id===t)??null}_focal(){return this._asset(this.focalAssetId)??this.assets[0]??null}_neighbors(){let t=this._focal();return t?M(this.registry?.relations??[],t.id):{incoming:[],outgoing:[]}}_focus(t){let e=this._asset(t);e&&(this.focalAssetId=e.id,this._search="",this.onNavigate?.(e.id))}_renderNeighbor(t,e){let s=e?t.target_asset_id:t.source_asset_id,r=this._asset(s);if(!r)return a`
        <div class="neighbor missing">
          <strong>${this.t("topology.missing_asset")}</strong>
          <span>${t.relation_type}</span>
        </div>
      `;let o=Ie(r,this.areas);return a`
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
    `}render(){let t=this._focal(),e=Mt(this.assets,this._search,t?.area_id,this.areas),s=this._search.trim()?20:8,r=e.slice(0,s),{incoming:o,outgoing:n}=this._neighbors();return a`
      <section class="explorer">
        <h1>${this.t("topology.explorer")}</h1>

        <label>
          ${this.t("topology.search_assets")}
          <input
            .value=${this._search}
            @input=${c=>{this._search=c.target.value}}
          />
        </label>

        <div class="picker">
          ${r.length?r.map(c=>a`
                  <button
                    type="button"
                    aria-pressed=${t?.id===c.id?"true":"false"}
                    @click=${()=>this._focus(c.id)}
                  >
                    <strong>${c.name}</strong>
                    ${c.areaName?a`<span>${c.areaName}</span>`:d}
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
            `:d}

        ${t?a`
              <h2>${t.name}</h2>

              <div class="columns">
                <div>
                  <h3>${this.t("topology.incoming")}</h3>

                  ${o.length?o.map(c=>this._renderNeighbor(c,!1)):a`
                        <p class="muted">
                          ${this.t("topology.no_relations")}
                        </p>
                      `}
                </div>

                <div>
                  <h3>${this.t("topology.outgoing")}</h3>

                  ${n.length?n.map(c=>this._renderNeighbor(c,!0)):a`
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
    `}};h(ft,"properties",{t:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},registry:{attribute:!1},focalAssetId:{attribute:!1},onNavigate:{attribute:!1},_search:{state:!0}}),h(ft,"styles",g`
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
  `);_("bindhome-topology-explorer",ft);var bt=class extends m{constructor(){super(),this.hass=null,this.registry={},this.t=t=>t,this.presets=[],this.floors=[],this.areas=[],this.assets=[],this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this.refreshBindingData=null,this.refreshTopologyData=null,this.selectedAssetId=null,this._active="browse"}_show(t){this._active=t}willUpdate(t){t.has("selectedAssetId")&&this.selectedAssetId&&(this._active="browse")}_forwardAssetsRefreshed(t){t.stopPropagation(),this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:t.detail,bubbles:!0,composed:!0}))}_showBrowseFromWorkflow(t){t.stopPropagation(),this._active="browse"}render(){return a`
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
          .selectedAssetId=${this.selectedAssetId}
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
    `}};h(bt,"properties",{hass:{attribute:!1},registry:{attribute:!1},t:{attribute:!1},presets:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},selectedAssetId:{attribute:!1},_active:{state:!0}}),h(bt,"styles",g`
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
  `);_("bindhome-inventory-section",bt);var yt=class extends m{constructor(){super(),this.registry={},this.areas=[],this.t=t=>t,this._tab="assets",this._selectedAssetId=null}_areaName(t){return this.areas.find(e=>e.area_id===t)?.name??this.t(t?"infrastructure.unknown_area":"infrastructure.no_area")}_assetName(t){return this.registry.assets?.find(e=>e.id===t)?.name??t}_renderAssets(){let t=this.registry.assets??[];if(!t.length)return a`<div class="empty">${this.t("infrastructure.no_assets")}</div>`;if(this._selectedAssetId){let e=t.find(s=>s.id===this._selectedAssetId);if(e)return a`<button class="link" @click=${()=>this._selectedAssetId=null}>← ${this.t("infrastructure.back_assets")}</button><section class="detail"><h2>${e.name}</h2><dl><dt>${this.t("fields.type")}</dt><dd>${e.asset_type}</dd><dt>${this.t("fields.code")}</dt><dd>${e.code||this.t("common.not_set")}</dd><dt>${this.t("common.area")}</dt><dd>${this._areaName(e.area_id)}</dd><dt>${this.t("fields.capabilities")}</dt><dd>${e.capabilities?.join(", ")||this.t("common.none")}</dd></dl><details class="advanced"><summary>${this.t("infrastructure.advanced")}</summary><dl><dt>${this.t("infrastructure.asset_id")}</dt><dd>${e.id}</dd><dt>${this.t("infrastructure.area_id")}</dt><dd>${e.area_id||this.t("common.none")}</dd></dl></details></section>`}return a`<div class="table-wrap"><table><thead><tr><th>${this.t("fields.name")}</th><th>${this.t("fields.type")}</th><th>${this.t("common.area")}</th><th>${this.t("fields.capabilities")}</th></tr></thead><tbody>${t.map(e=>a`<tr><td><button class="link" @click=${()=>this._selectedAssetId=e.id}>${e.name}</button></td><td>${e.asset_type}</td><td>${this._areaName(e.area_id)}</td><td>${e.capabilities?.join(", ")||"\u2014"}</td></tr>`)}</tbody></table></div>`}_renderRelations(){let t=this.registry.relations??[];return t.length?a`<div class="table-wrap"><table><thead><tr><th>${this.t("fields.source")}</th><th>${this.t("fields.relation")}</th><th>${this.t("fields.target")}</th></tr></thead><tbody>${t.map(e=>a`<tr><td>${this._assetName(e.source_asset_id)}</td><td>${e.relation_type}</td><td>${this._assetName(e.target_asset_id)}</td></tr>`)}</tbody></table></div>`:a`<div class="empty">${this.t("infrastructure.no_relations")}</div>`}_renderBindings(){let t=this.registry.bindings??[];return t.length?a`<div class="table-wrap"><table><thead><tr><th>${this.t("fields.asset")}</th><th>${this.t("fields.capability")}</th><th>${this.t("fields.role")}</th><th>${this.t("fields.ha_entity")}</th><th>Entity Registry ID</th></tr></thead><tbody>${t.map(e=>a`<tr><td>${this._assetName(e.asset_id)}</td><td>${e.capability}</td><td>${e.role}</td><td class="technical">${e.entity_id}</td><td class="technical">${e.entity_registry_id||"\u2014"}</td></tr>`)}</tbody></table></div>`:a`<div class="empty">${this.t("infrastructure.no_bindings")}</div>`}render(){return a`<div class="content"><h1>${this.t("nav.infrastructure")}</h1><p class="muted">${this.t("infrastructure.intro")}</p><nav class="tabs" aria-label=${this.t("infrastructure.views_label")}>${["assets","relations","bindings"].map(t=>a`<button class=${this._tab===t?"active":""} @click=${()=>{this._tab=t,this._selectedAssetId=null}}>${this.t(`infrastructure.tabs.${t}`)}</button>`)}</nav>${this._tab==="assets"?this._renderAssets():this._tab==="relations"?this._renderRelations():this._renderBindings()}</div>`}};h(yt,"properties",{registry:{attribute:!1},areas:{attribute:!1},t:{attribute:!1},_tab:{state:!0},_selectedAssetId:{state:!0}}),h(yt,"styles",g`
    :host{display:block}*{box-sizing:border-box}.content{max-width:1200px;margin:auto;padding:28px 24px}h1,h2,p{margin:0}h1{font-size:24px;font-weight:500}h2{font-size:20px;font-weight:500}.muted{color:var(--secondary-text-color)}.tabs{margin-top:20px;display:flex;border-bottom:1px solid var(--divider-color);overflow-x:auto}.tabs button{min-height:46px;padding:0 16px;border:0;border-bottom:3px solid transparent;color:var(--secondary-text-color);background:transparent;cursor:pointer;font:inherit}.tabs button.active{color:var(--primary-color);border-bottom-color:var(--primary-color)}.tabs button:focus-visible,.link:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}.table-wrap{margin-top:20px;overflow-x:auto;background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:8px}table{width:100%;border-collapse:collapse;text-align:left}th,td{padding:12px 14px;border-bottom:1px solid var(--divider-color);vertical-align:top}th{font-size:12px;color:var(--secondary-text-color);background:var(--secondary-background-color)}tr:last-child td{border-bottom:0}.link{padding:0;border:0;color:var(--primary-color);background:transparent;cursor:pointer;font:inherit;font-weight:500;text-align:left}.empty{margin-top:20px;padding:28px;border:1px dashed var(--divider-color);border-radius:8px;text-align:center;color:var(--secondary-text-color)}.detail{margin-top:20px;padding:20px;border:1px solid var(--divider-color);border-radius:8px;background:var(--card-background-color)}.detail dl{display:grid;grid-template-columns:180px 1fr;gap:12px}.detail dt{color:var(--secondary-text-color)}.detail dd{margin:0;overflow-wrap:anywhere}.advanced{margin-top:20px;border-top:1px solid var(--divider-color);padding-top:14px}.technical{font-family:monospace;overflow-wrap:anywhere}@media(max-width:600px){.content{padding:20px 12px}th,td{padding:10px}.detail dl{grid-template-columns:1fr;gap:4px}.detail dd{margin-bottom:10px}}
  `);_("bindhome-infrastructure-inspector",yt);function _i(i){let t=[],e=[],s="",r=!1;for(let o=0;o<i.length;o+=1){let n=i[o];if(r){n==='"'?i[o+1]==='"'?(s+='"',o+=1):r=!1:s+=n;continue}if(n==='"'&&s.length===0){r=!0;continue}if(n===","){e.push(s),s="";continue}if(n===`
`){e.push(s),t.push(e),e=[],s="";continue}if(n==="\r"){i[o+1]===`
`&&(o+=1),e.push(s),t.push(e),e=[],s="";continue}s+=n}if(r)throw new Error("CSV contains an unterminated quoted field");return(s.length||e.length)&&(e.push(s),t.push(e)),t}function fi(i){let t=String(i??"");return/[",\r\n]/.test(t)?`"${t.replaceAll('"','""')}"`:t}function bi(i){return`${i.map(t=>t.map(fi).join(",")).join(`
`)}
`}function Ns(i,t){if(t.scope==="all")return i;let e=_i(i);if(!e.length)return i;let s=e[0],r=s.indexOf("area_id");if(r<0)throw new Error("BindHome CSV is missing area_id");let o=new Set;if(t.scope==="area"&&t.areaId)o.add(t.areaId);else if(t.scope==="floor"&&t.floorId)for(let n of t.areas??[])n.floor_id===t.floorId&&o.add(n.area_id);return bi([s,...e.slice(1).filter(n=>o.has(n[r]??""))])}function Ls(i,t=null){let e=t?t.replace(/[^a-zA-Z0-9_-]+/g,"-"):null;return i==="floor"&&e?`bindhome-inventory-floor-${e}.csv`:i==="area"&&e?`bindhome-inventory-area-${e}.csv`:"bindhome-inventory.csv"}function qt(i,t,e="text/plain;charset=utf-8"){let s=new Blob([t],{type:e}),r=URL.createObjectURL(s),o=document.createElement("a");o.href=r,o.download=i,o.style.display="none",document.body.append(o),o.click(),o.remove(),queueMicrotask(()=>URL.revokeObjectURL(r))}var vt=class extends m{constructor(){super(),this.hass=null,this.t=t=>t,this.floors=[],this.areas=[],this._scope="all",this._floorId="",this._areaId="",this._fileName="",this._csvText="",this._validation=null,this._busy=!1,this._error=null,this._success=null}_api(){return f(this.hass)}_selectedScopeId(){return this._scope==="floor"?this._floorId:this._scope==="area"?this._areaId:null}_scopeReady(){return this._scope==="all"||(this._scope==="floor"?!!this._floorId:!!this._areaId)}async _export(){if(!(!this.hass||!this._scopeReady())){this._busy=!0,this._error=null,this._success=null;try{let t=await this._api().exportInventoryCsv(),e=this._selectedScopeId(),s=Ns(t.csv,{scope:this._scope,floorId:this._floorId||null,areaId:this._areaId||null,areas:this.areas});qt(Ls(this._scope,e),s,"text/csv;charset=utf-8"),this._success=this.t("csv.export_success")}catch(t){this._error=y(t,this.t("csv.export_error")).message}finally{this._busy=!1}}}async _fileSelected(t){let e=t.currentTarget.files?.[0];e&&(this._fileName=e.name,this._csvText=await e.text(),await this._validate())}async _validate(){if(!(!this.hass||!this._csvText)){this._busy=!0,this._error=null,this._success=null,this._validation=null;try{this._validation=await this._api().validateInventoryCsv(this._csvText)}catch(t){this._error=y(t,this.t("csv.validate_error")).message}finally{this._busy=!1}}}async _commit(){if(!(!this.hass||!this._validation?.valid||!Number.isInteger(this._validation.revision))){this._busy=!0,this._error=null,this._success=null;try{let t=await this._api().importInventoryCsv({csv:this._csvText,revision:this._validation.revision}),e=await this._api().listAssets();this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:e,bubbles:!0,composed:!0})),this._validation={...t,revision:t.revision},this._success=this.t("csv.import_success",{created:t.preview?.created??0,updated:t.preview?.updated??0})}catch(t){let e=y(t,this.t("csv.import_error"));this._error=e.code==="conflict"?this.t("csv.conflict"):e.message}finally{this._busy=!1}}}_renderValidation(){let t=this._validation;if(!t)return a`<p class="muted">${this.t("csv.import_hint")}</p>`;if(!t.valid){let s=t.errors??[];return a`<div class="status error" role="alert">${this.t("csv.invalid",{count:s.length})}</div>
        <div class="table-wrap"><table><thead><tr><th>${this.t("csv.row")}</th><th>${this.t("csv.field")}</th><th>${this.t("csv.problem")}</th></tr></thead><tbody>
          ${s.map(r=>a`<tr><td>${r.row}</td><td>${r.field||this.t("common.not_set")}</td><td>${r.message}</td></tr>`)}
        </tbody></table></div>`}let e=t.preview??{created:0,updated:0,total:0,changes:[]};return a`<div class="status success">${this.t("csv.valid")}</div>
      <div class="summary">
        <span class="pill">${this.t("csv.created",{count:e.created})}</span>
        <span class="pill">${this.t("csv.updated",{count:e.updated})}</span>
        <span class="pill">${this.t("csv.total",{count:e.total})}</span>
      </div>
      <div class="table-wrap"><table><thead><tr><th>${this.t("csv.row")}</th><th>${this.t("csv.operation")}</th><th>${this.t("fields.name")}</th></tr></thead><tbody>
        ${(e.changes??[]).map(s=>a`<tr><td>${s.row}</td><td>${this.t(`csv.operation_${s.operation}`)}</td><td>${s.name}</td></tr>`)}
      </tbody></table></div>
      <div class="actions"><button class="primary" ?disabled=${this._busy} @click=${this._commit}>${this.t("csv.commit")}</button></div>`}render(){return a`<section class="tool surface">
      <h2>${this.t("csv.title")}</h2>
      <p class="muted">${this.t("csv.intro")}</p>
      <div class="split">
        <section class="pane">
          <h3>${this.t("csv.export_title")}</h3>
          <p class="muted">${this.t("csv.export_hint")}</p>
          <div class="grid">
            <label>${this.t("csv.scope")}
              <select .value=${this._scope} @change=${t=>{let e=t.currentTarget.value;(e==="all"||e==="floor"||e==="area")&&(this._scope=e)}}>
                <option value="all">${this.t("csv.scope_all")}</option>
                <option value="floor">${this.t("csv.scope_floor")}</option>
                <option value="area">${this.t("csv.scope_area")}</option>
              </select>
            </label>
            ${this._scope==="floor"?a`<label>${this.t("fields.floor")}
              <select .value=${this._floorId} @change=${t=>{this._floorId=t.currentTarget.value}}>
                <option value="">${this.t("csv.choose")}</option>
                ${this.floors.map(t=>a`<option value=${t.floor_id}>${t.name}</option>`)}
              </select></label>`:d}
            ${this._scope==="area"?a`<label>${this.t("fields.area")}
              <select .value=${this._areaId} @change=${t=>{this._areaId=t.currentTarget.value}}>
                <option value="">${this.t("csv.choose")}</option>
                ${this.areas.map(t=>a`<option value=${t.area_id}>${t.name}</option>`)}
              </select></label>`:d}
          </div>
          <div class="actions"><button class="primary" ?disabled=${this._busy||!this._scopeReady()} @click=${this._export}>${this.t("csv.export")}</button></div>
        </section>
        <section class="pane">
          <h3>${this.t("csv.import_title")}</h3>
          <p class="muted">${this.t("csv.import_warning")}</p>
          <label>${this.t("csv.file")}
            <input type="file" accept=".csv,text/csv" ?disabled=${this._busy} @change=${this._fileSelected} />
          </label>
          ${this._fileName?a`<p class="muted">${this._fileName}</p>`:d}
          ${this._renderValidation()}
        </section>
      </div>
      ${this._error?a`<div class="status error" role="alert">${this._error}</div>`:d}
      ${this._success?a`<div class="status success" role="status">${this._success}</div>`:d}
    </section>`}};h(vt,"properties",{hass:{attribute:!1},t:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},_scope:{state:!0},_floorId:{state:!0},_areaId:{state:!0},_fileName:{state:!0},_csvText:{state:!0},_validation:{state:!0},_busy:{state:!0},_error:{state:!0},_success:{state:!0}}),h(vt,"styles",[$,g`
      :host { display: block; }
      .tool { padding: 20px; }
      h2 { margin: 0 0 6px; font-size: 20px; font-weight: 500; }
      h3 { margin: 0 0 10px; font-size: 16px; font-weight: 500; }
      .muted { color: var(--secondary-text-color); }
      .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
      label { display: grid; gap: 6px; font-size: 13px; color: var(--secondary-text-color); }
      select, input[type="file"] { min-height: 42px; padding: 8px 10px; border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color); color: var(--primary-text-color); }
      .actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 14px; }
      button { min-height: 42px; padding: 0 15px; border: 0; border-radius: 8px; font: inherit; font-weight: 500; }
      button.primary { background: var(--primary-color); color: var(--text-primary-color, #fff); }
      button.secondary { background: var(--secondary-background-color); color: var(--primary-text-color); }
      button[disabled] { opacity: .5; cursor: default; }
      .split { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 22px; }
      .pane { min-width: 0; padding: 16px; border: 1px solid var(--divider-color); border-radius: 10px; }
      .status { margin-top: 12px; padding: 11px 12px; border-radius: 8px; background: var(--secondary-background-color); }
      .error { color: var(--error-color); }
      .success { color: var(--success-color, #2e7d32); }
      .table-wrap { overflow-x: auto; margin-top: 12px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th, td { padding: 8px 9px; border-bottom: 1px solid var(--divider-color); text-align: left; vertical-align: top; }
      th { color: var(--secondary-text-color); font-weight: 500; }
      .summary { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
      .pill { padding: 4px 8px; border-radius: 999px; background: var(--secondary-background-color); font-size: 12px; }
      @media (max-width: 760px) {
        .tool { padding: 16px 12px; }
        .grid, .split { grid-template-columns: 1fr; }
      }
    `]);_("bindhome-csv-inventory-tool",vt);function yi(i){let t=i?.registry;return!t||typeof t!="object"?null:{assets:Array.isArray(t.assets)?t.assets.length:0,relations:Array.isArray(t.relations)?t.relations.length:0,bindings:Array.isArray(t.bindings)?t.bindings.length:0,representations:Array.isArray(t.representations)?t.representations.length:0}}var xt=class extends m{constructor(){super(),this.hass=null,this.t=t=>t,this.revision=null,this._lastBackup=null,this._recovery=null,this._restoreFileName="",this._restoreBackup=null,this._restoreSummary=null,this._confirmed=!1,this._busy=!1,this._error=null,this._success=null,this._loadedIdentity=null}updated(t){if(!t.has("hass")||!this.hass)return;let e=this.hass?.user?.id??"browser";e!==this._loadedIdentity&&(this._loadedIdentity=e,this._loadStatus())}_api(){return f(this.hass)}async _loadStatus(){let t=this._loadedIdentity,[e,s]=await Promise.all([zt(this.hass,oe),this._api().getBackupRecoveryStatus().catch(()=>null)]);t===this._loadedIdentity&&(this._lastBackup=e.available&&typeof e.value=="string"?e.value:null,this._recovery=s)}async _exportBackup(){if(this.hass){this._busy=!0,this._error=null,this._success=null;try{let t=await this._api().exportRegistryBackup(),e=`${JSON.stringify(t.backup,null,2)}
`,s=new Date,r=s.toISOString().slice(0,10);qt(`bindhome-registry-backup-${r}.json`,e,"application/json;charset=utf-8"),this._lastBackup=s.toISOString(),await C(this.hass,oe,this._lastBackup),this._success=this.t("backup.export_success")}catch(t){this._error=y(t,this.t("backup.export_error")).message}finally{this._busy=!1}}}async _restoreFileSelected(t){let e=t.currentTarget.files?.[0];if(e){this._error=null,this._success=null,this._confirmed=!1,this._restoreFileName=e.name;try{let s=JSON.parse(await e.text());if(s?.format!=="bindhome.registry"||!s.registry)throw new Error(this.t("backup.invalid_envelope"));let r=yi(s);if(!r)throw new Error(this.t("backup.invalid_envelope"));this._restoreBackup=s,this._restoreSummary=r}catch(s){this._restoreBackup=null,this._restoreSummary=null,this._error=s instanceof Error?s.message:this.t("backup.invalid_file")}}}async _restore(){if(!(!this.hass||!this._restoreBackup||!this._confirmed)){this._busy=!0,this._error=null,this._success=null;try{let t=await this._api().restoreRegistryBackup({backup:this._restoreBackup,revision:this._recovery?.recovery_required?null:this.revision});this._confirmed=!1,this._success=t.reloaded===!1?this.t("backup.restore_saved_reload_failed"):this.t("backup.restore_success"),t.registry?.assets&&this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:t.registry.assets,bubbles:!0,composed:!0})),await this._loadStatus()}catch(t){let e=y(t,this.t("backup.restore_error"));this._error=e.code==="conflict"?this.t("backup.conflict"):e.message}finally{this._busy=!1}}}_renderSummary(){let t=this._restoreSummary;return t?a`<div class="summary">
      <span class="pill">${this.t("backup.assets",{count:t.assets})}</span>
      <span class="pill">${this.t("backup.relations",{count:t.relations})}</span>
      <span class="pill">${this.t("backup.bindings",{count:t.bindings})}</span>
      <span class="pill">${this.t("backup.representations",{count:t.representations})}</span>
    </div>`:d}render(){return a`<section class="tool">
      <h2>${this.t("backup.title")}</h2>
      <p class="muted">${this.t("backup.intro")}</p>
      ${this._recovery?.recovery_required?a`<div class="status warning" role="alert">${this.t("backup.recovery_required")}</div>`:d}
      <div class="grid">
        <section class="pane">
          <h3>${this.t("backup.export_title")}</h3>
          <p class="muted">${this.t("backup.export_hint")}</p>
          <p>${this._lastBackup?this.t("backup.last",{date:new Date(this._lastBackup).toLocaleString()}):this.t("backup.never")}</p>
          <div class="actions"><button class="primary" ?disabled=${this._busy} @click=${this._exportBackup}>${this.t("backup.download")}</button></div>
        </section>
        <section class="pane">
          <h3>${this.t("backup.restore_title")}</h3>
          <p class="muted">${this.t("backup.restore_warning")}</p>
          <input type="file" accept=".json,application/json" ?disabled=${this._busy} @change=${this._restoreFileSelected} />
          ${this._restoreFileName?a`<p class="muted">${this._restoreFileName}</p>`:d}
          ${this._renderSummary()}
          ${this._restoreBackup?a`
            <label class="confirm">
              <input type="checkbox" .checked=${this._confirmed} @change=${t=>{this._confirmed=!!t.currentTarget.checked}} />
              <span>${this.t("backup.confirm_overwrite")}</span>
            </label>
            <div class="actions"><button class="danger" ?disabled=${this._busy||!this._confirmed} @click=${this._restore}>${this.t("backup.restore")}</button></div>
          `:d}
        </section>
      </div>
      ${this._error?a`<div class="status error" role="alert">${this._error}</div>`:d}
      ${this._success?a`<div class="status success" role="status">${this._success}</div>`:d}
    </section>`}};h(xt,"properties",{hass:{attribute:!1},t:{attribute:!1},revision:{attribute:!1},_lastBackup:{state:!0},_recovery:{state:!0},_restoreFileName:{state:!0},_restoreBackup:{state:!0},_restoreSummary:{state:!0},_confirmed:{state:!0},_busy:{state:!0},_error:{state:!0},_success:{state:!0}}),h(xt,"styles",[$,g`
      :host { display: block; }
      .tool { padding: 20px; border-top: 1px solid var(--divider-color); }
      h2 { margin: 0 0 6px; font-size: 20px; font-weight: 500; }
      h3 { margin: 0 0 8px; font-size: 16px; font-weight: 500; }
      .muted { color: var(--secondary-text-color); }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 18px; }
      .pane { min-width: 0; padding: 16px; border: 1px solid var(--divider-color); border-radius: 10px; }
      .actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 14px; }
      button { min-height: 42px; padding: 0 15px; border: 0; border-radius: 8px; font: inherit; font-weight: 500; }
      button.primary { background: var(--primary-color); color: var(--text-primary-color, #fff); }
      button.secondary { background: var(--secondary-background-color); color: var(--primary-text-color); }
      button.danger { background: var(--error-color); color: #fff; }
      button[disabled] { opacity: .5; cursor: default; }
      input[type="file"] { width: 100%; min-height: 42px; padding: 8px; border: 1px solid var(--divider-color); border-radius: 8px; }
      .status { margin-top: 12px; padding: 11px 12px; border-radius: 8px; background: var(--secondary-background-color); }
      .warning { border-left: 4px solid var(--warning-color, #f9a825); }
      .error { color: var(--error-color); }
      .success { color: var(--success-color, #2e7d32); }
      .summary { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }
      .pill { padding: 4px 8px; border-radius: 999px; background: var(--secondary-background-color); font-size: 12px; }
      .confirm { display: flex; align-items: flex-start; gap: 9px; margin-top: 14px; line-height: 20px; }
      .confirm input { margin-top: 3px; }
      @media (max-width: 760px) { .tool { padding: 16px 12px; } .grid { grid-template-columns: 1fr; } }
    `]);_("bindhome-backup-restore-tool",xt);var vi=new Set(["entity_not_found"]),xi="binding_not_found",$i="already_bound";function wi(i){let t={};for(let e of i??[]){let s=e?.status??"unknown";t[s]=(t[s]??0)+1}return t}var $t=class extends m{constructor(){super(),this.hass=null,this.t=t=>t,this.areas=[],this.assets=[],this.bindingStatuses={records:[],summary:{}},this._recovery=null,this._drift=[],this._loading=!1,this._error=null}connectedCallback(){super.connectedCallback(),this.hass&&this._refreshSupplementalHealth()}updated(t){t.has("hass")&&this.hass&&t.get("hass")!==this.hass&&this._refreshSupplementalHealth()}_assetName(t){return this.assets.find(e=>e.id===t)?.name??t}_areaName(t){return t?this.areas.find(e=>e.area_id===t)?.name??t:this.t("health.no_area")}_staleAreas(){let t=new Set(this.areas.map(e=>e.area_id));return this.assets.filter(e=>e.area_id&&!t.has(e.area_id))}_bindingRecords(t){return(this.bindingStatuses?.records??[]).filter(e=>e.status===t)}_actionableBindings(){return(this.bindingStatuses?.records??[]).filter(t=>vi.has(t.status))}_dispatch(t,e){this.dispatchEvent(new CustomEvent(t,{detail:e,bubbles:!0,composed:!0}))}_openAsset(t){this._dispatch("health-open-asset",t)}_reviewImport(t){this._dispatch("health-review-import",t||null)}_openRecovery(){this._dispatch("health-open-recovery",null)}async _refreshSupplementalHealth(){if(!(!this.hass||this._loading)){this._loading=!0,this._error=null;try{let t=f(this.hass),[e,s]=await Promise.all([t.getBackupRecoveryStatus(),t.discoverImport()]);this._recovery=e;let r=new Map;for(let o of s?.proposals??[]){if(o?.duplicate_status===$i)continue;let n=o?.asset?.area_id??null,c=Math.max(1,o?.source?.entity_ids?.length??o?.bindings?.length??1);r.set(n,(r.get(n)??0)+c)}this._drift=[...r.entries()].map(([o,n])=>({areaId:o,count:n})).sort((o,n)=>this._areaName(o.areaId).localeCompare(this._areaName(n.areaId)))}catch(t){this._error=t instanceof Error?t.message:String(t)}finally{this._loading=!1}}}_renderBindingItems(t,e,s){return a`<div class="section">
      <h3>${this.t(e)}</h3>
      ${t.length?t.map(r=>a`<div class="item">
            <div class="item-copy">
              <strong>${this._assetName(r.asset_id)}</strong>
              <span>${this.t(s,{capability:r.capability,entity:r.entity_id??"\u2014"})}</span>
            </div>
            <button class="action" @click=${()=>this._openAsset(r.asset_id)}>${this.t("health.open_asset")}</button>
          </div>`):a`<p class="empty">${this.t("health.none")}</p>`}
    </div>`}render(){let t=this.bindingStatuses?.summary??{},e=this.bindingStatuses?.records??[],s=t.by_status??wi(e),r=this._actionableBindings(),o=this._bindingRecords(xi),n=this._staleAreas(),c=r.length+o.length+n.length+(this._recovery?.recovery_required?1:0)+this._drift.reduce((l,u)=>l+u.count,0);return a`<section class="card" aria-busy=${this._loading?"true":"false"}>
      <div class="head">
        <div>
          <h2>${this.t("health.title")}</h2>
          <p class="muted">${this.t("health.intro")}</p>
        </div>
        <button class="refresh" ?disabled=${this._loading} @click=${()=>this._refreshSupplementalHealth()}>
          ${this.t(this._loading?"health.refreshing":"health.refresh")}
        </button>
      </div>

      <div class="summary">
        <div class="metric"><strong>${t.total??e.length}</strong><span>${this.t("health.bindings_total")}</span></div>
        <div class="metric"><strong>${t.config_valid??0}</strong><span>${this.t("health.config_valid")}</span></div>
        <div class="metric"><strong>${t.runtime_available??0}</strong><span>${this.t("health.runtime_available")}</span></div>
      </div>
      <div class="status-strip">
        ${Object.entries(s).map(([l,u])=>a`<span class="pill">${this.t(`health.status.${l}`)}: ${u}</span>`)}
      </div>
      <p class=${c?"warning":"ok"}>${this.t(c?"health.actionable_count":"health.all_clear",{count:c})}</p>

      ${this._recovery?.recovery_required?a`<div class="section">
            <h3>${this.t("health.recovery_title")}</h3>
            <div class="item">
              <div class="item-copy"><strong class="error">${this.t("health.recovery_required")}</strong><span>${this.t("health.recovery_detail")}</span></div>
              <button class="action" @click=${()=>this._openRecovery()}>${this.t("health.open_recovery")}</button>
            </div>
          </div>`:d}

      ${this._renderBindingItems(r,"health.stale_bindings","health.stale_binding_detail")}
      ${this._renderBindingItems(o,"health.unbound_capabilities","health.unbound_detail")}

      <div class="section">
        <h3>${this.t("health.stale_areas")}</h3>
        ${n.length?n.map(l=>a`<div class="item">
              <div class="item-copy"><strong>${l.name}</strong><span>${this.t("health.stale_area_detail",{area:l.area_id})}</span></div>
              <button class="action" @click=${()=>this._openAsset(l.id)}>${this.t("health.fix_asset")}</button>
            </div>`):a`<p class="empty">${this.t("health.none")}</p>`}
      </div>

      <div class="section">
        <h3>${this.t("health.inverse_drift")}</h3>
        ${this._drift.length?this._drift.map(l=>a`<div class="item">
              <div class="item-copy"><strong>${this._areaName(l.areaId)}</strong><span>${this.t("health.undocumented_entities",{count:l.count})}</span></div>
              <button class="action" @click=${()=>this._reviewImport(l.areaId)}>${this.t("health.review_import")}</button>
            </div>`):a`<p class="empty">${this.t("health.no_inverse_drift")}</p>`}
      </div>

      ${this._error?a`<p class="error" role="alert">${this.t("health.load_error",{error:this._error})}</p>`:d}
    </section>`}};h($t,"properties",{hass:{attribute:!1},t:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},bindingStatuses:{attribute:!1},_recovery:{state:!0},_drift:{state:!0},_loading:{state:!0},_error:{state:!0}}),h($t,"styles",[$,g`
      :host { display: block; max-width: 1200px; margin: 24px auto 0; padding: 0 24px; }
      .card { border: 1px solid var(--divider-color); border-radius: 14px; background: var(--card-background-color); padding: 20px; }
      .head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
      .head h2 { margin: 0; font-size: 20px; }
      .head p { margin: 6px 0 0; }
      .refresh { border: 0; background: transparent; color: var(--primary-color); min-height: 40px; }
      .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 18px; }
      .metric { border: 1px solid var(--divider-color); border-radius: 10px; padding: 12px; }
      .metric strong { display: block; font-size: 22px; }
      .status-strip { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 0; }
      .pill { border-radius: 999px; background: var(--secondary-background-color); padding: 6px 10px; font-size: 12px; }
      .section { margin-top: 22px; }
      .section h3 { margin: 0 0 8px; font-size: 16px; }
      .item { display: flex; justify-content: space-between; align-items: center; gap: 14px; border-top: 1px solid var(--divider-color); padding: 12px 0; }
      .item:first-of-type { border-top: 0; }
      .item-copy { min-width: 0; }
      .item-copy strong, .item-copy span { display: block; }
      .item-copy span { color: var(--secondary-text-color); margin-top: 3px; }
      .action { flex: none; border: 0; border-radius: 8px; padding: 9px 12px; background: var(--primary-color); color: var(--text-primary-color, white); }
      .ok { color: var(--success-color, var(--primary-color)); }
      .warning { color: var(--warning-color); }
      .error { color: var(--error-color); }
      .empty { color: var(--secondary-text-color); margin: 8px 0 0; }
      @media (max-width: 600px) {
        :host { padding: 0 12px; }
        .summary { grid-template-columns: 1fr; }
        .item { align-items: flex-start; flex-direction: column; }
        .action { width: 100%; }
      }
    `]);_("bindhome-health-tool",$t);var wt=class extends m{constructor(){super(),this.hass=null,this.t=t=>t,this.presets=[],this.floors=[],this.areas=[],this.assets=[],this.registry={},this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this.refreshBindingData=null,this.refreshTopologyData=null,this.selectedAssetId=null,this._tab="inventory"}willUpdate(t){t.has("selectedAssetId")&&this.selectedAssetId&&(this._tab="inventory")}render(){return a`<div class="content-head">
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
          </button><button
            class=${this._tab==="maintenance"?"active":""}
            aria-current=${this._tab==="maintenance"?"page":"false"}
            @click=${()=>this._tab="maintenance"}
          >
            ${this.t("advanced.maintenance")}
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
          .selectedAssetId=${this.selectedAssetId}
          @assets-refreshed=${t=>this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:t.detail,bubbles:!0,composed:!0}))}
        ></bindhome-inventory-section>
      </section>
      <section class="view" ?hidden=${this._tab!=="infrastructure"}>
        <bindhome-infrastructure-inspector
          .t=${this.t}
          .registry=${this.registry}
          .areas=${this.areas}
        ></bindhome-infrastructure-inspector>
      </section>
      <section class="view" ?hidden=${this._tab!=="maintenance"}>
        <bindhome-health-tool
          .hass=${this.hass}
          .t=${this.t}
          .areas=${this.areas}
          .assets=${this.assets}
          .bindingStatuses=${this.bindingStatuses}
          @health-open-asset=${t=>{this.selectedAssetId=t.detail,this._tab="inventory"}}
          @health-review-import=${t=>this.dispatchEvent(new CustomEvent("review-import",{detail:t.detail,bubbles:!0,composed:!0}))}
          @health-open-recovery=${()=>this.renderRoot.querySelector("bindhome-backup-restore-tool")?.scrollIntoView?.({behavior:"smooth",block:"start"})}
        ></bindhome-health-tool>
        <bindhome-csv-inventory-tool
          .hass=${this.hass}
          .t=${this.t}
          .floors=${this.floors}
          .areas=${this.areas}
          @assets-refreshed=${t=>this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:t.detail,bubbles:!0,composed:!0}))}
        ></bindhome-csv-inventory-tool>
        <bindhome-backup-restore-tool
          .hass=${this.hass}
          .t=${this.t}
          .revision=${this.registry?.revision??null}
          @assets-refreshed=${t=>this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:t.detail,bubbles:!0,composed:!0}))}
        ></bindhome-backup-restore-tool>
      </section>`}};h(wt,"properties",{hass:{attribute:!1},t:{attribute:!1},presets:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},registry:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},selectedAssetId:{attribute:!1},_tab:{state:!0}}),h(wt,"styles",[$,g`
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
    `]);_("bindhome-advanced-view",wt);var kt=class extends m{constructor(){super(),this.t=t=>t,this.floors=[],this.areas=[],this._step=0}_complete(t){this.dispatchEvent(new CustomEvent("onboarding-complete",{detail:{startInventory:t},bubbles:!0,composed:!0}))}_renderWelcome(){return a`<p class="eyebrow">${this.t("onboarding.welcome_eyebrow")}</p><h1>${this.t("onboarding.welcome_title")}</h1><p class="lead">${this.t("onboarding.welcome_body")}</p><div class="example"><div class="example-row"><div class="example-box"><strong>${this.t("onboarding.stable_title")}</strong><span class="muted">${this.t("onboarding.stable_example")}</span></div><span class="arrow" aria-hidden="true">→</span><div class="example-box"><strong>${this.t("onboarding.replaceable_title")}</strong><span class="muted">${this.t("onboarding.replaceable_example")}</span></div></div></div>`}_renderModel(){let t=["asset","capability","binding","representation"];return a`<p class="eyebrow">${this.t("onboarding.model_eyebrow")}</p><h1>${this.t("onboarding.model_title")}</h1><p class="lead">${this.t("onboarding.model_body")}</p><div class="model">${t.map((e,s)=>a`<div class="model-row"><span class="number">${s+1}</span><div><strong>${this.t(`onboarding.${e}_title`)}</strong><span class="muted">${this.t(`onboarding.${e}_body`)}</span></div></div>`)}</div>`}_renderStructure(){return a`<p class="eyebrow">${this.t("onboarding.structure_eyebrow")}</p><h1>${this.t("onboarding.structure_title")}</h1><p class="lead">${this.t("onboarding.structure_body")}</p><div class="structure"><div class="counts"><div class="count"><strong>${this.floors.length}</strong><span class="muted">${this.t("onboarding.floors_detected")}</span></div><div class="count"><strong>${this.areas.length}</strong><span class="muted">${this.t("onboarding.areas_detected")}</span></div></div>${this.areas.length===0?a`<div class="warning">${this.t("onboarding.no_areas")}</div>`:a`<p class="muted">${this.t("onboarding.structure_ready")}</p>`}</div>`}_renderStart(){return a`<p class="eyebrow">${this.t("onboarding.start_eyebrow")}</p><h1>${this.t("onboarding.start_title")}</h1><p class="lead">${this.t("onboarding.start_body")}</p><div class="next-steps"><strong>${this.t("onboarding.after_inventory_title")}</strong><ol><li>${this.t("onboarding.after_inventory_binding")}</li><li>${this.t("onboarding.after_inventory_topology")}</li><li>${this.t("onboarding.after_inventory_representation")}</li></ol></div>`}render(){let t=[()=>this._renderWelcome(),()=>this._renderModel(),()=>this._renderStructure(),()=>this._renderStart()];return a`<div class="page">
      <div class="progress" aria-label=${this.t("onboarding.progress_label")}>${t.map((e,s)=>a`<span class=${s<=this._step?"active":""}></span>`)}</div>
      ${t[this._step]()}
      <div class="actions">
        ${this._step>0?a`<button @click=${()=>this._step-=1}>${this.t("onboarding.back")}</button>`:null}
        ${this._step<t.length-1?a`<button class="primary" @click=${()=>this._step+=1}>${this.t("onboarding.next")}</button>`:a`<button class="primary" ?disabled=${this.areas.length===0} @click=${()=>this._complete(!1)}>${this.t("nav.home")}</button>`}
        <button class="skip" @click=${()=>this._complete(!1)}>${this.t("onboarding.skip")}</button>
      </div>
    </div>`}};h(kt,"properties",{t:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},_step:{state:!0}}),h(kt,"styles",g`
    :host { display: block; }
    * { box-sizing: border-box; }
    .page { width: min(760px, calc(100% - 32px)); margin: 0 auto; padding: 48px 0 64px; }
    .eyebrow { margin: 0 0 8px; color: var(--primary-color); font-size: 13px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
    h1 { margin: 0; font-size: clamp(28px, 5vw, 38px); line-height: 1.15; font-weight: 500; }
    .lead { max-width: 680px; margin: 16px 0 0; color: var(--secondary-text-color); font-size: 17px; line-height: 1.55; }
    .progress { display: flex; gap: 8px; margin: 30px 0; }
    .progress span { height: 4px; flex: 1; border-radius: 999px; background: var(--divider-color); }
    .progress span.active { background: var(--primary-color); }
    .example, .model, .structure, .next-steps { margin-top: 28px; padding: 20px; border: 1px solid var(--divider-color); border-radius: 12px; background: var(--card-background-color); }
    .example-row { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: 12px; align-items: center; }
    .example-box { min-height: 86px; padding: 14px; border: 1px solid var(--divider-color); border-radius: 8px; }
    .example-box strong, .model strong { display: block; margin-bottom: 5px; font-weight: 500; }
    .muted { color: var(--secondary-text-color); line-height: 1.45; }
    .arrow { color: var(--secondary-text-color); font-size: 24px; }
    .model { display: grid; gap: 0; padding: 0; overflow: hidden; }
    .model-row { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 12px; padding: 16px 18px; border-bottom: 1px solid var(--divider-color); }
    .model-row:last-child { border-bottom: 0; }
    .number { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 50%; background: var(--secondary-background-color, var(--primary-background-color)); font-weight: 600; }
    .counts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
    .count { padding: 14px; border: 1px solid var(--divider-color); border-radius: 8px; }
    .count strong { display: block; font-size: 24px; font-weight: 500; }
    .warning { margin-top: 16px; padding: 12px 14px; border-left: 3px solid var(--warning-color, #f9a825); background: var(--secondary-background-color, var(--primary-background-color)); }
    .next-steps ol { margin: 12px 0 0; padding-left: 22px; color: var(--secondary-text-color); line-height: 1.6; }
    .actions { display: flex; align-items: center; gap: 10px; margin-top: 32px; }
    button { min-height: 44px; padding: 0 18px; border-radius: 8px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); font: inherit; font-weight: 500; }
    button.primary { border-color: var(--primary-color); background: var(--primary-color); color: var(--text-primary-color, #fff); }
    button.skip { margin-left: auto; border-color: transparent; background: transparent; color: var(--secondary-text-color); }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
    @media (max-width: 600px) {
      .page { width: min(100% - 24px, 760px); padding-top: 28px; }
      .example-row { grid-template-columns: 1fr; }
      .arrow { transform: rotate(90deg); justify-self: center; }
      .actions { flex-wrap: wrap; }
      button.skip { width: 100%; margin-left: 0; }
    }
  `);_("bindhome-onboarding-view",kt);var At=class extends m{constructor(){super(),this.hass=null,this.narrow=!1,this.route=null,this.panel=null,this._view="home",this._loading=!0,this._refreshing=!1,this._error=null,this._refreshError=null,this._presets=[],this._floors=[],this._areas=[],this._assets=[],this._registry=null,this._bindingStatuses={records:[],summary:{}},this._entityRegistry=[],this._deviceRegistry=[],this._initialized=!1,this._loadPromise=null,this._translationLanguage=null,this._dataGeneration=0,this._t=de(),this._contextAreaId=null,this._selectedAssetId=null,this._selectedAreaId=null,this._advancedAssetId=null,this._searchQuery="",this._addSessionId=0,this._advancedPinned=!1,this._advancedPreferenceIdentity=null,this._advancedPreferenceGeneration=0,this._onboardingVisible=!1,this._onboardingDismissed=!1,this._onboardingPreferenceIdentity=null,this._onboardingPreferenceGeneration=0,this._registryConflict=!1,this._registryUnsubscribe=null,this._registrySubscriptionConnection=null,this._registrySubscriptionGeneration=0,this._registryRefreshPromise=null,this._conflictUnsubscribe=null,this._reloadAfterConflictHandler=()=>this._reloadAfterConflict(),this._hassByView={home:null,add:null,advanced:null},this._refreshBindingDataHandler=()=>this._refreshBindingData(),this._refreshTopologyDataHandler=()=>this._refreshTopologyData(),this._refreshAssetsHandler=()=>this._refreshAssets(),this._searchQueryChangedHandler=t=>this._searchQueryChanged(t),this._addCreatedHandler=async t=>{let e=await this._refreshAssets(),s=t??e?.at(-1);s&&this._openAsset(s.id)}}connectedCallback(){super.connectedCallback(),this.hass&&this._initialized&&this._ensureRegistrySubscription()}disconnectedCallback(){this._dropRegistrySubscription(),this._dropConflictSubscription(),super.disconnectedCallback()}_dropRegistrySubscription(){this._registrySubscriptionGeneration+=1;let t=this._registryUnsubscribe;this._registryUnsubscribe=null,this._registrySubscriptionConnection=null,typeof t=="function"&&t()}_dropConflictSubscription(){let t=this._conflictUnsubscribe;this._conflictUnsubscribe=null,typeof t=="function"&&t()}async _ensureRegistrySubscription(){let t=this.hass?.connection;if(!t||t===this._registrySubscriptionConnection)return;this._dropRegistrySubscription(),this._dropConflictSubscription();let e=++this._registrySubscriptionGeneration;this._registrySubscriptionConnection=t,this._conflictUnsubscribe=Ye(this.hass,()=>{this._registryConflict=!0});try{let s=await f(this.hass).subscribeRegistryChanges(r=>this._registryChanged(r));if(e!==this._registrySubscriptionGeneration||t!==this._registrySubscriptionConnection){s();return}this._registryUnsubscribe=s}catch(s){e===this._registrySubscriptionGeneration&&t===this._registrySubscriptionConnection&&(this._registrySubscriptionConnection=null,this._dropConflictSubscription(),this._refreshError=s?.message||this._t("shell.refresh_error"))}}_registryChanged(t){if(!Number.isInteger(t?.revision)||t.revision<0)return;let e=this._registry?.revision;Number.isInteger(e)&&t.revision<=e||this._refreshRegistryFromEvent()}async _refreshRegistryFromEvent(){if(!this.hass)return;if(this._registryRefreshPromise)return this._registryRefreshPromise;let t=++this._dataGeneration,e=f(this.hass);this._registryRefreshPromise=Promise.all([e.getRegistry(),e.listBindingStatuses()]);try{let[s,r]=await this._registryRefreshPromise;if(t!==this._dataGeneration)return;this._registry=s,this._assets=s.assets??this._assets,this._bindingStatuses=r,this._refreshError=null,this._syncOnboardingVisibility()}catch(s){t===this._dataGeneration&&(this._refreshError=s?.message||this._t("shell.refresh_error"))}finally{this._registryRefreshPromise=null}}async _reloadAfterConflict(){await this._load(!1)}updated(t){(t.has("route")||t.has("hass"))&&this.route&&this._applyRoute(this.route),t.has("hass")&&(this._restoreAdvancedPreference(),this._restoreOnboardingPreference()),t.has("hass")&&this.hass&&!this._initialized&&!this._loadPromise?this._load(!0):t.has("hass")&&this.hass&&this._initialized&&(this.hass.language||"en")!==this._translationLanguage&&this._loadTranslations(this.hass.language||"en"),t.has("hass")&&this.hass&&this._initialized&&this._ensureRegistrySubscription()}async _loadTranslations(t=this.hass?.language||"en"){let e=t||"en",s=await le(this.hass,e);(this.hass?.language||"en")===e&&(this._t=s,this._translationLanguage=e)}async _load(t=!1){if(!this.hass||this._loadPromise)return this._loadPromise;let e=++this._dataGeneration;t?this._loading=!0:this._refreshing=!0,this._error=null,this._refreshError=null;let s=this.hass,r=f(s),o=Dt(s),n=s.language||"en";this._loadPromise=Promise.all([r.listPresets(),r.listAssets(),r.getRegistry(),r.listBindingStatuses(),o.listFloors(),o.listAreas(),o.listEntityRegistry(),o.listDeviceRegistry(),le(s,n)]);try{let[c,l,u,b,p,v,x,w,q]=await this._loadPromise;if(e!==this._dataGeneration)return;this._presets=c,this._assets=l,this._registry=u,this._bindingStatuses=b,this._floors=p,this._areas=v,this._entityRegistry=x,this._deviceRegistry=w,this._t=q,this._translationLanguage=n,this._registryConflict=!1,this._ensureRegistrySubscription()}catch(c){let l=c?.message||this._t("shell.load_error_detail");t||!this._initialized?this._error=l:this._refreshError=l}finally{this._initialized=!0,this._syncOnboardingVisibility(),this._loading=!1,this._refreshing=!1,this._loadPromise=null}}async _refreshBindingData(){if(!this.hass)return;let t=++this._dataGeneration,e=f(this.hass),[s,r]=await Promise.all([e.getRegistry(),e.listBindingStatuses()]);t===this._dataGeneration&&(this._registry=s,this._assets=s.assets??this._assets,this._bindingStatuses=r)}async _refreshTopologyData(){if(!this.hass)return;let t=++this._dataGeneration,e=await f(this.hass).getRegistry();t===this._dataGeneration&&(this._registry=e,this._assets=e.assets??this._assets)}async _refreshAssets(){if(!this.hass)return;let t=++this._dataGeneration,e=await f(this.hass).listAssets();if(t===this._dataGeneration)return this._assets=e,this._registry&&(this._registry={...this._registry,assets:e}),this._syncOnboardingVisibility(),e}_assetsRefreshed(t){this._assets=t.detail,this._registry&&(this._registry={...this._registry,assets:t.detail}),this._syncOnboardingVisibility()}_isAdmin(){return this.hass?.user?.is_admin!==!1}_routePrefix(){if(typeof this.route?.prefix=="string"&&this.route.prefix)return this.route.prefix;let t=this.panel?.url_path;return t?`/${t}`:"/bindhome"}_routeState(){return{view:this._view,areaId:this._selectedAreaId,assetId:this._selectedAssetId,query:this._searchQuery,contextAreaId:this._contextAreaId,advancedAssetId:this._advancedAssetId}}_commitRoute({replace:t=!1}={}){let e=me(this._routeState(),this._routePrefix());ge(e,{replace:t})}_applyRoute(t){let e=os(t,window.location.search);!this._isAdmin()&&(e.view==="add"||e.view==="advanced")&&(e=ue()),this._view=e.view,this._selectedAreaId=e.areaId,this._selectedAssetId=e.assetId,this._searchQuery=e.query,this._contextAreaId=e.contextAreaId,this._advancedAssetId=e.advancedAssetId;let s=me(e,this._routePrefix()),r=`${window.location.pathname}${window.location.search}`;s!==r&&ge(s,{replace:!0})}_navigate(t){if(!(!this._isAdmin()&&(t==="add"||t==="advanced"))&&(this._onboardingVisible&&this._dismissOnboarding(),!(t==="advanced"&&!this._advancedPinned))){if(t==="add"){this._openAdd(null);return}this._view==="advanced"&&t!=="advanced"&&(this._advancedAssetId=null),this._view=t,t!=="add"&&(this._contextAreaId=null),this._commitRoute()}}_openAdd(t=null){this._isAdmin()&&(this._addSessionId+=1,this._contextAreaId=t,this._view="add",this._commitRoute())}_searchQueryChanged(t){this._searchQuery=typeof t.detail=="string"?t.detail:"",this._view==="search"&&this._commitRoute({replace:!0})}_legacyAdvancedPreferenceKey(){return`bindhome.advanced-pinned.${this.hass?.user?.id??"browser"}`}async _restoreAdvancedPreference(){let t=this.hass?.user?.id??"browser";if(t===this._advancedPreferenceIdentity)return;this._advancedPreferenceIdentity=t;let e=++this._advancedPreferenceGeneration,s=await ne(this.hass,ie,this._legacyAdvancedPreferenceKey());e!==this._advancedPreferenceGeneration||t!==this._advancedPreferenceIdentity||(this._advancedPinned=this._isAdmin()&&s)}_setAdvancedPinned(t){this._isAdmin()||(t=!1),this._advancedPreferenceIdentity=this.hass?.user?.id??"browser",this._advancedPreferenceGeneration+=1,this._advancedPinned=t,C(this.hass,ie,t),!t&&this._view==="advanced"&&this._navigate("home")}_legacyOnboardingPreferenceKey(){return`bindhome.onboarding.v1.${this.hass?.user?.id??"browser"}`}async _restoreOnboardingPreference(){let t=this.hass?.user?.id??"browser";if(t===this._onboardingPreferenceIdentity)return;this._onboardingPreferenceIdentity=t;let e=++this._onboardingPreferenceGeneration,s=await ne(this.hass,re,this._legacyOnboardingPreferenceKey());e!==this._onboardingPreferenceGeneration||t!==this._onboardingPreferenceIdentity||(this._onboardingDismissed=s,this._syncOnboardingVisibility())}_syncOnboardingVisibility(){this._onboardingVisible=this._isAdmin()&&this._initialized&&!this._error&&this._assets.length===0&&!this._onboardingDismissed}_dismissOnboarding(){this._onboardingPreferenceIdentity=this.hass?.user?.id??"browser",this._onboardingPreferenceGeneration+=1,this._onboardingDismissed=!0,this._onboardingVisible=!1,C(this.hass,re,!0)}_completeOnboarding(){this._dismissOnboarding(),this._contextAreaId=null,this._view="home",this._commitRoute()}_homeNavigate(t){this._view="home",this._selectedAreaId=t.detail.areaId,this._selectedAssetId=t.detail.assetId,this._commitRoute()}_openAsset(t){let e=this._assets.find(s=>s.id===t);this._selectedAssetId=t,this._selectedAreaId=e?.area_id?this._areas.some(s=>s.area_id===e.area_id)?e.area_id:I:A,this._view="home",this._commitRoute()}_editAsset(t){!this._isAdmin()||!this._advancedPinned||(this._advancedAssetId=t,this._view="advanced",this._commitRoute())}_humanAssetCommitted(t){t?.id&&(this._assets=this._assets.map(e=>e.id===t.id?t:e),this._registry&&(this._registry={...this._registry,assets:this._assets}),this._selectedAssetId=t.id,this._selectedAreaId=t.area_id?this._areas.some(e=>e.area_id===t.area_id)?t.area_id:I:A,this._view==="home"&&this._commitRoute({replace:!0}))}_hassFor(t){return(this._view===t||this._hassByView[t]==null)&&(this._hassByView[t]=this.hass),this._hassByView[t]}_renderViews(){let t={t:this._t,floors:this._floors,areas:this._areas,assets:this._assets,registry:this._registry??{},bindingStatuses:this._bindingStatuses,entityRegistry:this._entityRegistry,deviceRegistry:this._deviceRegistry,refreshBindingData:this._refreshBindingDataHandler,refreshTopologyData:this._refreshTopologyDataHandler};return a`<section class="view" ?hidden=${this._view!=="home"}>
        <bindhome-home-view
          .hass=${this._hassFor("home")}
          .t=${t.t}
          .floors=${t.floors}
          .areas=${t.areas}
          .assets=${t.assets}
          .registry=${t.registry}
          .bindingStatuses=${t.bindingStatuses}
          .entityRegistry=${t.entityRegistry}
          .deviceRegistry=${t.deviceRegistry}
          .advancedEnabled=${this._isAdmin()&&this._advancedPinned}
          .readOnly=${!this._isAdmin()}
          .refreshBindingData=${t.refreshBindingData}
          .refreshTopologyData=${t.refreshTopologyData}
          .refreshAssets=${this._refreshAssetsHandler}
          .selectedAssetId=${this._selectedAssetId}
          .selectedAreaId=${this._selectedAreaId}
          @home-navigate=${this._homeNavigate}
          @add-in-area=${e=>this._openAdd(e.detail)}
          @open-advanced=${e=>this._editAsset(e.detail)}
          @asset-committed=${e=>this._humanAssetCommitted(e.detail)}
        ></bindhome-home-view>
      </section>
      <section class="view" ?hidden=${this._view!=="add"}>
        <bindhome-add-view
          .hass=${this._isAdmin()?this._hassFor("add"):null}
          .t=${this._t}
          .presets=${this._presets}
          .floors=${this._floors}
          .areas=${this._areas}
          .assets=${this._assets}
          .contextAreaId=${this._contextAreaId}
          .sessionId=${this._addSessionId}
          .onCreated=${this._addCreatedHandler}
          @assets-refreshed=${this._assetsRefreshed}
          @go-home=${()=>this._navigate("home")}
        ></bindhome-add-view>
      </section>
      <section class="view" ?hidden=${this._view!=="search"}>
        <bindhome-search-view
          .t=${this._t}
          .assets=${this._assets}
          .areas=${this._areas}
          .floors=${this._floors}
          .query=${this._searchQuery}
          @search-query-changed=${this._searchQueryChangedHandler}
          @open-asset=${e=>this._openAsset(e.detail)}
        ></bindhome-search-view>
      </section>
      <section class="view" ?hidden=${this._view!=="advanced"}>
        <bindhome-advanced-view
          .hass=${this._isAdmin()?this._hassFor("advanced"):null}
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
          .selectedAssetId=${this._advancedAssetId}
          @assets-refreshed=${this._assetsRefreshed}
          @review-import=${e=>this._openAdd(e.detail)}
        ></bindhome-advanced-view>
      </section>`}render(){let t;return this._loading?t=a`<div class="state" aria-busy="true">
        <div><div class="spinner"></div><p>${this._t("shell.loading")}</p></div>
      </div>`:this._error?t=a`<div class="state">
        <div class="state-content">
          <h2>${this._t("shell.load_error")}</h2>
          <p>${this._error}</p>
          <button class="retry" @click=${()=>this._load(!0)}>${this._t("common.retry")}</button>
        </div>
      </div>`:t=this._renderViews(),a`<div class="shell">
      <header class="top">
        <div class="leading"><ha-menu-button></ha-menu-button><div class="brand"><ha-icon icon="mdi:home-switch"></ha-icon><h1>BindHome</h1>${this._isAdmin()?d:a`<span class="read-only-badge">${this._t("common.read_only")}</span>`}</div></div>
        <nav class="tabs" aria-label=${this._t("shell.sections_label")}>
          ${["home",...this._isAdmin()?["add"]:[],"search"].map(e=>a`<button
              class=${this._view===e?"active":""}
              aria-current=${this._view===e?"page":"false"}
              @click=${()=>this._navigate(e)}
            >${this._t(`nav.${e}`)}</button>`)}
          ${this._isAdmin()?a`<button
                class=${this._view==="advanced"?"advanced active":"advanced"}
                aria-current=${this._view==="advanced"?"page":"false"}
                ?disabled=${!this._advancedPinned&&this._view!=="advanced"}
                @click=${()=>this._navigate("advanced")}
              >${this._t("nav.advanced")}</button>
              <ha-switch
                class="advanced-switch"
                .checked=${this._advancedPinned}
                aria-label=${this._t(this._advancedPinned?"nav.unpin_advanced":"nav.pin_advanced")}
                title=${this._t(this._advancedPinned?"nav.unpin_advanced":"nav.pin_advanced")}
                @change=${e=>this._setAdvancedPinned(!!e.currentTarget.checked)}
              ></ha-switch>`:d}
        </nav>
        <button
          class="refresh"
          aria-label=${this._t(this._refreshing?"shell.refreshing_label":"shell.refresh_label")}
          aria-busy=${this._refreshing?"true":"false"}
          title=${this._t(this._refreshing?"shell.refreshing_label":"shell.refresh_label")}
          @click=${()=>this._load(!1)}
          ?disabled=${this._loading||this._refreshing||!!this._loadPromise}
        ><ha-icon class=${this._refreshing?"spinning":""} icon="mdi:refresh"></ha-icon></button>
      </header>
      ${this._registryConflict?a`<div class="refresh-error registry-conflict" role="alert">
            <span>${this._t("shell.registry_conflict")}</span>
            <button class="retry" @click=${this._reloadAfterConflictHandler}>
              ${this._t("shell.registry_conflict_reload")}
            </button>
          </div>`:null}
      ${this._refreshError?a`<div class="refresh-error" role="alert">${this._t("shell.refresh_error")} ${this._refreshError}</div>`:null}
      <main>
        ${t}
        ${this._onboardingVisible?a`<div class="onboarding-overlay">
              <bindhome-onboarding-view
                .t=${this._t}
                .floors=${this._floors}
                .areas=${this._areas}
                @onboarding-complete=${this._completeOnboarding}
              ></bindhome-onboarding-view>
            </div>`:null}
      </main>
    </div>`}};h(At,"properties",{hass:{attribute:!1},narrow:{type:Boolean},route:{attribute:!1},panel:{attribute:!1},_view:{state:!0},_loading:{state:!0},_refreshing:{state:!0},_error:{state:!0},_presets:{state:!0},_floors:{state:!0},_areas:{state:!0},_assets:{state:!0},_registry:{state:!0},_bindingStatuses:{state:!0},_entityRegistry:{state:!0},_deviceRegistry:{state:!0},_refreshError:{state:!0},_t:{state:!0},_contextAreaId:{state:!0},_selectedAssetId:{state:!0},_selectedAreaId:{state:!0},_advancedAssetId:{state:!0},_searchQuery:{state:!0},_addSessionId:{state:!0},_advancedPinned:{state:!0},_onboardingVisible:{state:!0},_registryConflict:{state:!0}}),h(At,"styles",g`
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
    * { box-sizing: border-box; }
    .shell { min-height: 100vh; display: flex; flex-direction: column; }
    .top {
      display: flex;
      align-items: center;
      min-height: 60px;
      padding: 0 20px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
      background: var(--card-background-color, #fff);
    }
    .leading { display: flex; align-items: center; min-width: 0; }
    .leading > ha-menu-button { flex: none; }
    .brand { display: flex; align-items: center; gap: 9px; margin-right: 30px; }
    .brand ha-icon { color: var(--primary-color); --mdc-icon-size: 28px; }
    .brand h1 { margin: 0; font-size: 20px; font-weight: 500; }
    .read-only-badge { padding: 3px 7px; border-radius: 999px; background: var(--secondary-background-color); color: var(--secondary-text-color); font-size: 11px; font-weight: 500; }
    .tabs { align-self: stretch; display: flex; overflow-x: auto; scrollbar-width: none; }
    .tabs::-webkit-scrollbar { display: none; }
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
    .tabs button.active { color: var(--primary-text-color); border-bottom-color: var(--primary-color); }
    .tabs button.advanced[disabled] {
      color: var(--disabled-text-color, var(--secondary-text-color));
      opacity: 0.48;
      cursor: default;
      border-bottom-color: transparent;
    }
    .tabs .advanced-switch { flex: none; align-self: center; margin: 0 14px 0 4px; }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: -3px; }
    .refresh {
      width: 44px;
      height: 44px;
      margin-left: auto;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: var(--primary-color);
    }
    .refresh[disabled] { opacity: .55; cursor: progress; }
    .refresh ha-icon.spinning { animation: spin 0.8s linear infinite; }
    main { flex: 1; min-width: 0; }
    .onboarding-overlay {
      position: fixed;
      inset: 60px 0 0;
      z-index: 20;
      overflow: auto;
      background: var(--primary-background-color, #fafafa);
    }
    .view[hidden] { display: none; }
    .refresh-error {
      margin: 12px 24px 0;
      padding: 12px;
      border: 1px solid var(--error-color, #db4437);
      border-radius: 8px;
    }
    .state { min-height: 60vh; display: grid; place-items: center; padding: 24px; text-align: center; }
    .state-content { max-width: 520px; }
    .state h2 { margin: 0; font-size: 22px; font-weight: 500; }
    .state p { color: var(--secondary-text-color); line-height: 22px; }
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
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 650px) {
      .top {
        padding: 0 8px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 44px;
        grid-template-rows: 54px 50px;
      }
      .brand { margin: 0; padding-left: 6px; }
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
        padding-inline: 7px;
        font-size: 12px;
      }
      .tabs .advanced-switch {
        margin-inline: 4px 8px;
        transform: scale(0.88);
        transform-origin: center;
      }
      .refresh { grid-column: 2; grid-row: 1; }
      .refresh-error { margin-inline: 12px; }
      .onboarding-overlay { inset: 104px 0 0; }
    }
    @media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }
  `);_("bindhome-panel",At);})();
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
