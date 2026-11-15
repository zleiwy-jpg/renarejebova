"use strict";

(() => {
  const chatToggle = document.createElement("button");
  chatToggle.className = "lesson-chat-toggle";
  chatToggle.type = "button";
  chatToggle.setAttribute("aria-expanded", "false");
  chatToggle.setAttribute("aria-controls", "lesson-chat");
  chatToggle.setAttribute("aria-label", "Dərslər barədə sual ver");
  chatToggle.innerHTML = '<span class="lesson-chat-toggle-mark" aria-hidden="true">π</span>';

  const prompt = document.createElement("button");
  prompt.className = "lesson-chat-prompt";
  prompt.type = "button";
  prompt.hidden = false;
  prompt.textContent = "Sualın varsa, buyur";
  prompt.setAttribute("aria-label", "Sualın varsa, buyur. Çatı aç");

  const panel = document.createElement("section");
  panel.className = "lesson-chat-panel";
  panel.id = "lesson-chat";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Pifaqor sual-cavab paneli");

  const header = document.createElement("header");
  header.className = "lesson-chat-header";
  const identity = document.createElement("div");
  identity.className = "lesson-chat-identity";
  const avatar = document.createElement("span");
  avatar.className = "lesson-chat-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = "π";
  const headerCopy = document.createElement("div");
  headerCopy.className = "lesson-chat-header-copy";
  const title = document.createElement("h2");
  title.textContent = "Pifaqor";
  const subtitle = document.createElement("p");
  subtitle.textContent = "Riyaziyyat dərsləri üzrə köməkçi";
  headerCopy.append(title, subtitle);
  identity.append(avatar, headerCopy);
  const headerActions = document.createElement("div");
  headerActions.className = "lesson-chat-header-actions";
  const online = document.createElement("span");
  online.className = "lesson-chat-online";
  online.innerHTML = '<span aria-hidden="true"></span> Onlayn';
  const closeButton = document.createElement("button");
  closeButton.className = "lesson-chat-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Çatı bağla");
  closeButton.textContent = "×";
  headerActions.append(online, closeButton);
  header.append(identity, headerActions);

  const messages = document.createElement("div");
  messages.className = "lesson-chat-messages";
  messages.setAttribute("role", "log");
  messages.setAttribute("aria-live", "polite");
  messages.setAttribute("aria-relevant", "additions text");
  const welcome = document.createElement("p");
  welcome.className = "lesson-chat-message is-assistant";
  welcome.textContent = "Salam! Mən Rəna müəllimənin köməkçisiyəm. Dərslər barədə suallarınıza cavab verməyə hazıram.";
  messages.append(welcome);

  const suggestions = document.createElement("div");
  suggestions.className = "lesson-chat-suggestions";
  suggestions.setAttribute("aria-label", "Məşhur suallar");
  ["Dərslər kimlər üçündür?", "Dərsin qiyməti nə qədərdir?", "Onlayn sınaq necə işləyir?"].forEach(question => {
    const suggestion = document.createElement("button");
    suggestion.type = "button";
    suggestion.textContent = question;
    suggestions.append(suggestion);
  });

  const form = document.createElement("form");
  form.className = "lesson-chat-form";
  const input = document.createElement("input");
  input.type = "text";
  input.name = "question";
  input.maxLength = 240;
  input.placeholder = "Sualını bura yaz...";
  input.autocomplete = "off";
  input.setAttribute("aria-label", "Dərslər barədə sualınız");
  input.required = true;
  const send = document.createElement("button");
  send.type = "submit";
  send.setAttribute("aria-label", "Sualı göndər");
  send.textContent = "↑";
  form.append(input, send);
  panel.append(header, messages, suggestions, form);
  document.body.append(panel, prompt, chatToggle);

  const contactLink = document.createElement("a");
  contactLink.href = "https://wa.me/994707160585";
  contactLink.target = "_blank";
  contactLink.rel = "noopener noreferrer";
  contactLink.className = "lesson-chat-contact";
  contactLink.setAttribute("aria-label", "WhatsApp ilə müəllimə yaz");
  contactLink.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.5 0 .1 5.4.1 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6a12 12 0 0 0 5.9 1.5h.1c6.6 0 12-5.4 12-12 0-3.2-1.3-6.2-3.7-8.4ZM12.1 21.8h-.1a9.9 9.9 0 0 1-5.1-1.4l-.4-.2-3.7 1 1-3.6-.3-.4a9.8 9.8 0 0 1-1.5-5.2c0-5.5 4.5-10 10-10 2.7 0 5.2 1.1 7.1 2.9a10 10 0 0 1 2.9 7.1c0 5.3-4.4 9.8-9.9 9.8Zm5.5-7.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.1 3c.1.2 2 3.1 4.8 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.6-.3Z"/></svg><span>WhatsApp ilə yazın</span><span class="lesson-chat-contact-arrow" aria-hidden="true">↗</span>';

  const responses = [
    { terms: ["qiymet", "odenis", "ne qeder", "pul", "haqq"], text: "Dərsin dəqiq qiymətini öyrənmək üçün WhatsApp vasitəsilə müəllimlə əlaqə saxlaya bilərsiniz.", contact: true },
    { terms: ["saat", "cedvel", "vaxt", "ne vaxt", "qrafik"], text: "Dərs cədvəli şagirdin səviyyəsinə və boş yerlərə görə müəyyənləşdirilir. Uyğun vaxtı müəllimlə dəqiqləşdirin." },
    { terms: ["kimler", "sinif", "abituriyent", "usaq", "telebe", "yas"], text: "Hazırlıq 5–11-ci sinif şagirdləri və abituriyentlər üçün nəzərdə tutulub. Səviyyənizə uyğun qrup barədə müəllimlə danışa bilərsiniz." },
    { terms: ["online", "onlayn", "sinaq", "imtahan", "test"], text: "Onlayn sınaqda təsadüfi seçilən 20 riyaziyyat sualı olur. Hər düzgün cavab 5% hesablanır; sualı boş saxlamaq və sonra geri qayıtmaq mümkündür. Nəticə sınağın sonunda görünür." },
    { terms: ["metod", "nece oyren", "ders nece", "izah", "ezber"], text: "Dərslərdə əzbərçilikdən çox düşünmə və məntiqi anlama əsasdır. İzah şagirdin fərdi xüsusiyyətinə və öyrənmə tempinə uyğun qurulur." },
    { terms: ["tecrube", "sertifikasiya", "bal", "ugur", "netic"], text: "Rəna müəllimənin 19 illik pedaqoji təcrübəsi var. Saytda sertifikasiya balı 55, uğurlu nəticələr göstəricisi isə 98% olaraq təqdim edilib." },
    { terms: ["unvan", "adres", "mekteb", "harada", "yer"], text: "Rəna müəllimə 322 saylı tam orta məktəbdə riyaziyyat müəllimi kimi çalışır. Dərslərin keçirildiyi yer və formatı əvvəlcədən müəllimlə dəqiqləşdirmək yaxşıdır." },
    { terms: ["elaqe", "whatsapp", "nomre", "yazim", "danis"], text: "Müəllimlə birbaşa əlaqə saxlamaq üçün aşağıdakı WhatsApp düyməsindən istifadə edin." },
    { terms: ["salam", "sabah", "axsam", "nec", "kimsen"], text: "Salam! Mən dərslər, hazırlıq səviyyələri və onlayn sınaq barədə cavab verə bilərəm. Məsələn, «Dərslər kimlər üçündür?» yaza bilərsiniz." }
  ];

  function normalize(text) {
    return text.toLocaleLowerCase("az")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ə/g, "e")
      .replace(/ı/g, "i");
  }

  function appendMessage(text, sender) {
    const message = document.createElement("p");
    message.className = `lesson-chat-message is-${sender}`;
    message.textContent = text;
    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function answerQuestion(question) {
    const normalized = normalize(question);
    const match = responses.find(response => response.terms.some(term => normalized.includes(normalize(term))));
    const answer = match
      ? match.text
      : "Bu sual üçün hazır cavabım yoxdur. Qiymət, dəqiq cədvəl və qeydiyyat barədə müəllimdən birbaşa məlumat ala bilərsiniz.";
    const typing = document.createElement("p");
    typing.className = "lesson-chat-message is-assistant lesson-chat-typing";
    typing.setAttribute("aria-label", "Köməkçi cavab yazır");
    typing.innerHTML = "<span></span><span></span><span></span>";
    messages.append(typing);
    messages.scrollTop = messages.scrollHeight;
    return new Promise(resolve => {
      window.setTimeout(() => {
      typing.remove();
      const message = document.createElement("p");
      message.className = "lesson-chat-message is-assistant";
      messages.append(message);
      const characters = Array.from(answer);
      let index = 0;
      const finish = () => {
        if (!match || match.contact || match.terms.includes("elaqe")) messages.append(contactLink.cloneNode(true));
        messages.scrollTop = messages.scrollHeight;
        resolve();
      };
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        message.textContent = answer;
        finish();
        return;
      }
      const timer = window.setInterval(() => {
        message.textContent += characters[index];
        index += 1;
        messages.scrollTop = messages.scrollHeight;
        if (index >= characters.length) {
          window.clearInterval(timer);
          finish();
        }
      }, 18);
      }, 500);
    });
  }

  function submitQuestion(question) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    appendMessage(cleanQuestion, "user");
    input.value = "";
    input.disabled = true;
    send.disabled = true;
    answerQuestion(cleanQuestion).then(() => {
      input.disabled = false;
      send.disabled = false;
      input.focus();
    });
  }

  function setOpen(open) {
    panel.hidden = !open;
    chatToggle.setAttribute("aria-expanded", String(open));
    if (open) {
      prompt.hidden = true;
      input.focus();
    }
  }

  prompt.addEventListener("click", () => setOpen(true));
  chatToggle.addEventListener("click", () => setOpen(panel.hidden));
  closeButton.addEventListener("click", () => {
    setOpen(false);
    chatToggle.focus();
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    submitQuestion(input.value);
  });
  suggestions.addEventListener("click", event => {
    const suggestion = event.target.closest("button");
    if (suggestion) submitQuestion(suggestion.textContent);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) {
      setOpen(false);
      chatToggle.focus();
    }
  });
})();
