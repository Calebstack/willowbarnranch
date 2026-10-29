document.addEventListener("DOMContentLoaded", () => {
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  if (menuToggle && mainNav) {
    const closeMenu = () => {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      mainNav.classList.remove("is-open");
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      mainNav.classList.toggle("is-open", !isOpen);
    });

    mainNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", (event) => {
      if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReducedMotion) {
    document.body.classList.add("motion-enabled");

    const revealTargets = document.querySelectorAll(
      "main > section:not(.page-hero):not(.hero), .service-card, .gallery-page-item, .offer-card",
    );
    revealTargets.forEach((element) => element.classList.add("motion-reveal"));

    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });

      revealTargets.forEach((element) => revealObserver.observe(element));
    } else {
      revealTargets.forEach((element) => element.classList.add("is-visible"));
    }
  }

  const heroImage = document.querySelector("[data-hero-slideshow]");
  if (heroImage && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const slides = [
      {
        src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2200&q=85",
        alt: "A romantic outdoor wedding reception beneath the trees",
      },
      {
        src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=2200&q=85",
        alt: "A wedding table dressed for a celebration",
      },
      {
        src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=2200&q=85",
        alt: "An elegant wedding table with flowers and candlelight",
      },
    ];
    const slideshowImages = [{ image: heroImage, alt: slides[0].alt }];
    const preloadSlides = slides.slice(1).map(async (slide) => {
      const image = new Image();
      image.className = "hero-image is-slideshow-hidden";
      image.alt = "";
      image.setAttribute("aria-hidden", "true");
      image.src = slide.src;
      await image.decode();
      heroImage.parentElement.insertBefore(image, heroImage.nextSibling);
      return { image, alt: slide.alt };
    });

    Promise.allSettled(preloadSlides).then((results) => {
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`Unable to preload homepage slideshow image: ${slides[index + 1].src}`, result.reason);
        } else {
          slideshowImages.push(result.value);
        }
      });

      if (slideshowImages.length < 2) return;
      let activeSlide = 0;
      window.setInterval(() => {
        const current = slideshowImages[activeSlide];
        activeSlide = (activeSlide + 1) % slideshowImages.length;
        const next = slideshowImages[activeSlide];

        current.image.classList.add("is-slideshow-hidden");
        current.image.alt = "";
        current.image.setAttribute("aria-hidden", "true");
        next.image.classList.remove("is-slideshow-hidden");
        next.image.alt = next.alt;
        next.image.removeAttribute("aria-hidden");
      }, 3000);
    });
  }

  const giftForm = document.querySelector("[data-gift-form]");
  if (giftForm) {
    const customAmountRadio = giftForm.querySelector('input[name="amount-choice"][value="custom"]');
    const customAmountWrap = giftForm.querySelector(".custom-amount-wrap");
    const customAmount = giftForm.querySelector("#custom-amount");
    const previewAmount = document.querySelector("[data-gift-preview]");
    const recipientNameLabel = giftForm.querySelector("[data-recipient-name]");
    const recipientEmailLabel = giftForm.querySelector("[data-recipient-email]");

    const updateAmount = () => {
      const selected = giftForm.querySelector('input[name="amount-choice"]:checked');
      const isCustom = selected === customAmountRadio;
      customAmountWrap.hidden = !isCustom;
      customAmount.required = isCustom;
      if (previewAmount) previewAmount.textContent = isCustom ? (customAmount.value || "—") : selected.value;
    };

    giftForm.querySelectorAll('input[name="amount-choice"]').forEach((input) => {
      input.addEventListener("change", updateAmount);
    });
    customAmount.addEventListener("input", updateAmount);

    giftForm.querySelectorAll('input[name="recipient"]').forEach((input) => {
      input.addEventListener("change", () => {
        if (!input.checked) return;
        const label = input.value === "myself" ? "Your" : "Recipient’s";
        recipientNameLabel.textContent = label;
        recipientEmailLabel.textContent = label;
      });
    });

    giftForm.querySelectorAll("[data-channel]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const channelFields = giftForm.querySelector(`[data-channel-fields="${checkbox.value.toLowerCase()}"]`);
        const phoneInput = channelFields.querySelector("input");
        channelFields.hidden = !checkbox.checked;
        phoneInput.required = checkbox.checked;
      });
    });

    giftForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const selected = giftForm.querySelector('input[name="amount-choice"]:checked');
      const amount = selected === customAmountRadio ? Number(customAmount.value) : Number(selected.value);
      if (!Number.isFinite(amount) || amount <= 0) {
        customAmount.setCustomValidity("Enter an amount greater than zero.");
        customAmount.reportValidity();
        return;
      }
      customAmount.setCustomValidity("");
      showFormStatus(giftForm, "Your gift details are ready. Online checkout will be available once payment processing is connected.");
    });
    updateAmount();
  }

  document.querySelectorAll("[data-local-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      showFormStatus(form, "Thanks for reaching out! This demo form is ready to connect to the Willow Barn Ranch team.");
    });
  });

  const mapFrame = document.querySelector(".map-frame iframe");
  const mapAddress = encodeURIComponent("2791 Ashue Rd, Wapato, WA 98951, USA");
  document.querySelectorAll("[data-map-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-map-mode]").forEach((option) => option.classList.toggle("active", option === button));
      const mode = button.dataset.mapMode === "satellite" ? "k" : "m";
      mapFrame.src = `https://maps.google.com/maps?q=${mapAddress}&t=${mode}&z=15&output=embed`;
    });
  });

  const topic = new URLSearchParams(window.location.search).get("service");
  const topicSelect = document.querySelector("#contact-topic");
  if (topic === "proposal" && topicSelect) topicSelect.value = "Proposal package";

  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  document.querySelectorAll('input[type="date"]').forEach((dateInput) => {
    dateInput.min = localToday;
  });
});

function showFormStatus(form, message) {
  const status = form.querySelector(".form-status");
  if (status) {
    status.classList.remove("error");
    status.textContent = message;
  }
}
