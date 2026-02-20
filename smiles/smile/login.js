import './login.css';
import $ from 'jquery';
import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { setDoc, getDoc, getDocs, doc, collection, query, where, serverTimestamp } from 'firebase/firestore';
import { wiTip, Mensaje, savels, getls, wiSpin } from '../widev.js';
import { personal } from '../header.js';

// ==================== 1. CONFIG ====================
const cfg   = { db: 'smiles', rol: 'smile' };
let login = 'si', registrar = 'si', restablecer = 'no';
let usuarioOk = false, emailOk = false;

const errRegistrar = {
  'auth/email-already-in-use':'Email ya registrado', 'auth/weak-password':'Contraseña débil',
  'auth/invalid-credential':'Contraseña incorrecta', 'auth/invalid-email':'Email no válido',
  'auth/missing-email':'Usuario no registrado',      'auth/too-many-requests':'Demasiados intentos'
};

const reglas = {
  regEmail:     [v => v.toLowerCase().trim(),                           v => /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v) || 'Email inválido'],
  regUsuario:   [v => v.toLowerCase().replace(/[^a-z0-9_]/g,'').trim(), v => v.length >= 4 || 'Mínimo 4 caracteres'],
  regNombre:    [v => v.trim(),                                          v => v.length > 0  || 'Ingresa tu nombre'],
  regApellidos: [v => v.trim(),                                          v => v.length > 0  || 'Ingresa tus apellidos'],
  regPassword:  [v => v,                                                 v => v.length >= 6 || 'Mínimo 6 caracteres'],
  regPassword1: [v => v,                                                 v => v === $('#regPassword').val() || 'No coinciden']
};

// ==================== 2. TEMPLATES ====================
const campo = (ico, tipo, id, place, ojo = false) =>
  `<div class="wilg_grupo"><i class="fas fa-${ico}"></i><input type="${tipo}" id="${id}" placeholder="${place}" autocomplete="off">${ojo ? '<i class="fas fa-eye wilg_ojo"></i>' : ''}</div>`;

const tpl = {
  login: () => `
    <div class="wilg_head">
      <div class="wilg_logo"><img src="./smile.avif" alt="Awonbe"></div>
      <h2>Bienvenido</h2>
      <p>Inicia sesión en tu cuenta</p>
    </div>
    ${campo('envelope','text','email','Email o usuario')}
    ${campo('lock','password','password','Contraseña', true)}
    <button type="button" id="Login" class="wilg_btn inactivo"><i class="fas fa-sign-in-alt"></i> Iniciar Sesión</button>
    <div class="wilg_links">
      ${restablecer === 'si' ? '<span class="wilg_rec">¿Olvidaste tu contraseña?</span>' : ''}
      ${registrar   === 'si' ? '<span class="wilg_reg">Crear cuenta <i class="fas fa-arrow-right"></i></span>' : ''}
    </div>`,

  registrar: () => `
    <div class="wilg_head">
      <div class="wilg_logo"><img src="./smile.avif" alt="Awonbe"></div>
      <h2>Crear Cuenta</h2>
      <p>Únete a la comunidad</p>
    </div>
    <div class="wilg_grid">
      ${['envelope,email,regEmail,Email','user,text,regUsuario,Usuario','user-tie,text,regNombre,Nombre',
         'user-tie,text,regApellidos,Apellidos'].map(c => { const [i,t,id,p] = c.split(','); return campo(i,t,id,p); }).join('')}
      ${campo('lock','password','regPassword','Contraseña', true)}
      ${campo('lock','password','regPassword1','Confirmar contraseña', true)}
    </div>
    <div class="wilg_check">
      <label><input type="checkbox" id="regTerminos">
      <span>Acepto los <a href="/terminos.html" target="_blank">términos y condiciones</a></span></label>
    </div>
    <button type="button" id="Registrar" class="wilg_btn inactivo"><i class="fas fa-user-plus"></i> Registrarme</button>
    <div class="wilg_links"><span class="wilg_log"><i class="fas fa-arrow-left"></i> Ya tengo cuenta</span></div>`,

  restablecer: () => `
    <div class="wilg_head">
      <div class="wilg_logo wilg_logo_sm"><img src="./smile.avif" alt="Awonbe"></div>
      <h2>Restablecer</h2>
      <p>Te enviaremos un enlace a tu email</p>
    </div>
    ${campo('envelope','text','recEmail','Email o usuario')}
    <button type="button" id="Recuperar" class="wilg_btn inactivo"><i class="fas fa-paper-plane"></i> Enviar enlace</button>
    <div class="wilg_links"><span class="wilg_log"><i class="fas fa-arrow-left"></i> Volver</span></div>`
};

// ==================== 3. RENDER ====================
export const render = () => {
  $('#wimain').html(`
    <div class="wilg_wrap">
      <div class="wilg_card">
        <form id="liForm"></form>
      </div>
    </div>`);
  mostrar('login');
};

const mostrar = (v) => {
  $('#liForm').html(tpl[v]()).attr('data-vista', v);
  $('#liForm input:first').focus();
};

// ==================== 4. UTILS ====================
const val    = id => $(`#${id}`).val().trim();
const tema   = t  => { if (!t) return; const [n,c] = t.split('|'); document.documentElement.dataset.theme = n; $('meta[name="theme-color"]').attr('content', c); };
const entrar = async (wi) => { savels('wiSmile', wi, 24); if (wi?.tema) { localStorage.wiTema = wi.tema; tema(wi.tema); } personal(wi); };
const correo = async (v) => {
  if (v.includes('@')) return v;
  const snap = await getDoc(doc(db, cfg.db, v));
  if (!snap.exists()) throw new Error('Usuario no encontrado');
  return snap.data().email;
};

