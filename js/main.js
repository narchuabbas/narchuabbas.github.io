/* Ocean Architects — nav, carousel, projects render, lightbox, contact form */
(function () {
  "use strict";

  /* ---- helpers ---- */
  function encPath(dir, file) {
    var f = encodeURIComponent(file);
    if (!dir) return f;
    var d = dir.split("/").map(encodeURIComponent).join("/");
    return d + "/" + f;
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function frame(src, alt, extraClass) {
    var wrap = el("div", "img-frame" + (extraClass ? " " + extraClass : ""));
    var ph = el("div", "ph", "<small>" + alt + "</small>");
    var img = document.createElement("img");
    img.src = src; img.alt = alt; img.loading = "lazy";
    img.onerror = function () { this.style.display = "none"; };
    wrap.appendChild(ph); wrap.appendChild(img);
    return wrap;
  }

  document.addEventListener("DOMContentLoaded", function () {

    /* ---- Mobile nav toggle ---- */
    var toggle = document.querySelector(".nav__toggle");
    var links = document.querySelector(".nav__links");
    if (toggle && links) {
      toggle.addEventListener("click", function () { links.classList.toggle("open"); });
    }

    var PROJECTS = window.OA_PROJECTS || [];

    /* collect all lightbox images in document order */
    var galleryImgs = [];
    function registerLightbox(src, caption) {
      var idx = galleryImgs.length;
      galleryImgs.push({ src: src, caption: caption });
      return idx;
    }

    /* ---- Home carousel ---- */
    var track = document.getElementById("carousel-track");
    if (track) {
      PROJECTS.forEach(function (p) {
        var slide = el("div", "slide");
        var card = el("article", "project-card");
        var cover = encPath(p.dir, p.images[0]);
        var imgFrame = frame(cover, p.title);
        var body = el("div", "project-card__body");
        body.innerHTML =
          '<span class="eyebrow">' + p.category + '</span>' +
          '<h3>' + p.title + '</h3>' +
          '<p style="color:var(--muted);">' + p.blurb + '</p>' +
          '<a href="projects.html#' + p.slug + '" class="btn btn--red" style="margin-top:18px; align-self:flex-start;">View details</a>';
        card.appendChild(imgFrame);
        card.appendChild(body);
        slide.appendChild(card);
        track.appendChild(slide);
      });
      initCarousel();
    }

    /* ---- Projects page ---- */
    var list = document.getElementById("projects-list");
    if (list) {
      PROJECTS.forEach(function (p) {
        var section = el("section", "proj-section");
        section.id = p.slug;

        var top = el("div", "proj-top");
        var cover = encPath(p.dir, p.images[0]);
        var coverFrame = frame(cover, p.title);
        coverFrame.dataset.lb = registerLightbox(cover, p.title);

        var body = el("div", "body");
        body.innerHTML =
          '<span class="eyebrow">' + p.category + '</span>' +
          '<h3>' + p.title + '</h3>' +
          '<p style="color:var(--muted);">' + p.blurb + '</p>' +
          '<ul class="proj-spec">' +
            '<li><span>Category</span><span>' + p.category + '</span></li>' +
            (p.length && p.length !== "—" ? '<li><span>Length</span><span>' + p.length + '</span></li>' : '') +
            '<li><span>Images</span><span>' + p.images.length + '</span></li>' +
          '</ul>';
        top.appendChild(coverFrame);
        top.appendChild(body);
        section.appendChild(top);

        /* gallery of remaining images */
        if (p.images.length > 1) {
          var gal = el("div", "proj-gallery");
          p.images.slice(1).forEach(function (fname) {
            var src = encPath(p.dir, fname);
            var f = frame(src, p.title);
            f.dataset.lb = registerLightbox(src, p.title);
            gal.appendChild(f);
          });
          section.appendChild(gal);
        }

        /* optional video */
        if (p.video) {
          var vwrap = el("div", "proj-video");
          var v = document.createElement("video");
          v.src = encPath(p.dir, p.video);
          v.controls = true; v.preload = "metadata";
          vwrap.appendChild(v);
          section.appendChild(vwrap);
        }

        list.appendChild(section);
      });

      initLightbox();

      /* jump to anchor after render */
      if (location.hash) {
        var target = document.getElementById(location.hash.slice(1));
        if (target) setTimeout(function () { target.scrollIntoView({ behavior: "smooth" }); }, 60);
      }
    }

    /* ---- Contact form: sends straight to aon@oceanarchs.com via FormSubmit ---- */
    var FORM_ENDPOINT = "https://formsubmit.co/ajax/aon@oceanarchs.com";
    var form = document.getElementById("contact-form");
    if (form) {
      var statusEl = form.querySelector(".form-status");
      var btn = form.querySelector("button[type=submit]");
      function setStatus(msg, kind) {
        statusEl.innerHTML = msg;
        statusEl.className = "form-status" + (kind ? " form-status--" + kind : "");
      }
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = (form.elements["name"].value || "").trim();
        var email = (form.elements["email"].value || "").trim();
        var message = (form.elements["message"].value || "").trim();
        if (form.elements["_honey"].value) return;            /* bot */
        if (!name || !email || !message) { setStatus("Please fill in your name, email and message.", "error"); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus("Please enter a valid email address.", "error"); return; }

        btn.disabled = true; btn.textContent = "Sending...";
        setStatus("", "");
        fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            name: name, email: email, message: message,
            _subject: "Website enquiry from " + name,
            _replyto: email,
            _template: "table"
          })
        })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && String(d.success) === "true") {
            form.reset();
            setStatus("Thank you, " + name.replace(/[<>&]/g, "") + ". Your message has been sent and we will get back to you shortly.", "ok");
          } else { throw new Error(d && d.message); }
        })
        .catch(function () {
          setStatus('Sorry, the message could not be sent. Please email us directly at <a href="mailto:aon@oceanarchs.com">aon@oceanarchs.com</a>.', "error");
        })
        .then(function () { btn.disabled = false; btn.textContent = "Send Message"; });
      });
    }

    /* ================= Carousel behaviour ================= */
    function initCarousel() {
      var carousel = document.querySelector(".carousel");
      if (!carousel) return;
      var tr = carousel.querySelector(".carousel__track");
      var slides = Array.prototype.slice.call(tr.querySelectorAll(".slide"));
      var prev = carousel.querySelector(".carousel__btn--prev");
      var next = carousel.querySelector(".carousel__btn--next");
      var dotsWrap = carousel.querySelector(".carousel__dots");

      slides.forEach(function (s, i) {
        var b = document.createElement("button");
        b.setAttribute("aria-label", "Go to project " + (i + 1));
        b.addEventListener("click", function () { scrollToSlide(i); });
        dotsWrap.appendChild(b);
      });
      var dots = Array.prototype.slice.call(dotsWrap.children);

      function scrollToSlide(i) {
        var s = slides[i];
        if (s) tr.scrollTo({ left: s.offsetLeft - tr.offsetLeft, behavior: "smooth" });
      }
      function current() {
        var center = tr.scrollLeft + tr.clientWidth / 2, best = 0, bd = Infinity;
        slides.forEach(function (s, i) {
          var mid = s.offsetLeft - tr.offsetLeft + s.clientWidth / 2;
          var d = Math.abs(mid - center);
          if (d < bd) { bd = d; best = i; }
        });
        return best;
      }
      function updateDots() {
        var c = current();
        dots.forEach(function (d, i) { d.classList.toggle("active", i === c); });
      }
      if (next) next.addEventListener("click", function () { scrollToSlide(Math.min(current() + 1, slides.length - 1)); });
      if (prev) prev.addEventListener("click", function () { scrollToSlide(Math.max(current() - 1, 0)); });
      tr.addEventListener("scroll", function () { window.requestAnimationFrame(updateDots); });
      updateDots();
    }

    /* ================= Lightbox ================= */
    function initLightbox() {
      var box = el("div", "lightbox");
      box.innerHTML =
        '<button class="lightbox__close" aria-label="Close">&times;</button>' +
        '<button class="lightbox__nav lightbox__nav--prev" aria-label="Previous">&#8249;</button>' +
        '<img alt="">' +
        '<button class="lightbox__nav lightbox__nav--next" aria-label="Next">&#8250;</button>';
      document.body.appendChild(box);
      var lbImg = box.querySelector("img");
      var cur = 0;

      function show(i) {
        if (i < 0) i = galleryImgs.length - 1;
        if (i >= galleryImgs.length) i = 0;
        cur = i;
        lbImg.src = galleryImgs[i].src;
        lbImg.alt = galleryImgs[i].caption || "";
      }
      function open(i) { show(i); box.classList.add("open"); }
      function close() { box.classList.remove("open"); lbImg.src = ""; }

      document.addEventListener("click", function (e) {
        var f = e.target.closest("[data-lb]");
        if (f) { open(parseInt(f.dataset.lb, 10)); }
      });
      box.querySelector(".lightbox__close").addEventListener("click", close);
      box.querySelector(".lightbox__nav--prev").addEventListener("click", function () { show(cur - 1); });
      box.querySelector(".lightbox__nav--next").addEventListener("click", function () { show(cur + 1); });
      box.addEventListener("click", function (e) { if (e.target === box) close(); });
      document.addEventListener("keydown", function (e) {
        if (!box.classList.contains("open")) return;
        if (e.key === "Escape") close();
        else if (e.key === "ArrowLeft") show(cur - 1);
        else if (e.key === "ArrowRight") show(cur + 1);
      });
    }

  });
})();
