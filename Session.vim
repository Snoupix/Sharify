let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd /home/snoupix/work/sharify
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
let s:shortmess_save = &shortmess
if &shortmess =~ 'A'
  set shortmess=aoOA
else
  set shortmess=aoO
endif
badd +16 src/routes/+page.svelte
badd +5 src/components/logo.svelte
badd +3 TODO.md
badd +172 src/style.css
badd +76 src/routes/+layout.svelte
badd +18 src/components/ui/button/button.svelte
badd +137 remix/app/styles/tailwind.css
badd +7 .env
badd +5 src/components/button.svelte
badd +1 src/app.html
badd +78 remix_clone/app/routes/index.tsx
badd +23 tailwind.config.js
badd +132 remix_clone/app/styles/tailwind.css
badd +54 src/components/navbar.svelte
badd +250 remix_clone/app/routes/host.tsx
badd +2 src/lib/ws_store.ts
badd +73 src/routes/host/+page.svelte
badd +20 src/components/ui/input/input.svelte
badd +37 README.md
badd +1 .ignore
badd +51 src/lib/spotify.ts
badd +30 src/lib/utils.ts
badd +5 src/routes/auth_spotify/+page.svelte
badd +113 remix_clone/app/routes/auth_spotify.tsx
badd +7 src/routes/+error.svelte
badd +1 src/lib/queries.ts
badd +62 src/routes/room/\[slug]/\[slug]/+page.svelte
badd +198 remix_clone/app/routes/room.\$roomID.tsx
badd +1 src/lib/types.ts
badd +27 src/routes/room/\[slug]/\[slug]/+page.server.ts
badd +1 src/lib/server/apollo_client.ts
badd +48 package.json
badd +32 src/routes/join/\[slug]/\[slug]/+page.server.ts
badd +60 src/routes/join/\[slug]/\[slug]/+page.svelte
badd +0 /home/snoupix/work/snapi/schema.graphql
argglobal
%argdel
set stal=2
tabnew +setlocal\ bufhidden=wipe
tabnew +setlocal\ bufhidden=wipe
tabnew +setlocal\ bufhidden=wipe
tabrewind
edit TODO.md
argglobal
balt src/routes/room/\[slug]/\[slug]/+page.svelte
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
let s:l = 37 - ((35 * winheight(0) + 27) / 54)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 37
normal! 0
lcd /home/snoupix/work/sharify
tabnext
edit /home/snoupix/work/sharify/src/routes/join/\[slug]/\[slug]/+page.svelte
argglobal
balt /home/snoupix/work/sharify/src/routes/room/\[slug]/\[slug]/+page.svelte
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
let s:l = 60 - ((26 * winheight(0) + 27) / 54)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 60
normal! 024|
lcd /home/snoupix/work/sharify
tabnext
edit /home/snoupix/work/sharify/remix_clone/app/routes/room.\$roomID.tsx
argglobal
balt /home/snoupix/work/sharify/remix_clone/app/routes/auth_spotify.tsx
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
let s:l = 198 - ((26 * winheight(0) + 27) / 54)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 198
normal! 0
lcd /home/snoupix/work/sharify
tabnext
edit /home/snoupix/work/snapi/schema.graphql
argglobal
balt /home/snoupix/work/sharify/remix_clone/app/routes/room.\$roomID.tsx
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
let s:l = 1 - ((0 * winheight(0) + 27) / 54)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 1
normal! 0
lcd /home/snoupix/work/sharify
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
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
