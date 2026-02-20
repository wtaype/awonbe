import{j as i}from"./vendor-gzd0YkcT.js";import{db as d,auth as g}from"./firebase-FjtV-Ze4.js";import{g as b,d as w,a as C,q as A,w as R,c as U,s as P,b as x,u as j,e as T,f as N,h as L,i as S,o as I}from"./firebase-BcHM_OHh.js";import{d as f,g as n,M as u,s as V,h as D}from"./main-BrzqCT97.js";import{personal as M}from"./header-BdgRY149.js";import"./main-BCWMdErc.js";const l={db:"smiles",rol:"smile"};let v=!1,h=!1;const E={"auth/email-already-in-use":"Email ya registrado","auth/weak-password":"Contraseña débil","auth/invalid-credential":"Contraseña incorrecta","auth/invalid-email":"Email no válido","auth/missing-email":"Usuario no registrado","auth/too-many-requests":"Demasiados intentos"},_={regEmail:[a=>a.toLowerCase().trim(),a=>/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(a)||"Email inválido"],regUsuario:[a=>a.toLowerCase().replace(/[^a-z0-9_]/g,"").trim(),a=>a.length>=4||"Mínimo 4 caracteres"],regNombre:[a=>a.trim(),a=>a.length>0||"Ingresa tu nombre"],regApellidos:[a=>a.trim(),a=>a.length>0||"Ingresa tus apellidos"],regPassword:[a=>a,a=>a.length>=6||"Mínimo 6 caracteres"],regPassword1:[a=>a,a=>a===i("#regPassword").val()||"No coinciden"]},c=(a,s,e,r,t=!1)=>`<div class="wilg_grupo"><i class="fas fa-${a}"></i><input type="${s}" id="${e}" placeholder="${r}" autocomplete="off">${t?'<i class="fas fa-eye wilg_ojo"></i>':""}</div>`,O={login:()=>`
    <div class="wilg_head">
      <div class="wilg_logo"><img src="./smile.avif" alt="Awonbe"></div>
      <h2>Bienvenido</h2>
      <p>Inicia sesión en tu cuenta</p>
    </div>
    ${c("envelope","text","email","Email o usuario")}
    ${c("lock","password","password","Contraseña",!0)}
    <button type="button" id="Login" class="wilg_btn inactivo"><i class="fas fa-sign-in-alt"></i> Iniciar Sesión</button>
    <div class="wilg_links">
      
      <span class="wilg_reg">Crear cuenta <i class="fas fa-arrow-right"></i></span>
    </div>`,registrar:()=>`
    <div class="wilg_head">
      <div class="wilg_logo"><img src="./smile.avif" alt="Awonbe"></div>
      <h2>Crear Cuenta</h2>
      <p>Únete a la comunidad</p>
    </div>
    <div class="wilg_grid">
      ${["envelope,email,regEmail,Email","user,text,regUsuario,Usuario","user-tie,text,regNombre,Nombre","user-tie,text,regApellidos,Apellidos"].map(a=>{const[s,e,r,t]=a.split(",");return c(s,e,r,t)}).join("")}
      ${c("lock","password","regPassword","Contraseña",!0)}
      ${c("lock","password","regPassword1","Confirmar contraseña",!0)}
    </div>
    <div class="wilg_check">
      <label><input type="checkbox" id="regTerminos">
      <span>Acepto los <a href="/terminos.html" target="_blank">términos y condiciones</a></span></label>
    </div>
    <button type="button" id="Registrar" class="wilg_btn inactivo"><i class="fas fa-user-plus"></i> Registrarme</button>
    <div class="wilg_links"><span class="wilg_log"><i class="fas fa-arrow-left"></i> Ya tengo cuenta</span></div>`,restablecer:()=>`
    <div class="wilg_head">
      <div class="wilg_logo wilg_logo_sm"><img src="./smile.avif" alt="Awonbe"></div>
      <h2>Restablecer</h2>
      <p>Te enviaremos un enlace a tu email</p>
    </div>
    ${c("envelope","text","recEmail","Email o usuario")}
    <button type="button" id="Recuperar" class="wilg_btn inactivo"><i class="fas fa-paper-plane"></i> Enviar enlace</button>
    <div class="wilg_links"><span class="wilg_log"><i class="fas fa-arrow-left"></i> Volver</span></div>`},k=()=>{i("#wimain").html(`
    <div class="wilg_wrap">
      <div class="wilg_card">
        <form id="liForm"></form>
      </div>
    </div>`),p("login")},p=a=>{i("#liForm").html(O[a]()).attr("data-vista",a),i("#liForm input:first").focus()},o=a=>i(`#${a}`).val().trim(),q=a=>{if(!a)return;const[s,e]=a.split("|");document.documentElement.dataset.theme=s,i('meta[name="theme-color"]').attr("content",e)},y=async a=>{V("wiSmile",a,24),a?.tema&&(localStorage.wiTema=a.tema,q(a.tema)),M(a)},$=async a=>{if(a.includes("@"))return a;const s=await b(w(d,l.db,a));if(!s.exists())throw new Error("Usuario no encontrado");return s.data().email};i(document).on("click.li",".wilg_ojo",function(){const a=i(this).siblings("input");a.attr("type",a.attr("type")==="password"?"text":"password"),i(this).toggleClass("fa-eye fa-eye-slash")}).on("input.li","#email,#recEmail,#regEmail,#regUsuario",function(){i(this).val(i(this).val().toLowerCase())}).on("click.li",".wilg_reg",()=>p("registrar")).on("click.li",".wilg_rec",()=>p("restablecer")).on("click.li",".wilg_log",()=>p("login")).on("input.li keyup.li","#password",a=>{i("#Login").removeClass("inactivo"),a.key==="Enter"&&i("#Login").click()}).on("input.li keyup.li","#regPassword1",a=>{i("#Registrar").removeClass("inactivo"),a.key==="Enter"&&i("#Registrar").click()}).on("input.li keyup.li","#recEmail",a=>{i("#Recuperar").removeClass("inactivo"),a.key==="Enter"&&i("#Recuperar").click()}).on("blur.li",Object.keys(_).map(a=>`#${a}`).join(","),function(){const[a,s]=_[this.id],e=a(i(this).val());i(this).val(e);const r=s(e);r!==!0&&f(this,r,"error",2500)}).on("blur.li","#regUsuario",async function(){const a=o("regUsuario");a.length<3||(v=!(await b(w(d,l.db,a))).exists(),f(this,`Usuario ${v?"disponible ✅":"no disponible ❌"}`,v?"success":"error",3e3))}).on("blur.li","#regEmail",async function(){const a=o("regEmail");a.includes("@")&&(h=(await C(A(U(d,l.db),R("email","==",a)))).empty,f(this,`Email ${h?"disponible ✅":"no disponible ❌"}`,h?"success":"error",3e3))}).on("click.li","#Login",async function(){n(this,!0,"Iniciando");try{await P(g,await $(o("email")),o("password"));const a=(await b(w(d,l.db,g.currentUser.displayName||o("email")))).data();await y(a)}catch(a){u(E[a.code]||a.message,"error")}finally{n(this,!1)}}).on("click.li","#Registrar",async function(){const s=[[!i("#regTerminos").is(":checked"),i("#regTerminos")[0],"Acepta los términos"],[!v,i("#regUsuario")[0],"Verifica el usuario"],[!h,i("#regEmail")[0],"Verifica el email"]].find(([e])=>e);if(s)return f(s[1],s[2],"error",2500);n(this,!0,"Registrando");try{const e=Object.fromEntries(["email","usuario","nombre","apellidos","password"].map(m=>[m,o(m==="email"?"regEmail":m==="usuario"?"regUsuario":m==="nombre"?"regNombre":m==="apellidos"?"regApellidos":"regPassword")])),{user:r}=await x(g,e.email,e.password);await Promise.all([j(r,{displayName:e.usuario}),T(r)]);const t={...e,rol:l.rol,uid:r.uid,terminos:!0,tema:localStorage.wiTema};delete t.password,await N(w(d,l.db,e.usuario),{...t,creado:L()}),await y(t),u("✅ Cuenta creada. Verifica tu email","success")}catch(e){u(E[e.code]||e.message,"error")}finally{n(this,!1)}}).on("click.li","#Recuperar",async function(){n(this,!0,"Enviando");try{await S(g,await $(o("recEmail"))),u("✅ Email enviado, revisa tu bandeja","success"),setTimeout(()=>p("login"),2e3)}catch(a){u(E[a.code]||a.message,"error")}finally{n(this,!1)}});I(g,async a=>{if(a){const s=D("wiSmile");if(s){await y(s);return}const e=await b(w(d,l.db,a.displayName||a.email));e.exists()?await y(e.data()):k()}else k()});export{k as render};
