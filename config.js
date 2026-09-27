:root{
  --ink:#171310;
  --paper:#f7f0df;
  --paper2:#fffaf0;
  --muted:#766d61;
  --line:#ddd2bd;
  --accent:#c9782b;
  --accent2:#8d3e20;
  --white:#fffdf7;
  --shadow:0 16px 40px rgba(35,25,10,.09);
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,system-ui,sans-serif}
a{text-decoration:none;color:inherit}
.wrap{width:min(1120px,92%);margin:auto}
.hero{min-height:680px;background:var(--paper);overflow:hidden;border-bottom:1px solid var(--line)}
.nav{height:82px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(23,19,16,.12)}
.brand{display:flex;align-items:center;gap:12px}
.brand-mark{font-size:38px;line-height:1}
.eyebrow,.section-kicker{font-family:"Barlow Condensed",sans-serif;font-weight:700;letter-spacing:.15em;font-size:12px}
.brand-title{font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:22px;letter-spacing:.02em}
nav{display:flex;gap:25px;font-size:14px;font-weight:700}
nav a:hover{color:var(--accent2)}
.menu-btn{display:none;background:none;border:0;font-size:28px}
.hero-content{min-height:598px;display:grid;grid-template-columns:1.05fr .95fr;align-items:center;gap:20px}
.pill{display:inline-block;border:1px solid var(--ink);padding:8px 12px;font-size:12px;font-weight:800;letter-spacing:.08em}
h1,h2,h3{font-family:"Barlow Condensed",sans-serif}
h1{font-size:clamp(56px,8vw,100px);line-height:.82;margin:26px 0 22px;letter-spacing:-.035em}
h1 span{font-style:italic}
.hero-text{max-width:560px;font-size:17px;line-height:1.7;color:#4e473e}
.hero-actions{display:flex;gap:12px;margin-top:28px}
.btn{padding:13px 19px;border-radius:3px;font-weight:800;font-size:14px}
.btn-primary{background:var(--ink);color:var(--white)}
.btn-ghost{border:1px solid var(--ink)}
.knight-art{position:relative;height:520px;display:flex;align-items:center;justify-content:center}
.knight{font-size:470px;line-height:.75;transform:translateX(70px);filter:drop-shadow(0 20px 15px rgba(0,0,0,.05))}
.knight.mirror{position:absolute;transform:scaleX(-1) translateX(70px)}
.center-cut{position:absolute;font-size:180px;color:var(--paper);z-index:2}
.main{padding:38px 0 70px}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.stat-card{background:var(--paper2);border:1px solid var(--line);padding:20px;display:flex;gap:14px;align-items:center;box-shadow:var(--shadow)}
.stat-icon{font-size:25px}.stat-label{font-size:12px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.08em}.stat-value{font-family:"Barlow Condensed";font-size:31px;font-weight:800}.stat-value.small{font-size:25px}
.notice{margin:18px 0 55px;background:var(--ink);color:var(--white);padding:19px 23px;display:flex;gap:15px;align-items:center}.notice-icon{font-size:25px}.notice span{display:block;color:#cfc7ba;font-size:13px;margin-top:3px}
.section{margin-top:60px}.section-head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:18px}.section-kicker{color:var(--accent2)}h2{font-size:48px;line-height:.9;margin:5px 0 0}
.search,.select{background:var(--paper2);border:1px solid var(--line);padding:11px 13px;font:inherit;color:var(--ink);border-radius:3px}
.players-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.player-card{background:var(--paper2);border:1px solid var(--line);padding:18px;display:flex;justify-content:space-between;align-items:center}
.player-number{font-family:"Barlow Condensed";font-size:14px;color:var(--muted);font-weight:700}.player-name{font-weight:800;margin-top:3px}.player-status{font-size:11px;border:1px solid var(--line);padding:5px 8px;text-transform:uppercase;font-weight:800}
.bracket-hint{color:var(--muted);font-weight:600}
.bracket{display:flex;align-items:stretch;gap:52px;overflow-x:auto;padding:6px 4px 30px}
.bracket-round{display:flex;flex-direction:column;justify-content:space-around;gap:22px;min-width:230px;flex:none}
.bracket-round-title{font-family:"Barlow Condensed",sans-serif;font-weight:700;letter-spacing:.1em;font-size:12px;color:var(--accent2);text-transform:uppercase;text-align:center;margin-bottom:2px}
.bracket-match{position:relative;background:var(--paper2);border:1px solid var(--line);box-shadow:var(--shadow)}
.bracket-match:not(:first-child)::before{content:"";position:absolute;top:50%;left:-26px;width:26px;height:2px;background:var(--line)}
.bracket-round:last-child .bracket-match::after{content:none}
.bracket-round:not(:last-child) .bracket-match::after{content:"";position:absolute;top:50%;right:-26px;width:26px;height:2px;background:var(--line)}
.bracket-slot{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:11px 14px;font-weight:700;font-size:15px;border-bottom:1px solid var(--line)}
.bracket-slot:last-child{border-bottom:0}
.bracket-slot.winner{color:var(--accent2)}
.bracket-slot.loser{color:var(--muted);font-weight:600}
.bracket-slot .pts{font-size:11px;font-weight:800;color:var(--muted)}
.bracket-meta{padding:7px 14px;font-size:11px;color:var(--muted);border-top:1px dashed var(--line);display:flex;justify-content:space-between}
.bracket-meta .pending{color:var(--accent2);font-weight:800}
.table-wrap{overflow:auto;background:var(--paper2);border:1px solid var(--line)}
table{width:100%;border-collapse:collapse;min-width:680px}th,td{padding:14px 16px;border-bottom:1px solid var(--line);text-align:left;font-size:14px}th{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}td:nth-child(1),td:last-child{font-weight:800}
.live-dot{font-size:12px;font-weight:700}.live-dot i{display:inline-block;width:8px;height:8px;background:#3c8f45;border-radius:50%;margin-right:5px}
.prize-card{background:var(--ink);color:var(--white);display:grid;grid-template-columns:1.2fr 1fr;box-shadow:var(--shadow)}.prize-left,.prize-right{padding:35px}.prize-right{border-left:1px solid #3d3832}.big-money{font-family:"Barlow Condensed";font-size:82px;font-weight:800;margin:12px 0}.prize-left p{max-width:520px;color:#c9c1b4;line-height:1.6;font-size:14px}.prize-row{display:flex;justify-content:space-between;gap:20px;padding:15px 0;border-bottom:1px solid #3d3832;font-size:13px}.prize-row span{color:#bcb3a5}.info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.info-card{display:flex;gap:14px;background:var(--paper2);border:1px solid var(--line);padding:22px}.info-icon{font-size:25px}.info-card h3{font-size:24px;margin:0 0 5px}.info-card p{margin:0;color:var(--muted);font-size:13px;line-height:1.5}
.updated{text-align:center;color:var(--muted);font-size:11px;margin-top:38px}
footer{background:var(--ink);color:var(--white);padding:25px 0}.footer-inner{display:flex;justify-content:space-between;gap:20px;font-size:13px}.footer-inner span{color:#aaa094}
.empty{padding:30px;text-align:center;color:var(--muted);background:var(--paper2);border:1px dashed var(--line)}
.badge-win{color:#28753a}.badge-loss{color:#9a3024}.badge-draw{color:#8a6a1c}
@media(max-width:850px){
  nav{display:none;position:absolute;top:82px;left:0;right:0;background:var(--paper);padding:18px 4%;flex-direction:column;border-bottom:1px solid var(--line);z-index:10}
  nav.open{display:flex}.menu-btn{display:block}
  .hero-content{grid-template-columns:1fr}.knight-art{height:280px;order:-1}.knight{font-size:240px}.knight.mirror{transform:scaleX(-1) translateX(40px)}.center-cut{font-size:90px}
  .stats-grid{grid-template-columns:repeat(2,1fr)}.players-grid{grid-template-columns:repeat(2,1fr)}
  .bracket-round{min-width:200px}
  .prize-card{grid-template-columns:1fr}.prize-right{border-left:0;border-top:1px solid #3d3832}
  .info-grid{grid-template-columns:1fr}
}
@media(max-width:560px){
  h1{font-size:58px}.stats-grid,.players-grid{grid-template-columns:1fr}.section-head{align-items:start;flex-direction:column}.search,.select{width:100%}
  .hero{min-height:auto}.hero-content{padding:45px 0 30px}.big-money{font-size:65px}
}
