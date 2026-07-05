#!/usr/bin/env node
/* Gerador de sites do catálogo. Um template flexível + config por nicho. */
const fs = require('fs');
const path = require('path');
const OUT = __dirname;

const FONTS = {
  luxe:     {disp:"Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400", body:"Jost:wght@300;400;500;600", dispFam:"'Fraunces',serif", bodyFam:"'Jost',sans-serif", dispW:400},
  clinic:   {disp:"Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800", body:"Hanken+Grotesk:wght@300;400;500;600", dispFam:"'Bricolage Grotesque',sans-serif", bodyFam:"'Hanken Grotesk',sans-serif", dispW:700},
  editorial:{disp:"Playfair+Display:ital,wght@0,400;0,500;0,600;1,400", body:"Hanken+Grotesk:wght@300;400;500;600", dispFam:"'Playfair Display',serif", bodyFam:"'Hanken Grotesk',sans-serif", dispW:400},
  bold:     {disp:"Familjen+Grotesk:wght@400;500;600;700", body:"Hanken+Grotesk:wght@300;400;500;600", dispFam:"'Familjen Grotesk',sans-serif", bodyFam:"'Hanken Grotesk',sans-serif", dispW:700},
};

// temas: light/dark base + accent
function theme(t){
  if(t.dark) return {
    bg:t.bg||'#121110', panel:t.panel||'#1b1917', ink:'#f3eee7', muted:'#a99f92',
    line:t.line||'rgba(255,255,255,.12)', accent:t.accent, accent2:t.accent2||t.accent, soft:t.soft||'rgba(255,255,255,.05)'
  };
  return {
    bg:t.bg||'#f6f5f1', panel:'#ffffff', ink:t.ink||'#191b1a', muted:'#647067',
    line:t.line||'#e6e4dd', accent:t.accent, accent2:t.accent2||t.accent, soft:t.soft||'#eef2ef'
  };
}

