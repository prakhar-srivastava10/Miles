self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("v1").then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/about.html",
        "/addHabitType.html",
        "/congrats.html",
        "/createHabit.html",
        "/dashboard.html",
        "/editHabit.html",
        "/settings.html",
        "/signup.html",
        "/stat.html",
        "/login.html",
        "/css/styles.css",
        "/js/script.js",
        "/js/createHabit.js",
        "/js/dashboard.js",
        "/js/login.js",
        "/js/editHabit.js",
        "/js/settings.js",
        "/js/signup.js",
        "/js/theme.js",
        "/images/192.png",
        "/images/512.png",
        "/images/angry-tortoise.png",
        "/images/cheering-tortoise.png",
        "/images/happy-tortoise.png",
        "/images/miles1.png",
        "/images/sad-tortoise.png",
        "/images/signature.png",
        "/images/trophy.png",
        "/images/deleteicon.png",
        "/images/downArrow.png",
        "/images/miles-happy-tears-face.png",
        "/images/upArrow.png"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
