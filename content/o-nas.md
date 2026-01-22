---
title: 'O nas'
description: 'Poznaj naszą historię, wartości i zespół. Tworzymy nowoczesne rozwiązania webowe z pasją i zaangażowaniem od ponad 5 lat.'
to: '/o-nas'
seo:
  title: 'O nas - Nuxt Base Starter | Profesjonalne rozwiązania webowe'
  description: 'Poznaj naszą historię, wartości i zespół. Specjalizujemy się w tworzeniu nowoczesnych aplikacji webowych opartych o Nuxt, Vue i TypeScript.'
  image: '/images/about/welcome.jpg'
  ogType: 'website'
# Hero - Intro
sections:
  hero:
    type: 'hero'
    id: 'hero'
    enabled: true
    headline: 'O NAS'
    title: 'Tworzymy wyjątkowe doświadczenia cyfrowe'
    description: 'Jesteśmy zespołem pasjonatów technologii, którzy od ponad 5 lat tworzą nowoczesne rozwiązania webowe. Specjalizujemy się w budowaniu wydajnych, skalowalnych aplikacji, które pomagają firmom osiągać cele biznesowe.'
    orientation: 'horizontal'
    reverse: false
    image:
      src: '/images/about/welcome.jpg'
      alt: 'Zespół pracujący nad projektem'
    links:
      - label: 'Skontaktuj się z nami'
        to: '/kontakt'
        color: 'primary'
        variant: 'solid'
        size: 'lg'
        icon: 'i-lucide-mail'
      - label: 'Zobacz portfolio'
        to: '/portfolio'
        variant: 'outline'
        size: 'lg'
        icon: 'i-lucide-arrow-right'
    ui:
      root: 'bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800'
  # Features - Nasza misja i wizja
  mission:
    type: 'features'
    id: 'mission'
    enabled: true
    headline: 'MISJA I WIZJA'
    icon: 'i-lucide-compass'
    title: 'Co nas napędza'
    description: 'Nasza misja to tworzenie rozwiązań, które nie tylko spełniają oczekiwania, ale je przewyższają'
    orientation: 'vertical'
    items:
      - title: 'Nasza misja'
        description: 'Dostarczamy innowacyjne rozwiązania webowe najwyższej jakości, które pomagają naszym klientom rozwijać ich biznesy w cyfrowym świecie. Każdy projekt traktujemy indywidualnie, dbając o najdrobniejsze szczegóły.'
        icon: 'i-lucide-target'
        orientation: 'vertical'
      - title: 'Nasza wizja'
        description: 'Dążymy do tego, aby stać się wiodącym partnerem technologicznym dla firm, które chcą wykorzystać pełen potencjał nowoczesnych technologii webowych. Wierzymy w przyszłość opartą na wydajnych, przyjaznych użytkownikowi aplikacjach.'
        icon: 'i-lucide-eye'
        orientation: 'vertical'
      - title: 'Nasze podejście'
        description: 'Stawiamy na transparentność, otwartą komunikację i ścisłą współpracę z klientami. Używamy metodologii Agile, co pozwala nam szybko reagować na zmiany i dostarczać wartość w krótszych cyklach.'
        icon: 'i-lucide-handshake'
        orientation: 'vertical'

  # Features - Wartości firmy
  values:
    type: 'features'
    id: 'values'
    enabled: true
    headline: 'NASZE WARTOŚCI'
    icon: 'i-lucide-heart'
    title: 'Na czym nam zależy'
    description: 'Wartości, które kształtują naszą kulturę pracy i podejście do każdego projektu'
    orientation: 'vertical'
    items:
      - title: 'Jakość kodu'
        description: 'Piszemy czysty, testowalny i dobrze udokumentowany kod. Stosujemy najlepsze praktyki branżowe, code review i automatyczne testy, aby zapewnić najwyższą jakość naszych rozwiązań.'
        icon: 'i-lucide-code-2'
        orientation: 'horizontal'
      - title: 'Innowacyjność'
        description: 'Śledzimy najnowsze trendy technologiczne i nie boimy się eksperymentować. Wykorzystujemy nowoczesne narzędzia jak Nuxt 4, Vue 3, TypeScript i serverless, aby tworzyć przyszłościowe aplikacje.'
        icon: 'i-lucide-lightbulb'
        orientation: 'horizontal'
      - title: 'Transparentność'
        description: 'Wierzymy w otwartą komunikację. Nasi klienci zawsze wiedzą, na jakim etapie jest projekt, jakie są koszty i jakie wyzwania możemy napotkać. Żadnych niespodzianek.'
        icon: 'i-lucide-eye'
        orientation: 'horizontal'
      - title: 'Bezpieczeństwo'
        description: 'Bezpieczeństwo danych naszych klientów jest dla nas priorytetem. Implementujemy najlepsze praktyki zabezpieczeń, regularne audyty i compliance z RODO.'
        icon: 'i-lucide-shield-check'
        orientation: 'horizontal'
      - title: 'Wydajność'
        description: 'Tworzymy aplikacje, które są szybkie i responsywne. Optymalizujemy każdy aspekt - od czasu ładowania strony po Core Web Vitals, aby zapewnić najlepsze doświadczenia użytkowników.'
        icon: 'i-lucide-zap'
        orientation: 'horizontal'
      - title: 'Rozwój'
        description: 'Inwestujemy w ciągły rozwój naszego zespołu. Uczestniczymy w konferencjach, szkoleniach i dzielimy się wiedzą wewnątrz zespołu oraz z społecznością open source.'
        icon: 'i-lucide-trending-up'
        orientation: 'horizontal'

  # Features - Jak pracujemy
  process:
    type: 'features'
    id: 'process'
    enabled: true
    headline: 'JAK PRACUJEMY'
    icon: 'i-lucide-workflow'
    title: 'Nasz proces tworzenia rozwiązań'
    description: 'Od pomysłu do wdrożenia - sprawdzony proces, który gwarantuje sukces projektu'
    orientation: 'vertical'
    items:
      - title: '1. Discovery & Analiza'
        description: 'Poznajemy Twój biznes, cele i użytkowników. Przeprowadzamy warsztaty, analizujemy konkurencję i tworzymy user personas. Definiujemy wymagania funkcjonalne i niefunkcjonalne.'
        icon: 'i-lucide-search'
        orientation: 'horizontal'
      - title: '2. Strategia & Planowanie'
        description: 'Na podstawie zebranych informacji tworzymy strategię projektu. Określamy architecture, tech stack, milestones i timeline. Przygotowujemy szczegółową dokumentację i user stories.'
        icon: 'i-lucide-clipboard-list'
        orientation: 'horizontal'
      - title: '3. Design & Prototypowanie'
        description: 'Projektujemy UX/UI zgodnie z najlepszymi praktykami i Twoją identyfikacją wizualną. Tworzymy wireframes, mockupy i interaktywne prototypy, które testujemy z użytkownikami.'
        icon: 'i-lucide-palette'
        orientation: 'horizontal'
      - title: '4. Rozwój & Implementacja'
        description: 'Kodujemy aplikację w sprintach, stosując metodologię Agile. Przeprowadzamy regularne code reviews, piszemy testy jednostkowe i integracyjne. Pokazujemy postępy w demo po każdym sprincie.'
        icon: 'i-lucide-code'
        orientation: 'horizontal'
      - title: '5. Testowanie & QA'
        description: 'Przeprowadzamy kompleksowe testowanie: funkcjonalne, wydajnościowe, bezpieczeństwa i użyteczności. Testujemy na różnych urządzeniach i przeglądarkach.'
        icon: 'i-lucide-bug'
        orientation: 'horizontal'
      - title: '6. Wdrożenie & Monitoring'
        description: 'Wdrażamy aplikację na produkcję z planem rollback. Konfigurujemy monitoring, alerty i analytics. Zapewniamy wsparcie techniczne i kolejne iteracje rozwojowe.'
        icon: 'i-lucide-rocket'
        orientation: 'horizontal'

  # Section - Zespół (opcjonalnie jako features)
  team:
    type: 'features'
    id: 'team'
    enabled: true
    headline: 'NASZ ZESPÓŁ'
    icon: 'i-lucide-users'
    title: 'Poznaj ludzi za projektami'
    description: 'Jesteśmy zespołem specjalistów z różnych dziedzin, którzy łączą siły, aby tworzyć wyjątkowe produkty cyfrowe'
    orientation: 'vertical'
    items:
      - title: 'Frontend Developers'
        description: 'Eksperci w Vue.js, Nuxt, React i nowoczesnych frameworkach. Tworzymy responsywne, wydajne interfejsy użytkownika z dbałością o accessibility i UX.'
        icon: 'i-lucide-monitor'
        orientation: 'horizontal'
      - title: 'Backend Developers'
        description: 'Specjaliści od Node.js, PHP, Python i baz danych. Budujemy skalowalne API, mikroservisy i integracje z zewnętrznymi systemami.'
        icon: 'i-lucide-server'
        orientation: 'horizontal'
      - title: 'DevOps Engineers'
        description: 'Dbamy o infrastrukturę, CI/CD pipelines, monitoring i bezpieczeństwo. Automatyzujemy procesy i zapewniamy stabilność systemów.'
        icon: 'i-lucide-settings'
        orientation: 'horizontal'
      - title: 'UI/UX Designers'
        description: 'Projektujemy intuicyjne interfejsy oparte na research użytkowników. Tworzymy design systemy i dbamy o spójność wizualną produktów.'
        icon: 'i-lucide-pen-tool'
        orientation: 'horizontal'
      - title: 'Product Managers'
        description: 'Zarządzamy projektami i produktami, dbając o to, aby każdy sprint dostarczał wartość biznesową. Jesteśmy pomostem między klientem a zespołem technicznym.'
        icon: 'i-lucide-briefcase'
        orientation: 'horizontal'
      - title: 'QA Testers'
        description: 'Zapewniamy najwyższą jakość poprzez kompleksowe testowanie funkcjonalne, wydajnościowe i bezpieczeństwa.'
        icon: 'i-lucide-check-circle'
        orientation: 'horizontal'

  # Section - Technologie
  technologies:
    type: 'features'
    id: 'technologies'
    enabled: true
    headline: 'TECHNOLOGIE'
    icon: 'i-lucide-cpu'
    title: 'Stack technologiczny'
    description: 'Pracujemy z najlepszymi narzędziami i technologiami, aby dostarczać nowoczesne rozwiązania'
    orientation: 'vertical'
    items:
      - title: 'Frontend'
        description: 'Vue 3, Nuxt 4, React, TypeScript, Tailwind CSS, Vite, Pinia, VueUse'
        icon: 'i-lucide-layout'
        orientation: 'horizontal'
      - title: 'Backend'
        description: 'Node.js, Nitro, Symfony, Laravel, Express, NestJS, REST API, GraphQL'
        icon: 'i-lucide-database'
        orientation: 'horizontal'
      - title: 'Bazy danych'
        description: 'PostgreSQL, MySQL, MongoDB, Redis, Supabase, Firebase'
        icon: 'i-lucide-hard-drive'
        orientation: 'horizontal'
      - title: 'Cloud & DevOps'
        description: 'AWS, Google Cloud, Vercel, Cloudflare, Docker, Kubernetes, GitHub Actions'
        icon: 'i-lucide-cloud'
        orientation: 'horizontal'
      - title: 'Testing'
        description: 'Vitest, Jest, Playwright, Cypress, Testing Library'
        icon: 'i-lucide-flask-conical'
        orientation: 'horizontal'
      - title: 'Tools'
        description: 'Git, VS Code, Figma, Jira, Confluence, Postman, Swagger'
        icon: 'i-lucide-wrench'
        orientation: 'horizontal'

  # Section - Statystyki
  stats:
    type: 'section'
    id: 'stats'
    enabled: true
    headline: 'W LICZBACH'
    icon: 'i-lucide-bar-chart'
    title: 'Nasze osiągnięcia'
    description: 'Liczby, które pokazują nasze zaangażowanie i doświadczenie'
    orientation: 'vertical'
    links: []
    features:
      - title: '150+ projektów'
        description: 'Zrealizowanych z sukcesem dla klientów z różnych branż'
        icon: 'i-lucide-briefcase'
        orientation: 'vertical'
      - title: '80+ klientów'
        description: 'Zadowolonych partnerów biznesowych w Polsce i za granicą'
        icon: 'i-lucide-users'
        orientation: 'vertical'
      - title: '5+ lat'
        description: 'Doświadczenia w tworzeniu nowoczesnych aplikacji webowych'
        icon: 'i-lucide-calendar'
        orientation: 'vertical'
      - title: '98%'
        description: 'Klientów poleca nas swoim znajomym i współpracuje z nami ponownie'
        icon: 'i-lucide-heart'
        orientation: 'vertical'
      - title: '24/7'
        description: 'Monitoring i wsparcie dla aplikacji krytycznych biznesowo'
        icon: 'i-lucide-clock'
        orientation: 'vertical'
      - title: '15+ specjalistów'
        description: 'W naszym zespole, zawsze gotowych do nowych wyzwań'
        icon: 'i-lucide-users-2'
        orientation: 'vertical'

  # FAQ - Najczęściej zadawane pytania
  faq:
    type: 'faq'
    id: 'faq'
    enabled: true
    headline: 'FAQ'
    title: 'Najczęściej zadawane pytania'
    description: 'Odpowiedzi na pytania, które najczęściej słyszymy od naszych klientów'
    multiple: false
    orientation: 'vertical'
    items:
      - question: 'Jak długo trwa realizacja projektu?'
        answer: 'Czas realizacji zależy od zakresu projektu. Prosty landing page możemy dostarczyć w 2-3 tygodnie, bardziej złożona aplikacja webowa może wymagać 2-3 miesięcy pracy. Podczas pierwszej konsultacji zawsze określamy realny timeline dostosowany do Twoich potrzeb i budżetu.'
        icon: 'i-lucide-clock'
      - question: 'Jakie technologie używacie?'
        answer: 'Specjalizujemy się w nowoczesnym stacku: Vue 3, Nuxt 4, TypeScript, Tailwind CSS na frontendzie oraz Node.js, Symfony, PHP na backendzie. Wybieramy technologie dopasowane do potrzeb projektu, stawiając na rozwiązania sprawdzone, skalowalne i z dobrym wsparciem społeczności.'
        icon: 'i-lucide-code-2'
      - question: 'Czy oferujecie wsparcie po wdrożeniu?'
        answer: 'Tak, oferujemy elastyczne pakiety wsparcia technicznego. W zależności od potrzeb możesz wybrać wsparcie podstawowe (reagowanie w dni robocze) lub premium (monitoring 24/7 z SLA). Zapewniamy też aktualizacje bezpieczeństwa, poprawki błędów i rozwój aplikacji.'
        icon: 'i-lucide-headphones'
      - question: 'Jaki jest proces współpracy?'
        answer: 'Zaczynamy od bezpłatnej konsultacji, podczas której poznajemy Twoje potrzeby. Następnie przygotowujemy ofertę i harmonogram. Po akceptacji rozpoczynamy pracę w sprintach - co 2 tygodnie pokazujemy postępy i zbieramy feedback. Taki proces gwarantuje transparentność i pozwala szybko reagować na zmiany.'
        icon: 'i-lucide-workflow'
      - question: 'Czy tworzycie również projekty graficzne?'
        answer: 'Tak, nasz zespół obejmuje doświadczonych UI/UX designerów. Tworzymy projekty graficzne od zera lub dostosowujemy istniejący branding do nowej platformy. Projektujemy w Figma, co pozwala na łatwą współpracę i szybkie iteracje.'
        icon: 'i-lucide-palette'
      - question: 'Czy mogę zobaczyć wasze realizacje?'
        answer: 'Oczywiście! Zapraszamy do sekcji Portfolio, gdzie prezentujemy nasze wybrane projekty. Ze względu na NDA część projektów nie może być publicznie pokazana, ale podczas spotkania chętnie opowiemy o nich więcej i pokażemy case studies.'
        icon: 'i-lucide-folder-open'

  # CTA - Kontakt
  cta:
    type: 'cta'
    id: 'cta'
    enabled: true
    title: 'Gotowy na współpracę?'
    description: 'Porozmawiajmy o Twoim projekcie. Oferujemy bezpłatną konsultację, podczas której pomożemy określić zakres projektu i oszacować koszty.'
    orientation: 'vertical'
    variant: 'soft'
    links:
      - label: 'Skontaktuj się'
        to: '/kontakt'
        color: 'primary'
        variant: 'solid'
        size: 'lg'
        icon: 'i-lucide-send'
      - label: 'Zobacz realizacje'
        to: '/portfolio'
        variant: 'outline'
        size: 'lg'
        icon: 'i-lucide-folder-open'
    ui:
      root: ''
---

:PageHero{:hero="sections.hero"}
:PageSection{:section="sections.mission"}
:PageSection{:section="sections.values"}
:PageSection{:section="sections.process"}
:PageSection{:section="sections.team"}
:PageSection{:section="sections.technologies"}
:PageSection{:section="sections.stats"}
:PageFAQ{:section="sections.faq"}
:PageCTA{:cta="sections.cta"}