const SITES = [
  { slug:'04-dentista', cat:'Saúde', font:'clinic', t:{accent:'#0e7c86',accent2:'#13a3b0',soft:'#e2f1f2'},
    brand:'OdontoVita', kicker:'Odontologia Moderna', h1:'O sorriso que você sempre quis, com quem cuida de verdade.',
    sub:'Atendimento humanizado, tecnologia de ponta e aquele cuidado que tira o medo do dentista. Agende sua avaliação.',
    hero:'dentista-1.jpg', feat:'dentista-2.jpg',
    svc:[['Clareamento','Dentes mais brancos com segurança e resultado duradouro.','R$ 350'],
         ['Implantes','Recupere a mastigação e a confiança do seu sorriso.','consulte'],
         ['Ortodontia','Aparelhos e alinhadores para um sorriso alinhado.','R$ 180/mês']],
    ftitle:'Por que a OdontoVita', fdesc:'Aqui você não é mais um número. Diagnóstico claro, plano de tratamento transparente e uma equipe que te acolhe do começo ao fim.',
    pts:[['+12 mil','sorrisos transformados'],['4,9★','no Google'],['0','dor com sedação'],['24h','retorno garantido']],
    quote:['"Eu tinha pavor de dentista. Hoje vou tranquila — atendimento nota mil."','Renata, paciente'] },

  { slug:'05-fisioterapia', cat:'Saúde', font:'clinic', t:{accent:'#2f8f6b',accent2:'#3fae82',soft:'#e3f2eb'},
    brand:'Movimente', kicker:'Fisioterapia & Pilates', h1:'De volta ao movimento, sem dor e sem limites.',
    sub:'Reabilitação, pilates clínico e fisioterapia esportiva com avaliação individual. Seu corpo merece um plano de verdade.',
    hero:'fisioterapia-1.jpg', feat:'fisioterapia-2.jpg',
    svc:[['Fisioterapia Ortopédica','Tratamento de lesões, dores e pós-operatório.','R$ 120'],
         ['Pilates Clínico','Fortalecimento e postura com acompanhamento.','R$ 90'],
         ['Fisio Esportiva','Recuperação e prevenção para quem treina.','R$ 140']],
    ftitle:'Tratamento que faz sentido', fdesc:'Avaliamos a causa, não só o sintoma. Um plano progressivo com metas claras até você voltar 100%.',
    pts:[['+8 mil','atendimentos'],['4,9★','avaliação'],['1:1','atendimento individual'],['100%','plano personalizado']],
    quote:['"Em 6 semanas voltei a correr sem dor. Profissionais excelentes."','Marcelo, paciente'] },

  { slug:'06-nutricao', cat:'Saúde', font:'editorial', t:{accent:'#4b8b3b',accent2:'#6aa84f',bg:'#f4f1e9',soft:'#eaf0e2'},
    brand:'Nutre', kicker:'Nutrição & Bem-estar', h1:'Comer bem pode ser simples, gostoso e do seu jeito.',
    sub:'Planos alimentares sem dietas malucas, feitos pra sua rotina e seus objetivos. Saúde que cabe na vida real.',
    hero:'nutricao-1.jpg', feat:'nutricao-2.jpg',
    svc:[['Emagrecimento','Plano sustentável, sem sofrimento e sem efeito sanfona.','R$ 200'],
         ['Nutrição Esportiva','Performance e composição corporal para quem treina.','R$ 250'],
         ['Reeducação Alimentar','Aprenda a comer bem pra vida toda.','R$ 180']],
    ftitle:'Sem dieta de revista', fdesc:'Nada de cardápio impossível. Construímos juntos uma alimentação que você consegue manter — e que dá resultado.',
    pts:[['+5 mil','pacientes'],['4,9★','no Google'],['0','dietas restritivas'],['100%','plano sob medida']],
    quote:['"Perdi 12kg comendo comida de verdade. Mudou minha relação com a comida."','Aline, paciente'] },

  { slug:'07-psicologia', cat:'Saúde', font:'editorial', t:{accent:'#6b6f9e',accent2:'#8a8ec0',bg:'#f3f1ee',soft:'#eceaf2'},
    brand:'Acolher', kicker:'Psicologia & Terapia', h1:'Um espaço seguro para você se reencontrar.',
    sub:'Terapia individual, online ou presencial, com escuta acolhedora e sem julgamentos. Cuidar da mente é um ato de coragem.',
    hero:'psicologia-1.jpg', feat:'psicologia-2.jpg',
    svc:[['Terapia Individual','Acompanhamento para ansiedade, autoconhecimento e mais.','R$ 150'],
         ['Terapia Online','A mesma qualidade, no conforto da sua casa.','R$ 130'],
         ['Terapia de Casal','Reconstruir o diálogo e fortalecer a relação.','R$ 220']],
    ftitle:'Você não precisa dar conta sozinho', fdesc:'Aqui o tempo é seu. Um ambiente reservado, sigiloso e acolhedor para você falar — e ser ouvido de verdade.',
    pts:[['+10 anos','de experiência'],['100%','sigiloso'],['online','ou presencial'],['1ª','conversa sem compromisso']],
    quote:['"Encontrei um espaço onde finalmente pude respirar. Recomendo demais."','Paciente (sigiloso)'] },

  { slug:'08-automotiva', cat:'Serviços', font:'bold', t:{dark:true,accent:'#e23b2e',accent2:'#ff5a3c',bg:'#0f0e0d',panel:'#1a1817'},
    brand:'Apex Detail', kicker:'Estética Automotiva', h1:'Seu carro com brilho de showroom.',
    sub:'Polimento, vitrificação, higienização e película. Tratamento premium pra quem ama o próprio carro.',
    hero:'automotiva-1.jpg', feat:'automotiva-2.jpg',
    svc:[['Vitrificação','Proteção e brilho que duram anos.','R$ 1.200'],
         ['Polimento Técnico','Remove riscos e devolve o espelhamento.','R$ 600'],
         ['Higienização Interna','Interior impecável, como saiu da concessionária.','R$ 350']],
    ftitle:'Trabalho de verdade, não lavajato', fdesc:'Produtos premium, técnica de detalhamento e cuidado obsessivo com cada detalhe. Seu carro merece.',
    pts:[['+3 mil','carros tratados'],['5★','avaliação'],['2 anos','de garantia'],['100%','produtos premium']],
    quote:['"Parecia carro zero de novo. Serviço impecável, recomendo de olhos fechados."','Bruno, cliente'] },

  { slug:'09-reforma', cat:'Serviços', font:'bold', t:{dark:true,accent:'#e0922f',accent2:'#ffb454',bg:'#13110e',panel:'#1d1a15'},
    brand:'Construrte', kicker:'Reformas & Construção', h1:'Sua reforma sem dor de cabeça, do projeto à chave.',
    sub:'Reformas residenciais e comerciais com prazo cumprido, orçamento transparente e acabamento de primeira.',
    hero:'reforma-1.jpg', feat:'reforma-2.jpg',
    svc:[['Reforma Completa','Projeto, execução e entrega no prazo combinado.','orçamento'],
         ['Pequenos Reparos','Da pintura ao acabamento, resolvido sem enrolação.','a partir R$ 300'],
         ['Drywall & Gesso','Forros, divisórias e sancas com acabamento fino.','orçamento']],
    ftitle:'Prazo cumprido é regra', fdesc:'Você acompanha cada etapa com cronograma claro. Sem surpresa no orçamento, sem obra que não acaba.',
    pts:[['+400','obras entregues'],['4,8★','avaliação'],['no prazo','sempre'],['garantia','de serviço']],
    quote:['"Cumpriram o prazo e o orçamento à risca. Raro hoje em dia."','Patrícia, cliente'] },

  { slug:'10-climatizacao', cat:'Serviços', font:'clinic', t:{accent:'#1b6fb3',accent2:'#3a93d6',soft:'#e3eef7'},
    brand:'FrioMax', kicker:'Climatização & Ar-condicionado', h1:'Instalação e manutenção de ar que você pode confiar.',
    sub:'Instalação, limpeza e manutenção de ar-condicionado com técnicos certificados e atendimento rápido.',
    hero:'climatizacao-1.jpg', feat:'climatizacao-2.jpg',
    svc:[['Instalação','Split residencial e comercial com garantia.','a partir R$ 350'],
         ['Limpeza & Higienização','Ar limpo, saudável e mais econômico.','R$ 150'],
         ['Manutenção (PMOC)','Contrato para empresas e condomínios.','orçamento']],
    ftitle:'Atendimento rápido de verdade', fdesc:'Equipe certificada, peças originais e resposta no mesmo dia. Seu conforto não pode esperar.',
    pts:[['+6 mil','serviços'],['4,9★','avaliação'],['mesmo dia','atendimento'],['garantia','em tudo']],
    quote:['"Instalaram no mesmo dia que liguei. Profissionais e pontuais."','Eduardo, cliente'] },

  { slug:'11-advogado', cat:'Profissionais', font:'luxe', t:{dark:true,accent:'#c2a35a',accent2:'#dcc084',bg:'#0e0f12',panel:'#16181d'},
    brand:'Drummond Advocacia', kicker:'Advocacia & Consultoria', h1:'Seus direitos defendidos com seriedade e estratégia.',
    sub:'Atuação em direito trabalhista, previdenciário e civil. Atendimento próximo, linguagem clara e compromisso com o seu caso.',
    hero:'advogado-1.jpg', feat:'advogado-2.jpg',
    svc:[['Direito Trabalhista','Rescisões, verbas e defesa dos seus direitos.','1ª consulta'],
         ['Previdenciário','Aposentadorias, benefícios e revisões do INSS.','1ª consulta'],
         ['Direito Civil','Contratos, família e resolução de conflitos.','1ª consulta']],
    ftitle:'Advocacia que fala a sua língua', fdesc:'Nada de juridiquês. Explicamos cada passo do seu caso com transparência e te mantemos informado do início ao fim.',
    pts:[['+15 anos','de atuação'],['+2 mil','casos'],['OAB','regular'],['1ª','consulta avaliativa']],
    quote:['"Ganhei minha causa e fui tratado com respeito o tempo todo. Excelentes."','José, cliente'] },

  { slug:'12-arquiteto', cat:'Profissionais', font:'editorial', t:{accent:'#1f1f1f',accent2:'#9a7b54',bg:'#f4f2ee',ink:'#1c1b19',soft:'#eceae4'},
    brand:'Estúdio Linha', kicker:'Arquitetura & Interiores', h1:'Espaços que contam a sua história.',
    sub:'Projetos de arquitetura e interiores sob medida — funcionais, atemporais e com a sua identidade em cada detalhe.',
    hero:'arquiteto-1.jpg', feat:'arquiteto-2.jpg',
    svc:[['Projeto de Interiores','Ambientes funcionais e com personalidade.','orçamento'],
         ['Projeto Arquitetônico','Da planta à execução, com acompanhamento.','orçamento'],
         ['Consultoria Express','Direcionamento rápido pro seu espaço.','R$ 490']],
    ftitle:'Design com propósito', fdesc:'Cada projeto começa ouvindo você. Unimos estética e funcionalidade para criar espaços que fazem sentido pra sua vida.',
    pts:[['+150','projetos'],['premiado','design'],['sob medida','sempre'],['3D','você vê antes']],
    quote:['"Transformaram nosso apê em algo que parece revista. Amamos cada canto."','Família Souza'] },

  { slug:'13-fotografia', cat:'Eventos', font:'luxe', t:{dark:true,accent:'#cfae74',accent2:'#e6cd9c',bg:'#100f0d',panel:'#1a1815'},
    brand:'Lentes & Luz', kicker:'Fotografia Profissional', h1:'Momentos que merecem ser eternizados.',
    sub:'Casamentos, ensaios e eventos com olhar autoral e entrega impecável. Suas memórias em imagens que emocionam.',
    hero:'fotografia-1.jpg', feat:'fotografia-2.jpg',
    svc:[['Casamentos','Cobertura completa do seu grande dia.','a partir R$ 2.500'],
         ['Ensaios','Gestante, família, casal e individual.','a partir R$ 450'],
         ['Eventos & Corporativo','Aniversários, formaturas e empresas.','orçamento']],
    ftitle:'Mais que fotos, sentimentos', fdesc:'Um olhar que captura o que é real. Você relembra cada emoção ao ver as imagens — e elas duram pra sempre.',
    pts:[['+500','eventos'],['5★','avaliação'],['entrega','garantida'],['álbum','premium']],
    quote:['"As fotos do nosso casamento são um sonho. Choramos ao ver. Perfeito!"','Camila & Léo'] },
];

