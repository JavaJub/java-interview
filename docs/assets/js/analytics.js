(function () {
  const TELEGRAM_HOST = "t.me";
  const MAX_VALUE_LENGTH = 140;
  let lastPageView = "";

  function compactValue(value) {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) return value.map(compactValue).filter(Boolean).join(",");
    const text = String(value).replace(/\s+/g, " ").trim();
    if (!text) return undefined;
    return text.length > MAX_VALUE_LENGTH ? `${text.slice(0, MAX_VALUE_LENGTH - 1)}…` : text;
  }

  function allowedSearchParams() {
    const params = new URLSearchParams(window.location.search);
    const allowed = new URLSearchParams();
    ["quiz", "mode", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((key) => {
      const value = params.get(key);
      if (value) allowed.set(key, value);
    });
    return allowed.toString();
  }

  function referrerHost() {
    if (!document.referrer) return undefined;
    try {
      return new URL(document.referrer).host;
    } catch (_) {
      return undefined;
    }
  }

  function baseProps() {
    const search = allowedSearchParams();
    return {
      path: window.location.pathname,
      search: search || undefined,
      title: document.title,
      referrer_host: referrerHost(),
    };
  }

  function cleanProps(props) {
    return Object.fromEntries(
      Object.entries({ ...baseProps(), ...props })
        .map(([key, value]) => [key, compactValue(value)])
        .filter(([, value]) => value !== undefined),
    );
  }

  function track(eventName, props = {}) {
    const safeProps = cleanProps(props);
    window.dispatchEvent(new CustomEvent("javajub:analytics", { detail: { eventName, props: safeProps } }));

    if (typeof window.plausible === "function") {
      window.plausible(eventName, { props: safeProps });
    }
    if (window.umami && typeof window.umami.track === "function") {
      window.umami.track(eventName, safeProps);
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, safeProps);
    }
    const ymId = window.JAVAJUB_ANALYTICS && window.JAVAJUB_ANALYTICS.ymCounterId;
    if (ymId && typeof window.ym === "function") {
      window.ym(ymId, "reachGoal", eventName, safeProps);
    }
  }

  function trackPageView() {
    const current = `${window.location.pathname}${window.location.search}`;
    if (current === lastPageView) return;
    lastPageView = current;
    track("page_view");
  }

  function classifyTelegramPlacement(link) {
    if (link.closest(".quiz-summary")) return "quiz_result";
    if (link.closest(".quiz-hero")) return "quiz_catalog";
    if (link.closest(".md-footer")) return "footer";
    if (link.closest(".md-header")) return "header";
    return "content";
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest && event.target.closest("a[href]");
    if (!link) return;

    let url;
    try {
      url = new URL(link.href);
    } catch (_) {
      return;
    }

    if (url.host === TELEGRAM_HOST) {
      track("telegram_click", {
        link_text: link.textContent,
        link_url: url.href,
        placement: classifyTelegramPlacement(link),
      });
    }
  });

  window.javajubTrack = track;

  document.addEventListener("DOMContentLoaded", trackPageView);
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(trackPageView);
  }
  trackPageView();
}());
