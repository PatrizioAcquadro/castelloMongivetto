(() => {
  document.documentElement.classList.add("js-ready");

  document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const page = body.dataset.page || "";

    initNavigation();
    setActiveNavLink();
    initRevealAnimations();
    initAnchorScroll();

    if (page === "gallery") {
      initGallery();
    }

    if (page === "contact") {
      initContactForm();
    }
  });

  function initNavigation() {
    const navToggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");
    const menu = document.getElementById("primary-navigation");

    if (!navToggle || !nav || !menu) {
      return;
    }

    const isMobileViewport = () => window.innerWidth <= 920;

    const setOpen = (isOpen) => {
      const canOpenDrawer = isMobileViewport();
      const nextOpen = canOpenDrawer ? isOpen : false;

      nav.classList.toggle("is-open", nextOpen);
      navToggle.setAttribute("aria-expanded", String(nextOpen));
      menu.setAttribute("aria-hidden", canOpenDrawer ? String(!nextOpen) : "false");
      document.body.classList.toggle("nav-open", nextOpen);
    };

    setOpen(false);

    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setOpen(!isOpen);
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("click", (event) => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      if (!isOpen) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (!nav.contains(target) && !navToggle.contains(target)) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      if (event.key === "Escape" && isOpen) {
        setOpen(false);
        navToggle.focus();
      }
    });

    window.addEventListener("resize", () => setOpen(false));
  }

  function setActiveNavLink() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    const currentPath = path.toLowerCase();

    document.querySelectorAll(".nav-links a").forEach((link) => {
      const href = (link.getAttribute("href") || "").split("#")[0].toLowerCase();
      const normalizedHref = href === "" ? "index.html" : href;
      const isActive = normalizedHref === currentPath;

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function initRevealAnimations() {
    const revealItems = document.querySelectorAll("[data-reveal]");
    if (!revealItems.length) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const target = entry.target;
          const delay = Number(target.getAttribute("data-reveal-delay") || "0");
          if (delay > 0) {
            target.style.transitionDelay = `${delay}ms`;
          }
          target.classList.add("is-visible");
          observer.unobserve(target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  function initAnchorScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    if (!anchors.length) {
      return;
    }

    anchors.forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const hash = anchor.getAttribute("href");
        if (!hash || hash.length < 2) {
          return;
        }

        const target = document.querySelector(hash);
        if (!target) {
          return;
        }

        event.preventDefault();
        const headerOffset = getHeaderOffset();
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top, behavior: "smooth" });
      });
    });
  }

  function getHeaderOffset() {
    const header = document.querySelector(".site-header");
    return header ? header.offsetHeight + 8 : 0;
  }

  function initGallery() {
    const filterButtons = Array.from(document.querySelectorAll(".filter-btn[data-filter]"));
    const galleryItems = Array.from(document.querySelectorAll(".gallery-item[data-category]"));
    const emptyMessage = document.querySelector(".gallery-empty");

    if (!galleryItems.length) {
      return;
    }

    let activeFilter = "all";

    const getVisibleItems = () =>
      galleryItems.filter((item) => !item.classList.contains("is-hidden"));

    const applyFilter = (filter) => {
      activeFilter = filter;

      let visibleCount = 0;
      galleryItems.forEach((item) => {
        const category = item.dataset.category;
        const isVisible = filter === "all" || category === filter;
        item.classList.toggle("is-hidden", !isVisible);
        item.setAttribute("aria-hidden", String(!isVisible));
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (emptyMessage) {
        emptyMessage.hidden = visibleCount !== 0;
      }

      filterButtons.forEach((button) => {
        const isActive = button.dataset.filter === activeFilter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const nextFilter = button.dataset.filter || "all";
        applyFilter(nextFilter);
      });
    });

    applyFilter("all");
    initLightbox(galleryItems, getVisibleItems);
  }

  function initLightbox(allItems, getVisibleItems) {
    const lightbox = document.querySelector(".lightbox");
    const closeBtn = document.querySelector(".lightbox__close");
    const prevBtn = document.querySelector(".lightbox__nav--prev");
    const nextBtn = document.querySelector(".lightbox__nav--next");
    const image = document.querySelector(".lightbox__media");
    const title = document.querySelector(".lightbox__title");
    const description = document.querySelector(".lightbox__description");

    if (!lightbox || !closeBtn || !prevBtn || !nextBtn || !image || !title || !description) {
      return;
    }

    let currentItems = [];
    let currentIndex = -1;
    let lastFocusedElement = null;

    const isOpen = () => lightbox.getAttribute("aria-hidden") === "false";

    const renderCurrent = () => {
      if (!currentItems.length || currentIndex < 0 || currentIndex >= currentItems.length) {
        return;
      }

      const item = currentItems[currentIndex];
      const img = item.querySelector("img");
      if (!img) {
        return;
      }

      image.src = img.src;
      image.alt = img.alt;
      title.textContent = item.dataset.title || "Immagine del Castello Mongivetto";
      description.textContent =
        item.dataset.description || "Dettaglio fotografico del Castello Mongivetto.";

      const hasMultiple = currentItems.length > 1;
      prevBtn.hidden = !hasMultiple;
      nextBtn.hidden = !hasMultiple;
    };

    const openLightbox = (item) => {
      currentItems = getVisibleItems();
      currentIndex = currentItems.indexOf(item);

      if (currentIndex < 0) {
        return;
      }

      lastFocusedElement = document.activeElement;
      renderCurrent();

      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      closeBtn.focus();
    };

    const closeLightbox = () => {
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      image.removeAttribute("src");

      if (lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus();
      }
    };

    const step = (direction) => {
      if (!currentItems.length) {
        return;
      }

      currentIndex = (currentIndex + direction + currentItems.length) % currentItems.length;
      renderCurrent();
    };

    allItems.forEach((item) => {
      item.addEventListener("click", () => openLightbox(item));
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(item);
        }
      });
    });

    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", () => step(-1));
    nextBtn.addEventListener("click", () => step(1));

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!isOpen()) {
        return;
      }

      if (event.key === "Escape") {
        closeLightbox();
      }
      if (event.key === "ArrowLeft") {
        step(-1);
      }
      if (event.key === "ArrowRight") {
        step(1);
      }
    });
  }

  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) {
      return;
    }

    const fields = {
      name: document.getElementById("name"),
      email: document.getElementById("email"),
      phone: document.getElementById("phone"),
      subject: document.getElementById("subject"),
      message: document.getElementById("message"),
      privacy: document.getElementById("privacy"),
    };

    const statusRoot = form.querySelector(".form-status");
    if (!statusRoot) {
      return;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearStatus(statusRoot);
      clearAllErrors(fields);

      let hasErrors = false;

      if (!fields.name || !fields.name.value.trim()) {
        setFieldError(fields.name, "Inserisci nome e cognome.");
        hasErrors = true;
      }

      if (!fields.email || !fields.email.value.trim()) {
        setFieldError(fields.email, "Inserisci un'email valida.");
        hasErrors = true;
      } else if (!isValidEmail(fields.email.value.trim())) {
        setFieldError(fields.email, "L'indirizzo email non è valido.");
        hasErrors = true;
      }

      if (!fields.subject || !fields.subject.value.trim()) {
        setFieldError(fields.subject, "Seleziona l'oggetto della richiesta.");
        hasErrors = true;
      }

      if (!fields.message || fields.message.value.trim().length < 10) {
        setFieldError(fields.message, "Inserisci un messaggio di almeno 10 caratteri.");
        hasErrors = true;
      }

      if (!fields.privacy || !fields.privacy.checked) {
        setFieldError(fields.privacy, "È necessario accettare il consenso privacy.");
        hasErrors = true;
      }

      if (hasErrors) {
        showAlert(statusRoot, "error", "Controlla i campi evidenziati e riprova.");
        return;
      }

      const selectedOption = fields.subject.options[fields.subject.selectedIndex];
      const subjectLabel = selectedOption ? selectedOption.textContent.trim() : "Richiesta";

      const payloadLines = [
        `Nome: ${fields.name.value.trim()}`,
        `Email: ${fields.email.value.trim()}`,
        `Telefono: ${fields.phone && fields.phone.value.trim() ? fields.phone.value.trim() : "Non indicato"}`,
        `Oggetto: ${subjectLabel}`,
        "",
        "Messaggio:",
        fields.message.value.trim(),
      ];

      const mailtoSubject = encodeURIComponent(
        `Richiesta ${subjectLabel} - ${fields.name.value.trim()}`
      );
      const mailtoBody = encodeURIComponent(payloadLines.join("\n"));
      const mailto = `mailto:info@castellomongivetto.com?subject=${mailtoSubject}&body=${mailtoBody}`;

      showAlert(statusRoot, "success", "Apertura del tuo client email in corso.");
      showAlert(
        statusRoot,
        "info",
        'Se non si apre automaticamente, scrivi a <a href="mailto:info@castellomongivetto.com">info@castellomongivetto.com</a>.'
      );

      window.location.href = mailto;
      form.reset();
    });
  }

  function clearAllErrors(fields) {
    Object.values(fields).forEach((field) => {
      if (!field) {
        return;
      }

      field.classList.remove("input-error");
      field.removeAttribute("aria-invalid");

      const errorId = `${field.id || field.name}-error`;
      const existing = document.getElementById(errorId);
      if (existing) {
        existing.remove();
      }

      if (field instanceof HTMLElement && field.hasAttribute("aria-describedby")) {
        const describedBy = field.getAttribute("aria-describedby") || "";
        const cleaned = describedBy
          .split(" ")
          .filter((id) => id && id !== errorId)
          .join(" ");

        if (cleaned) {
          field.setAttribute("aria-describedby", cleaned);
        } else {
          field.removeAttribute("aria-describedby");
        }
      }
    });
  }

  function setFieldError(field, message) {
    if (!field) {
      return;
    }

    field.classList.add("input-error");
    field.setAttribute("aria-invalid", "true");

    const host =
      field.closest(".form-group") ||
      field.closest(".checkbox-group") ||
      field.parentElement;

    if (!host) {
      return;
    }

    const errorId = `${field.id || field.name}-error`;
    let error = document.getElementById(errorId);
    if (!error) {
      error = document.createElement("p");
      error.id = errorId;
      error.className = "field-error";
      host.appendChild(error);
    }

    error.textContent = message;

    const describedBy = field.getAttribute("aria-describedby");
    if (!describedBy) {
      field.setAttribute("aria-describedby", errorId);
    } else if (!describedBy.split(" ").includes(errorId)) {
      field.setAttribute("aria-describedby", `${describedBy} ${errorId}`.trim());
    }
  }

  function showAlert(root, type, message) {
    const alert = document.createElement("div");
    alert.className = `form-alert form-alert--${type}`;
    alert.innerHTML = message;
    root.appendChild(alert);
  }

  function clearStatus(root) {
    root.innerHTML = "";
  }

  function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
})();