function waSvg(){return '<svg viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.99-1.045zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>';}

function render(s){
  const f=FONTS[s.font]; const c=theme(s.t); const dark=!!s.t.dark;
  const wa='https://wa.me/5561994081617?text='+encodeURIComponent('Olá! Vi o site da '+s.brand+' e quero saber mais.');
  const svc=s.svc.map((x,i)=>`<div class="card"><div class="ic">${String(i+1).padStart(2,'0')}</div><h3>${x[0]}</h3><p>${x[1]}</p><div class="price">${x[2]}</div></div>`).join('');
  const pts=s.pts.map(p=>`<div class="stat"><div class="n">${p[0]}</div><div class="t">${p[1]}</div></div>`).join('');
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${s.brand} · ${s.kicker}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${f.disp}&family=${f.body}&display=swap" rel="stylesheet">
<style>
:root{--bg:${c.bg};--panel:${c.panel};--ink:${c.ink};--muted:${c.muted};--line:${c.line};--ac:${c.accent};--ac2:${c.accent2};--soft:${c.soft}}
*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:${f.bodyFam};font-weight:${dark?300:400};line-height:1.65;overflow-x:hidden}
h1,h2,h3,.disp{font-family:${f.dispFam};font-weight:${f.dispW};letter-spacing:-.01em;line-height:1.08}
img{display:block;max-width:100%}a{color:inherit;text-decoration:none}
.wrap{max-width:1140px;margin:0 auto;padding:0 24px}
.eyebrow{font-size:.72rem;letter-spacing:.26em;text-transform:uppercase;color:var(--ac);font-weight:600}
.btn{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:.9rem;padding:13px 26px;border-radius:${dark?'3px':'40px'};transition:.3s;letter-spacing:.02em}
.btn-p{background:var(--ac);color:${dark?'#0d0d0d':'#fff'}}.btn-p:hover{background:var(--ac2);transform:translateY(-2px)}
.btn-o{border:1.5px solid var(--ac);color:var(--ac)}.btn-o:hover{background:var(--ac);color:${dark?'#0d0d0d':'#fff'}}
header{position:fixed;inset:0 0 auto 0;z-index:50;background:${dark?'rgba(18,17,16,.82)':'rgba(246,245,241,.85)'};backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
nav{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;max-width:1140px;margin:0 auto}
.brand{font-family:${f.dispFam};font-weight:${f.dispW};font-size:1.4rem}.brand b{color:var(--ac)}
.navlinks{display:flex;gap:28px;font-size:.88rem;font-weight:500}.navlinks a{color:var(--muted);transition:.2s}.navlinks a:hover{color:var(--ac)}
@media(max-width:840px){.navlinks{display:none}}
.hero{padding:140px 0 80px;position:relative}
.hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:48px;align-items:center}
.hero h1{font-size:clamp(2.4rem,5.4vw,4.2rem);margin:20px 0 22px}
.hero p.lead{font-size:1.1rem;color:var(--muted);max-width:460px;margin-bottom:30px}
.hero-cta{display:flex;gap:14px;flex-wrap:wrap}
.hero-art{position:relative}.hero-art .main{border-radius:20px;overflow:hidden;aspect-ratio:4/5;box-shadow:0 30px 70px rgba(0,0,0,${dark?'.5':'.16'})}
.hero-art .main img{width:100%;height:100%;object-fit:cover}
.hero-art .badge{position:absolute;left:-22px;bottom:38px;background:var(--panel);border:1px solid var(--line);padding:16px 20px;border-radius:14px;box-shadow:0 16px 40px rgba(0,0,0,${dark?'.5':'.14'})}
.hero-art .badge .n{font-family:${f.dispFam};font-size:1.7rem;color:var(--ac);line-height:1}.hero-art .badge .t{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-top:6px}
@media(max-width:840px){.hero-grid{grid-template-columns:1fr;gap:40px}.hero-art{max-width:420px;margin:0 auto}}
.strip{background:var(--ac);color:${dark?'#0d0d0d':'#fff'};padding:16px 0}
.strip .wrap{display:flex;justify-content:center;gap:40px;flex-wrap:wrap;font-size:.85rem;font-weight:600;letter-spacing:.03em}
.strip span:before{content:"✓ ";opacity:.7}
section.pad{padding:96px 0}
.sechead{max-width:600px;margin:0 auto 54px;text-align:center}.sechead h2{font-size:clamp(2rem,4.2vw,2.9rem);margin-top:12px}
.svc{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:32px 28px;transition:.35s}
.card:hover{transform:translateY(-6px);border-color:var(--ac);box-shadow:0 26px 54px rgba(0,0,0,${dark?'.45':'.1'})}
.card .ic{font-family:${f.dispFam};font-size:1.1rem;color:var(--ac);width:50px;height:50px;border:1px solid var(--line);border-radius:${dark?'12px':'50%'};display:grid;place-items:center;margin-bottom:20px}
.card h3{font-size:1.3rem;margin-bottom:8px}.card p{color:var(--muted);font-size:.95rem}.card .price{margin-top:18px;font-family:${f.dispFam};color:var(--ac2);font-size:1.05rem}
@media(max-width:840px){.svc{grid-template-columns:1fr}}
.about{background:var(--panel);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.about .wrap{display:grid;grid-template-columns:1fr 1fr;gap:54px;align-items:center;padding:90px 24px}
.about .imgwrap{border-radius:18px;overflow:hidden;aspect-ratio:1/1}.about img{width:100%;height:100%;object-fit:cover}
.about h2{font-size:clamp(1.9rem,4vw,2.7rem);margin:14px 0 16px}.about p{color:var(--muted)}
.about ul{list-style:none;margin-top:22px}.about li{display:flex;gap:13px;padding:11px 0;color:var(--muted)}
.about .ck{flex:0 0 22px;height:22px;border-radius:50%;background:var(--ac);color:${dark?'#0d0d0d':'#fff'};display:grid;place-items:center;font-size:.72rem;margin-top:3px}
@media(max-width:840px){.about .wrap{grid-template-columns:1fr;gap:34px}}
.stats{background:var(--soft)}.stats .wrap{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding:60px 24px;text-align:center}
.stat .n{font-family:${f.dispFam};font-size:clamp(2rem,4.4vw,3rem);color:var(--ac);line-height:1}.stat .t{font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-top:8px}
@media(max-width:680px){.stats .wrap{grid-template-columns:1fr 1fr;gap:34px 14px}}
.quote{text-align:center;max-width:820px;margin:0 auto}.quote p{font-family:${f.dispFam};${s.font==='clinic'||s.font==='bold'?'':'font-style:italic;'}font-size:clamp(1.4rem,3.2vw,2.2rem);line-height:1.4}
.quote .who{margin-top:22px;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:var(--ac)}
.cta{text-align:center;padding:110px 0;background:radial-gradient(90% 120% at 50% 0%,var(--soft),var(--bg))}
.cta h2{font-size:clamp(2.2rem,5vw,3.4rem);margin-bottom:16px}.cta p{color:var(--muted);max-width:460px;margin:0 auto 32px}
footer{background:var(--panel);border-top:1px solid var(--line);padding:60px 0 34px}
.foot{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:36px}footer p,footer a{color:var(--muted);font-size:.92rem}
footer h4{font-family:${f.dispFam};font-size:1rem;margin-bottom:13px;color:var(--ink)}footer .col a{display:block;margin-bottom:9px;transition:.2s}footer .col a:hover{color:var(--ac)}
.copy{margin-top:40px;padding-top:22px;border-top:1px solid var(--line);text-align:center;font-size:.82rem;color:var(--muted)}
@media(max-width:840px){.foot{grid-template-columns:1fr;gap:24px}}
.wa{position:fixed;right:22px;bottom:22px;z-index:60;width:58px;height:58px;border-radius:50%;background:#25d366;display:grid;place-items:center;box-shadow:0 10px 30px rgba(37,211,102,.4);transition:.3s}.wa:hover{transform:scale(1.08)}.wa svg{width:30px;height:30px;fill:#fff}
.mobile-stickybar{display:none}
@media(max-width:820px){
  .wa{display:none}
  .mobile-stickybar{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:70;background:#25d366;color:#fff;text-align:center;justify-content:center;align-items:center;gap:8px;padding:14px 16px calc(14px + env(safe-area-inset-bottom));font-weight:700;font-size:.95rem;letter-spacing:.01em;box-shadow:0 -6px 20px rgba(0,0,0,.18)}
  .mobile-stickybar svg{width:20px;height:20px;fill:#fff;flex:0 0 auto}
  body{padding-bottom:64px}
}
@keyframes rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.hero-copy>*{opacity:0;animation:rise .9s forwards}.hero-copy>*:nth-child(1){animation-delay:.05s}.hero-copy>*:nth-child(2){animation-delay:.2s}.hero-copy>*:nth-child(3){animation-delay:.35s}.hero-copy>*:nth-child(4){animation-delay:.5s}
</style></head><body>
<header><nav><div class="brand">${s.brand.split(' ')[0]}<b>${s.brand.includes(' ')?'':'.'}</b></div>
<div class="navlinks"><a href="#servicos">Serviços</a><a href="#sobre">Sobre</a><a href="#resultados">Resultados</a><a href="#contato">Contato</a></div>
<a href="#contato" class="btn btn-p">Agendar agora</a></nav></header>
<section class="hero"><div class="wrap hero-grid">
<div class="hero-copy"><div class="eyebrow">${s.kicker}</div><h1>${s.h1}</h1><p class="lead">${s.sub}</p>
<div class="hero-cta"><a href="${wa}" class="btn btn-p">Falar no WhatsApp</a><a href="#servicos" class="btn btn-o">Ver serviços</a></div></div>
<div class="hero-art"><div class="main"><img src="./assets/${s.hero}" alt="${s.brand}"></div>
<div class="badge"><div class="n">${s.pts[1][0]}</div><div class="t">${s.pts[1][1]}</div></div></div>
</div></section>
<div class="strip"><div class="wrap"><span>Atendimento rápido</span><span>Profissionais de confiança</span><span>Avaliação sem compromisso</span></div></div>
<section class="pad" id="servicos"><div class="wrap"><div class="sechead"><div class="eyebrow">O que oferecemos</div><h2>Nossos serviços</h2></div><div class="svc">${svc}</div></div></section>
<section class="about" id="sobre"><div class="wrap"><div class="imgwrap"><img src="./assets/${s.feat}" alt="${s.brand}"></div>
<div><div class="eyebrow">Por que escolher</div><h2>${s.ftitle}</h2><p>${s.fdesc}</p>
<ul><li><span class="ck">✓</span><span>Atendimento próximo e humano do início ao fim</span></li>
<li><span class="ck">✓</span><span>Transparência total em preço e prazo</span></li>
<li><span class="ck">✓</span><span>Resultado de verdade, sem enrolação</span></li></ul>
<a href="${wa}" class="btn btn-p" style="margin-top:26px">Quero saber mais</a></div></div></section>
<div class="stats" id="resultados"><div class="wrap">${pts}</div></div>
<section class="pad"><div class="wrap quote"><p>${s.quote[0]}</p><div class="who">${s.quote[1]}</div></div></section>
<section class="cta" id="contato"><div class="wrap"><div class="eyebrow">Vamos começar</div><h2>Fale com a gente agora</h2><p>Chame no WhatsApp e tire suas dúvidas. Atendimento rápido e sem compromisso.</p><a href="${wa}" class="btn btn-p">Falar no WhatsApp</a></div></section>
<footer><div class="wrap"><div class="foot"><div><div class="brand">${s.brand.split(' ')[0]}<b>${s.brand.includes(' ')?'':'.'}</b></div><p style="margin-top:13px">${s.kicker}. ${s.ftitle}.</p></div>
<div class="col"><h4>Serviços</h4>${s.svc.map(x=>`<a href="#servicos">${x[0]}</a>`).join('')}</div>
<div class="col"><h4>Contato</h4><a href="${wa}">WhatsApp</a><a href="#">(00) 90000-0000</a><a href="#">Atendimento Seg a Sáb</a></div></div>
<div class="copy">© 2026 ${s.brand} · Site exemplo</div></div></footer>
<a class="wa" href="${wa}" aria-label="WhatsApp">${waSvg()}</a>
<a class="mobile-stickybar" href="${wa}" aria-label="Falar no WhatsApp">${waSvg()}Falar no WhatsApp agora</a>
</body></html>`;
}

for(const s of SITES){ fs.writeFileSync(path.join(OUT,s.slug+'.html'), render(s)); console.log('gerado',s.slug); }
console.log('DONE', SITES.length,'sites');