// ==================== 5. EVENTOS ====================
$(document)
  .on('click.li',   '.wilg_ojo',  function () {
    const $i = $(this).siblings('input');
    $i.attr('type', $i.attr('type') === 'password' ? 'text' : 'password');
    $(this).toggleClass('fa-eye fa-eye-slash');
  })
  .on('input.li',   '#email,#recEmail,#regEmail,#regUsuario', function () { $(this).val($(this).val().toLowerCase()); })
  .on('click.li',   '.wilg_reg', () => mostrar('registrar'))
  .on('click.li',   '.wilg_rec', () => mostrar('restablecer'))
  .on('click.li',   '.wilg_log', () => mostrar('login'))

  // Activar botones + Enter
  .on('input.li keyup.li', '#password',    e => { $('#Login').removeClass('inactivo');    e.key === 'Enter' && $('#Login').click(); })
  .on('input.li keyup.li', '#regPassword1',e => { $('#Registrar').removeClass('inactivo');e.key === 'Enter' && $('#Registrar').click(); })
  .on('input.li keyup.li', '#recEmail',    e => { $('#Recuperar').removeClass('inactivo');e.key === 'Enter' && $('#Recuperar').click(); })

  // Validación blur
  .on('blur.li', Object.keys(reglas).map(id => `#${id}`).join(','), function () {
    const [trans, vld] = reglas[this.id];
    const v = trans($(this).val()); $(this).val(v);
    const r = vld(v); r !== true && wiTip(this, r, 'error', 2500);
  })

  // Verificar disponibilidad usuario / email
  .on('blur.li', '#regUsuario', async function () {
    const u = val('regUsuario'); if (u.length < 3) return;
    usuarioOk = !(await getDoc(doc(db, cfg.db, u))).exists();
    wiTip(this, `Usuario ${usuarioOk ? 'disponible ✅' : 'no disponible ❌'}`, usuarioOk ? 'success' : 'error', 3000);
  })
  .on('blur.li', '#regEmail', async function () {
    const e = val('regEmail'); if (!e.includes('@')) return;
    emailOk = (await getDocs(query(collection(db, cfg.db), where('email','==',e)))).empty;
    wiTip(this, `Email ${emailOk ? 'disponible ✅' : 'no disponible ❌'}`, emailOk ? 'success' : 'error', 3000);
  })

  // ——— LOGIN ———
  .on('click.li', '#Login', async function () {
    wiSpin(this, true, 'Iniciando');
    try {
      await signInWithEmailAndPassword(auth, await correo(val('email')), val('password'));
      const wi = (await getDoc(doc(db, cfg.db, auth.currentUser.displayName || val('email')))).data();
      await entrar(wi);
    } catch (e) { Mensaje(errRegistrar[e.code] || e.message, 'error'); }
    finally { wiSpin(this, false); }
  })

  // ——— REGISTRO ———
  .on('click.li', '#Registrar', async function () {
    const checks = [
      [!$('#regTerminos').is(':checked'), $('#regTerminos')[0], 'Acepta los términos'],
      [!usuarioOk, $('#regUsuario')[0], 'Verifica el usuario'],
      [!emailOk,   $('#regEmail')[0],   'Verifica el email']
    ];
    const fallo = checks.find(([c]) => c);
    if (fallo) return wiTip(fallo[1], fallo[2], 'error', 2500);
    wiSpin(this, true, 'Registrando');
    try {
      const datos = Object.fromEntries(['email','usuario','nombre','apellidos','password'].map(k => [k, val(k === 'email' ? 'regEmail' : k === 'usuario' ? 'regUsuario' : k === 'nombre' ? 'regNombre' : k === 'apellidos' ? 'regApellidos' : 'regPassword')]));
      const { user } = await createUserWithEmailAndPassword(auth, datos.email, datos.password);
      await Promise.all([updateProfile(user, { displayName: datos.usuario }), sendEmailVerification(user)]);
      const wi = { ...datos, rol: cfg.rol, uid: user.uid, terminos: true, tema: localStorage.wiTema };
      delete wi.password;
      await setDoc(doc(db, cfg.db, datos.usuario), { ...wi, creado: serverTimestamp() });
      await entrar(wi);
      Mensaje('✅ Cuenta creada. Verifica tu email', 'success');
    } catch (e) { Mensaje(errRegistrar[e.code] || e.message, 'error'); }
    finally { wiSpin(this, false); }
  })

  // ——— RECUPERAR ———
  .on('click.li', '#Recuperar', async function () {
    wiSpin(this, true, 'Enviando');
    try {
      await sendPasswordResetEmail(auth, await correo(val('recEmail')));
      Mensaje('✅ Email enviado, revisa tu bandeja', 'success');
      setTimeout(() => mostrar('login'), 2000);
    } catch (e) { Mensaje(errRegistrar[e.code] || e.message, 'error'); }
    finally { wiSpin(this, false); }
  });

// ——— PUNTO DE ENTRADA ———
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const wi = getls('wiSmile');
    if (wi) { await entrar(wi); return; }
    const snap = await getDoc(doc(db, cfg.db, user.displayName || user.email));
    snap.exists() ? await entrar(snap.data()) : render();
  } else { render(); }
});