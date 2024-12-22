let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd ~/work/sharify
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
let s:shortmess_save = &shortmess
if &shortmess =~ 'A'
  set shortmess=aoOA
else
  set shortmess=aoO
endif
badd +9 src/components/logo.svelte
badd +34 TODO.md
badd +172 src/style.css
badd +112 src/routes/+layout.svelte
badd +2 .env
badd +19 src/components/button.svelte
badd +1 src/app.html
badd +78 remix_clone/app/routes/index.tsx
badd +19 tailwind.config.js
badd +132 remix_clone/app/styles/tailwind.css
badd +167 src/components/navbar.svelte
badd +1 remix_clone/app/routes/host.tsx
badd +29 src/lib/ws_store.ts
badd +85 src/routes/host/+page.svelte
badd +75 README.md
badd +1 .ignore
badd +6 src/lib/spotify.ts
badd +183 src/lib/utils.ts
badd +5 src/routes/auth_spotify/+page.svelte
badd +113 remix_clone/app/routes/auth_spotify.tsx
badd +7 src/routes/+error.svelte
badd +95 src/lib/queries.ts
badd +509 remix_clone/app/routes/room.\$roomID.tsx
badd +66 src/lib/types.ts
badd +6 src/lib/server/apollo_client.ts
badd +48 package.json
badd +12 src/routes/join/\[slug]/\[slug]/+page.server.ts
badd +10 src/routes/join/\[slug]/\[slug]/+page.svelte
badd +1 ~/work/snapi/schema.graphql
badd +18 src/routes/join/+page.svelte
badd +146 remix_clone/app/components/hostRoom.tsx
badd +9 src/components/card.svelte
badd +12 src/lib/auth.ts
badd +1 src/routes/signin/+page.server.ts
badd +1 src/routes/signout/+page.server.ts
badd +9 src/hooks.server.ts
badd +2 src/routes/+layout.server.ts
badd +38 src/routes/+page.svelte
badd +5 src/routes/auth/callback/\[slug]/+page.svelte
badd +19 .env.layout
badd +303 src/routes/room/\[slug]/+page.svelte
badd +3 src/routes/room/\[slug]/+page.server.ts
argglobal
%argdel
set stal=2
tabnew +setlocal\ bufhidden=wipe
tabnew +setlocal\ bufhidden=wipe
tabnew +setlocal\ bufhidden=wipe
tabrewind
edit TODO.md
argglobal
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let &fdl = &fdl
let s:l = 43 - ((32 * winheight(0) + 27) / 55)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 43
normal! 04|
lcd ~/work/sharify
tabnext
edit ~/work/sharify/src/components/navbar.svelte
argglobal
balt ~/work/sharify/src/lib/auth.ts
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let &fdl = &fdl
let s:l = 167 - ((27 * winheight(0) + 27) / 55)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 167
normal! 0
lcd ~/work/sharify
tabnext
edit ~/work/sharify/remix_clone/app/components/hostRoom.tsx
argglobal
balt ~/work/sharify/remix_clone/app/routes/room.\$roomID.tsx
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let &fdl = &fdl
let s:l = 227 - ((27 * winheight(0) + 27) / 55)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 227
normal! 034|
lcd ~/work/sharify
tabnext
edit ~/work/snapi/schema.graphql
argglobal
balt ~/work/sharify/remix_clone/app/routes/room.\$roomID.tsx
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let &fdl = &fdl
let s:l = 11 - ((10 * winheight(0) + 27) / 55)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 11
normal! 062|
lcd ~/work/sharify
tabnext 2
set stal=1
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0 && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20
let &shortmess = s:shortmess_save
let s:sx = expand("<sfile>:p:r")."x.vim"
if filereadable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &g:so = s:so_save | let &g:siso = s:siso_save
nohlsearch
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
