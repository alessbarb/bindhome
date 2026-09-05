(()=>{var Be=Object.defineProperty;var Ue=(r,t,e)=>t in r?Be(r,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[t]=e;var u=(r,t,e)=>Ue(r,typeof t!="symbol"?t+"":t,e);var ut=globalThis,gt=ut.ShadowRoot&&(ut.ShadyCSS===void 0||ut.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,It=Symbol(),te=new WeakMap,O=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==It)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(gt&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=te.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&te.set(e,t))}return t}toString(){return this.cssText}},ee=r=>new O(typeof r=="string"?r:r+"",void 0,It),m=(r,...t)=>{let e=r.length===1?r[0]:t.reduce((s,i,o)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[o+1],r[0]);return new O(e,r,It)},se=(r,t)=>{if(gt)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),i=ut.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,r.appendChild(s)}},St=gt?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return ee(e)})(r):r;var{is:qe,defineProperty:je,getOwnPropertyDescriptor:Fe,getOwnPropertyNames:Ke,getOwnPropertySymbols:We,getPrototypeOf:Ge}=Object,mt=globalThis,ie=mt.trustedTypes,Qe=ie?ie.emptyScript:"",Ve=mt.reactiveElementPolyfillSupport,B=(r,t)=>r,Rt={toAttribute(r,t){switch(t){case Boolean:r=r?Qe:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},ae=(r,t)=>!qe(r,t),re={attribute:!0,type:String,converter:Rt,reflect:!1,useDefault:!1,hasChanged:ae};Symbol.metadata??=Symbol("metadata"),mt.litPropertyMetadata??=new WeakMap;var I=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=re){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&je(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){let{get:i,set:o}=Fe(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:i,set(n){let d=i?.call(this);o?.call(this,n),this.requestUpdate(t,d,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??re}static _$Ei(){if(this.hasOwnProperty(B("elementProperties")))return;let t=Ge(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(B("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(B("properties"))){let e=this.properties,s=[...Ke(e),...We(e)];for(let i of s)this.createProperty(i,e[i])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let i of s)e.unshift(St(i))}else t!==void 0&&e.push(St(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return se(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){let o=(s.converter?.toAttribute!==void 0?s.converter:Rt).toAttribute(e,s.type);this._$Em=t,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,e){let s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let o=s.getPropertyOptions(i),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:Rt;this._$Em=i;let d=n.fromAttribute(e,o.type);this[i]=d??this._$Ej?.get(i)??d,this._$Em=null}}requestUpdate(t,e,s,i=!1,o){if(t!==void 0){let n=this.constructor;if(i===!1&&(o=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??ae)(o,e)||s.useDefault&&s.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:o},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),o!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,o]of s){let{wrapped:n}=o,d=this[i];n!==!0||this._$AL.has(i)||d===void 0||this.C(i,void 0,o,d)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};I.elementStyles=[],I.shadowRootOptions={mode:"open"},I[B("elementProperties")]=new Map,I[B("finalized")]=new Map,Ve?.({ReactiveElement:I}),(mt.reactiveElementVersions??=[]).push("2.1.2");var Lt=globalThis,oe=r=>r,_t=Lt.trustedTypes,ne=_t?_t.createPolicy("lit-html",{createHTML:r=>r}):void 0,ue="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,ge="?"+S,Ye=`<${ge}>`,D=document,q=()=>D.createComment(""),j=r=>r===null||typeof r!="object"&&typeof r!="function",Mt=Array.isArray,Je=r=>Mt(r)||typeof r?.[Symbol.iterator]=="function",Ct=`[ 	
\f\r]`,U=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,le=/-->/g,de=/>/g,R=RegExp(`>|${Ct}(?:([^\\s"'>=/]+)(${Ct}*=${Ct}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ce=/'/g,he=/"/g,me=/^(?:script|style|textarea|title)$/i,Ot=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),a=Ot(1),fs=Ot(2),bs=Ot(3),z=Symbol.for("lit-noChange"),c=Symbol.for("lit-nothing"),pe=new WeakMap,C=D.createTreeWalker(D,129);function _e(r,t){if(!Mt(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return ne!==void 0?ne.createHTML(t):t}var Xe=(r,t)=>{let e=r.length-1,s=[],i,o=t===2?"<svg>":t===3?"<math>":"",n=U;for(let d=0;d<e;d++){let l=r[d],p,_,h=-1,b=0;for(;b<l.length&&(n.lastIndex=b,_=n.exec(l),_!==null);)b=n.lastIndex,n===U?_[1]==="!--"?n=le:_[1]!==void 0?n=de:_[2]!==void 0?(me.test(_[2])&&(i=RegExp("</"+_[2],"g")),n=R):_[3]!==void 0&&(n=R):n===R?_[0]===">"?(n=i??U,h=-1):_[1]===void 0?h=-2:(h=n.lastIndex-_[2].length,p=_[1],n=_[3]===void 0?R:_[3]==='"'?he:ce):n===he||n===ce?n=R:n===le||n===de?n=U:(n=R,i=void 0);let v=n===R&&r[d+1].startsWith("/>")?" ":"";o+=n===U?l+Ye:h>=0?(s.push(p),l.slice(0,h)+ue+l.slice(h)+S+v):l+S+(h===-2?d:v)}return[_e(r,o+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},F=class r{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let o=0,n=0,d=t.length-1,l=this.parts,[p,_]=Xe(t,e);if(this.el=r.createElement(p,s),C.currentNode=this.el.content,e===2||e===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(i=C.nextNode())!==null&&l.length<d;){if(i.nodeType===1){if(i.hasAttributes())for(let h of i.getAttributeNames())if(h.endsWith(ue)){let b=_[n++],v=i.getAttribute(h).split(S),x=/([.?@])?(.*)/.exec(b);l.push({type:1,index:o,name:x[2],strings:v,ctor:x[1]==="."?zt:x[1]==="?"?Pt:x[1]==="@"?Nt:N}),i.removeAttribute(h)}else h.startsWith(S)&&(l.push({type:6,index:o}),i.removeAttribute(h));if(me.test(i.tagName)){let h=i.textContent.split(S),b=h.length-1;if(b>0){i.textContent=_t?_t.emptyScript:"";for(let v=0;v<b;v++)i.append(h[v],q()),C.nextNode(),l.push({type:2,index:++o});i.append(h[b],q())}}}else if(i.nodeType===8)if(i.data===ge)l.push({type:2,index:o});else{let h=-1;for(;(h=i.data.indexOf(S,h+1))!==-1;)l.push({type:7,index:o}),h+=S.length-1}o++}}static createElement(t,e){let s=D.createElement("template");return s.innerHTML=t,s}};function P(r,t,e=r,s){if(t===z)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl,o=j(t)?void 0:t._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(r),i._$AT(r,e,s)),s!==void 0?(e._$Co??=[])[s]=i:e._$Cl=i),i!==void 0&&(t=P(r,i._$AS(r,t.values),i,s)),t}var Dt=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??D).importNode(e,!0);C.currentNode=i;let o=C.nextNode(),n=0,d=0,l=s[0];for(;l!==void 0;){if(n===l.index){let p;l.type===2?p=new K(o,o.nextSibling,this,t):l.type===1?p=new l.ctor(o,l.name,l.strings,this,t):l.type===6&&(p=new Tt(o,this,t)),this._$AV.push(p),l=s[++d]}n!==l?.index&&(o=C.nextNode(),n++)}return C.currentNode=D,i}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},K=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=c,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=P(this,t,e),j(t)?t===c||t==null||t===""?(this._$AH!==c&&this._$AR(),this._$AH=c):t!==this._$AH&&t!==z&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Je(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==c&&j(this._$AH)?this._$AA.nextSibling.data=t:this.T(D.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=F.createElement(_e(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{let o=new Dt(i,this),n=o.u(this.options);o.p(e),this.T(n),this._$AH=o}}_$AC(t){let e=pe.get(t.strings);return e===void 0&&pe.set(t.strings,e=new F(t)),e}k(t){Mt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,i=0;for(let o of t)i===e.length?e.push(s=new r(this.O(q()),this.O(q()),this,this.options)):s=e[i],s._$AI(o),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=oe(t).nextSibling;oe(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},N=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,o){this.type=1,this._$AH=c,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=c}_$AI(t,e=this,s,i){let o=this.strings,n=!1;if(o===void 0)t=P(this,t,e,0),n=!j(t)||t!==this._$AH&&t!==z,n&&(this._$AH=t);else{let d=t,l,p;for(t=o[0],l=0;l<o.length-1;l++)p=P(this,d[s+l],e,l),p===z&&(p=this._$AH[l]),n||=!j(p)||p!==this._$AH[l],p===c?t=c:t!==c&&(t+=(p??"")+o[l+1]),this._$AH[l]=p}n&&!i&&this.j(t)}j(t){t===c?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},zt=class extends N{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===c?void 0:t}},Pt=class extends N{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==c)}},Nt=class extends N{constructor(t,e,s,i,o){super(t,e,s,i,o),this.type=5}_$AI(t,e=this){if((t=P(this,t,e,0)??c)===z)return;let s=this._$AH,i=t===c&&s!==c||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==c&&(s===c||i);i&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Tt=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){P(this,t)}};var Ze=Lt.litHtmlPolyfillSupport;Ze?.(F,K),(Lt.litHtmlVersions??=[]).push("3.3.3");var fe=(r,t,e)=>{let s=e?.renderBefore??t,i=s._$litPart$;if(i===void 0){let o=e?.renderBefore??null;s._$litPart$=i=new K(t.insertBefore(q(),o),o,void 0,e??{})}return i._$AI(r),i};var Bt=globalThis,g=class extends I{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=fe(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return z}};g._$litElement$=!0,g.finalized=!0,Bt.litElementHydrateSupport?.({LitElement:g});var He=Bt.litElementPolyfillSupport;He?.({LitElement:g});(Bt.litElementVersions??=[]).push("4.2.2");function f(r){return{async getRegistry(){return r.callWS({type:"bindhome/registry/get"})},async listAssets(){return(await r.callWS({type:"bindhome/assets/list"})).assets??[]},async listPresets(){return(await r.callWS({type:"bindhome/presets/list"})).presets??[]},async listBindingStatuses(){return r.callWS({type:"bindhome/bindings/status"})},async setBinding({assetId:t,capability:e,entityId:s,role:i="primary"}){return r.callWS({type:"bindhome/bindings/set",asset_id:t,capability:e,entity_id:s,role:i})},async deleteBinding(t){return r.callWS({type:"bindhome/bindings/delete",binding_id:t})},async createRelation({sourceAssetId:t,relationType:e,targetAssetId:s}){return r.callWS({type:"bindhome/relations/create",source_asset_id:t,relation_type:e,target_asset_id:s})},async deleteRelation(t){return r.callWS({type:"bindhome/relations/delete",relation_id:t})},async createAssetsBulk(t){return r.callWS({type:"bindhome/assets/create_bulk",assets:t})},async updateAsset(t,e){return(await r.callWS({...e,type:"bindhome/assets/update",asset_id:t})).asset},async deleteAsset(t){return r.callWS({type:"bindhome/assets/delete",asset_id:t})},async getDeleteImpact(t){return r.callWS({type:"bindhome/assets/delete_impact",asset_id:t})},async deleteAssetWithDependencies(t){return r.callWS({type:"bindhome/assets/delete_with_dependencies",asset_id:t})}}}var ft="__bindhome_no_floor__";function be(r){return{async listFloors(){return(await r.callWS({type:"config/floor_registry/list"})??[]).map(e=>({floor_id:e.floor_id,name:e.name,level:e.level??null,icon:e.icon??null}))},async listAreas(){return(await r.callWS({type:"config/area_registry/list"})??[]).map(e=>({area_id:e.area_id,name:e.name,floor_id:e.floor_id??null,icon:e.icon??null}))},async listEntityRegistry(){return r.callWS({type:"config/entity_registry/list"})},async listDeviceRegistry(){return r.callWS({type:"config/device_registry/list"})}}}function Ut(r,t){return t===ft?r.filter(e=>!e.floor_id):r.filter(e=>e.floor_id===t)}var ts="component.bindhome.common.panel_";async function qt(r,t){let e=async o=>(await r.callWS({type:"frontend/get_translations",language:o,category:"common",integration:["bindhome"]}))?.resources??{},s=await e("en"),i=s;if(t!=="en")try{i=await e(t)}catch{i=s}return jt(i,s)}function jt(r={},t={}){return(e,s={})=>{let i=`${ts}${e.replaceAll(".","_")}`;return(r[i]??t[i]??e).replace(/\{(\w+)\}/g,(n,d)=>s[d]??n)}}function bt(r,t){return`${r}.${t===1?"one":"other"}`}function E(r,t){let e=`presets.${t.preset_id}.name`,s=r(e);return s===e?t.default_name:s}var es={light_point:["mdi:lightbulb-outline","lighting"],socket:["mdi:power-socket-eu","electricity"],switch:["mdi:light-switch","electricity"],electrical_panel:["mdi:electric-switch","electricity"],circuit:["mdi:transmission-tower","electricity"],junction_box:["mdi:connection","electricity"],ethernet_outlet:["mdi:ethernet","network"],telephone_outlet:["mdi:phone-classic","network"],antenna_outlet:["mdi:television-classic","network"],wifi_access_point:["mdi:wifi","network"],radiator:["mdi:radiator","climate"],thermostat:["mdi:thermostat","climate"],fan:["mdi:fan","climate"],air_conditioning_unit:["mdi:air-conditioner","climate"],tap:["mdi:faucet","water"],shutoff_valve:["mdi:valve","water"],valve:["mdi:valve","water"],drain:["mdi:water-minus","water"],manifold:["mdi:pipe-valve","water"],door:["mdi:door","structure"],window:["mdi:window-closed","structure"],blind:["mdi:blinds","structure"],skylight:["mdi:window-open","structure"],boiler:["mdi:water-boiler","equipment"],water_heater:["mdi:water-boiler","equipment"],pump:["mdi:pump","equipment"],freezer:["mdi:fridge-outline","equipment"],appliance:["mdi:dishwasher","equipment"],machine:["mdi:cog-outline","equipment"]};function $(r,t){let e=es[t],s=`presets.${t}.name`,i=r(s);return{type:t,label:i===s?Ft(t):i,icon:e?.[0]??"mdi:cube-outline",category:e?.[1]??"other",known:!!e}}function Ft(r){let t=String(r||"").replaceAll("_"," ").trim();return t?t.charAt(0).toUpperCase()+t.slice(1):"\u2014"}var vt=["lighting","electricity","water","climate","equipment","network","structure","other"];function yt(r,t){let e={lighting:"mdi:lightbulb-outline",electricity:"mdi:flash-outline",water:"mdi:water-outline",climate:"mdi:thermometer",equipment:"mdi:tools",network:"mdi:lan",structure:"mdi:home-outline",other:"mdi:dots-horizontal-circle-outline"};return{category:t,label:r(`categories.${t}`),icon:e[t]??e.other}}var k="__bindhome_no_area__",A="__bindhome_stale_area__";function ve(r,t,e){let s=new Map(t.map(l=>[l.area_id,l])),i=new Map;for(let l of e){let p=l.area_id?s.has(l.area_id)?l.area_id:A:k;i.set(p,[...i.get(p)??[],l])}let n=[...r].sort((l,p)=>(l.level??999)-(p.level??999)||l.name.localeCompare(p.name)).map(l=>({id:l.floor_id,name:l.name,icon:l.icon,areas:t.filter(p=>p.floor_id===l.floor_id).sort(W)})),d=t.filter(l=>!l.floor_id).sort(W);return d.length&&n.push({id:"__no_floor__",name:null,icon:null,areas:d}),{groups:n,assetsByArea:i,unassigned:i.get(k)??[],stale:i.get(A)??[]}}function W(r,t){return r.name.localeCompare(t.name,void 0,{sensitivity:"base"})}function ye(r,t){let e=new Map;for(let s of t){let i=$(r,s.asset_type);e.set(i.category,[...e.get(i.category)??[],s])}return vt.filter(s=>e.has(s)).map(s=>({category:s,assets:e.get(s).sort(W)}))}function xe(r,t,e,s,i){let o=new Map(e.map(l=>[l.area_id,l])),n=new Map(s.map(l=>[l.floor_id,l])),d=i.trim().toLocaleLowerCase();return d?t.map(l=>{let p=l.area_id?o.get(l.area_id):null,_=p?.floor_id?n.get(p.floor_id):null,h=$(r,l.asset_type),v=[l.name,l.code,h.label,l.asset_type,p?.name,_?.name].filter(Boolean).map(x=>String(x).toLocaleLowerCase()).reduce((x,M,Et)=>x+(M===d?100-Et:M.startsWith(d)?50-Et:M.includes(d)?10-Et:0),0);return{asset:l,area:p,floor:_,type:h,score:v}}).filter(l=>l.score>0).sort((l,p)=>p.score-l.score||W(l.asset,p.asset)).slice(0,30):t.slice().sort(W).slice(0,8)}var w=m`
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
`;var ss={feeds:{outgoing:"relations.feeds.outgoing",incoming:"relations.feeds.incoming"},contains:{outgoing:"relations.contains.outgoing",incoming:"relations.contains.incoming"},controls:{outgoing:"relations.controls.outgoing",incoming:"relations.controls.incoming"},part_of:{outgoing:"relations.part_of.outgoing",incoming:"relations.part_of.incoming"}};function $e(r,t,e){let s=ss[t]?.[e];return{type:t,direction:e,label:s?r(s):r("relations.unknown",{type:Ft(t)}),known:!!s,icon:t==="feeds"?"mdi:flash-outline":t==="controls"?"mdi:tune":t==="contains"||t==="part_of"?"mdi:folder-outline":"mdi:vector-link"}}function we(r){return{socket:[{direction:"outgoing",relationType:"feeds",labelKey:"relations.actions.indicate_feeds"},{direction:"incoming",relationType:"feeds",labelKey:"relations.actions.power_source"}],circuit:[{direction:"outgoing",relationType:"feeds",labelKey:"relations.actions.add_powered"},{direction:"incoming",relationType:"feeds",labelKey:"relations.actions.panel_source"}],electrical_panel:[{direction:"outgoing",relationType:"feeds",labelKey:"relations.actions.add_powered"},{direction:"outgoing",relationType:"contains",labelKey:"relations.actions.add_content"}],junction_box:[{direction:"outgoing",relationType:"contains",labelKey:"relations.actions.add_content"}],manifold:[{direction:"outgoing",relationType:"contains",labelKey:"relations.actions.add_content"}],shutoff_valve:[{direction:"outgoing",relationType:"controls",labelKey:"relations.actions.indicate_controls"}],valve:[{direction:"outgoing",relationType:"controls",labelKey:"relations.actions.indicate_controls"}],light_point:[{direction:"incoming",relationType:"feeds",labelKey:"relations.actions.power_source"}]}[r]??[]}function T(r=[],t){return{outgoing:r.filter(e=>e.source_asset_id===t),incoming:r.filter(e=>e.target_asset_id===t)}}function ke(r=[]){return[...new Set(r.map(t=>t.relation_type).filter(Boolean))].sort()}function Kt(r){return/^[a-z][a-z0-9_]*$/.test(String(r).trim())}function Wt(r){return[r?.message,r?.body?.message,r?.data?.message,r?.error].filter(t=>typeof t=="string")}function y(r,t=null){let e=Wt(r).find(s=>s.trim())??t;return{code:r?.code??r?.body?.code??r?.data?.code??null,message:e}}function Ae(r,t=null){for(let s of Wt(r))try{let i=JSON.parse(s);if(Number.isInteger(i?.index)&&i.index>=0&&typeof i?.field=="string"&&typeof i?.message=="string")return{structured:!0,index:i.index,field:i.field,message:i.message}}catch{}return{structured:!1,index:null,field:null,message:Wt(r).find(s=>s.trim())??t}}function is(r){return String(r??"").trim()}function L(r){return is(r).toLocaleLowerCase()}function Ie(r,t){return L(r.name).localeCompare(L(t.name),void 0,{numeric:!0,sensitivity:"base"})||r.entityId.localeCompare(t.entityId)}function Ee(r,t,e){let s=L(t);if(!s)return e&&r.areaId===e?0:1;let i=[r.name,r.entityId,r.areaName,r.deviceName,r.domain].map(L),o=i.some(l=>l===s),n=i.some(l=>l.startsWith(s)),d=e&&r.areaId===e?0:1;return(o?0:n?1:2)*2+d}function Se({entityRegistry:r=[],deviceRegistry:t=[],states:e={},areas:s=[]}={}){let i=new Map(r.filter(l=>l?.entity_id).map(l=>[l.entity_id,l])),o=new Map(t.filter(l=>l?.id).map(l=>[l.id,l])),n=new Map(s.filter(l=>l?.area_id).map(l=>[l.area_id,l.name]));return[...new Set([...i.keys(),...Object.keys(e??{})])].map(l=>{let p=i.get(l)??null,_=e?.[l]??null,h=p?.device_id?o.get(p.device_id):null,[b]=l.split("."),v=p?.area_id??h?.area_id??null,x=_?.attributes?.friendly_name??p?.name??p?.original_name??l;return{entityId:l,domain:b,name:x,state:_?.state??null,registryEntry:p,deviceId:p?.device_id??null,deviceName:h?.name_by_user??h?.name??null,areaId:v,areaName:v?n.get(v)??null:null,disabled:!!p?.disabled_by,hidden:!!p?.hidden_by,isBindHome:p?.platform==="bindhome"}}).sort(Ie)}function Re(r,t="",e=null){let s=L(t);return[...r??[]].filter(i=>s?[i.name,i.entityId,i.areaName,i.deviceName,i.domain].some(o=>L(o).includes(s)):!0).sort((i,o)=>Ee(i,s,e)-Ee(o,s,e)||Ie(i,o))}var rs=8,as=20;function os(r,t){let e=`capabilities.${t}`,s=r(e);return s!==e?s:t.replaceAll("_"," ").replace(/\b\w/g,i=>i.toUpperCase())}var G=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.capability="",this.status=null,this.areas=[],this.entityRegistry=[],this.deviceRegistry=[],this.showEntityId=!0,this.refreshBindingData=null,this._editing=!1,this._search="",this._selectedEntityId=null,this._saving=!1,this._error=null,this._confirmDisconnect=!1,this._selectionMode="search",this._bindingIdentity=null,this._operation=0,this._committedDisconnectId=null}_candidates(){return Se({entityRegistry:this.entityRegistry,deviceRegistry:this.deviceRegistry,states:this.hass?.states,areas:this.areas})}willUpdate(){let t=this.asset?JSON.stringify([this.asset.id,this.capability,"primary"]):null;this._bindingIdentity!==null&&t!==this._bindingIdentity&&(this._editing=!1,this._selectedEntityId=null,this._search="",this._error=null,this._confirmDisconnect=!1,this._saving=!1,this._selectionMode="search",this._committedDisconnectId=null,this._operation+=1),this._bindingIdentity=t}_currentEntityId(){return this.status?.entity_id??this.status?.binding?.entity_id??null}_currentCandidate(){let t=this._currentEntityId();return this._candidates().find(e=>e.entityId===t)??null}_runtimeLabel(t){return t?t.state==="unavailable"?this.t("connection.unavailable"):t.state==="unknown"?this.t("connection.unknown"):t.state===null?this.t("connection.no_runtime"):this.t("connection.available"):this.t("connection.stale")}_configurationLabel(){return this.status?.status==="entity_not_found"||this.status?.config_valid!==!1?this.t("connection.configured"):this.t("connection.invalid_configuration")}_candidateStateLabel(t){return!t||t.state===null?this.t("connection.no_runtime"):t.state==="unavailable"?this.t("connection.unavailable"):t.state==="unknown"?this.t("connection.unknown"):t.state}_displayName(t,e){return t?.name&&(this.showEntityId||t.name!==e)?t.name:t?.deviceName??(this.showEntityId?e:this.t("connection.configured"))}_candidateMeta(t){return[this.showEntityId?t?.entityId:null,t?.areaName,t?.deviceName,t?this._candidateStateLabel(t):null].filter(Boolean).join(" \xB7 ")}_beginEdit(){this._saving||(this._editing=!0,this._selectedEntityId=this._currentEntityId(),this._search="",this._error=null,this._confirmDisconnect=!1,this._selectionMode="search")}_cancelEdit(){this._saving||(this._editing=!1,this._selectedEntityId=null,this._search="",this._error=null,this._confirmDisconnect=!1,this._selectionMode="search")}_select(t){this._saving||(this._selectedEntityId=t,this._error=null,this._selectionMode="selected")}_changeSelection(){this._saving||(this._selectionMode="search")}async _save(){if(this._saving||!this._selectedEntityId||!this.asset)return;this._saving=!0,this._error=null;let t=++this._operation,e=this._selectedEntityId;try{if(await f(this.hass).setBinding({assetId:this.asset.id,capability:this.capability,entityId:e,role:"primary"}),t!==this._operation)return;this._editing=!1,this._selectedEntityId=null,this._search="";try{this.refreshBindingData&&await this.refreshBindingData()}catch{this._error=this.t("connection.sync_warning")}}catch(s){if(t!==this._operation)return;let i=y(s,this.t("connection.save_error"));this._error=i.code==="binding_cycle"?this.t("connection.cycle_error"):i.message}finally{this._saving=!1}}async _disconnect(){let t=this.status?.binding;if(this._saving||!t||this._committedDisconnectId===t.id)return;this._saving=!0,this._error=null,this._editing=!1;let e=++this._operation;try{if(await f(this.hass).deleteBinding(t.id),e!==this._operation)return;this._committedDisconnectId=t.id,this._confirmDisconnect=!1;try{this.refreshBindingData&&await this.refreshBindingData()}catch{this._error=this.t("connection.sync_warning")}}catch(s){if(e!==this._operation)return;this._error=y(s,this.t("connection.disconnect_error")).message,this._confirmDisconnect=!0}finally{this._saving=!1}}_renderSummary(){let t=this.status?.binding,e=this._currentEntityId(),s=this._currentCandidate();return!t||this.status?.status==="binding_not_found"?a`<div class="summary">${this.t("connection.not_connected")}</div><div class="actions"><button class="primary" @click=${this._beginEdit}>${this.t("connection.connect")}</button></div>`:a`
      <div class="entity">${this._displayName(s,e)}</div>
      ${e&&this.showEntityId?a`<div class="technical">${e}</div>`:c}
      ${s?.areaName||s?.deviceName?a`<div class="summary">${[s.areaName,s.deviceName].filter(Boolean).join(" \xB7 ")}</div>`:c}
      <div class="summary">${this._configurationLabel()} · ${this.status?.status==="entity_not_found"?this.t("connection.stale"):this._runtimeLabel(s)}</div>
      <div class="actions">
        <button class="primary" @click=${this._beginEdit}>${this.t("connection.change")}</button>
        <button class="danger" @click=${()=>this._confirmDisconnect=!0} ?disabled=${this._saving}>${this.t("connection.disconnect")}</button>
      </div>
      ${this._confirmDisconnect?a`<div class="confirm" role="alertdialog" aria-label=${this.t("connection.confirm_disconnect")}><span>${this.t("connection.confirm_disconnect")}</span><button @click=${()=>this._confirmDisconnect=!1} ?disabled=${this._saving}>${this.t("editor.cancel")}</button><button class="danger" @click=${this._disconnect} ?disabled=${this._saving}>${this.t("connection.disconnect")}</button></div>`:c}
    `}_renderEditor(){let t=Re(this._candidates(),this._search,this.asset?.area_id),e=t.slice(0,this._search?as:rs),s=this._currentEntityId(),i=this._candidates().find(n=>n.entityId===this._selectedEntityId),o=!!(s&&s===this._selectedEntityId);return a`
      <div class="picker">
        ${s?a`<div class="current"><strong>${this.t("connection.current")}</strong><div class="entity">${this._displayName(this._currentCandidate(),s)}</div>${this.showEntityId?a`<div class="technical">${s}</div>`:c}</div>`:c}
        <label>${this.t("connection.search_label")}<input aria-label=${this.t("connection.search_label")} .value=${this._search} @input=${n=>{this._search=n.target.value,this._selectionMode="search"}} /></label>
        ${this._selectionMode==="selected"?a`<div class="selected-summary" aria-live="polite"><strong>${this.t("connection.selected")}</strong><div class="entity">✓ ${this._displayName(i,this._selectedEntityId)}</div><div class="technical">${i?this._candidateMeta(i):this.showEntityId?`${this._selectedEntityId} \xB7 ${this.t("connection.no_runtime")}`:this.t("connection.no_runtime")}</div><button @click=${this._changeSelection} ?disabled=${this._saving}>${this.t("connection.change_selection")}</button></div>`:a`
          ${!this._search&&e.length?a`<div class="suggestions-heading">${this.t("connection.suggestions")}</div>`:c}
          ${e.length?e.map(n=>a`<button class="candidate ${n.entityId===this._selectedEntityId?"selected":""}" aria-pressed=${n.entityId===this._selectedEntityId} @click=${()=>this._select(n.entityId)}><span class="entity">${this._displayName(n,n.entityId)}</span><span class="candidate-meta">${this._candidateMeta(n)}${n.disabled?` \xB7 ${this.t("connection.disabled")}`:""}${n.hidden?` \xB7 ${this.t("connection.hidden")}`:""}</span></button>`):a`<div class="muted">${this.t("connection.no_matches")}</div>`}
          ${t.length>e.length?a`<div class="muted result-count">${this.t("connection.showing_results",{shown:e.length,total:t.length})}</div>`:c}
        `}
        <div class="actions"><button @click=${this._cancelEdit} ?disabled=${this._saving}>${this.t("editor.cancel")}</button><button class="primary" @click=${this._save} ?disabled=${this._saving||!this._selectedEntityId||o}>${this._saving?this.t("connection.saving"):this.t("common.save")}</button></div>
      </div>
    `}render(){return this.asset?a`<article class="row"><strong>${os(this.t,this.capability)}</strong>${this._editing?this._renderEditor():this._renderSummary()}${this._error?a`<div class="error" role="alert">${this._error}</div>`:c}</article>`:c}};u(G,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},capability:{type:String},status:{attribute:!1},areas:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},showEntityId:{type:Boolean,attribute:"show-entity-id"},refreshBindingData:{attribute:!1},_editing:{state:!0},_search:{state:!0},_selectedEntityId:{state:!0},_saving:{state:!0},_error:{state:!0},_confirmDisconnect:{state:!0},_selectionMode:{state:!0}}),u(G,"styles",m`
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
  `);customElements.define("bindhome-primary-connection-editor",G);var Q=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.assets=[],this.areas=[],this.action=null,this.onRefresh=null,this._target="",this._query="",this._saving=!1,this._error=null,this._token=0,this._identity="",this._committed=!1}connectedCallback(){super.connectedCallback(),this._resetIdentity()}willUpdate(){let t=this._currentIdentity();this._identity&&t!==this._identity&&this._resetIdentity(),this._identity=t}_currentIdentity(){return`${this.asset?.id??""}:${this.action?.direction??""}:${this.action?.relationType??""}`}_resetIdentity(){this._token+=1,this._target="",this._query="",this._saving=!1,this._error=null,this._committed=!1,this._identity=this._currentIdentity()}_isCurrent(t,e){return t===this._token&&e===this._currentIdentity()}async _save(){if(this._saving||this._committed||!this._target||!this.asset||!this.action)return;let t=++this._token,e=this._currentIdentity();this._saving=!0,this._error=null;let s=this.action.direction==="incoming";try{if(await f(this.hass).createRelation({sourceAssetId:s?this._target:this.asset.id,relationType:this.action.relationType,targetAssetId:s?this.asset.id:this._target}),!this._isCurrent(t,e))return;this._committed=!0,this._saving=!1;try{await this.onRefresh?.()}catch{if(!this._isCurrent(t,e))return;this.dispatchEvent(new CustomEvent("sync-warning",{detail:this.t("topology.sync_warning"),bubbles:!0,composed:!0}))}if(!this._isCurrent(t,e))return;this.dispatchEvent(new CustomEvent("done",{bubbles:!0,composed:!0}))}catch(i){if(!this._isCurrent(t,e))return;let o=y(i,this.t("topology.create_error"));this._error=o.code==="conflict"?this.t("topology.duplicate_relation"):o.message}finally{this._isCurrent(t,e)&&!this._committed&&(this._saving=!1)}}render(){let t=this._query.toLocaleLowerCase(),e=this.assets.filter(s=>s.id!==this.asset?.id&&(!t||[s.name,s.code,s.asset_type].filter(Boolean).some(i=>String(i).toLocaleLowerCase().includes(t)))).slice(0,20);return a`<label
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
                >${this.areas.find(i=>i.area_id===s.area_id)?.name??this.t("home.unassigned")}</small
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
      </div>`}};u(Q,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},action:{attribute:!1},onRefresh:{attribute:!1},_target:{state:!0},_query:{state:!0},_saving:{state:!0},_error:{state:!0}}),u(Q,"styles",[w,m`
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
    `]);customElements.define("bindhome-contextual-relation-editor",Q);var V=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.areas=[],this.refreshAssets=null,this._name="",this._code="",this._areaId="",this._saving=!1,this._error=null,this._identity=null,this._operation=0,this._committed=!1}willUpdate(){this.asset?.id!==this._identity&&(this._identity=this.asset?.id??null,this._operation+=1,this._name=this.asset?.name??"",this._code=this.asset?.code??"",this._areaId=this.asset?.area_id??"",this._saving=!1,this._error=null,this._committed=!1)}async _save(t){if(t?.preventDefault(),this._saving||this._committed||!this.asset||!this._name.trim())return;let e={};if(this._name.trim()!==this.asset.name&&(e.name=this._name.trim()),(this._code.trim()||null)!==(this.asset.code||null)&&(e.code=this._code.trim()||null),(this._areaId||null)!==(this.asset.area_id||null)&&(e.area_id=this._areaId||null),!Object.keys(e).length){this.dispatchEvent(new CustomEvent("done",{bubbles:!0,composed:!0}));return}this._saving=!0,this._error=null;let s=++this._operation,i=this.asset.id;try{let o=await f(this.hass).updateAsset(i,e);if(s!==this._operation||i!==this.asset?.id)return;this._committed=!0,this.dispatchEvent(new CustomEvent("asset-committed",{detail:o,bubbles:!0,composed:!0}));try{this.refreshAssets&&await this.refreshAssets()}catch{if(s!==this._operation||i!==this.asset?.id)return;this.dispatchEvent(new CustomEvent("sync-warning",{detail:this.t("editor.sync_warning"),bubbles:!0,composed:!0}))}s===this._operation&&i===this.asset?.id&&this.dispatchEvent(new CustomEvent("done",{bubbles:!0,composed:!0}))}catch(o){if(s!==this._operation||i!==this.asset?.id)return;let n=y(o,this.t("editor.save_error"));this._error=n.code==="conflict"?this.t("editor.save_error"):n.message}finally{s===this._operation&&(this._saving=!1)}}render(){if(!this.asset)return c;let t=$(this.t,this.asset.asset_type);return a`<form class="surface" @submit=${this._save}>
      <div class="head"><ha-icon icon=${t.icon}></ha-icon><div><h2>${this.t("editor.human_title")}</h2><div class="type">${t.label}</div></div></div>
      <div class="fields">
        <label>${this.t("fields.name")}<input .value=${this._name} @input=${e=>this._name=e.target.value} required></label>
        <label>${this.t("fields.code_optional")}<input .value=${this._code} @input=${e=>this._code=e.target.value}></label>
        <label>${this.t("add.room")}<select .value=${this._areaId} @change=${e=>this._areaId=e.target.value}><option value="" ?selected=${!this._areaId}>${this.t("add.no_room")}</option>${this.areas.map(e=>a`<option value=${e.area_id} ?selected=${e.area_id===this._areaId}>${e.name}</option>`)}</select></label>
      </div>
      ${this._error?a`<div class="error" role="alert">${this._error}</div>`:c}
      <div class="actions"><button type="button" class="secondary" ?disabled=${this._saving} @click=${()=>this.dispatchEvent(new CustomEvent("cancel",{bubbles:!0,composed:!0}))}>${this.t("common.cancel")}</button><button class="primary" ?disabled=${this._saving||this._committed||!this._name.trim()}>${this._saving?this.t("editor.saving"):this.t("common.save")}</button></div>
    </form>`}};u(V,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},areas:{attribute:!1},refreshAssets:{attribute:!1},_name:{state:!0},_code:{state:!0},_areaId:{state:!0},_saving:{state:!0},_error:{state:!0}}),u(V,"styles",[w,m`
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
  `]);customElements.define("bindhome-human-asset-editor",V);var Y=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.refreshBindingData=null,this.refreshTopologyData=null,this.refreshAssets=null,this._impact=null,this._loading=!1,this._deleting=!1,this._error=null,this._identity=null}willUpdate(){this.asset?.id!==this._identity&&(this._identity=this.asset?.id,this._impact=null,this._loading=!1,this._deleting=!1,this._error=null)}async _prepare(){if(!(!this.hass||!this.asset||this._loading||this._deleting)){this._loading=!0,this._error=null;try{this._impact=await f(this.hass).getDeleteImpact(this.asset.id)}catch(t){this._error=y(t,this.t("delete.error")).message}finally{this._loading=!1}}}async _delete(){if(!(!this.hass||!this.asset||!this._impact||this._deleting)){this._deleting=!0,this._error=null;try{await f(this.hass).deleteAssetWithDependencies(this.asset.id),await Promise.allSettled([this.refreshBindingData?.(),this.refreshTopologyData?.(),this.refreshAssets?.()]),this.dispatchEvent(new CustomEvent("asset-deleted",{detail:this.asset.id,bubbles:!0,composed:!0}))}catch(t){this._error=y(t,this.t("delete.error")).message,this._deleting=!1}}}render(){if(!this.asset)return c;let t=this._impact,e=t?.relations?.length??0,s=t?.owned_bindings?.length??0,i=t?.dependent_bindings?.length??0;return a`<div class="danger">
      <h3>${this.t("delete.title")}</h3>
      ${t?a`<p>${this.t("delete.impact",{relations:e,bindings:s,dependent:i})}</p>
            <p class="muted">${this.t("delete.hardware_safe")}</p>
            ${t.logical_entity_id?a`<p class="warning">${this.t("delete.logical_warning",{entity_id:t.logical_entity_id})}</p>`:c}
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
      ${this._error?a`<div class="error" role="alert">${this._error}</div>`:c}
    </div>`}};u(Y,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},refreshAssets:{attribute:!1},_impact:{state:!0},_loading:{state:!0},_deleting:{state:!0},_error:{state:!0}}),u(Y,"styles",m`
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
  `);customElements.define("bindhome-asset-delete-control",Y);var J=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.assets=[],this.areas=[],this.floors=[],this.registry={},this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this.advancedEnabled=!1,this.refreshBindingData=null,this.refreshTopologyData=null,this.refreshAssets=null,this._action=null,this._sync=null,this._editingAsset=!1,this._identity=null}willUpdate(){this.asset?.id!==this._identity&&(this._identity=this.asset?.id,this._action=null,this._sync=null,this._editingAsset=!1)}_area(){return this.areas.find(t=>t.area_id===this.asset?.area_id)??null}_asset(t){return this.assets.find(e=>e.id===t)??null}_relations(){let t=T(this.registry?.relations??[],this.asset?.id);return[...t.incoming.map(e=>({relation:e,direction:"incoming",other:this._asset(e.source_asset_id)})),...t.outgoing.map(e=>({relation:e,direction:"outgoing",other:this._asset(e.target_asset_id)}))]}_devices(){let t=this.asset?.capabilities??[],e=(this.bindingStatuses?.records??[]).filter(o=>o.asset_id===this.asset?.id&&o.role==="primary"&&!!(o.binding||o.entity_id)).map(o=>({capability:o.capability,status:o})),s=e.length?e:t.length?[{capability:t[0],status:null}]:[],i=new Set;return s.filter(({capability:o,status:n})=>{let d=n?.binding?.entity_id??n?.entity_id,l=this.entityRegistry.find(_=>_.entity_id===d)?.device_id,p=l?`device:${l}`:d?`entity:${d}`:`capability:${o}`;return i.has(p)?!1:(i.add(p),!0)})}_forwardDeleted(t){t.stopPropagation(),this.dispatchEvent(new CustomEvent("asset-deleted",{detail:t.detail,bubbles:!0,composed:!0}))}render(){if(!this.asset)return c;if(this._editingAsset)return a`<bindhome-human-asset-editor
      .hass=${this.hass} .t=${this.t} .asset=${this.asset} .areas=${this.areas}
      .refreshAssets=${this.refreshAssets}
      @cancel=${()=>this._editingAsset=!1}
      @done=${()=>this._editingAsset=!1}
      @sync-warning=${d=>this._sync=d.detail}
    ></bindhome-human-asset-editor>`;let t=$(this.t,this.asset.asset_type),e=this._area(),s=this._relations(),i=this._devices(),o=(this.registry.representations??[]).filter(d=>d.asset_id===this.asset.id),n=we(this.asset.asset_type);return a`<button class="back text-button" @click=${()=>this.dispatchEvent(new CustomEvent("back",{bubbles:!0,composed:!0}))}>
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
          <button class="text-button" @click=${()=>this._editingAsset=!0}>${this.t("common.edit")}</button>
        </header>
        <section class="section">
          <h3>${this.t("detail.connections")}</h3>
          ${s.length?a`<div class="relations">${s.map(({relation:d,direction:l,other:p})=>{let _=$e(this.t,d.relation_type,l);return a`<div class="relation"><ha-icon icon=${_.icon}></ha-icon><div><small>${_.label}</small>${p?a`<button @click=${()=>this.dispatchEvent(new CustomEvent("navigate-asset",{detail:p.id,bubbles:!0,composed:!0}))}>${p.name}</button>`:a`<strong>${this.t("detail.missing_element")}</strong>`}</div></div>`})}</div>`:a`<p class="passive">${this.t("detail.no_connections")}</p>`}
          ${n.length?a`<div class="actions">${n.map(d=>a`<button class="secondary" ?disabled=${!!this._action} @click=${()=>this._action=d}>${this.t(d.labelKey)}</button>`)}</div>`:c}
          ${this._action?a`<bindhome-contextual-relation-editor .hass=${this.hass} .t=${this.t} .asset=${this.asset} .assets=${this.assets} .areas=${this.areas} .action=${this._action} .onRefresh=${this.refreshTopologyData} @cancel=${()=>this._action=null} @done=${()=>this._action=null} @sync-warning=${d=>this._sync=d.detail}></bindhome-contextual-relation-editor>`:c}
          ${this._sync?a`<div class="error" role="alert">${this._sync}</div>`:c}
        </section>
        <section class="section">
          <h3>${this.t(this.asset.asset_type==="radiator"?"detail.control":"detail.device")}</h3>
          ${i.length?i.map(d=>a`<div class="device"><bindhome-primary-connection-editor .hass=${this.hass} .t=${this.t} .asset=${this.asset} .capability=${d.capability} .status=${d.status} .areas=${this.areas} .entityRegistry=${this.entityRegistry} .deviceRegistry=${this.deviceRegistry} .refreshBindingData=${this.refreshBindingData} .showEntityId=${!1}></bindhome-primary-connection-editor></div>`):a`<p class="passive">${this.t("detail.passive")}</p>`}
        </section>
        <section class="section">
          <details>
            <summary><ha-icon icon="mdi:code-tags"></ha-icon>${this.t("detail.technical")}</summary>
            <dl>
              <dt>${this.t("fields.asset_type")}</dt><dd class="raw">${this.asset.asset_type}</dd>
              <dt>${this.t("detail.asset_id")}</dt><dd class="raw">${this.asset.id}</dd>
              <dt>${this.t("fields.code")}</dt><dd>${this.asset.code||this.t("common.not_set")}</dd>
              <dt>${this.t("fields.capabilities")}</dt><dd class="raw">${this.asset.capabilities?.join(", ")||this.t("common.none")}</dd>
              <dt>${this.t("detail.representations")}</dt><dd class="raw">${o.length?o.map(d=>d.platform).join(", "):this.t("common.none")}</dd>
            </dl>
            ${this.advancedEnabled?a`<button class="secondary open-advanced" @click=${()=>this.dispatchEvent(new CustomEvent("open-advanced",{detail:this.asset.id,bubbles:!0,composed:!0}))}>${this.t("detail.open_advanced")}</button>`:c}
          </details>
        </section>
        <section class="section">
          <bindhome-asset-delete-control
            .hass=${this.hass}
            .t=${this.t}
            .asset=${this.asset}
            .refreshBindingData=${this.refreshBindingData}
            .refreshTopologyData=${this.refreshTopologyData}
            .refreshAssets=${this.refreshAssets}
            @asset-deleted=${this._forwardDeleted}
          ></bindhome-asset-delete-control>
        </section>
      </article>`}};u(J,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},floors:{attribute:!1},registry:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},advancedEnabled:{type:Boolean,attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},refreshAssets:{attribute:!1},_action:{state:!0},_sync:{state:!0},_editingAsset:{state:!0}}),u(J,"styles",[w,m`
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
    `]);customElements.define("bindhome-element-detail",J);var X=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.floors=[],this.areas=[],this.assets=[],this.registry={},this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this.advancedEnabled=!1,this.refreshBindingData=null,this.refreshTopologyData=null,this.refreshAssets=null,this.selectedAssetId=null,this.selectedAreaId=null,this._collapsedFloorIds=new Set}_areaAssets(t){return t===k?this.assets.filter(e=>!e.area_id):t===A?this.assets.filter(e=>e.area_id&&!this.areas.some(s=>s.area_id===e.area_id)):this.assets.filter(e=>e.area_id===t)}_selectArea(t){this.dispatchEvent(new CustomEvent("home-navigate",{detail:{areaId:t,assetId:null},bubbles:!0,composed:!0}))}_selectAsset(t){let e=this.assets.find(i=>i.id===t);if(!e)return;let s=e.area_id?this.areas.some(i=>i.area_id===e.area_id)?e.area_id:A:k;this.dispatchEvent(new CustomEvent("home-navigate",{detail:{areaId:s,assetId:t},bubbles:!0,composed:!0}))}_toggleFloor(t){let e=new Set(this._collapsedFloorIds);e.has(t)?e.delete(t):e.add(t),this._collapsedFloorIds=e}_areaName(){return this.selectedAreaId===k?this.t("home.unassigned"):this.selectedAreaId===A?this.t("home.stale_area"):this.areas.find(t=>t.area_id===this.selectedAreaId)?.name??this.t("home.choose_room")}_renderTree(){let t=ve(this.floors,this.areas,this.assets);return a`<section
      class="tree surface ${this.selectedAreaId||this.selectedAssetId?"hidden-mobile":""}"
      aria-label=${this.t("home.navigation_label")}
    >
      ${t.groups.map(e=>{let s=this._collapsedFloorIds.has(e.id);return a`<div>
          <button class="floor-title" aria-expanded=${!s} @click=${()=>this._toggleFloor(e.id)}>
            <ha-icon icon=${e.icon||"mdi:layers-outline"}></ha-icon>
            <span class="grow">${e.name??this.t("common.no_floor")}</span>
            <span class="count">${e.areas.length}</span>
            <ha-icon class="collapse-icon" icon=${s?"mdi:chevron-down":"mdi:chevron-up"}></ha-icon>
          </button>
          ${s?c:e.areas.map(i=>{let o=t.assetsByArea.get(i.area_id)?.length??0;return a`<button
                  class="area-row ${this.selectedAreaId===i.area_id?"selected":""}"
                  aria-current=${this.selectedAreaId===i.area_id?"location":"false"}
                  @click=${()=>this._selectArea(i.area_id)}
                >
                  <ha-icon icon=${i.icon||"mdi:floor-plan"}></ha-icon>
                  <span class="grow">${i.name}</span>
                  <span class="count">${o}</span>
                  <ha-icon icon="mdi:chevron-right"></ha-icon>
                </button>`})}
        </div>`})}
      ${t.unassigned.length||t.stale.length?a`<div class="specials">
            ${t.unassigned.length?a`<button class="area-row special ${this.selectedAreaId===k?"selected":""}" @click=${()=>this._selectArea(k)}>
                  <ha-icon icon="mdi:map-marker-off-outline"></ha-icon><span class="grow">${this.t("home.unassigned")}</span><span class="count">${t.unassigned.length}</span>
                </button>`:c}
            ${t.stale.length?a`<button class="area-row special ${this.selectedAreaId===A?"selected":""}" @click=${()=>this._selectArea(A)}>
                  <ha-icon icon="mdi:map-marker-alert-outline"></ha-icon><span class="grow">${this.t("home.stale_area")}</span><span class="count">${t.stale.length}</span>
                </button>`:c}
          </div>`:c}
    </section>`}_renderRoom(){if(!this.selectedAreaId)return a`<div class="empty room">${this.t("home.choose_room")}</div>`;let t=this._areaAssets(this.selectedAreaId),e=ye(this.t,t);return a`<section class="room surface ${this.selectedAssetId?"hidden-mobile":""}">
      <button class="back text-button" @click=${()=>this._selectArea(null)}><ha-icon icon="mdi:arrow-left"></ha-icon>${this.t("home.back_floors")}</button>
      <header class="room-head">
        <ha-icon icon="mdi:floor-plan"></ha-icon>
        <div class="grow"><h2>${this._areaName()}</h2><span class="muted">${this.t("home.element_count",{count:t.length})}</span></div>
        ${[k,A].includes(this.selectedAreaId)?c:a`<button class="primary" @click=${()=>this.dispatchEvent(new CustomEvent("add-in-area",{detail:this.selectedAreaId,bubbles:!0,composed:!0}))}>
              <ha-icon icon="mdi:plus"></ha-icon><span>${this.t("home.add_element")}</span>
            </button>`}
      </header>
      ${e.length?e.map(s=>{let i=yt(this.t,s.category);return a`<section>
              <div class="category-title"><ha-icon icon=${i.icon}></ha-icon><span class="grow">${i.label}</span><span class="count">${s.assets.length}</span></div>
              ${s.assets.map(o=>{let n=$(this.t,o.asset_type);return a`<button class="asset-row" @click=${()=>this._selectAsset(o.id)}>
                  <ha-icon icon=${n.icon}></ha-icon><span class="grow"><strong>${o.name}</strong><span class="asset-meta">${n.label}</span></span><ha-icon icon="mdi:chevron-right"></ha-icon>
                </button>`})}
            </section>`}):a`<div class="empty">${this.t("home.room_empty")}</div>`}
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
              .refreshBindingData=${this.refreshBindingData}
              .refreshTopologyData=${this.refreshTopologyData}
              .refreshAssets=${this.refreshAssets}
              @back=${()=>this.dispatchEvent(new CustomEvent("home-navigate",{detail:{areaId:this.selectedAreaId,assetId:null},bubbles:!0,composed:!0}))}
              @navigate-asset=${e=>this._selectAsset(e.detail)}
              @asset-deleted=${()=>this._selectArea(this.selectedAreaId)}
            ></bindhome-element-detail>`:c}
      </div>
    </div>`}};u(X,"properties",{hass:{attribute:!1},t:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},registry:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},advancedEnabled:{type:Boolean,attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},refreshAssets:{attribute:!1},selectedAssetId:{attribute:!1},selectedAreaId:{attribute:!1},_collapsedFloorIds:{state:!0}}),u(X,"styles",[w,m`
      .layout { display: grid; grid-template-columns: minmax(260px, 360px) minmax(0, 1fr); gap: 18px; margin-top: 22px; align-items: start; }
      .floor-title, .area-row, .category-title, .asset-row { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 52px; padding: 8px 14px; border: 0; border-bottom: 1px solid var(--divider-color); background: transparent; text-align: left; }
      .floor-title { font:inherit; color:inherit; font-weight: 500; background: var(--secondary-background-color); cursor:pointer; }
      .floor-title ha-icon, .category-title ha-icon { color: var(--primary-color); }
      .floor-title .collapse-icon { color:var(--secondary-text-color); }
      .area-row:hover, .asset-row:hover { background: var(--secondary-background-color); }
      .area-row.selected { border-left: 3px solid var(--primary-color); background: var(--secondary-background-color); }
      .grow { min-width: 0; flex: 1; overflow-wrap: anywhere; }
      .count { color: var(--secondary-text-color); font-size: 12px; }
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
      @media (max-width: 760px) {
        .layout { display: block; }
        .tree.hidden-mobile, .room.hidden-mobile { display: none; }
        .detail .back, .room .back { display: inline-flex; margin-bottom: 8px; }
        .page { padding-top: 18px; }
        .room-head { align-items: flex-start; }
        .room-head .primary { padding: 0 12px; }
        .room-head .primary span { display: none; }
      }
    `]);customElements.define("bindhome-home-view",X);var ns=["light_point","socket","circuit","tap","shutoff_valve","window","door","appliance"];function Ce(r,t,e=""){let s=e.trim().toLocaleLowerCase(),i=t.map(n=>({preset:n,name:E(r,n),presentation:$(r,n.asset_type)})).filter(({preset:n,name:d})=>!s||[d,n.asset_type].some(l=>l.toLocaleLowerCase().includes(s))).sort((n,d)=>n.name.localeCompare(d.name,void 0,{sensitivity:"base",numeric:!0})),o=new Map;for(let n of i){let d=n.presentation.category;o.has(d)||o.set(d,[]),o.get(d).push(n)}return{featured:s?[]:ns.map(n=>i.find(({preset:d})=>d.preset_id===n)).filter(Boolean),groups:vt.filter(n=>o.has(n)).map(n=>({category:n,items:o.get(n)})),count:i.length}}function ls(r,t){return{key:`draft:${r.preset_id}:${t}`,presetId:r.preset_id,name:`${r.default_name} ${t}`,asset_type:r.asset_type,code:null,capabilities:[...r.suggested_capabilities??[]]}}function Z(r=[]){return{presetOrder:r.map(t=>t.preset_id),presets:new Map(r.map(t=>[t.preset_id,t])),quantities:new Map(r.map(t=>[t.preset_id,0])),retained:new Map(r.map(t=>[t.preset_id,[]]))}}function De(r,t,e){let s=r.presets.get(t);if(!s)return r;let i=Math.max(0,Math.floor(Number(e)||0)),o=[...r.retained.get(t)??[]];for(;o.length<i;)o.push(ls(s,o.length+1));return{...r,quantities:new Map(r.quantities).set(t,i),retained:new Map(r.retained).set(t,o)}}function ze(r,t,e){let s=new Map(r.retained);for(let[i,o]of s){let n=o.findIndex(l=>l.key===t);if(n===-1)continue;let d=[...o];d[n]={...d[n],...e},s.set(i,d);break}return{...r,retained:s}}function Gt(r){return r.presetOrder.flatMap(t=>{let e=r.quantities.get(t)??0;return(r.retained.get(t)??[]).slice(0,e)})}function Pe(r,t){return Gt(r).map(e=>{let s={name:e.name,asset_type:e.asset_type,area_id:t,capabilities:[...e.capabilities]};return e.code?.trim()&&(s.code=e.code.trim()),s})}function Ne(r,t){return(r??[]).filter(e=>e.area_id===t)}function Te(r,t){let e=new Map(t.map(i=>[i.asset_type,i.group])),s=new Map;for(let i of r){let o=e.get(i.asset_type)??"other",n=s.get(o)??[];n.push(i),s.set(o,n)}return s}var xt=class{constructor(t,e=null){this.api=t,this.fallbackMessage=e,this.saving=!1}async save(t,e){if(this.saving)return{ok:!1,duplicate:!0};this.saving=!0;let s=Pe(t,e),i;try{i=await this.api.createAssetsBulk(s)}catch(o){return this.saving=!1,{ok:!1,duplicate:!1,error:Ae(o,this.fallbackMessage)}}try{let o=await this.api.listAssets();return{ok:!0,created:i.assets??[],assets:o,payload:s,refreshError:null}}catch(o){return{ok:!0,created:i.assets??[],assets:null,payload:s,refreshError:o}}finally{this.saving=!1}}};var H=class extends g{constructor(){super(),this.hass=null,this.presets=[],this.t=t=>t,this.floors=[],this.areas=[],this.assets=[],this._step="select",this._floorId="",this._areaId="",this._draftState=Z(),this._openGroups=new Set,this._openDrafts=new Set,this._saveError=null,this._saving=!1,this._success=null,this._confirmRoomChange=!1,this._controller=null}willUpdate(t){(t.has("presets")||t.has("t"))&&this.presets.length&&this._activeDrafts.length===0&&(this._draftState=Z(this._localizedPresets()),this._openGroups=new Set([this.presets[0].group])),(t.has("hass")||t.has("t"))&&this.hass&&(this._controller=new xt(f(this.hass),this.t("errors.batch_fallback")))}get _selectedArea(){return this.areas.find(t=>t.area_id===this._areaId)}get _selectedFloor(){return this._floorId===ft?null:this.floors.find(t=>t.floor_id===this._floorId)}get _areaAssets(){return Ne(this.assets,this._areaId)}get _activeDrafts(){return Gt(this._draftState)}_localizedPresets(){return this.presets.map(t=>({...t,default_name:E(this.t,t)}))}_groupLabel(t){return this.t(`groups.${t}`)===`groups.${t}`?t:this.t(`groups.${t}`)}_count(t,e){return this.t(bt(t,e),{count:e})}_selectFloor(t){this._floorId=t.target.value,Ut(this.areas,this._floorId).some(s=>s.area_id===this._areaId)||(this._areaId="")}_continue(){this._areaId&&(this._step="quantity")}_changeQuantity(t,e){if(this._saving)return;let s=this._draftState.quantities.get(t)??0;this._draftState=De(this._draftState,t,s+e),this._saveError=null}_toggleGroup(t){let e=new Set(this._openGroups);e.has(t)?e.delete(t):e.add(t),this._openGroups=e}_toggleDraft(t){let e=new Set(this._openDrafts);e.has(t)?e.delete(t):e.add(t),this._openDrafts=e}_updateDraft(t,e){if(this._saving)return;let s=Object.keys(e),i=this._activeDrafts.findIndex(o=>o.key===t);this._draftState=ze(this._draftState,t,e),(!this._saveError?.structured||this._saveError.index===i&&s.includes(this._saveError.field))&&(this._saveError=null)}_removeCapability(t,e){this._updateDraft(t.key,{capabilities:t.capabilities.filter(s=>s!==e)})}_addCapability(t,e){let s=e.value.trim();!s||t.capabilities.includes(s)||(this._updateDraft(t.key,{capabilities:[...t.capabilities,s]}),e.value="")}async _save(){if(this._saving||!this._controller||!this._activeDrafts.length)return;this._saving=!0,this._saveError=null;let t=await this._controller.save(this._draftState,this._areaId);if(this._saving=!1,t.duplicate)return;if(!t.ok){if(this._saveError=t.error,this._step="review",t.error.structured){let s=this._activeDrafts[t.error.index];if(s){this._openDrafts=new Set([...this._openDrafts,s.key]),await this.updateComplete;let i=this.renderRoot.querySelector(`#${CSS.escape(this._fieldId(s,t.error.field))}`)??this.renderRoot.querySelector(".alert");i?.classList.contains("alert")&&i.setAttribute("tabindex","-1"),i?.scrollIntoView({behavior:"smooth",block:"center"}),i instanceof HTMLElement&&i.focus({preventScroll:!0})}}return}let e=t.assets??[...this.assets,...t.created];this.assets=e,this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:e,bubbles:!0,composed:!0})),this._success={count:t.created.length,areaName:this._selectedArea?.name??this.t("inventory.selected_area")},this._draftState=Z(this._localizedPresets()),this._openGroups=new Set([this.presets[0]?.group].filter(Boolean)),this._openDrafts=new Set,this._step="success"}_backToQuantities(){this._step="quantity"}_requestRoomChange(){if(this._activeDrafts.length){this._confirmRoomChange=!0;return}this._step="select"}_discardAndChangeRoom(){this._draftState=Z(this._localizedPresets()),this._saveError=null,this._openDrafts=new Set,this._confirmRoomChange=!1,this._floorId="",this._areaId="",this._step="select"}_fieldId(t,e){return`${t.key.replaceAll(":","-")}-${e}`}_fieldError(t,e){return this._saveError?.structured&&this._saveError.index===t&&this._saveError.field===e}_renderContext(){return a`<div class="context"><div class="context-inner">
      <div class="context-values">
        <div class="context-item"><ha-icon icon="mdi:layers-outline"></ha-icon><span class="context-label">${this.t("common.floor")}</span><span class="context-value">${this._selectedFloor?.name??this.t("common.no_floor")}</span></div>
        <div class="context-item"><ha-icon icon="mdi:floor-plan"></ha-icon><span class="context-label">${this.t("common.area")}</span><span class="context-value">${this._selectedArea?.name}</span></div>
      </div>
      <button class="button text" @click=${this._requestRoomChange} ?disabled=${this._saving}>${this.t("inventory.change_room")}</button>
    </div></div>`}_renderSelection(){let t=[...this.floors,{floor_id:ft,name:this.t("common.no_floor")}],e=Ut(this.areas,this._floorId);return a`<div class="content selection">
      <h1>${this.t("inventory.title")}</h1><p class="muted intro">${this.t("inventory.selection_intro")}</p>
      <div class="field-block"><label for="floor">${this.t("common.floor")}</label><select id="floor" .value=${this._floorId} @change=${this._selectFloor}><option value="">${this.t("inventory.select_floor")}</option>${t.map(s=>a`<option value=${s.floor_id}>${s.name}</option>`)}</select><p class="muted helper">${this.t("inventory.no_floor_helper")}</p></div>
      <div class="field-block"><label for="area">${this.t("common.area")}</label><select id="area" .value=${this._areaId} @change=${s=>this._areaId=s.target.value} ?disabled=${!this._floorId}><option value="">${this.t("inventory.select_area")}</option>${e.map(s=>a`<option value=${s.area_id}>${s.name}</option>`)}</select>${this._floorId&&!e.length?a`<p class="muted helper">${this.t("inventory.no_areas")}</p>`:c}</div>
      <div class="actions"><button class="button primary" @click=${this._continue} ?disabled=${!this._areaId}>${this.t("inventory.continue")}</button></div>
    </div>`}_renderExisting(){let t=Te(this._areaAssets,this.presets);return this._areaAssets.length?a`<div class="existing-summary">${[...t].map(([e,s])=>a`<div class="existing-group"><div class="existing-heading"><strong>${this._groupLabel(e)}</strong><span class="muted">${s.length}</span></div><ul class="existing-list">${s.map(i=>a`<li>${i.name}</li>`)}</ul></div>`)}</div>`:a`<p class="muted helper">${this.t("inventory.no_existing")}</p>`}_renderQuantity(){let t=new Map;for(let e of this.presets)t.set(e.group,[...t.get(e.group)??[],e]);return a`${this._renderContext()}${this._renderRoomChangeConfirmation()}<div class="content layout"><section><h1>${this.t("inventory.quantity_title")}</h1><p class="muted intro">${this.t("inventory.quantity_intro")}</p>
      <details class="mobile-existing"><summary><strong>${this.t("inventory.existing")}</strong><span class="muted">${this._areaAssets.length}</span></summary>${this._renderExisting()}</details>
      <div class="groups">${[...t].map(([e,s])=>{let i=s.reduce((n,d)=>n+(this._draftState.quantities.get(d.preset_id)??0),0),o=this._openGroups.has(e);return a`<section class="group"><button class="group-toggle" @click=${()=>this._toggleGroup(e)} aria-expanded=${o} aria-label=${this.t(o?"actions.collapse_group":"actions.expand_group",{group:this._groupLabel(e)})}><span class="group-title"><ha-icon icon=${o?"mdi:chevron-down":"mdi:chevron-right"}></ha-icon>${this._groupLabel(e)}</span><span class="muted">${this._count("counts.selected",i)}</span></button>${o?s.map(n=>{let d=this._draftState.quantities.get(n.preset_id)??0,l=E(this.t,n);return a`<div class="quantity-row"><div><div class="preset-name">${l}</div>${n.suggested_capabilities?.length?a`<div class="suggestions">${this.t("inventory.suggested",{capabilities:n.suggested_capabilities.join(", ")})}</div>`:c}</div><div class="stepper"><button aria-label=${this.t("actions.decrease_quantity",{name:l})} @click=${()=>this._changeQuantity(n.preset_id,-1)} ?disabled=${d===0||this._saving}><ha-icon icon="mdi:minus"></ha-icon></button><output aria-live="polite">${d}</output><button aria-label=${this.t("actions.increase_quantity",{name:l})} @click=${()=>this._changeQuantity(n.preset_id,1)} ?disabled=${this._saving}><ha-icon icon="mdi:plus"></ha-icon></button></div></div>`}):c}</section>`})}</div></section><aside class="rail"><h2>${this.t("inventory.existing")}</h2><p class="muted helper">${this.t("inventory.existing_unchanged")}</p>${this._renderExisting()}<div class="draft-count"><span class="muted">${this.t("inventory.being_added")}</span><strong>${this._count("counts.asset",this._activeDrafts.length)}</strong><p class="muted helper">${this.t("inventory.not_saved_yet")}</p></div></aside></div>${this._renderBottom("quantity")}`}_renderDraft(t,e){let s=this._openDrafts.has(t.key)||["name","asset_type","code","capabilities"].some(o=>this._fieldError(e,o)),i=this._saveError?.structured&&this._saveError.index===e;return a`<article class="draft-row ${i?"error":""}" data-draft-index=${e}><div class="draft-summary"><span class="draft-number">${e+1}</span><div class="draft-title"><strong>${t.name}</strong><span>${t.asset_type}</span></div><button class="draft-toggle" aria-label=${this.t(s?"actions.collapse_draft":"actions.edit_draft",{name:t.name})} aria-expanded=${s} @click=${()=>this._toggleDraft(t.key)}><ha-icon icon=${s?"mdi:chevron-up":"mdi:chevron-down"}></ha-icon></button></div>${s?a`<div class="draft-fields">
      ${this._renderInput(t,e,"name",this.t("fields.name"),t.name)}
      ${this._renderInput(t,e,"asset_type",this.t("fields.asset_type"),t.asset_type)}
      ${this._renderInput(t,e,"code",this.t("fields.code_optional"),t.code??"")}
      <div class="capabilities"><label>${this.t("fields.capabilities")}</label><div class="capability-list">${t.capabilities.length?t.capabilities.map(o=>a`<span class="capability">${o}<button aria-label=${this.t("actions.remove_capability",{capability:o})} @click=${()=>this._removeCapability(t,o)} ?disabled=${this._saving}><ha-icon icon="mdi:close"></ha-icon></button></span>`):a`<span class="muted helper">${this.t("fields.no_capabilities")}</span>`}</div><div class="add-capability"><label>${this.t("fields.custom_capability")}<input id=${this._fieldId(t,"capabilities")} placeholder=${this.t("fields.capability_placeholder")} aria-invalid=${this._fieldError(e,"capabilities")} aria-describedby=${this._fieldError(e,"capabilities")?`${this._fieldId(t,"capabilities")}-error`:c} @keydown=${o=>{o.key==="Enter"&&(o.preventDefault(),this._addCapability(t,o.target))}}></label><button class="button secondary" @click=${o=>this._addCapability(t,o.currentTarget.previousElementSibling.querySelector("input"))} ?disabled=${this._saving}>${this.t("common.add")}</button></div>${this._fieldError(e,"capabilities")?a`<p class="field-error" id=${`${this._fieldId(t,"capabilities")}-error`}>${this._saveError.message}</p>`:c}</div>
    </div>`:c}</article>`}_renderInput(t,e,s,i,o){let n=this._fieldError(e,s),d=this._fieldId(t,s);return a`<label for=${d}>${i}<input id=${d} .value=${o} aria-invalid=${n} aria-describedby=${n?`${d}-error`:c} @input=${l=>this._updateDraft(t.key,{[s]:s==="code"?l.target.value||null:l.target.value})} ?disabled=${this._saving}>${n?a`<span class="field-error" id=${`${d}-error`}>${this._saveError.message}</span>`:c}</label>`}_renderReview(){return a`${this._renderContext()}${this._renderRoomChangeConfirmation()}<div class="content">${this._saveError?a`<div class="alert" role="alert"><ha-icon icon="mdi:alert-circle-outline"></ha-icon><div><h3>${this.t("errors.nothing_saved")}</h3><p class="muted helper">${this._saveError.structured?this.t("errors.correct_field"):this._saveError.message||this.t("errors.batch_fallback")} ${this.t("errors.drafts_preserved")}</p></div></div>`:c}<div class="review-header"><div><h1>${this._count("review.title",this._activeDrafts.length)}</h1><p class="muted intro">${this.t("review.intro")}</p></div></div><section class="existing-review"><div class="section-heading"><div><h2>${this.t("review.registered")}</h2><p class="muted helper">${this.t("review.registered_helper")}</p></div><strong>${this._areaAssets.length}</strong></div></section><section class="drafts"><div class="section-heading"><div><h2>${this.t("inventory.being_added")}</h2><p class="muted helper">${this.t("review.atomic_batch")}</p></div><strong>${this._activeDrafts.length}</strong></div><div>${this._activeDrafts.map((t,e)=>this._renderDraft(t,e))}</div></section></div>${this._renderBottom("review")}`}_renderRoomChangeConfirmation(){return this._confirmRoomChange?a`<div class="content"><section class="alert" role="alertdialog" aria-labelledby="change-room-title" aria-describedby="change-room-description"><ha-icon icon="mdi:alert-outline"></ha-icon><div><h3 id="change-room-title">${this.t("discard.title")}</h3><p class="muted helper" id="change-room-description">${this.t("discard.description")}</p><div class="actions"><button class="button secondary" @click=${()=>this._confirmRoomChange=!1}>${this.t("discard.stay")}</button><button class="button primary" @click=${this._discardAndChangeRoom}>${this.t("discard.confirm")}</button></div></div></section></div>`:c}_renderBottom(t){let e=this._activeDrafts.length;return a`<div class="bottom-bar" aria-busy=${this._saving}><div class="bottom-inner"><p class="muted bottom-copy">${t==="review"?this._count("review.save_explanation",e):this._count("review.before_save",e)}</p>${t==="review"?a`<div><button class="button secondary" @click=${this._backToQuantities} ?disabled=${this._saving}>${this.t("review.back_quantities")}</button> <button class="button primary" @click=${this._save} ?disabled=${this._saving||!e}>${this._saving?this.t("review.saving"):this._count("review.save",e)}</button></div>`:a`<button class="button primary" @click=${()=>this._step="review"} ?disabled=${!e}>${this._count("review.review_items",e)}</button>`}</div></div>`}_renderSuccess(){return a`${this._renderContext()}<div class="content success"><div><ha-icon icon="mdi:check-circle-outline"></ha-icon><h1>${this._count("success.created",this._success.count)}</h1><p class="intro">${this._success.areaName}</p><p class="muted intro">${this.t("success.explanation")}</p><div class="actions"><button class="button primary" @click=${()=>this._step="quantity"}>${this.t("success.back")}</button><button class="button secondary" @click=${()=>this.dispatchEvent(new CustomEvent("view-infrastructure",{bubbles:!0,composed:!0}))}>${this.t("success.view")}</button></div></div></div>`}render(){return!this.floors.length&&!this.areas.length?a`<div class="content selection"><h1>${this.t("inventory.title")}</h1><p class="muted intro">${this.t("inventory.no_floor_area")}</p></div>`:this._step==="select"?this._renderSelection():this._step==="quantity"?this._renderQuantity():this._step==="review"?this._renderReview():this._renderSuccess()}};u(H,"properties",{hass:{attribute:!1},t:{attribute:!1},presets:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},_step:{state:!0},_floorId:{state:!0},_areaId:{state:!0},_draftState:{state:!0},_openGroups:{state:!0},_openDrafts:{state:!0},_saveError:{state:!0},_saving:{state:!0},_success:{state:!0},_confirmRoomChange:{state:!0}}),u(H,"styles",m`
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
  `);customElements.define("bindhome-inventory-workflow",H);var tt=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.presets=[],this.floors=[],this.areas=[],this.assets=[],this.contextAreaId=null,this.sessionId=0,this.onCreated=null,this._mode="single",this._preset=null,this._name="",this._code="",this._areaId="",this._search="",this._saving=!1,this._error=null,this._sync=null,this._committed=!1,this._identity=null,this._operation=0}willUpdate(){this.sessionId!==this._identity&&(this._identity=this.sessionId,this._mode="single",this._preset=null,this._name="",this._code="",this._areaId=this.contextAreaId??"",this._search="",this._operation+=1,this._saving=!1,this._error=null,this._sync=null,this._committed=!1)}_choose(t){this._preset=t,this._name=E(this.t,t),this._code="",this._error=null,this._sync=null,this._committed=!1}_forwardAssetsRefreshed(t){t.stopPropagation(),this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:t.detail,bubbles:!0,composed:!0}))}_goHome(t){t?.stopPropagation?.(),this.dispatchEvent(new CustomEvent("go-home",{bubbles:!0,composed:!0}))}async _submit(t){if(t.preventDefault(),this._saving||this._committed||!this._preset||!this._name.trim())return;let e=++this._operation,s=this.sessionId;this._saving=!0,this._error=null,this._sync=null;try{let i={name:this._name.trim(),asset_type:this._preset.asset_type,capabilities:[...this._preset.suggested_capabilities??[]]};this._code.trim()&&(i.code=this._code.trim()),this._areaId&&(i.area_id=this._areaId);let o=await f(this.hass).createAssetsBulk([i]),n=o?.assets?.[0]??o?.created?.[0]??null;if(e!==this._operation||s!==this.sessionId)return;this._committed=!0,this._saving=!1;try{this.onCreated&&await this.onCreated(n)}catch{if(e!==this._operation||s!==this.sessionId)return;this._sync=this.t("shell.refresh_error")}e===this._operation&&s===this.sessionId&&this.dispatchEvent(new CustomEvent("asset-created",{detail:n,bubbles:!0,composed:!0}))}catch(i){if(e!==this._operation||s!==this.sessionId)return;let o=y(i,this.t("add.create_error"));this._error=o.code==="conflict"?this.t("add.create_error"):o.message}finally{e===this._operation&&s===this.sessionId&&(this._saving=!1)}}render(){let t=Ce(this.t,this.presets,this._search);return a`<div class="page">
      <h1 class="page-title">${this.t("nav.add")}</h1>
      <p class="intro muted">${this.t("add.intro")}</p>
      <div class="mode-switch" role="tablist" aria-label=${this.t("add.mode_label")}>
        <button class=${this._mode==="single"?"active":""} role="tab" aria-selected=${this._mode==="single"} @click=${()=>this._mode="single"}>${this.t("add.single_mode")}</button>
        <button class=${this._mode==="bulk"?"active":""} role="tab" aria-selected=${this._mode==="bulk"} @click=${()=>{this._mode="bulk",this._preset=null}}>${this.t("add.bulk_mode")}</button>
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
          ></bindhome-inventory-workflow>`:this._preset?a`<form class="form surface" @submit=${this._submit}>
            <div class="form-head"><ha-icon icon=${$(this.t,this._preset.asset_type).icon}></ha-icon><h2>${E(this.t,this._preset)}</h2></div>
            <div class="fields">
              <label>${this.t("fields.name")}<input .value=${this._name} @input=${e=>this._name=e.target.value} required /></label>
              <label>${this.t("fields.code_optional")}<input .value=${this._code} @input=${e=>this._code=e.target.value} /></label>
              <label>${this.t("add.room")}<select .value=${this._areaId} @change=${e=>this._areaId=e.target.value}>
                <option value="" ?selected=${!this._areaId}>${this.t("add.no_room")}</option>
                ${this.areas.map(e=>a`<option value=${e.area_id} ?selected=${e.area_id===this._areaId}>${e.name}</option>`)}
              </select></label>
            </div>
            ${this._error?a`<div class="error" role="alert">${this._error}</div>`:c}
            ${this._sync?a`<div class="success" role="status">${this._sync}</div>`:c}
            <div class="actions">
              <button type="button" class="secondary" ?disabled=${this._saving} @click=${()=>{this._preset=null,this._error=null,this._sync=null,this._committed=!1}}>${this.t("common.cancel")}</button>
              <button class="primary" ?disabled=${this._saving||this._committed||!this._name.trim()}>${this._saving?this.t("add.saving"):this.t("common.add")}</button>
            </div>
          </form>`:a`<section class="picker">
            <h2>${this.t("add.what")}</h2>
            <label class="search">${this.t("add.search_label")}<input type="search" .value=${this._search} placeholder=${this.t("add.search_placeholder")} @input=${e=>this._search=e.target.value}></label>
            ${t.featured.length?a`<section class="catalogue-section"><h3>${this.t("add.frequent")}</h3><div class="presets">${t.featured.map(e=>this._renderPreset(e))}</div></section>`:c}
            <section class="catalogue"><h3>${this.t("add.all_types")}</h3>
              ${t.groups.length?t.groups.map(e=>{let s=yt(this.t,e.category);return a`<details class="category" ?open=${!!this._search}><summary><ha-icon icon=${s.icon}></ha-icon><span>${s.label}</span><span class="count">${e.items.length}</span></summary><div class="presets">${e.items.map(i=>this._renderPreset(i))}</div></details>`}):a`<div class="empty">${this.t("add.no_matches")}</div>`}
            </section>
          </section>`}
    </div>`}_renderPreset(t){return a`<button class="preset" @click=${()=>this._choose(t.preset)}><ha-icon icon=${t.presentation.icon}></ha-icon><strong>${t.name}</strong></button>`}};u(tt,"properties",{hass:{attribute:!1},t:{attribute:!1},presets:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},contextAreaId:{attribute:!1},sessionId:{attribute:!1},onCreated:{attribute:!1},_mode:{state:!0},_preset:{state:!0},_name:{state:!0},_code:{state:!0},_areaId:{state:!0},_search:{state:!0},_saving:{state:!0},_error:{state:!0},_sync:{state:!0},_committed:{state:!0}}),u(tt,"styles",[w,m`
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
      @media (max-width: 600px) {
        .mode-switch { width:100%; }
        .mode-switch button { flex:1; padding-inline:8px; }
        .presets { grid-template-columns:1fr; }
        .preset { min-height:56px; flex-direction:row; align-items:center; justify-content:flex-start; }
        .catalogue-section, .catalogue { margin-top:20px; }
        .form { padding: 16px; }
        .actions > * { flex: 1; }
      }
    `]);customElements.define("bindhome-add-view",tt);var et=class extends g{constructor(){super(),this.t=t=>t,this.assets=[],this.areas=[],this.floors=[],this._query=""}render(){let e=xe(this.t,this.assets,this.areas,this.floors,this._query).map(s=>s.asset?s:{asset:s,area:this.areas.find(i=>i.area_id===s.area_id),type:$(this.t,s.asset_type)});return a`<div class="page">
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
            ${e.map(({asset:s,area:i,type:o})=>a`<button
                  class="result"
                  @click=${()=>this.dispatchEvent(new CustomEvent("open-asset",{detail:s.id,bubbles:!0,composed:!0}))}
                >
                  <ha-icon icon=${o.icon}></ha-icon
                  ><span
                    ><strong>${s.name}</strong
                    ><span class="meta"
                      >${o.label} ·
                      ${i?.name??this.t(s.area_id?"home.stale_area":"home.unassigned")}</span
                    ></span
                  ><ha-icon icon="mdi:chevron-right"></ha-icon>
                </button>`)}
          </div>`:a`<div class="empty">${this.t("search.empty")}</div>`}
    </div>`}};u(et,"properties",{t:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},floors:{attribute:!1},_query:{state:!0}}),u(et,"styles",[w,m`
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
    `]);customElements.define("bindhome-search-view",et);function Vt(r,t){return(r?.name??"").localeCompare(t?.name??"",void 0,{sensitivity:"base",numeric:!0})}function Qt(r){return[...r].sort(Vt)}function Yt(r,t,e){let s=new Map((r??[]).map(h=>[h.floor_id,h])),i=new Map((t??[]).map(h=>[h.area_id,h])),o=new Map;for(let h of e??[]){if(!h.area_id||!i.has(h.area_id))continue;let b=o.get(h.area_id)??[];b.push(h),o.set(h.area_id,b)}let n=(t??[]).map(h=>({area:h,assets:Qt(o.get(h.area_id)??[])})).sort((h,b)=>Vt(h.area,b.area)),d=(r??[]).map(h=>({floor:h,areas:n.filter(({area:b})=>b.floor_id===h.floor_id)})).sort((h,b)=>{let v=h.floor.level,x=b.floor.level;return typeof v=="number"&&typeof x=="number"&&v!==x?v-x:Vt(h.floor,b.floor)}),l=n.filter(({area:h})=>!h.floor_id||!s.has(h.floor_id)),p=Qt((e??[]).filter(h=>!h.area_id)),_=Qt((e??[]).filter(h=>h.area_id&&!i.has(h.area_id)));return{floors:d,noFloorAreas:l,noAreaAssets:p,unknownAreaAssets:_}}function st(r){return{asset_id:r.id,name:r.name,asset_type:r.asset_type,code:r.code??"",area_id:r.area_id??"",capabilities:[...r.capabilities??[]]}}function Le(r){return r==null?null:String(r).trim()||null}function ds(r,t){return r.length!==t.length?!1:r.every((e,s)=>e===t[s])}function Jt(r,t){if(t.asset_id!==r.id)throw new Error("Asset edit draft identity does not match the persisted Asset");let e={name:t.name,asset_type:t.asset_type,code:Le(t.code),area_id:Le(t.area_id),capabilities:[...t.capabilities??[]]},s={asset_id:r.id};e.name!==r.name&&(s.name=e.name),e.asset_type!==r.asset_type&&(s.asset_type=e.asset_type),e.code!==(r.code??null)&&(s.code=e.code),e.area_id!==(r.area_id??null)&&(s.area_id=e.area_id);let i=[...r.capabilities??[]];return ds(e.capabilities,i)||(s.capabilities=e.capabilities),s}function Me(r,t){return Object.keys(Jt(r,t)).length>1}function cs(r,t,e="primary"){return`${r}:${t}:${e}`}function Oe(r){let t=r?.records??[];return new Map(t.map(e=>[cs(e.asset_id,e.capability,e.role),e]))}function Xt(r,t=[]){return t.find(e=>e.area_id===r?.area_id)?.name??null}function hs(r,t=[]){return{asset:r,id:r.id,name:r.name,code:r.code??"",assetType:r.asset_type,areaId:r.area_id??null,areaName:Xt(r,t)}}function $t(r,t="",e=null,s=[]){let i=String(t).trim().toLocaleLowerCase(),o=r.map(d=>hs(d,s));return(i?o.filter(d=>[d.name,d.code,d.assetType,d.areaName??""].join(" ").toLocaleLowerCase().includes(i)):o).sort((d,l)=>+!!(e&&l.areaId===e)-+!!(e&&d.areaId===e)||d.name.localeCompare(l.name)||d.id.localeCompare(l.id))}var it=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.assets=[],this.areas=[],this.registry={},this.onRefresh=null,this.onDone=null,this.onSyncWarning=null,this._direction="outgoing",this._type="",this._other="",this._search="",this._saving=!1,this._error=null,this._identity="",this._token=0}connectedCallback(){super.connectedCallback(),this._resetIdentity()}willUpdate(t){if(!t.has("asset"))return;let e=this.asset?.id??"";this._identity&&e!==this._identity&&this._resetIdentity(),this._identity=e}_resetIdentity(){this._token+=1,this._direction="outgoing",this._type="",this._other="",this._search="",this._error=null,this._saving=!1,this._identity=this.asset?.id??""}_isCurrent(t,e){return t===this._token&&this.asset?.id===e}_candidates(){let t=$t(this.assets.filter(s=>s.id!==this.asset?.id),this._search,this.asset?.area_id,this.areas),e=this._search.trim()?20:8;return{all:t,shown:t.slice(0,e)}}async _save(){if(this._saving||!this._other||!Kt(this._type))return;let t=++this._token,e=this.asset?.id,s=this._direction==="outgoing"?e:this._other,i=this._direction==="outgoing"?this._other:e;this._saving=!0,this._error=null;try{if(await f(this.hass).createRelation({sourceAssetId:s,relationType:this._type.trim(),targetAssetId:i}),!this._isCurrent(t,e))return;this._saving=!1,this.onDone?.();try{await this.onRefresh?.()}catch{if(!this._isCurrent(t,e))return;this.onSyncWarning?.(this.t("topology.sync_warning"))}}catch(o){if(!this._isCurrent(t,e))return;let n=y(o,this.t("topology.save_error"));this._error=n.code==="conflict"?this.t("topology.duplicate_relation"):n.message,this._saving=!1}}_cancel(){this.onDone?.()}render(){let{all:t,shown:e}=this._candidates();return a`
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
            ${ke(this.registry?.relations).map(s=>a`
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
            ?disabled=${this._saving||!this._other||!Kt(this._type)}
          >
            ${this.t("editor.save")}
          </button>
        </div>
      </form>
    `}};u(it,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},registry:{attribute:!1},onRefresh:{attribute:!1},onDone:{attribute:!1},onSyncWarning:{attribute:!1},_direction:{state:!0},_type:{state:!0},_other:{state:!0},_search:{state:!0},_saving:{state:!0},_error:{state:!0}}),u(it,"styles",m`
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
  `);customElements.define("bindhome-relation-editor",it);var rt=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.assets=[],this.areas=[],this.registry={},this.onRefresh=null,this.onNavigate=null,this._editing=!1,this._deleting=null,this._error=null,this._sync=null,this._confirm=null,this._identity="",this._token=0}willUpdate(t){t.has("asset")&&this.asset&&this._identity&&this.asset.id!==this._identity&&(this._token+=1,this._deleting=null,this._confirm=null,this._error=null,this._sync=null),this.asset&&(this._identity=this.asset.id)}_asset(t){return this.assets.find(e=>e.id===t)??null}_area(t){return t?.area_id?this.areas.find(e=>e.area_id===t.area_id)?.name??null:null}async _delete(t){if(this._deleting)return;let e=++this._token,s=this.asset?.id;this._deleting=t.id,this._error=null;try{if(await f(this.hass).deleteRelation(t.id),e!==this._token||this.asset?.id!==s)return;this._deleting=null,this._confirm=null;try{await this.onRefresh?.()}catch{if(e!==this._token||this.asset?.id!==s)return;this._sync=this.t("topology.sync_warning")}}catch(i){if(e!==this._token||this.asset?.id!==s)return;this._deleting=null,this._error=y(i,this.t("topology.delete_error")).message}}_navigate(t){this._asset(t)&&(this.onNavigate?.(t),this.dispatchEvent(new CustomEvent("navigate-asset",{detail:t,bubbles:!0,composed:!0})))}_renderNeighbor(t,e){let s=e?t.target_asset_id:t.source_asset_id,i=this._asset(s);if(!i)return a`
        <div class="neighbor missing">
          <strong>${this.t("topology.missing_asset")}</strong>
          <span>${t.relation_type}</span>
        </div>
      `;let o=this._area(i);return a`
      <button
        class="neighbor"
        type="button"
        @click=${()=>this._navigate(i.id)}
      >
        <strong>${i.name}</strong>
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
    `}render(){let{outgoing:t,incoming:e}=T(this.registry?.relations??[],this.asset?.id);return a`
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
    `}};u(rt,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},registry:{attribute:!1},onRefresh:{attribute:!1},onNavigate:{attribute:!1},_editing:{state:!0},_deleting:{state:!0},_error:{state:!0},_sync:{state:!0},_confirm:{state:!0}}),u(rt,"styles",m`
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
  `);customElements.define("bindhome-asset-topology",rt);function wt(r){return{...r,capabilities:[...r.capabilities??[]]}}var at=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.asset=null,this.assets=[],this.areas=[],this.floors=[],this.registry={},this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this.refreshBindingData=null,this.refreshTopologyData=null,this._editing=!1,this._draft=null,this._snapshot=null,this._saving=!1,this._error=null,this._saved=!1,this._newCapability=""}willUpdate(t){t.has("asset")&&this.asset&&!this._editing&&(this._snapshot=wt(this.asset),this._draft=st(this.asset))}get _dirty(){return!this._editing||!this._snapshot||!this._draft?!1:Me(this._snapshot,this._draft)}_emitEditing(t){this.dispatchEvent(new CustomEvent("editing-changed",{detail:t,bubbles:!0,composed:!0}))}_startEdit(){this._snapshot=wt(this.asset),this._draft=st(this.asset),this._editing=!0,this._error=null,this._saved=!1,this._newCapability="",this._emitEditing(!0)}_cancel(){this._draft=st(this.asset),this._snapshot=wt(this.asset),this._editing=!1,this._error=null,this._newCapability="",this._emitEditing(!1)}_close(){this._editing||this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}_updateField(t,e){!this._draft||this._saving||(this._draft={...this._draft,[t]:e},this._error=null,this._saved=!1)}_removeCapability(t){this._updateField("capabilities",this._draft.capabilities.filter(e=>e!==t))}_addCapability(){let t=this._newCapability.trim();if(!t||this._draft.capabilities.includes(t)){this._newCapability="";return}this._updateField("capabilities",[...this._draft.capabilities,t]),this._newCapability=""}async _save(t=null){if(t?.preventDefault(),this._saving||!this._snapshot||!this._draft)return;let e=Jt(this._snapshot,this._draft);if(Object.keys(e).length===1){this._editing=!1,this._emitEditing(!1);return}let{asset_id:s,...i}=e;this._saving=!0,this._error=null,this._saved=!1;try{let n=await f(this.hass).updateAsset(s,i);this.asset=n,this._snapshot=wt(n),this._draft=st(n),this._editing=!1,this._saved=!0,this._emitEditing(!1),this.dispatchEvent(new CustomEvent("asset-updated",{detail:n,bubbles:!0,composed:!0}))}catch(o){let n=y(o,this.t("editor.save_error"));this._error=n.message??this.t("editor.save_error")}finally{this._saving=!1}}_areaName(t){return t?this.areas.find(e=>e.area_id===t)?.name??this.t("infrastructure.unknown_area"):this.t("browser.no_area")}_assetName(t){return this.assets.find(e=>e.id===t)?.name??t}_entityName(t){return this.hass?.states?.[t]?.attributes?.friendly_name??t}_relations(){return(this.registry?.relations??[]).filter(t=>t.source_asset_id===this.asset.id||t.target_asset_id===this.asset.id)}_bindings(){return(this.registry?.bindings??[]).filter(t=>t.asset_id===this.asset.id)}_primaryStatus(t){let e=Oe(this.bindingStatuses).get(`${this.asset.id}:${t}:primary`);if(e)return e;let s=this._bindings().find(i=>i.capability===t&&i.role==="primary");return s?{asset_id:this.asset.id,capability:t,role:"primary",status:"resolved",config_valid:!0,runtime_available:!0,entity_id:s.entity_id,binding:s}:null}_representation(){return(this.registry?.representations??[]).find(t=>t.asset_id===this.asset.id)}_renderAreaOptions(){let t=new Set(this.floors.map(o=>o.floor_id)),e=new Set(this.areas.map(o=>o.area_id)),s=this._draft?.area_id&&!e.has(this._draft.area_id)?this._draft.area_id:null,i=this.areas.filter(o=>!o.floor_id||!t.has(o.floor_id));return a`
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

      ${i.length?a`
            <optgroup
              label=${this.t("common.no_floor")}
            >
              ${i.map(o=>a`
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
    `:c}};u(at,"properties",{hass:{attribute:!1},t:{attribute:!1},asset:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},floors:{attribute:!1},registry:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},_editing:{state:!0},_draft:{state:!0},_snapshot:{state:!0},_saving:{state:!0},_error:{state:!0},_saved:{state:!0},_newCapability:{state:!0}}),u(at,"styles",m`
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
  `);customElements.define("bindhome-asset-detail-editor",at);var kt="__bindhome_no_area_assets__",At="__bindhome_unknown_area_assets__",ot=class extends g{constructor(){super(),this.hass=null,this.floors=[],this.areas=[],this.assets=[],this.presets=[],this.registry={},this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this.refreshBindingData=null,this.refreshTopologyData=null,this.selectedAssetId=null,this.t=t=>t,this._selectedKey="",this._selectedAssetId=null,this._editorLocked=!1}get _hierarchy(){return Yt(this.floors,this.areas,this.assets)}_countAssets(t){return this.t(bt("counts.asset",t),{count:t})}_allAreaNodes(t=this._hierarchy){return[...t.floors.flatMap(e=>e.areas),...t.noFloorAreas]}_areaNode(t,e=this._hierarchy){return this._allAreaNodes(e).find(({area:s})=>s.area_id===t)}_targetForKey(t,e=this._hierarchy){if(!t)return null;if(t===kt)return e.noAreaAssets.length?{kind:"no-area",title:this.t("browser.no_area"),description:this.t("browser.no_area_intro"),assets:e.noAreaAssets}:null;if(t===At)return e.unknownAreaAssets.length?{kind:"unknown-area",title:this.t("browser.unknown_area"),description:this.t("browser.unknown_area_intro"),assets:e.unknownAreaAssets}:null;let s=this._areaNode(t,e);return s?{kind:"area",title:s.area.name,description:"",area:s.area,assets:s.assets}:null}willUpdate(t){if(t.has("selectedAssetId")&&this.selectedAssetId){let e=this.assets.find(s=>s.id===this.selectedAssetId);e&&(this._selectedKey=this._locationKeyForAsset(e),this._selectedAssetId=e.id)}if(this._selectedKey&&(t.has("floors")||t.has("areas")||t.has("assets"))){let e=Yt(this.floors,this.areas,this.assets);this._targetForKey(this._selectedKey,e)||(this._selectedKey=""),this._selectedAssetId&&!this.assets.some(s=>s.id===this._selectedAssetId)&&(this._selectedAssetId=null,this._editorLocked=!1)}}_select(t){this._editorLocked||(this._selectedAssetId=null,this._selectedKey=t)}_openAsset(t){this._selectedAssetId=t}_closeAsset(){this._editorLocked||(this._selectedAssetId=null)}_locationKeyForAsset(t){return t.area_id?this.areas.some(e=>e.area_id===t.area_id)?t.area_id:At:kt}_handleEditingChanged(t){this._editorLocked=!!t.detail}_handleAssetUpdated(t){t.stopPropagation();let e=t.detail,s=this.assets.map(i=>i.id===e.id?e:i);this.assets=s,this._selectedKey=this._locationKeyForAsset(e),this._selectedAssetId=e.id,this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:s,bubbles:!0,composed:!0}))}_assetTypeLabel(t){let e=this.presets.find(s=>s.asset_type===t.asset_type);return e?E(this.t,e):t.asset_type}_renderAreaButton(t){let e=this._selectedKey===t.area.area_id;return a`
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
    `:c}_renderSpecials(t){if(!t.noAreaAssets.length&&!t.unknownAreaAssets.length)return c;let e=this._selectedKey===kt,s=this._selectedKey===At;return a`
      <div class="specials">
        ${t.noAreaAssets.length?a`
              <button
                class="special-button ${e?"selected":""}"
                aria-pressed=${e?"true":"false"}
                ?disabled=${this._editorLocked}
                @click=${()=>this._select(kt)}
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
                @click=${()=>this._select(At)}
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
      `;let s=this.assets.find(i=>i.id===this._selectedAssetId);return s?a`
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
          @navigate-asset=${i=>this._openAsset(i.detail)}
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
              ${e.assets.map(i=>this._renderAsset(i,e))}
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
    `}};u(ot,"properties",{hass:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},presets:{attribute:!1},registry:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},selectedAssetId:{attribute:!1},t:{attribute:!1},_selectedKey:{state:!0},_selectedAssetId:{state:!0},_editorLocked:{state:!0}}),u(ot,"styles",m`
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
  `);customElements.define("bindhome-inventory-browser",ot);var nt=class extends g{constructor(){super(),this.t=t=>t,this.assets=[],this.areas=[],this.registry={},this.focalAssetId=null,this.onNavigate=null,this._search=""}_asset(t){return this.assets.find(e=>e.id===t)??null}_focal(){return this._asset(this.focalAssetId)??this.assets[0]??null}_neighbors(){let t=this._focal();return t?T(this.registry?.relations??[],t.id):{incoming:[],outgoing:[]}}_focus(t){let e=this._asset(t);e&&(this.focalAssetId=e.id,this._search="",this.onNavigate?.(e.id))}_renderNeighbor(t,e){let s=e?t.target_asset_id:t.source_asset_id,i=this._asset(s);if(!i)return a`
        <div class="neighbor missing">
          <strong>${this.t("topology.missing_asset")}</strong>
          <span>${t.relation_type}</span>
        </div>
      `;let o=Xt(i,this.areas);return a`
      <button
        class="neighbor"
        type="button"
        @click=${()=>this._focus(i.id)}
      >
        <strong>${i.name}</strong>
        <span>
          ${t.relation_type}${o?` \xB7 ${o}`:""}
        </span>
      </button>
    `}render(){let t=this._focal(),e=$t(this.assets,this._search,t?.area_id,this.areas),s=this._search.trim()?20:8,i=e.slice(0,s),{incoming:o,outgoing:n}=this._neighbors();return a`
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
          ${i.length?i.map(d=>a`
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

        ${e.length>i.length?a`
              <p class="count">
                ${this.t("topology.showing_results",{shown:i.length,total:e.length})}
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
    `}};u(nt,"properties",{t:{attribute:!1},assets:{attribute:!1},areas:{attribute:!1},registry:{attribute:!1},focalAssetId:{attribute:!1},onNavigate:{attribute:!1},_search:{state:!0}}),u(nt,"styles",m`
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
  `);customElements.define("bindhome-topology-explorer",nt);var lt=class extends g{constructor(){super(),this.hass=null,this.registry={},this.t=t=>t,this.presets=[],this.floors=[],this.areas=[],this.assets=[],this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this.refreshBindingData=null,this.refreshTopologyData=null,this.selectedAssetId=null,this._active="browse"}_show(t){this._active=t}willUpdate(t){t.has("selectedAssetId")&&this.selectedAssetId&&(this._active="browse")}_forwardAssetsRefreshed(t){t.stopPropagation(),this.dispatchEvent(new CustomEvent("assets-refreshed",{detail:t.detail,bubbles:!0,composed:!0}))}_showBrowseFromWorkflow(t){t.stopPropagation(),this._active="browse"}render(){return a`
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
    `}};u(lt,"properties",{hass:{attribute:!1},registry:{attribute:!1},t:{attribute:!1},presets:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},selectedAssetId:{attribute:!1},_active:{state:!0}}),u(lt,"styles",m`
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
  `);customElements.define("bindhome-inventory-section",lt);var dt=class extends g{constructor(){super(),this.registry={},this.areas=[],this.t=t=>t,this._tab="assets",this._selectedAssetId=null}_areaName(t){return this.areas.find(e=>e.area_id===t)?.name??this.t(t?"infrastructure.unknown_area":"infrastructure.no_area")}_assetName(t){return this.registry.assets?.find(e=>e.id===t)?.name??t}_renderAssets(){let t=this.registry.assets??[];if(!t.length)return a`<div class="empty">${this.t("infrastructure.no_assets")}</div>`;if(this._selectedAssetId){let e=t.find(s=>s.id===this._selectedAssetId);if(e)return a`<button class="link" @click=${()=>this._selectedAssetId=null}>← ${this.t("infrastructure.back_assets")}</button><section class="detail"><h2>${e.name}</h2><dl><dt>${this.t("fields.type")}</dt><dd>${e.asset_type}</dd><dt>${this.t("fields.code")}</dt><dd>${e.code||this.t("common.not_set")}</dd><dt>${this.t("common.area")}</dt><dd>${this._areaName(e.area_id)}</dd><dt>${this.t("fields.capabilities")}</dt><dd>${e.capabilities?.join(", ")||this.t("common.none")}</dd></dl><details class="advanced"><summary>${this.t("infrastructure.advanced")}</summary><dl><dt>${this.t("infrastructure.asset_id")}</dt><dd>${e.id}</dd><dt>${this.t("infrastructure.area_id")}</dt><dd>${e.area_id||this.t("common.none")}</dd></dl></details></section>`}return a`<div class="table-wrap"><table><thead><tr><th>${this.t("fields.name")}</th><th>${this.t("fields.type")}</th><th>${this.t("common.area")}</th><th>${this.t("fields.capabilities")}</th></tr></thead><tbody>${t.map(e=>a`<tr><td><button class="link" @click=${()=>this._selectedAssetId=e.id}>${e.name}</button></td><td>${e.asset_type}</td><td>${this._areaName(e.area_id)}</td><td>${e.capabilities?.join(", ")||"\u2014"}</td></tr>`)}</tbody></table></div>`}_renderRelations(){let t=this.registry.relations??[];return t.length?a`<div class="table-wrap"><table><thead><tr><th>${this.t("fields.source")}</th><th>${this.t("fields.relation")}</th><th>${this.t("fields.target")}</th></tr></thead><tbody>${t.map(e=>a`<tr><td>${this._assetName(e.source_asset_id)}</td><td>${e.relation_type}</td><td>${this._assetName(e.target_asset_id)}</td></tr>`)}</tbody></table></div>`:a`<div class="empty">${this.t("infrastructure.no_relations")}</div>`}_renderBindings(){let t=this.registry.bindings??[];return t.length?a`<div class="table-wrap"><table><thead><tr><th>${this.t("fields.asset")}</th><th>${this.t("fields.capability")}</th><th>${this.t("fields.role")}</th><th>${this.t("fields.ha_entity")}</th></tr></thead><tbody>${t.map(e=>a`<tr><td>${this._assetName(e.asset_id)}</td><td>${e.capability}</td><td>${e.role}</td><td>${e.entity_id}</td></tr>`)}</tbody></table></div>`:a`<div class="empty">${this.t("infrastructure.no_bindings")}</div>`}render(){return a`<div class="content"><h1>${this.t("nav.infrastructure")}</h1><p class="muted">${this.t("infrastructure.intro")}</p><nav class="tabs" aria-label=${this.t("infrastructure.views_label")}>${["assets","relations","bindings"].map(t=>a`<button class=${this._tab===t?"active":""} @click=${()=>{this._tab=t,this._selectedAssetId=null}}>${this.t(`infrastructure.tabs.${t}`)}</button>`)}</nav>${this._tab==="assets"?this._renderAssets():this._tab==="relations"?this._renderRelations():this._renderBindings()}</div>`}};u(dt,"properties",{registry:{attribute:!1},areas:{attribute:!1},t:{attribute:!1},_tab:{state:!0},_selectedAssetId:{state:!0}}),u(dt,"styles",m`
    :host{display:block}*{box-sizing:border-box}.content{max-width:1200px;margin:auto;padding:28px 24px}h1,h2,p{margin:0}h1{font-size:24px;font-weight:500}h2{font-size:20px;font-weight:500}.muted{color:var(--secondary-text-color)}.tabs{margin-top:20px;display:flex;border-bottom:1px solid var(--divider-color);overflow-x:auto}.tabs button{min-height:46px;padding:0 16px;border:0;border-bottom:3px solid transparent;color:var(--secondary-text-color);background:transparent;cursor:pointer;font:inherit}.tabs button.active{color:var(--primary-color);border-bottom-color:var(--primary-color)}.tabs button:focus-visible,.link:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}.table-wrap{margin-top:20px;overflow-x:auto;background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:8px}table{width:100%;border-collapse:collapse;text-align:left}th,td{padding:12px 14px;border-bottom:1px solid var(--divider-color);vertical-align:top}th{font-size:12px;color:var(--secondary-text-color);background:var(--secondary-background-color)}tr:last-child td{border-bottom:0}.link{padding:0;border:0;color:var(--primary-color);background:transparent;cursor:pointer;font:inherit;font-weight:500;text-align:left}.empty{margin-top:20px;padding:28px;border:1px dashed var(--divider-color);border-radius:8px;text-align:center;color:var(--secondary-text-color)}.detail{margin-top:20px;padding:20px;border:1px solid var(--divider-color);border-radius:8px;background:var(--card-background-color)}.detail dl{display:grid;grid-template-columns:180px 1fr;gap:12px}.detail dt{color:var(--secondary-text-color)}.detail dd{margin:0;overflow-wrap:anywhere}.advanced{margin-top:20px;border-top:1px solid var(--divider-color);padding-top:14px}@media(max-width:600px){.content{padding:20px 12px}th,td{padding:10px}.detail dl{grid-template-columns:1fr;gap:4px}.detail dd{margin-bottom:10px}}
  `);customElements.define("bindhome-infrastructure-inspector",dt);var ct=class extends g{constructor(){super(),this.hass=null,this.t=t=>t,this.presets=[],this.floors=[],this.areas=[],this.assets=[],this.registry={},this.bindingStatuses={records:[],summary:{}},this.entityRegistry=[],this.deviceRegistry=[],this.refreshBindingData=null,this.refreshTopologyData=null,this.selectedAssetId=null,this._tab="inventory"}willUpdate(t){t.has("selectedAssetId")&&this.selectedAssetId&&(this._tab="inventory")}render(){return a`<div class="content-head">
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
      </section>`}};u(ct,"properties",{hass:{attribute:!1},t:{attribute:!1},presets:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},assets:{attribute:!1},registry:{attribute:!1},bindingStatuses:{attribute:!1},entityRegistry:{attribute:!1},deviceRegistry:{attribute:!1},refreshBindingData:{attribute:!1},refreshTopologyData:{attribute:!1},selectedAssetId:{attribute:!1},_tab:{state:!0}}),u(ct,"styles",[w,m`
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
    `]);customElements.define("bindhome-advanced-view",ct);var ht=class extends g{constructor(){super(),this.t=t=>t,this.floors=[],this.areas=[],this._step=0}_complete(t){this.dispatchEvent(new CustomEvent("onboarding-complete",{detail:{startInventory:t},bubbles:!0,composed:!0}))}_renderWelcome(){return a`<p class="eyebrow">${this.t("onboarding.welcome_eyebrow")}</p><h1>${this.t("onboarding.welcome_title")}</h1><p class="lead">${this.t("onboarding.welcome_body")}</p><div class="example"><div class="example-row"><div class="example-box"><strong>${this.t("onboarding.stable_title")}</strong><span class="muted">${this.t("onboarding.stable_example")}</span></div><span class="arrow" aria-hidden="true">→</span><div class="example-box"><strong>${this.t("onboarding.replaceable_title")}</strong><span class="muted">${this.t("onboarding.replaceable_example")}</span></div></div></div>`}_renderModel(){let t=["asset","capability","binding","representation"];return a`<p class="eyebrow">${this.t("onboarding.model_eyebrow")}</p><h1>${this.t("onboarding.model_title")}</h1><p class="lead">${this.t("onboarding.model_body")}</p><div class="model">${t.map((e,s)=>a`<div class="model-row"><span class="number">${s+1}</span><div><strong>${this.t(`onboarding.${e}_title`)}</strong><span class="muted">${this.t(`onboarding.${e}_body`)}</span></div></div>`)}</div>`}_renderStructure(){return a`<p class="eyebrow">${this.t("onboarding.structure_eyebrow")}</p><h1>${this.t("onboarding.structure_title")}</h1><p class="lead">${this.t("onboarding.structure_body")}</p><div class="structure"><div class="counts"><div class="count"><strong>${this.floors.length}</strong><span class="muted">${this.t("onboarding.floors_detected")}</span></div><div class="count"><strong>${this.areas.length}</strong><span class="muted">${this.t("onboarding.areas_detected")}</span></div></div>${this.areas.length===0?a`<div class="warning">${this.t("onboarding.no_areas")}</div>`:a`<p class="muted">${this.t("onboarding.structure_ready")}</p>`}</div>`}_renderStart(){return a`<p class="eyebrow">${this.t("onboarding.start_eyebrow")}</p><h1>${this.t("onboarding.start_title")}</h1><p class="lead">${this.t("onboarding.start_body")}</p><div class="next-steps"><strong>${this.t("onboarding.after_inventory_title")}</strong><ol><li>${this.t("onboarding.after_inventory_binding")}</li><li>${this.t("onboarding.after_inventory_topology")}</li><li>${this.t("onboarding.after_inventory_representation")}</li></ol></div>`}render(){let t=[()=>this._renderWelcome(),()=>this._renderModel(),()=>this._renderStructure(),()=>this._renderStart()];return a`<div class="page">
      <div class="progress" aria-label=${this.t("onboarding.progress_label")}>${t.map((e,s)=>a`<span class=${s<=this._step?"active":""}></span>`)}</div>
      ${t[this._step]()}
      <div class="actions">
        ${this._step>0?a`<button @click=${()=>this._step-=1}>${this.t("onboarding.back")}</button>`:null}
        ${this._step<t.length-1?a`<button class="primary" @click=${()=>this._step+=1}>${this.t("onboarding.next")}</button>`:a`<button class="primary" ?disabled=${this.areas.length===0} @click=${()=>this._complete(!1)}>${this.t("nav.home")}</button>`}
        <button class="skip" @click=${()=>this._complete(!1)}>${this.t("onboarding.skip")}</button>
      </div>
    </div>`}};u(ht,"properties",{t:{attribute:!1},floors:{attribute:!1},areas:{attribute:!1},_step:{state:!0}}),u(ht,"styles",m`
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
  `);customElements.define("bindhome-onboarding-view",ht);var pt=class extends g{constructor(){super(),this.hass=null,this.narrow=!1,this.route=null,this.panel=null,this._view="home",this._loading=!0,this._error=null,this._refreshError=null,this._presets=[],this._floors=[],this._areas=[],this._assets=[],this._registry=null,this._bindingStatuses={records:[],summary:{}},this._entityRegistry=[],this._deviceRegistry=[],this._initialized=!1,this._loadPromise=null,this._translationLanguage=null,this._dataGeneration=0,this._t=jt(),this._contextAreaId=null,this._selectedAssetId=null,this._selectedAreaId=null,this._advancedAssetId=null,this._addSessionId=0,this._advancedPinned=!1,this._advancedPreferenceIdentity=null,this._onboardingVisible=!1,this._onboardingDismissed=!1,this._onboardingPreferenceIdentity=null}updated(t){t.has("hass")&&(this._restoreAdvancedPreference(),this._restoreOnboardingPreference()),t.has("hass")&&this.hass&&!this._initialized&&!this._loadPromise?this._load(!0):t.has("hass")&&this.hass&&this._initialized&&(this.hass.language||"en")!==this._translationLanguage&&this._loadTranslations(this.hass.language||"en")}async _loadTranslations(t=this.hass?.language||"en"){let e=t||"en",s=await qt(this.hass,e);(this.hass?.language||"en")===e&&(this._t=s,this._translationLanguage=e)}async _load(t=!1){if(!this.hass||this._loadPromise)return this._loadPromise;let e=++this._dataGeneration;t&&(this._loading=!0),this._error=null,this._refreshError=null;let s=this.hass,i=f(s),o=be(s),n=s.language||"en";this._loadPromise=Promise.all([i.listPresets(),i.listAssets(),i.getRegistry(),i.listBindingStatuses(),o.listFloors(),o.listAreas(),o.listEntityRegistry(),o.listDeviceRegistry(),qt(s,n)]);try{let[d,l,p,_,h,b,v,x,M]=await this._loadPromise;if(e!==this._dataGeneration)return;this._presets=d,this._assets=l,this._registry=p,this._bindingStatuses=_,this._floors=h,this._areas=b,this._entityRegistry=v,this._deviceRegistry=x,this._t=M,this._translationLanguage=n}catch(d){let l=d?.message||this._t("shell.load_error_detail");t||!this._initialized?this._error=l:this._refreshError=l}finally{this._initialized=!0,this._syncOnboardingVisibility(),this._loading=!1,this._loadPromise=null}}async _refreshBindingData(){if(!this.hass)return;let t=++this._dataGeneration,e=f(this.hass),[s,i]=await Promise.all([e.getRegistry(),e.listBindingStatuses()]);t===this._dataGeneration&&(this._registry=s,this._assets=s.assets??this._assets,this._bindingStatuses=i)}async _refreshTopologyData(){if(!this.hass)return;let t=++this._dataGeneration,e=await f(this.hass).getRegistry();t===this._dataGeneration&&(this._registry=e,this._assets=e.assets??this._assets)}async _refreshAssets(){if(!this.hass)return;let t=++this._dataGeneration,e=await f(this.hass).listAssets();if(t===this._dataGeneration)return this._assets=e,this._registry&&(this._registry={...this._registry,assets:e}),this._syncOnboardingVisibility(),e}_assetsRefreshed(t){this._assets=t.detail,this._registry&&(this._registry={...this._registry,assets:t.detail}),this._syncOnboardingVisibility()}_navigate(t){if(this._onboardingVisible&&this._dismissOnboarding(),!(t==="advanced"&&!this._advancedPinned)){if(t==="add"){this._openAdd(null);return}this._view==="advanced"&&t!=="advanced"&&(this._advancedAssetId=null),this._view=t,t!=="add"&&(this._contextAreaId=null)}}_openAdd(t=null){this._addSessionId+=1,this._contextAreaId=t,this._view="add"}_advancedPreferenceKey(){return`bindhome.advanced-pinned.${this.hass?.user?.id??"browser"}`}_restoreAdvancedPreference(){let t=this._advancedPreferenceKey();if(t!==this._advancedPreferenceIdentity){this._advancedPreferenceIdentity=t;try{this._advancedPinned=window.localStorage.getItem(t)==="true"}catch{this._advancedPinned=!1}}}_setAdvancedPinned(t){this._advancedPinned=t;try{window.localStorage.setItem(this._advancedPreferenceKey(),String(t))}catch{}!t&&this._view==="advanced"&&this._navigate("home")}_onboardingPreferenceKey(){return`bindhome.onboarding.v1.${this.hass?.user?.id??"browser"}`}_restoreOnboardingPreference(){let t=this._onboardingPreferenceKey();if(t!==this._onboardingPreferenceIdentity){this._onboardingPreferenceIdentity=t;try{this._onboardingDismissed=window.localStorage.getItem(t)==="true"}catch{this._onboardingDismissed=!1}this._syncOnboardingVisibility()}}_syncOnboardingVisibility(){this._onboardingVisible=this._initialized&&!this._error&&this._assets.length===0&&!this._onboardingDismissed}_dismissOnboarding(){this._onboardingDismissed=!0,this._onboardingVisible=!1;try{window.localStorage.setItem(this._onboardingPreferenceKey(),"true")}catch{}}_completeOnboarding(){this._dismissOnboarding(),this._contextAreaId=null,this._view="home"}_homeNavigate(t){this._selectedAreaId=t.detail.areaId,this._selectedAssetId=t.detail.assetId}_openAsset(t){let e=this._assets.find(s=>s.id===t);this._selectedAssetId=t,this._selectedAreaId=e?.area_id?this._areas.some(s=>s.area_id===e.area_id)?e.area_id:A:k,this._view="home"}_editAsset(t){this._advancedPinned&&(this._advancedAssetId=t,this._view="advanced")}_humanAssetCommitted(t){t?.id&&(this._assets=this._assets.map(e=>e.id===t.id?t:e),this._registry&&(this._registry={...this._registry,assets:this._assets}),this._selectedAssetId=t.id,this._selectedAreaId=t.area_id?this._areas.some(e=>e.area_id===t.area_id)?t.area_id:A:k)}_renderViews(){let t={hass:this.hass,t:this._t,floors:this._floors,areas:this._areas,assets:this._assets,registry:this._registry??{},bindingStatuses:this._bindingStatuses,entityRegistry:this._entityRegistry,deviceRegistry:this._deviceRegistry,refreshBindingData:()=>this._refreshBindingData(),refreshTopologyData:()=>this._refreshTopologyData()};return a`<section class="view" ?hidden=${this._view!=="home"}>
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
          .advancedEnabled=${this._advancedPinned}
          .refreshBindingData=${t.refreshBindingData}
          .refreshTopologyData=${t.refreshTopologyData}
          .refreshAssets=${()=>this._refreshAssets()}
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
          .hass=${this.hass}
          .t=${this._t}
          .presets=${this._presets}
          .floors=${this._floors}
          .areas=${this._areas}
          .assets=${this._assets}
          .contextAreaId=${this._contextAreaId}
          .sessionId=${this._addSessionId}
          .onCreated=${async e=>{let s=await this._refreshAssets(),i=e??s?.at(-1);i&&this._openAsset(i.id)}}
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
          .selectedAssetId=${this._advancedAssetId}
          @assets-refreshed=${this._assetsRefreshed}
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
        <div class="brand"><ha-icon icon="mdi:home-switch"></ha-icon><h1>BindHome</h1></div>
        <nav class="tabs" aria-label=${this._t("shell.sections_label")}>
          ${["home","add","search"].map(e=>a`<button
              class=${this._view===e?"active":""}
              aria-current=${this._view===e?"page":"false"}
              @click=${()=>this._navigate(e)}
            >${this._t(`nav.${e}`)}</button>`)}
          <button
            class=${this._view==="advanced"?"advanced active":"advanced"}
            aria-current=${this._view==="advanced"?"page":"false"}
            ?disabled=${!this._advancedPinned}
            @click=${()=>this._navigate("advanced")}
          >${this._t("nav.advanced")}</button>
          <ha-switch
            class="advanced-switch"
            .checked=${this._advancedPinned}
            aria-label=${this._t(this._advancedPinned?"nav.unpin_advanced":"nav.pin_advanced")}
            title=${this._t(this._advancedPinned?"nav.unpin_advanced":"nav.pin_advanced")}
            @change=${e=>this._setAdvancedPinned(!!e.currentTarget.checked)}
          ></ha-switch>
        </nav>
        <button
          class="refresh"
          aria-label=${this._t("shell.refresh_label")}
          @click=${()=>this._load(!1)}
          ?disabled=${this._loading||!!this._loadPromise}
        ><ha-icon icon="mdi:refresh"></ha-icon></button>
      </header>
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
    </div>`}};u(pt,"properties",{hass:{attribute:!1},narrow:{type:Boolean},route:{attribute:!1},panel:{attribute:!1},_view:{state:!0},_loading:{state:!0},_error:{state:!0},_presets:{state:!0},_floors:{state:!0},_areas:{state:!0},_assets:{state:!0},_registry:{state:!0},_bindingStatuses:{state:!0},_entityRegistry:{state:!0},_deviceRegistry:{state:!0},_refreshError:{state:!0},_t:{state:!0},_contextAreaId:{state:!0},_selectedAssetId:{state:!0},_selectedAreaId:{state:!0},_advancedAssetId:{state:!0},_addSessionId:{state:!0},_advancedPinned:{state:!0},_onboardingVisible:{state:!0}}),u(pt,"styles",m`
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
    .brand { display: flex; align-items: center; gap: 9px; margin-right: 30px; }
    .brand ha-icon { color: var(--primary-color); --mdc-icon-size: 28px; }
    .brand h1 { margin: 0; font-size: 20px; font-weight: 500; }
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
  `);customElements.define("bindhome-panel",pt);})();
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
