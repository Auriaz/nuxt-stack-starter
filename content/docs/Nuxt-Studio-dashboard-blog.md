# Nuxt Studio a dashboard/blog — jak wykorzystać do pisania bloga

## Czy da się „wstawić” edytor Nuxt Studio na podstronę dashboard/blog/[slug]?

**Krótko: nie w sposób „embed” na jednej podstronie.**

Nuxt Studio jest zaprojektowany jako **globalny panel** w aplikacji:

- Plugin nuxt-studio montuje **jeden** komponent `<nuxt-studio>` w `document.body` (floating button + panel).
- Nie ma publicznego API do „otwórz dokument o slug X” ani do osadzenia edytora tylko na konkretnej trasie (np. `dashboard/blog/[slug]`).
- W Studio nawiguje się **wewnątrz** panelu: drzewo treści (Content) → kolekcja `blog` → wybór pliku (np. `welcome.md`). Nie ma deep linka typu `?document=blog/welcome`.

Więc **nie da się** w sensie „dopisać edytor nuxt-studio do podstrony dashboard/blog/[slug]” tak, żeby ta podstrona była „stroną edycji” z wbudowanym Studio.

---

## Jak mimo to wykorzystać Nuxt Studio do pisania bloga z poziomu dashboardu

### Opcja 1: Studio globalnie + nawigacja w Studio (obecny model)

1. Użytkownik wchodzi na **dashboard** (lub dowolną stronę, gdzie działa Studio).
2. Otwiera Studio: **floating button** (lewy dolny róg) lub **Cmd+.** / **Ctrl+.**.
3. W panelu Studio: zakładka **Content** → kolekcja **blog** → wybiera wpis (np. `welcome`, `auto-imports-nuxt-4`).
4. Edytuje w Studio (Tryb wizualny / Code) i publikuje.

**Możesz ulepszyć dashboard/blog:**

- Na **dashboard/blog/index.vue** wyświetlić listę postów (z Nuxt Content: `queryCollection('blog')`).
- Przy każdym wpisie przycisk **„Edytuj w Studio”**, który:
  - przenosi na stronę, gdzie Studio jest dostępne (np. `/` lub `/dashboard`), **albo**
  - otwiera Studio na bieżącej stronie (np. focus na floating button / Cmd+.).
- Krótka instrukcja: „W Studio wybierz w drzewie: **Content → blog → [nazwa pliku]**”.

To nie jest „edytor na stronie dashboard/blog/[slug]”, ale **wejście do bloga z dashboardu** i edycja w tym samym Studio, które i tak macie globalnie.

### Opcja 2: Własny edytor na dashboard/blog/[slug] (bez Nuxt Studio)

Jeśli zależy Ci na **konkretnej stronie** typu `dashboard/blog/[slug]` z edytorem „na miejscu”:

- Zbuduj **własny** widok edycji na `dashboard/blog/[slug].vue`:
  - formularz (frontmatter + body) lub prosty edytor Markdown,
  - zapis przez API do plików w `content/blog/` (np. przez backend zapisujący do repo lub do pliku na serwerze).

To nie będzie Nuxt Studio, ale da Ci dokładnie „podstrona dashboardu = edycja tego wpisu”.

---

## Podsumowanie

| Pytanie                                                                       | Odpowiedź                                                                                                              |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Czy da się „dopisać” edytor Nuxt Studio do podstrony `dashboard/blog/[slug]`? | **Nie** — Studio to jeden globalny panel, nie komponent do osadzenia na wybranej trasie.                               |
| Czy da się z dashboardu korzystać z Nuxt Studio do pisania bloga?             | **Tak** — wejść na dashboard (lub /), otworzyć Studio (floating / Cmd+.), w Studio wybrać **Content → blog → [plik]**. |
| Czy da się mieć edycję „na stronie” dashboard/blog/[slug]?                    | Tylko **własnym** edytorem na tej podstronie (bez Nuxt Studio).                                                        |

Jeśli chcesz, mogę zaproponować konkretne zmiany w `dashboard/blog/index.vue` (lista postów + przycisk „Edytuj w Studio” + krótka instrukcja).
