import{w as a,q as i,p as s,M as c,L as l,S as p,t as d,O as h,i as u}from"./chunk-UIGDSWPH-DaYfYYzD.js";import{A as m}from"./auth-context-Dsnqgpzm.js";const j=()=>[{rel:"preconnect",href:"https://fonts.googleapis.com"},{rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"anonymous"},{rel:"stylesheet",href:"https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"}];function g({children:e}){return s.jsxs("html",{lang:"en",children:[s.jsxs("head",{children:[s.jsx("meta",{charSet:"utf-8"}),s.jsx("meta",{name:"viewport",content:"width=device-width, initial-scale=1"}),s.jsx(c,{}),s.jsx(l,{}),s.jsx("script",{dangerouslySetInnerHTML:{__html:`
              (function(l) {
                if (l.search[1] === '/' ) {
                  var decoded = l.search.slice(1).split('&').map(function(s) {
                    return s.replace(/~and~/g, '&')
                  }).join('?');
                  window.history.replaceState(null, null,
                      l.pathname.slice(0, -1) + decoded + l.hash
                  );
                }
              }(window.location))
            `}})]}),s.jsxs("body",{children:[e,s.jsx(p,{}),s.jsx(d,{})]})]})}const w=a(function(){return s.jsx(m,{children:s.jsx(h,{})})}),y=i(function({error:t}){let o="Oops!",n="An unexpected error occurred.",r;return u(t)&&(o=t.status===404?"404":"Error",n=t.status===404?"The requested page could not be found.":t.statusText||n),s.jsxs("main",{className:"pt-16 p-4 container mx-auto",children:[s.jsx("h1",{children:o}),s.jsx("p",{children:n}),r]})});export{y as ErrorBoundary,g as Layout,w as default,j as links};
