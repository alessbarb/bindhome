(()=>{var Yt=Object.defineProperty;var Xt=(i,t,e)=>t in i?Yt(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var f=(i,t,e)=>Xt(i,typeof t!="symbol"?t+"":t,e);var B=globalThis,W=B.ShadowRoot&&(B.ShadyCSS===void 0||B.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,et=Symbol(),wt=new WeakMap,z=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==et)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(W&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=wt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&wt.set(e,t))}return t}toString(){return this.cssText}},At=i=>new z(typeof i=="string"?i:i+"",void 0,et),g=(i,...t)=>{let e=i.length===1?i[0]:t.reduce((s,r,a)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+i[a+1],i[0]);return new z(e,i,et)},kt=(i,t)=>{if(W)i.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),r=B.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=e.cssText,i.appendChild(s)}},st=W?i=>i:i=>i instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return At(e)})(i):i;var{is:Zt,defineProperty:te,getOwnPropertyDescriptor:ee,getOwnPropertyNames:se,getOwnPropertySymbols:ie,getPrototypeOf:re}=Object,V=globalThis,Et=V.trustedTypes,ae=Et?Et.emptyScript:"",oe=V.reactiveElementPolyfillSupport,P=(i,t)=>i,it={toAttribute(i,t){switch(t){case Boolean:i=i?ae:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,t){let e=i;switch(t){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},Ct=(i,t)=>!Zt(i,t),St={attribute:!0,type:String,converter:it,reflect:!1,useDefault:!1,hasChanged:Ct};Symbol.metadata??=Symbol("metadata"),V.litPropertyMetadata??=new WeakMap;var v=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=St){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),r=this.getPropertyDescriptor(t,s,e);r!==void 0&&te(this.prototype,t,r)}}static getPropertyDescriptor(t,e,s){let{get:r,set:a}=ee(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:r,set(n){let d=r?.call(this);a?.call(this,n),this.requestUpdate(t,d,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??St}static _$Ei(){if(this.hasOwnProperty(P("elementProperties")))return;let t=re(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(P("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(P("properties"))){let e=this.properties,s=[...se(e),...ie(e)];for(let r of s)this.createProperty(r,e[r])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,r]of e)this.elementProperties.set(s,r)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let r=this._$Eu(e,s);r!==void 0&&this._$Eh.set(r,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let r of s)e.unshift(st(r))}else t!==void 0&&e.push(st(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return kt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,s);if(r!==void 0&&s.reflect===!0){let a=(s.converter?.toAttribute!==void 0?s.converter:it).toAttribute(e,s.type);this._$Em=t,a==null?this.removeAttribute(r):this.setAttribute(r,a),this._$Em=null}}_$AK(t,e){let s=this.constructor,r=s._$Eh.get(t);if(r!==void 0&&this._$Em!==r){let a=s.getPropertyOptions(r),n=typeof a.converter=="function"?{fromAttribute:a.converter}:a.converter?.fromAttribute!==void 0?a.converter:it;this._$Em=r;let d=n.fromAttribute(e,a.type);this[r]=d??this._$Ej?.get(r)??d,this._$Em=null}}requestUpdate(t,e,s,r=!1,a){if(t!==void 0){let n=this.constructor;if(r===!1&&(a=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??Ct)(a,e)||s.useDefault&&s.reflect&&a===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:r,wrapped:a},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),a!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),r===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[r,a]of this._$Ep)this[r]=a;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[r,a]of s){let{wrapped:n}=a,d=this[r];n!==!0||this._$AL.has(r)||d===void 0||this.C(r,void 0,a,d)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[P("elementProperties")]=new Map,v[P("finalized")]=new Map,oe?.({ReactiveElement:v}),(V.reactiveElementVersions??=[]).push("2.1.2");var ct=globalThis,zt=i=>i,G=ct.trustedTypes,Pt=G?G.createPolicy("lit-html",{createHTML:i=>i}):void 0,Mt="$lit$",$=`lit$${Math.random().toFixed(9).slice(2)}$`,Lt="?"+$,ne=`<${Lt}>`,A=document,N=()=>A.createComment(""),D=i=>i===null||typeof i!="object"&&typeof i!="function",ht=Array.isArray,le=i=>ht(i)||typeof i?.[Symbol.iterator]=="function",rt=`[ 	
\f\r]`,R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Rt=/-->/g,Nt=/>/g,y=RegExp(`>|${rt}(?:([^\\s"'>=/]+)(${rt}*=${rt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Dt=/'/g,Ot=/"/g,Ut=/^(?:script|style|textarea|title)$/i,pt=i=>(t,...e)=>({_$litType$:i,strings:t,values:e}),o=pt(1),xe=pt(2),$e=pt(3),k=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),It=new WeakMap,w=A.createTreeWalker(A,129);function Tt(i,t){if(!ht(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return Pt!==void 0?Pt.createHTML(t):t}var de=(i,t)=>{let e=i.length-1,s=[],r,a=t===2?"<svg>":t===3?"<math>":"",n=R;for(let d=0;d<e;d++){let c=i[d],p,u,l=-1,_=0;for(;_<c.length&&(n.lastIndex=_,u=n.exec(c),u!==null);)_=n.lastIndex,n===R?u[1]==="!--"?n=Rt:u[1]!==void 0?n=Nt:u[2]!==void 0?(Ut.test(u[2])&&(r=RegExp("</"+u[2],"g")),n=y):u[3]!==void 0&&(n=y):n===y?u[0]===">"?(n=r??R,l=-1):u[1]===void 0?l=-2:(l=n.lastIndex-u[2].length,p=u[1],n=u[3]===void 0?y:u[3]==='"'?Ot:Dt):n===Ot||n===Dt?n=y:n===Rt||n===Nt?n=R:(n=y,r=void 0);let b=n===y&&i[d+1].startsWith("/>")?" ":"";a+=n===R?c+ne:l>=0?(s.push(p),c.slice(0,l)+Mt+c.slice(l)+$+b):c+$+(l===-2?d:b)}return[Tt(i,a+(i[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},O=class i{constructor({strings:t,_$litType$:e},s){let r;this.parts=[];let a=0,n=0,d=t.length-1,c=this.parts,[p,u]=de(t,e);if(this.el=i.createElement(p,s),w.currentNode=this.el.content,e===2||e===3){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(r=w.nextNode())!==null&&c.length<d;){if(r.nodeType===1){if(r.hasAttributes())for(let l of r.getAttributeNames())if(l.endsWith(Mt)){let _=u[n++],b=r.getAttribute(l).split($),x=/([.?@])?(.*)/.exec(_);c.push({type:1,index:a,name:x[2],strings:b,ctor:x[1]==="."?ot:x[1]==="?"?nt:x[1]==="@"?lt:S}),r.removeAttribute(l)}else l.startsWith($)&&(c.push({type:6,index:a}),r.removeAttribute(l));if(Ut.test(r.tagName)){let l=r.textContent.split($),_=l.length-1;if(_>0){r.textContent=G?G.emptyScript:"";for(let b=0;b<_;b++)r.append(l[b],N()),w.nextNode(),c.push({type:2,index:++a});r.append(l[_],N())}}}else if(r.nodeType===8)if(r.data===Lt)c.push({type:2,index:a});else{let l=-1;for(;(l=r.data.indexOf($,l+1))!==-1;)c.push({type:7,index:a}),l+=$.length-1}a++}}static createElement(t,e){let s=A.createElement("template");return s.innerHTML=t,s}};function E(i,t,e=i,s){if(t===k)return t;let r=s!==void 0?e._$Co?.[s]:e._$Cl,a=D(t)?void 0:t._$litDirective$;return r?.constructor!==a&&(r?._$AO?.(!1),a===void 0?r=void 0:(r=new a(i),r._$AT(i,e,s)),s!==void 0?(e._$Co??=[])[s]=r:e._$Cl=r),r!==void 0&&(t=E(i,r._$AS(i,t.values),r,s)),t}var at=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,r=(t?.creationScope??A).importNode(e,!0);w.currentNode=r;let a=w.nextNode(),n=0,d=0,c=s[0];for(;c!==void 0;){if(n===c.index){let p;c.type===2?p=new I(a,a.nextSibling,this,t):c.type===1?p=new c.ctor(a,c.name,c.strings,this,t):c.type===6&&(p=new dt(a,this,t)),this._$AV.push(p),c=s[++d]}n!==c?.index&&(a=w.nextNode(),n++)}return w.currentNode=A,r}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},I=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,r){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=E(this,t,e),D(t)?t===h||t==null||t===""?(this._$AH!==h&&this._$AR(),this._$AH=h):t!==this._$AH&&t!==k&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):le(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==h&&D(this._$AH)?this._$AA.nextSibling.data=t:this.T(A.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,r=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=O.createElement(Tt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(e);else{let a=new at(r,this),n=a.u(this.options);a.p(e),this.T(n),this._$AH=a}}_$AC(t){let e=It.get(t.strings);return e===void 0&&It.set(t.strings,e=new O(t)),e}k(t){ht(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,r=0;for(let a of t)r===e.length?e.push(s=new i(this.O(N()),this.O(N()),this,this.options)):s=e[r],s._$AI(a),r++;r<e.length&&(this._$AR(s&&s._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=zt(t).nextSibling;zt(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},S=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,r,a){this.type=1,this._$AH=h,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=a,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=h}_$AI(t,e=this,s,r){let a=this.strings,n=!1;if(a===void 0)t=E(this,t,e,0),n=!D(t)||t!==this._$AH&&t!==k,n&&(this._$AH=t);else{let d=t,c,p;for(t=a[0],c=0;c<a.length-1;c++)p=E(this,d[s+c],e,c),p===k&&(p=this._$AH[c]),n||=!D(p)||p!==this._$AH[c],p===h?t=h:t!==h&&(t+=(p??"")+a[c+1]),this._$AH[c]=p}n&&!r&&this.j(t)}j(t){t===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},ot=class extends S{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===h?void 0:t}},nt=class extends S{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==h)}},lt=class extends S{constructor(t,e,s,r,a){super(t,e,s,r,a),this.type=5}_$AI(t,e=this){if((t=E(this,t,e,0)??h)===k)return;let s=this._$AH,r=t===h&&s!==h||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,a=t!==h&&(s===h||r);r&&this.element.removeEventListener(this.name,this,s),a&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},dt=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){E(this,t)}};var ce=ct.litHtmlPolyfillSupport;ce?.(O,I),(ct.litHtmlVersions??=[]).push("3.3.3");var Ft=(i,t,e)=>{let s=e?.renderBefore??t,r=s._$litPart$;if(r===void 0){let a=e?.renderBefore??null;s._$litPart$=r=new I(t.insertBefore(N(),a),a,void 0,e??{})}return r._$AI(i),r};var ut=globalThis,m=class extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Ft(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return k}};m._$litElement$=!0,m.finalized=!0,ut.litElementHydrateSupport?.({LitElement:m});var he=ut.litElementPolyfillSupport;he?.({LitElement:m});(ut.litElementVersions??=[]).push("4.2.2");function C(i){return{async getRegistry(){return i.callWS({type:"bindhome/registry/get"})},async listAssets(){return(await i.callWS({type:"bindhome/assets/list"})).assets??[]},async listPresets(){return(await i.callWS({type:"bindhome/presets/list"})).presets??[]},async createAssetsBulk(t){return i.callWS({type:"bindhome/assets/create_bulk",assets:t})},async updateAsset(t,e){return(await i.callWS({...e,type:"bindhome/assets/update",asset_id:t})).asset},async deleteAsset(t){return i.callWS({type:"bindhome/assets/delete",asset_id:t})}}}var Q="__bindhome_no_floor__";function qt(i){return{async listFloors(){return(await i.callWS({type:"config/floor_registry/list"})??[]).map(e=>({floor_id:e.floor_id,name:e.name,level:e.level??null,icon:e.icon??null}))},async listAreas(){return(await i.callWS({type:"config/area_registry/list"})??[]).map(e=>({area_id:e.area_id,name:e.name,floor_id:e.floor_id??null,icon:e.icon??null}))}}}function _t(i,t){return t===Q?i.filter(e=>!e.floor_id):i.filter(e=>e.floor_id===t)}var pe="component.bindhome.common.panel_";async function ft(i,t){let e=async a=>(await i.callWS({type:"frontend/get_translations",language:a,category:"common",integration:["bindhome"]}))?.resources??{},s=await e("en"),r=s;if(t!=="en")try{r=await e(t)}catch{r=s}return mt(r,s)}function mt(i={},t={}){return(e,s={})=>{let r=`${pe}${e.replaceAll(".","_")}`;return(i[r]??t[r]??e).replace(/\{(\w+)\}/g,(n,d)=>s[d]??n)}}function J(i,t){return`${i}.${t===1?"one":"other"}`}function M(i,t){let e=`presets.${t.preset_id}.name`,s=i(e);return s===e?t.default_name:s}var L=class extends m{constructor(){super(),this.registry={},this.areas=[],this.t=t=>t,this._tab="assets",this._selectedAssetId=null}_areaName(t){return this.areas.find(e=>e.area_id===t)?.name??this.t(t?"infrastructure.unknown_area":"infrastructure.no_area")}_assetName(t){return this.registry.assets?.find(e=>e.id===t)?.name??t}_renderAssets(){let t=this.registry.assets??[];if(!t.length)return o`<div class="empty">${this.t("infrastructure.no_assets")}</div>`;if(this._selectedAssetId){let e=t.find(s=>s.id===this._selectedAssetId);if(e)return o`<button class="link" @click=${()=>this._selectedAssetId=null}>← ${this.t("infrastructure.back_assets")}</button><section class="detail"><h2>${e.name}</h2><dl><dt>${this.t("fields.type")}</dt><dd>${e.asset_type}</dd><dt>${this.t("fields.code")}</dt><dd>${e.code||this.t("common.not_set")}</dd><dt>${this.t("common.area")}</dt><dd>${this._areaName(e.area_id)}</dd><dt>${this.t("fields.capabilities")}</dt><dd>${e.capabilities?.join(", ")||this.t("common.none")}</dd></dl><details class="advanced"><summary>${this.t("infrastructure.advanced")}</summary><dl><dt>${this.t("infrastructure.asset_id")}</dt><dd>${e.id}</dd><dt>${this.t("infrastructure.area_id")}</dt><dd>${e.area_id||this.t("common.none")}</dd></dl></details></section>`}return o`<div class="table-wrap"><table><thead><tr><th>${this.t("fields.name")}</th><th>${this.t("fields.type")}</th><th>${this.t("common.area")}</th><th>${this.t("fields.capabilities")}</th></tr></thead><tbody>${t.map(e=>o`<tr><td><button class="link" @click=${()=>this._selectedAssetId=e.id}>${e.name}</button></td><td>${e.asset_type}</td><td>${this._areaName(e.area_id)}</td><td>${e.capabilities?.join(", ")||"\u2014"}</td></tr>`)}</tbody></table></div>`}_renderRelations(){let t=this.registry.relations??[];return t.length?o`<div class="table-wrap"><table><thead><tr><th>${this.t("fields.source")}</th><th>${this.t("fields.relation")}</th><th>${this.t("fields.target")}</th></tr></thead><tbody>${t.map(e=>o`<tr><td>${this._assetName(e.source_asset_id)}</td><td>${e.relation_type}</td><td>${this._assetName(e.target_asset_id)}</td></tr>`)}</tbody></table></div>`:o`<div class="empty">${this.t("infrastructure.no_relations")}</div>`}_renderBindings(){let t=this.registry.bindings??[];return t.length?o`<div class="table-wrap"><table><thead><tr><th>${this.t("fields.asset")}</th><th>${this.t("fields.capability")}</th><th>${this.t("fields.role")}</th><th>${this.t("fields.ha_entity")}</th></tr></thead><tbody>${t.map(e=>o`<tr><td>${this._assetName(e.asset_id)}</td><td>${e.capability}</td><td>${e.role}</td><td>${e.entity_id}</td></tr>`)}</tbody></table></div>`:o`<div class="empty">${this.t("infrastructure.no_bindings")}</div>`}render(){return o`<div class="content"><h1>${this.t("nav.infrastructure")}</h1><p class="muted">${this.t("infrastructure.intro")}</p><nav class="tabs" aria-label=${this.t("infrastructure.views_label")}>${["assets","relations","bindings"].map(t=>o`<button class=${this._tab===t?"active":""} @click=${()=>{this._tab=t,this._selectedAssetId=null}}>${this.t(`infrastructure.tabs.${t}`)}</button>`)}</nav>${this._tab==="assets"?this._renderAssets():this._tab==="relations"?this._renderRelations():this._renderBindings()}</div>`}};f(L,"properties",{registry:{attribute:!1},areas:{attribute:!1},t:{attribute:!1},_tab:{state:!0},_selectedAssetId:{state:!0}}),f(L,"styles",g`
    :host{display:block}*{box-sizing:border-box}.content{max-width:1200px;margin:auto;padding:28px 24px}h1,h2,p{margin:0}h1{font-size:24px;font-weight:500}h2{font-size:20px;font-weight:500}.muted{color:var(--secondary-text-color)}.tabs{margin-top:20px;display:flex;border-bottom:1px solid var(--divider-color);overflow-x:auto}.tabs button{min-height:46px;padding:0 16px;border:0;border-bottom:3px solid transparent;color:var(--secondary-text-color);background:transparent;cursor:pointer;font:inherit}.tabs button.active{color:var(--primary-color);border-bottom-color:var(--primary-color)}.tabs button:focus-visible,.link:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}.table-wrap{margin-top:20px;overflow-x:auto;background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:8px}table{width:100%;border-collapse:collapse;text-align:left}th,td{padding:12px 14px;border-bottom:1px solid var(--divider-color);vertical-align:top}th{font-size:12px;color:var(--secondary-text-color);background:var(--secondary-background-color)}tr:last-child td{border-bottom:0}.link{padding:0;border:0;color:var(--primary-color);background:transparent;cursor:pointer;font:inherit;font-weight:500;text-align:left}.empty{margin-top:20px;padding:28px;border:1px dashed var(--divider-color);border-radius:8px;text-align:center;color:var(--secondary-text-color)}.detail{margin-top:20px;padding:20px;border:1px solid var(--divider-color);border-radius:8px;background:var(--card-background-color)}.detail dl{display:grid;grid-template-columns:180px 1fr;gap:12px}.detail dt{color:var(--secondary-text-color)}.detail dd{margin:0;overflow-wrap:anywhere}.advanced{margin-top:20px;border-top:1px solid var(--divider-color);padding-top:14px}@media(max-width:600px){.content{padding:20px 12px}th,td{padding:10px}.detail dl{grid-template-columns:1fr;gap:4px}.detail dd{margin-bottom:10px}}
  `);customElements.define("bindhome-infrastructure-inspector",L);function bt(i,t){return(i?.name??"").localeCompare(t?.name??"",void 0,{sensitivity:"base",numeric:!0})}function gt(i){return[...i].sort(bt)}function vt(i,t,e){let s=new Map((i??[]).map(l=>[l.floor_id,l])),r=new Map((t??[]).map(l=>[l.area_id,l])),a=new Map;for(let l of e??[]){if(!l.area_id||!r.has(l.area_id))continue;let _=a.get(l.area_id)??[];_.push(l),a.set(l.area_id,_)}let n=(t??[]).map(l=>({area:l,assets:gt(a.get(l.area_id)??[])})).sort((l,_)=>bt(l.area,_.area)),d=(i??[]).map(l=>({floor:l,areas:n.filter(({area:_})=>_.floor_id===l.floor_id)})).sort((l,_)=>{let b=l.floor.level,x=_.floor.level;return typeof b=="number"&&typeof x=="number"&&b!==x?b-x:bt(l.floor,_.floor)}),c=n.filter(({area:l})=>!l.floor_id||!s.has(l.floor_id)),p=gt((e??[]).filter(l=>!l.area_id)),u=gt((e??[]).filter(l=>l.area_id&&!r.has(l.area_id)));return{floors:d,noFloorAreas:c,noAreaAssets:p,unknownAreaAssets:u}}function U(i){return{asset_id:i.id,name:i.name,asset_type:i.asset_type,code:i.code??"",area_id:i.area_id??"",capabilities:[...i.capabilities??[]]}}function jt(i){return i==null?null:String(i).trim()||null}function ue(i,t){return i.length!==t.length?!1:i.every((e,s)=>e===t[s])}function xt(i,t){if(t.asset_id!==i.id)throw new Error("Asset edit draft identity does not match the persisted Asset");let e={name:t.name,asset_type:t.asset_type,code:jt(t.code),area_id:jt(t.area_id),capabilities:[...t.capabilities??[]]},s={asset_id:i.id};e.name!==i.name&&(s.name=e.name),e.asset_type!==i.asset_type&&(s.asset_type=e.asset_type),e.code!==(i.code??null)&&(s.code=e.code),e.area_id!==(i.area_id??null)&&(s.area_id=e.area_id);let r=[...i.capabilities??[]];return ue(e.capabilities,r)||(s.capabilities=e.capabilities),s}function Ht(i,t){return Object.keys(xt(i,t)).length>1}function $t(i){return[i?.message,i?.body?.message,i?.data?.message,i?.error].filter(t=>typeof t=="string")}function Kt(i,t=null){let e=$t(i).find(s=>s.trim())??t;return{code:i?.code??i?.body?.code??i?.data?.code??null,message:e}}function Bt(i,t=null){for(let s of $t(i))try{let r=JSON.parse(s);if(Number.isInteger(r?.index)&&r.index>=0&&typeof r?.field=="string"&&typeof r?.message=="string")return{structured:!0,index:r.index,field:r.field,message:r.message}}catch{}return{structured:!1,index:null,field:null,message:$t(i).find(s=>s.trim())??t}}function Y(i){return{...i,capabilities:[...i.capabilities??[]]}}var T=class extends m{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.assets=[],this.areas=[],this.floors=[],this.registry={},this._editing=!1,this._draft=null,this._snapshot=null,this._saving=!1,this._error=null,this._saved=!1,this._newCapability=""}willUpdate(t){t.has("asset")&&this.asset&&!this._editing&&(this._snapshot=Y(this.asset),this._draft=U(this.asset))}get _dirty(){return!this._editing||!this._snapshot||!this._draft?!1:Ht(this._snapshot,this._draft)}_emitEditing(t){this.dispatchEvent(new CustomEvent("editing-changed",{detail:t,bubbles:!0,composed:!0}))}_startEdit(){this._snapshot=Y(this.asset),this._draft=U(this.asset),this._editing=!0,this._error=null,this._saved=!1,this._newCapability="",this._emitEditing(!0)}_cancel(){this._draft=U(this.asset),this._snapshot=Y(this.asset),this._editing=!1,this._error=null,this._newCapability="",this._emitEditing(!1)}_close(){this._editing||this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}_updateField(t,e){!this._draft||this._saving||(this._draft={...this._draft,[t]:e},this._error=null,this._saved=!1)}_removeCapability(t){this._updateField("capabilities",this._draft.capabilities.filter(e=>e!==t))}_addCapability(){let t=this._newCapability.trim();if(!t||this._draft.capabilities.includes(t)){this._newCapability="";return}this._updateField("capabilities",[...this._draft.capabilities,t]),this._newCapability=""}async _save(t=null){if(t?.preventDefault(),this._saving||!this._snapshot||!this._draft)return;let e=xt(this._snapshot,this._draft);if(Object.keys(e).length===1){this._editing=!1,this._emitEditing(!1);return}let{asset_id:s,...r}=e;this._saving=!0,this._error=null,this._saved=!1;try{let n=await C(this.hass).updateAsset(s,r);this.asset=n,this._snapshot=Y(n),this._draft=U(n),this._editing=!1,this._saved=!0,this._emitEditing(!1),this.dispatchEvent(new CustomEvent("asset-updated",{detail:n,bubbles:!0,composed:!0}))}catch(a){let n=Kt(a,this.t("editor.save_error"));this._error=n.message??this.t("editor.save_error")}finally{this._saving=!1}}_areaName(t){return t?this.areas.find(e=>e.area_id===t)?.name??this.t("infrastructure.unknown_area"):this.t("browser.no_area")}_assetName(t){return this.assets.find(e=>e.id===t)?.name??t}_entityName(t){return this.hass?.states?.[t]?.attributes?.friendly_name??t}_relations(){return(this.registry?.relations??[]).filter(t=>t.source_asset_id===this.asset.id||t.target_asset_id===this.asset.id)}_bindings(){return(this.registry?.bindings??[]).filter(t=>t.asset_id===this.asset.id)}_representation(){return(this.registry?.representations??[]).find(t=>t.asset_id===this.asset.id)}_renderAreaOptions(){let t=new Set(this.floors.map(a=>a.floor_id)),e=new Set(this.areas.map(a=>a.area_id)),s=this._draft?.area_id&&!e.has(this._draft.area_id)?this._draft.area_id:null,r=this.areas.filter(a=>!a.floor_id||!t.has(a.floor_id));return o`
      <option value="">
        ${this.t("browser.no_area")}
      </option>

      ${s?o`
            <option
              value=${s}
            >
              ${this.t("editor.unknown_area_option",{area_id:s})}
            </option>
          `:h}

      ${this.floors.map(a=>{let n=this.areas.filter(d=>d.floor_id===a.floor_id);return n.length?o`
            <optgroup
              label=${a.name}
            >
              ${n.map(d=>o`
                  <option
                    value=${d.area_id}
                  >
                    ${d.name}
                  </option>
                `)}
            </optgroup>
          `:h})}

      ${r.length?o`
            <optgroup
              label=${this.t("common.no_floor")}
            >
              ${r.map(a=>o`
                  <option
                    value=${a.area_id}
                  >
                    ${a.name}
                  </option>
                `)}
            </optgroup>
          `:h}
    `}_renderCapabilitiesReadOnly(){return this.asset.capabilities?.length?o`
      <div class="cap-list">
        ${this.asset.capabilities.map(t=>o`
            <span class="cap">
              ${t}
            </span>
          `)}
      </div>
    `:this.t("common.none")}_renderReadOnly(){return o`
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
    `}_renderForm(){return o`
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

        ${this._error?o`
              <div
                class="error"
                role="alert"
              >
                ${this._error}
              </div>
            `:h}

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
                .value=${this._draft.area_id}
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

            ${this._draft.capabilities.length?o`
                  <div
                    class="editable-caps"
                  >
                    ${this._draft.capabilities.map(t=>o`
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
                `:o`
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
    `}_renderConnections(){let t=this._relations(),e=this._bindings(),s=this._representation();return o`
      <section class="connections">
        <h3>
          ${this.t("editor.connections")}
        </h3>

        <div class="connection-grid">
          <article class="connection-card">
            <h4>
              ${this.t("editor.relations")}
            </h4>

            ${t.length?o`
                  <ul
                    class="connection-list"
                  >
                    ${t.map(r=>{let a=r.source_asset_id===this.asset.id,n=a?r.target_asset_id:r.source_asset_id;return o`
                          <li>
                            <strong>
                              ${a?this.t("editor.outgoing"):this.t("editor.incoming")}
                            </strong>
                            ·
                            ${r.relation_type}
                            <br />
                            <span
                              class="muted"
                            >
                              ${this._assetName(n)}
                            </span>
                          </li>
                        `})}
                  </ul>
                `:o`
                  <p class="muted">
                    ${this.t("editor.no_relations")}
                  </p>
                `}
          </article>

          <article class="connection-card">
            <h4>
              ${this.t("editor.bindings")}
            </h4>

            ${e.length?o`
                  <ul
                    class="connection-list"
                  >
                    ${e.map(r=>{let a=this._entityName(r.entity_id);return o`
                          <li>
                            <strong>
                              ${r.capability}
                            </strong>
                            · ${r.role}
                            <br />
                            <span>
                              ${a}
                            </span>

                            ${a!==r.entity_id?o`
                                  <br />
                                  <span
                                    class="muted"
                                  >
                                    ${r.entity_id}
                                  </span>
                                `:h}
                          </li>
                        `})}
                  </ul>
                `:o`
                  <p class="muted">
                    ${this.t("editor.no_bindings")}
                  </p>
                `}
          </article>

          <article class="connection-card">
            <h4>
              ${this.t("editor.representation")}
            </h4>

            ${s?o`
                  <p>
                    ${this.t("editor.platform")}:
                    <strong>
                      ${s.platform}
                    </strong>
                  </p>
                `:o`
                  <p class="muted">
                    ${this.t("editor.no_representation")}
                  </p>
                `}
          </article>
        </div>
      </section>
    `}render(){return this.asset?o`
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

        ${this._editing?h:o`
              <button
                class="button secondary"
                @click=${this._startEdit}
              >
                ${this.t("editor.edit")}
              </button>
            `}
      </div>

      ${this._saved?o`
            <p
              class="saved"
              role="status"
            >
              ${this.t("editor.saved")}
            </p>
          `:h}

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
    `:h}};f(T,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},floors:{attribute:!1},registry:{attribute:!1},_editing:{state:!0},_draft:{state:!0},_snapshot:{state:!0},_saving:{state:!0},_error:{state:!0},_saved:{state:!0},_newCapability:{state:!0}}),f(T,"styles",g`
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
  `);customElements.define("bindhome-asset-detail-editor",T);var X="__bindhome_no_area_assets__",Z="__bindhome_unknown_area_assets__",F=class extends m{constructor(){super(),this.hass=null,this.floors=[],this.areas=[],this.assets=[],this.presets=[],this.registry={},this.t=t=>t,this._selectedKey="",this._selectedAssetId=null,this._editorLocked=!1}get _hierarchy(){return vt(this.floors,this.areas,this.assets)}_countAssets(t){return this.t(J("counts.asset",t),{count:t})}_allAreaNodes(t=this._hierarchy){return[...t.floors.flatMap(e=>e.areas),...t.noFloorAreas]}_areaNode(t,e=this._hierarchy){return this._allAreaNodes(e).find(({area:s})=>s.area_id===t)}_targetForKey(t,e=this._hierarchy){if(!t)return null;if(t===X)return e.noAreaAssets.length?{kind:"no-area",title:this.t("browser.no_area"),description:this.t("browser.no_area_intro"),assets:e.noAreaAssets}:null;if(t===Z)return e.unknownAreaAssets.length?{kind:"unknown-area",title:this.t("browser.unknown_area"),description:this.t("browser.unknown_area_intro"),assets:e.unknownAreaAssets}:null;let s=this._areaNode(t,e);return s?{kind:"area",title:s.area.name,description:"",area:s.area,assets:s.assets}:null}willUpdate(t){if(this._selectedKey&&(t.has("floors")||t.has("areas")||t.has("assets"))){let e=vt(this.floors,this.areas,this.assets);this._targetForKey(this._selectedKey,e)||(this._selectedKey=""),this._selectedAssetId&&!this.assets.some(s=>s.id===this._selectedAssetId)&&(this._selectedAssetId=null,this._editorLocked=!1)}}_select(t){this._editorLocked||(this._selectedAssetId=null,this._selectedKey=t)}_openAsset(t){this._selectedAssetId=t}_closeAsset(){this._editorLocked||(this._selectedAssetId=null)}_locationKeyForAsset(t){return t.area_id?this.areas.some(e=>e.area_id===t.area_id)?t.area_id:Z:X}_handleEditingChanged(t){this._editorLocked=!!t.detail}_handleAssetUpdated(t){t.stopPropagation();let e=t.detail,s=this.assets.map(r=>r.id===e.id?e:r);this.assets=s,this._selectedKey=this._locationKeyForAsset(e),this._selectedAssetId=e.id,this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:s,bubbles:!0,composed:!0}))}_assetTypeLabel(t){let e=this.presets.find(s=>s.asset_type===t.asset_type);return e?M(this.t,e):t.asset_type}_renderAreaButton(t){let e=this._selectedKey===t.area.area_id;return o`
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
    `}_renderFloor(t){return o`
      <section class="floor">
        <div class="floor-title">
          <ha-icon
            icon="mdi:layers-outline"
          ></ha-icon>
          <span>${t.floor.name}</span>
        </div>

        ${t.areas.length?t.areas.map(e=>this._renderAreaButton(e)):o`
              <p class="empty-floor">
                ${this.t("browser.floor_no_areas")}
              </p>
            `}
      </section>
    `}_renderNoFloor(t){return t.noFloorAreas.length?o`
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
    `:h}_renderSpecials(t){if(!t.noAreaAssets.length&&!t.unknownAreaAssets.length)return h;let e=this._selectedKey===X,s=this._selectedKey===Z;return o`
      <div class="specials">
        ${t.noAreaAssets.length?o`
              <button
                class="special-button ${e?"selected":""}"
                aria-pressed=${e?"true":"false"}
                ?disabled=${this._editorLocked}
                @click=${()=>this._select(X)}
              >
                <span class="area-name">
                  ${this.t("browser.no_area")}
                </span>
                <span class="count">
                  ${this._countAssets(t.noAreaAssets.length)}
                </span>
              </button>
            `:h}

        ${t.unknownAreaAssets.length?o`
              <button
                class="special-button ${s?"selected":""}"
                aria-pressed=${s?"true":"false"}
                ?disabled=${this._editorLocked}
                @click=${()=>this._select(Z)}
              >
                <span class="area-name">
                  ${this.t("browser.unknown_area")}
                </span>
                <span class="count">
                  ${this._countAssets(t.unknownAreaAssets.length)}
                </span>
              </button>
            `:h}
      </div>
    `}_renderAsset(t,e){return o`
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
          ${t.code?o`
                <span>
                  ${this.t("fields.code")}:
                  ${t.code}
                </span>
              `:h}

          ${t.capabilities?.length?o`
                <span>
                  ${this.t("fields.capabilities")}:
                  ${t.capabilities.join(", ")}
                </span>
              `:h}

          ${e.kind==="unknown-area"?o`
                <span class="stale">
                  ${this.t("browser.stale_area",{area_id:t.area_id})}
                </span>
              `:h}
        </div>
      </li>
    `}_renderResults(t){let e=this._targetForKey(this._selectedKey,t);if(!this.assets.length)return o`
        <div class="empty">
          ${this.t("browser.no_assets_home")}
        </div>
      `;let s=this.assets.find(r=>r.id===this._selectedAssetId);return s?o`
        <bindhome-asset-detail-editor
          .hass=${this.hass}
          .t=${this.t}
          .asset=${s}
          .assets=${this.assets}
          .areas=${this.areas}
          .floors=${this.floors}
          .registry=${this.registry}
          @close=${this._closeAsset}
          @editing-changed=${this._handleEditingChanged}
          @asset-updated=${this._handleAssetUpdated}
        ></bindhome-asset-detail-editor>
      `:e?o`
      <div class="results-header">
        <div class="results-copy">
          <h2>${e.title}</h2>

          ${e.description?o`
                <p
                  class="results-description"
                >
                  ${e.description}
                </p>
              `:h}
        </div>

        <span class="results-count">
          ${this._countAssets(e.assets.length)}
        </span>
      </div>

      ${e.assets.length?o`
            <ul
              class="assets"
              aria-label=${this.t("browser.asset_list_label",{location:e.title})}
            >
              ${e.assets.map(r=>this._renderAsset(r,e))}
            </ul>
          `:o`
            <div class="empty">
              ${this.t("browser.no_assets_area")}
            </div>
          `}
    `:o`
        <div class="empty">
          ${this.t("browser.select_area")}
        </div>
      `}render(){let t=this._hierarchy;return o`
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
    `}};f(F,"properties",{hass:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},presets:{attribute:!1},registry:{attribute:!1},t:{attribute:!1},_selectedKey:{state:!0},_selectedAssetId:{state:!0},_editorLocked:{state:!0}}),f(F,"styles",g`
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
  `);customElements.define("bindhome-inventory-browser",F);function _e(i,t){return{key:`draft:${i.preset_id}:${t}`,presetId:i.preset_id,name:`${i.default_name} ${t}`,asset_type:i.asset_type,code:null,capabilities:[...i.suggested_capabilities??[]]}}function q(i=[]){return{presetOrder:i.map(t=>t.preset_id),presets:new Map(i.map(t=>[t.preset_id,t])),quantities:new Map(i.map(t=>[t.preset_id,0])),retained:new Map(i.map(t=>[t.preset_id,[]]))}}function Wt(i,t,e){let s=i.presets.get(t);if(!s)return i;let r=Math.max(0,Math.floor(Number(e)||0)),a=[...i.retained.get(t)??[]];for(;a.length<r;)a.push(_e(s,a.length+1));return{...i,quantities:new Map(i.quantities).set(t,r),retained:new Map(i.retained).set(t,a)}}function Vt(i,t,e){let s=new Map(i.retained);for(let[r,a]of s){let n=a.findIndex(c=>c.key===t);if(n===-1)continue;let d=[...a];d[n]={...d[n],...e},s.set(r,d);break}return{...i,retained:s}}function yt(i){return i.presetOrder.flatMap(t=>{let e=i.quantities.get(t)??0;return(i.retained.get(t)??[]).slice(0,e)})}function Gt(i,t){return yt(i).map(e=>{let s={name:e.name,asset_type:e.asset_type,area_id:t,capabilities:[...e.capabilities]};return e.code?.trim()&&(s.code=e.code.trim()),s})}function Qt(i,t){return(i??[]).filter(e=>e.area_id===t)}function Jt(i,t){let e=new Map(t.map(r=>[r.asset_type,r.group])),s=new Map;for(let r of i){let a=e.get(r.asset_type)??"other",n=s.get(a)??[];n.push(r),s.set(a,n)}return s}var tt=class{constructor(t,e=null){this.api=t,this.fallbackMessage=e,this.saving=!1}async save(t,e){if(this.saving)return{ok:!1,duplicate:!0};this.saving=!0;let s=Gt(t,e),r;try{r=await this.api.createAssetsBulk(s)}catch(a){return this.saving=!1,{ok:!1,duplicate:!1,error:Bt(a,this.fallbackMessage)}}try{let a=await this.api.listAssets();return{ok:!0,created:r.assets??[],assets:a,payload:s,refreshError:null}}catch(a){return{ok:!0,created:r.assets??[],assets:null,payload:s,refreshError:a}}finally{this.saving=!1}}};var j=class extends m{constructor(){super(),this.presets=[],this.t=t=>t,this.floors=[],this.areas=[],this.assets=[],this._step="select",this._floorId="",this._areaId="",this._draftState=q(),this._openGroups=new Set,this._openDrafts=new Set,this._saveError=null,this._saving=!1,this._success=null,this._confirmRoomChange=!1,this._controller=null}willUpdate(t){(t.has("presets")||t.has("t"))&&this.presets.length&&this._activeDrafts.length===0&&(this._draftState=q(this._localizedPresets()),this._openGroups=new Set([this.presets[0].group])),(t.has("hass")||t.has("t"))&&this.hass&&(this._controller=new tt(C(this.hass),this.t("errors.batch_fallback")))}get _selectedArea(){return this.areas.find(t=>t.area_id===this._areaId)}get _selectedFloor(){return this._floorId===Q?null:this.floors.find(t=>t.floor_id===this._floorId)}get _areaAssets(){return Qt(this.assets,this._areaId)}get _activeDrafts(){return yt(this._draftState)}_localizedPresets(){return this.presets.map(t=>({...t,default_name:M(this.t,t)}))}_groupLabel(t){return this.t(`groups.${t}`)===`groups.${t}`?t:this.t(`groups.${t}`)}_count(t,e){return this.t(J(t,e),{count:e})}_selectFloor(t){this._floorId=t.target.value,_t(this.areas,this._floorId).some(s=>s.area_id===this._areaId)||(this._areaId="")}_continue(){this._areaId&&(this._step="quantity")}_changeQuantity(t,e){if(this._saving)return;let s=this._draftState.quantities.get(t)??0;this._draftState=Wt(this._draftState,t,s+e),this._saveError=null}_toggleGroup(t){let e=new Set(this._openGroups);e.has(t)?e.delete(t):e.add(t),this._openGroups=e}_toggleDraft(t){let e=new Set(this._openDrafts);e.has(t)?e.delete(t):e.add(t),this._openDrafts=e}_updateDraft(t,e){if(this._saving)return;let s=Object.keys(e),r=this._activeDrafts.findIndex(a=>a.key===t);this._draftState=Vt(this._draftState,t,e),(!this._saveError?.structured||this._saveError.index===r&&s.includes(this._saveError.field))&&(this._saveError=null)}_removeCapability(t,e){this._updateDraft(t.key,{capabilities:t.capabilities.filter(s=>s!==e)})}_addCapability(t,e){let s=e.value.trim();!s||t.capabilities.includes(s)||(this._updateDraft(t.key,{capabilities:[...t.capabilities,s]}),e.value="")}async _save(){if(this._saving||!this._controller||!this._activeDrafts.length)return;this._saving=!0,this._saveError=null;let t=await this._controller.save(this._draftState,this._areaId);if(this._saving=!1,t.duplicate)return;if(!t.ok){if(this._saveError=t.error,this._step="review",t.error.structured){let s=this._activeDrafts[t.error.index];if(s){this._openDrafts=new Set([...this._openDrafts,s.key]),await this.updateComplete;let r=this.renderRoot.querySelector(`#${CSS.escape(this._fieldId(s,t.error.field))}`)??this.renderRoot.querySelector(".alert");r?.classList.contains("alert")&&r.setAttribute("tabindex","-1"),r?.scrollIntoView({behavior:"smooth",block:"center"}),r?.focus({preventScroll:!0})}}return}let e=t.assets??[...this.assets,...t.created];this.assets=e,this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:e,bubbles:!0,composed:!0})),this._success={count:t.created.length,areaName:this._selectedArea?.name??this.t("inventory.selected_area")},this._draftState=q(this._localizedPresets()),this._openGroups=new Set([this.presets[0]?.group].filter(Boolean)),this._openDrafts=new Set,this._step="success"}_backToQuantities(){this._step="quantity"}_requestRoomChange(){if(this._activeDrafts.length){this._confirmRoomChange=!0;return}this._step="select"}_discardAndChangeRoom(){this._draftState=q(this._localizedPresets()),this._saveError=null,this._openDrafts=new Set,this._confirmRoomChange=!1,this._floorId="",this._areaId="",this._step="select"}_fieldId(t,e){return`${t.key.replaceAll(":","-")}-${e}`}_fieldError(t,e){return this._saveError?.structured&&this._saveError.index===t&&this._saveError.field===e}_renderContext(){return o`<div class="context"><div class="context-inner">
      <div class="context-values">
        <div class="context-item"><ha-icon icon="mdi:layers-outline"></ha-icon><span class="context-label">${this.t("common.floor")}</span><span class="context-value">${this._selectedFloor?.name??this.t("common.no_floor")}</span></div>
        <div class="context-item"><ha-icon icon="mdi:floor-plan"></ha-icon><span class="context-label">${this.t("common.area")}</span><span class="context-value">${this._selectedArea?.name}</span></div>
      </div>
      <button class="button text" @click=${this._requestRoomChange} ?disabled=${this._saving}>${this.t("inventory.change_room")}</button>
    </div></div>`}_renderSelection(){let t=[...this.floors,{floor_id:Q,name:this.t("common.no_floor")}],e=_t(this.areas,this._floorId);return o`<div class="content selection">
      <h1>${this.t("inventory.title")}</h1><p class="muted intro">${this.t("inventory.selection_intro")}</p>
      <div class="field-block"><label for="floor">${this.t("common.floor")}</label><select id="floor" .value=${this._floorId} @change=${this._selectFloor}><option value="">${this.t("inventory.select_floor")}</option>${t.map(s=>o`<option value=${s.floor_id}>${s.name}</option>`)}</select><p class="muted helper">${this.t("inventory.no_floor_helper")}</p></div>
      <div class="field-block"><label for="area">${this.t("common.area")}</label><select id="area" .value=${this._areaId} @change=${s=>this._areaId=s.target.value} ?disabled=${!this._floorId}><option value="">${this.t("inventory.select_area")}</option>${e.map(s=>o`<option value=${s.area_id}>${s.name}</option>`)}</select>${this._floorId&&!e.length?o`<p class="muted helper">${this.t("inventory.no_areas")}</p>`:h}</div>
      <div class="actions"><button class="button primary" @click=${this._continue} ?disabled=${!this._areaId}>${this.t("inventory.continue")}</button></div>
    </div>`}_renderExisting(){let t=Jt(this._areaAssets,this.presets);return this._areaAssets.length?o`<div class="existing-summary">${[...t].map(([e,s])=>o`<div class="existing-group"><div class="existing-heading"><strong>${this._groupLabel(e)}</strong><span class="muted">${s.length}</span></div><ul class="existing-list">${s.map(r=>o`<li>${r.name}</li>`)}</ul></div>`)}</div>`:o`<p class="muted helper">${this.t("inventory.no_existing")}</p>`}_renderQuantity(){let t=new Map;for(let e of this.presets)t.set(e.group,[...t.get(e.group)??[],e]);return o`${this._renderContext()}${this._renderRoomChangeConfirmation()}<div class="content layout"><section><h1>${this.t("inventory.quantity_title")}</h1><p class="muted intro">${this.t("inventory.quantity_intro")}</p>
      <details class="mobile-existing"><summary><strong>${this.t("inventory.existing")}</strong><span class="muted">${this._areaAssets.length}</span></summary>${this._renderExisting()}</details>
      <div class="groups">${[...t].map(([e,s])=>{let r=s.reduce((n,d)=>n+(this._draftState.quantities.get(d.preset_id)??0),0),a=this._openGroups.has(e);return o`<section class="group"><button class="group-toggle" @click=${()=>this._toggleGroup(e)} aria-expanded=${a} aria-label=${this.t(a?"actions.collapse_group":"actions.expand_group",{group:this._groupLabel(e)})}><span class="group-title"><ha-icon icon=${a?"mdi:chevron-down":"mdi:chevron-right"}></ha-icon>${this._groupLabel(e)}</span><span class="muted">${this._count("counts.selected",r)}</span></button>${a?s.map(n=>{let d=this._draftState.quantities.get(n.preset_id)??0,c=M(this.t,n);return o`<div class="quantity-row"><div><div class="preset-name">${c}</div>${n.suggested_capabilities?.length?o`<div class="suggestions">${this.t("inventory.suggested",{capabilities:n.suggested_capabilities.join(", ")})}</div>`:h}</div><div class="stepper"><button aria-label=${this.t("actions.decrease_quantity",{name:c})} @click=${()=>this._changeQuantity(n.preset_id,-1)} ?disabled=${d===0||this._saving}><ha-icon icon="mdi:minus"></ha-icon></button><output aria-live="polite">${d}</output><button aria-label=${this.t("actions.increase_quantity",{name:c})} @click=${()=>this._changeQuantity(n.preset_id,1)} ?disabled=${this._saving}><ha-icon icon="mdi:plus"></ha-icon></button></div></div>`}):h}</section>`})}</div></section><aside class="rail"><h2>${this.t("inventory.existing")}</h2><p class="muted helper">${this.t("inventory.existing_unchanged")}</p>${this._renderExisting()}<div class="draft-count"><span class="muted">${this.t("inventory.being_added")}</span><strong>${this._count("counts.asset",this._activeDrafts.length)}</strong><p class="muted helper">${this.t("inventory.not_saved_yet")}</p></div></aside></div>${this._renderBottom("quantity")}`}_renderDraft(t,e){let s=this._openDrafts.has(t.key)||["name","asset_type","code","capabilities"].some(a=>this._fieldError(e,a)),r=this._saveError?.structured&&this._saveError.index===e;return o`<article class="draft-row ${r?"error":""}" data-draft-index=${e}><div class="draft-summary"><span class="draft-number">${e+1}</span><div class="draft-title"><strong>${t.name}</strong><span>${t.asset_type}</span></div><button class="draft-toggle" aria-label=${this.t(s?"actions.collapse_draft":"actions.edit_draft",{name:t.name})} aria-expanded=${s} @click=${()=>this._toggleDraft(t.key)}><ha-icon icon=${s?"mdi:chevron-up":"mdi:chevron-down"}></ha-icon></button></div>${s?o`<div class="draft-fields">
      ${this._renderInput(t,e,"name",this.t("fields.name"),t.name)}
      ${this._renderInput(t,e,"asset_type",this.t("fields.asset_type"),t.asset_type)}
      ${this._renderInput(t,e,"code",this.t("fields.code_optional"),t.code??"")}
      <div class="capabilities"><label>${this.t("fields.capabilities")}</label><div class="capability-list">${t.capabilities.length?t.capabilities.map(a=>o`<span class="capability">${a}<button aria-label=${this.t("actions.remove_capability",{capability:a})} @click=${()=>this._removeCapability(t,a)} ?disabled=${this._saving}><ha-icon icon="mdi:close"></ha-icon></button></span>`):o`<span class="muted helper">${this.t("fields.no_capabilities")}</span>`}</div><div class="add-capability"><label>${this.t("fields.custom_capability")}<input id=${this._fieldId(t,"capabilities")} placeholder=${this.t("fields.capability_placeholder")} aria-invalid=${this._fieldError(e,"capabilities")} aria-describedby=${this._fieldError(e,"capabilities")?`${this._fieldId(t,"capabilities")}-error`:h} @keydown=${a=>{a.key==="Enter"&&(a.preventDefault(),this._addCapability(t,a.target))}}></label><button class="button secondary" @click=${a=>this._addCapability(t,a.currentTarget.previousElementSibling.querySelector("input"))} ?disabled=${this._saving}>${this.t("common.add")}</button></div>${this._fieldError(e,"capabilities")?o`<p class="field-error" id=${`${this._fieldId(t,"capabilities")}-error`}>${this._saveError.message}</p>`:h}</div>
    </div>`:h}</article>`}_renderInput(t,e,s,r,a){let n=this._fieldError(e,s),d=this._fieldId(t,s);return o`<label for=${d}>${r}<input id=${d} .value=${a} aria-invalid=${n} aria-describedby=${n?`${d}-error`:h} @input=${c=>this._updateDraft(t.key,{[s]:s==="code"?c.target.value||null:c.target.value})} ?disabled=${this._saving}>${n?o`<span class="field-error" id=${`${d}-error`}>${this._saveError.message}</span>`:h}</label>`}_renderReview(){return o`${this._renderContext()}${this._renderRoomChangeConfirmation()}<div class="content">${this._saveError?o`<div class="alert" role="alert"><ha-icon icon="mdi:alert-circle-outline"></ha-icon><div><h3>${this.t("errors.nothing_saved")}</h3><p class="muted helper">${this._saveError.structured?this.t("errors.correct_field"):this._saveError.message||this.t("errors.batch_fallback")} ${this.t("errors.drafts_preserved")}</p></div></div>`:h}<div class="review-header"><div><h1>${this._count("review.title",this._activeDrafts.length)}</h1><p class="muted intro">${this.t("review.intro")}</p></div></div><section class="existing-review"><div class="section-heading"><div><h2>${this.t("review.registered")}</h2><p class="muted helper">${this.t("review.registered_helper")}</p></div><strong>${this._areaAssets.length}</strong></div></section><section class="drafts"><div class="section-heading"><div><h2>${this.t("inventory.being_added")}</h2><p class="muted helper">${this.t("review.atomic_batch")}</p></div><strong>${this._activeDrafts.length}</strong></div><div>${this._activeDrafts.map((t,e)=>this._renderDraft(t,e))}</div></section></div>${this._renderBottom("review")}`}_renderRoomChangeConfirmation(){return this._confirmRoomChange?o`<div class="content"><section class="alert" role="alertdialog" aria-labelledby="change-room-title" aria-describedby="change-room-description"><ha-icon icon="mdi:alert-outline"></ha-icon><div><h3 id="change-room-title">${this.t("discard.title")}</h3><p class="muted helper" id="change-room-description">${this.t("discard.description")}</p><div class="actions"><button class="button secondary" @click=${()=>this._confirmRoomChange=!1}>${this.t("discard.stay")}</button><button class="button primary" @click=${this._discardAndChangeRoom}>${this.t("discard.confirm")}</button></div></div></section></div>`:h}_renderBottom(t){let e=this._activeDrafts.length;return o`<div class="bottom-bar" aria-busy=${this._saving}><div class="bottom-inner"><p class="muted bottom-copy">${t==="review"?this._count("review.save_explanation",e):this._count("review.before_save",e)}</p>${t==="review"?o`<div><button class="button secondary" @click=${this._backToQuantities} ?disabled=${this._saving}>${this.t("review.back_quantities")}</button> <button class="button primary" @click=${this._save} ?disabled=${this._saving||!e}>${this._saving?this.t("review.saving"):this._count("review.save",e)}</button></div>`:o`<button class="button primary" @click=${()=>this._step="review"} ?disabled=${!e}>${this._count("review.review_items",e)}</button>`}</div></div>`}_renderSuccess(){return o`${this._renderContext()}<div class="content success"><div><ha-icon icon="mdi:check-circle-outline"></ha-icon><h1>${this._count("success.created",this._success.count)}</h1><p class="intro">${this._success.areaName}</p><p class="muted intro">${this.t("success.explanation")}</p><div class="actions"><button class="button primary" @click=${()=>this._step="quantity"}>${this.t("success.back")}</button><button class="button secondary" @click=${()=>this.dispatchEvent(new CustomEvent("view-infrastructure",{bubbles:!0,composed:!0}))}>${this.t("success.view")}</button></div></div></div>`}render(){return!this.floors.length&&!this.areas.length?o`<div class="content selection"><h1>${this.t("inventory.title")}</h1><p class="muted intro">${this.t("inventory.no_floor_area")}</p></div>`:this._step==="select"?this._renderSelection():this._step==="quantity"?this._renderQuantity():this._step==="review"?this._renderReview():this._renderSuccess()}};f(j,"properties",{hass:{attribute:!1},t:{attribute:!1},presets:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},_step:{state:!0},_floorId:{state:!0},_areaId:{state:!0},_draftState:{state:!0},_openGroups:{state:!0},_openDrafts:{state:!0},_saveError:{state:!0},_saving:{state:!0},_success:{state:!0},_confirmRoomChange:{state:!0}}),f(j,"styles",g`
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
  `);customElements.define("bindhome-inventory-workflow",j);var H=class extends m{constructor(){super(),this.hass=null,this.registry={},this.t=t=>t,this.presets=[],this.floors=[],this.areas=[],this.assets=[],this._active="browse"}_show(t){this._active=t}_forwardAssetsRefreshed(t){t.stopPropagation(),this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:t.detail,bubbles:!0,composed:!0}))}_showBrowseFromWorkflow(t){t.stopPropagation(),this._active="browse"}render(){return o`
      <nav
        class="subnav"
        aria-label=${this.t("inventory.views.label")}
      >
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
          @assets-refreshed=${this._forwardAssetsRefreshed}
        ></bindhome-inventory-browser>
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
    `}};f(H,"properties",{hass:{attribute:!1},registry:{attribute:!1},t:{attribute:!1},presets:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},_active:{state:!0}}),f(H,"styles",g`
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
  `);customElements.define("bindhome-inventory-section",H);var K=class extends m{constructor(){super(),this._view="inventory",this._loading=!0,this._error=null,this._refreshError=null,this._presets=[],this._floors=[],this._areas=[],this._assets=[],this._registry=null,this._initialized=!1,this._loadPromise=null,this._translationLanguage=null,this._t=mt()}updated(t){t.has("hass")&&this.hass&&!this._initialized&&!this._loadPromise?this._load(!0):t.has("hass")&&this.hass&&this._initialized&&(this.hass.language||"en")!==this._translationLanguage&&this._loadTranslations(this.hass.language||"en")}async _loadTranslations(t=this.hass?.language||"en"){let e=t||"en",s=await ft(this.hass,e);(this.hass?.language||"en")===e&&(this._t=s,this._translationLanguage=e)}async _load(t=!1){if(!this.hass||this._loadPromise)return this._loadPromise;t&&(this._loading=!0),this._error=null,this._refreshError=null;let e=this.hass,s=C(e),r=qt(e),a=e.language||"en";this._loadPromise=Promise.all([s.listPresets(),s.listAssets(),s.getRegistry(),r.listFloors(),r.listAreas(),ft(e,a)]);try{let[n,d,c,p,u,l]=await this._loadPromise;this._presets=n,this._assets=d,this._registry=c,this._floors=p,this._areas=u,this._t=l,this._translationLanguage=a}catch(n){let d=n?.message||this._t("shell.load_error_detail");t||!this._initialized?this._error=d:this._refreshError=d}finally{this._initialized=!0,this._loading=!1,this._loadPromise=null}}_assetsRefreshed(t){this._assets=t.detail,this._registry&&(this._registry={...this._registry,assets:t.detail})}render(){let t,e=this._t;return this._loading?t=o`<div class="state" aria-busy="true"><div class="state-content"><div class="spinner"></div><p>${e("shell.loading")}</p></div></div>`:this._error?t=o`<div class="state"><div class="state-content"><h2>${e("shell.load_error")}</h2><p>${this._error}</p><button class="retry" @click=${()=>this._load(!0)}>${e("common.retry")}</button></div></div>`:t=o`
      <section
        class="view"
        ?hidden=${this._view!=="inventory"}
      >
        <bindhome-inventory-section
          .hass=${this.hass}
          .t=${e}
          .presets=${this._presets}
          .floors=${this._floors}
          .areas=${this._areas}
          .assets=${this._assets}
          .registry=${this._registry??{}}
          @assets-refreshed=${this._assetsRefreshed}
        ></bindhome-inventory-section>
      </section>

      <section
        class="view"
        ?hidden=${this._view!=="infrastructure"}
      >
        <bindhome-infrastructure-inspector
          .t=${e}
          .registry=${this._registry??{}}
          .areas=${this._areas}
        ></bindhome-infrastructure-inspector>
      </section>
    `,o`<div class="shell"><header><div class="brand"><ha-icon icon="mdi:home-switch"></ha-icon><h1>BindHome</h1></div><button class="refresh" aria-label=${e("shell.refresh_label")} @click=${()=>this._load(!1)} ?disabled=${this._loading||!!this._loadPromise}><ha-icon icon="mdi:refresh"></ha-icon></button></header><nav aria-label=${e("shell.sections_label")}><button class=${this._view==="inventory"?"active":""} @click=${()=>this._view="inventory"}>${e("nav.inventory")}</button><button class=${this._view==="infrastructure"?"active":""} @click=${()=>this._view="infrastructure"}>${e("nav.infrastructure")}</button></nav>${this._refreshError?o`<div class="refresh-error" role="alert">${e("shell.refresh_error")} ${this._refreshError}</div>`:null}<main>${t}</main></div>`}};f(K,"properties",{hass:{attribute:!1},narrow:{type:Boolean},route:{attribute:!1},panel:{attribute:!1},_view:{state:!0},_loading:{state:!0},_error:{state:!0},_presets:{state:!0},_floors:{state:!0},_areas:{state:!0},_assets:{state:!0},_registry:{state:!0},_refreshError:{state:!0},_t:{state:!0}}),f(K,"styles",g`
    :host{display:block;height:100%;min-height:100vh;color:var(--primary-text-color,#212121);background:var(--primary-background-color,#fafafa);font-family:var(--paper-font-body1_-_font-family,Roboto,Noto,sans-serif)}*{box-sizing:border-box}.shell{min-height:100vh;display:flex;flex-direction:column}header{min-height:60px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:8px 24px;border-bottom:1px solid var(--divider-color,#e0e0e0);background:var(--card-background-color,#fff)}.brand{display:flex;align-items:center;gap:10px}.brand ha-icon{color:var(--primary-color);--mdc-icon-size:28px}.brand h1{margin:0;font-size:20px;font-weight:500}nav{min-height:52px;display:flex;gap:4px;padding:0 20px;border-bottom:1px solid var(--divider-color,#e0e0e0);background:var(--card-background-color,#fff);overflow-x:auto}nav button{min-height:52px;padding:0 16px;border:0;border-bottom:3px solid transparent;background:transparent;color:var(--secondary-text-color);font:inherit;font-size:14px;font-weight:500;cursor:pointer}nav button.active{color:var(--primary-color);border-bottom-color:var(--primary-color)}nav button:focus-visible,.refresh:focus-visible{outline:2px solid var(--primary-color);outline-offset:-3px}main{flex:1;min-height:0}.view[hidden]{display:none}.refresh{width:44px;height:44px;border:0;border-radius:8px;color:var(--primary-color);background:transparent;cursor:pointer}.refresh-error{margin:12px 24px 0;padding:12px;border:1px solid var(--error-color,#db4437);border-radius:8px}.state{min-height:60vh;display:grid;place-items:center;padding:24px;text-align:center}.state-content{max-width:520px}.state h2{margin:0;font-size:22px;font-weight:500}.state p{color:var(--secondary-text-color);line-height:22px}.retry{min-height:44px;padding:0 18px;border:0;border-radius:8px;color:var(--text-primary-color,#fff);background:var(--primary-color);font:inherit;font-weight:500;cursor:pointer}.spinner{width:40px;height:40px;margin:0 auto 16px;border:4px solid var(--divider-color);border-top-color:var(--primary-color);border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:600px){header{min-height:54px;padding:5px 14px}nav{padding:0 8px}nav button{padding-inline:12px}.refresh-error{margin-inline:14px}}@media(prefers-reduced-motion:reduce){.spinner{animation-duration:1.8s}}
  `);customElements.define("bindhome-panel",K);})();
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
